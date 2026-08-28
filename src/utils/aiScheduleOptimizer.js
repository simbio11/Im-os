import { getTodayDateStr, getRelativeDateStr, formatKoreanDate, timeStrToMinutes, minutesToTimeStr } from './dateUtils.js';
import { callGeminiApi, getStoredGeminiApiKey } from '../services/geminiService.js';
import { queryLocalAiEngine } from '../services/localAiEngine.js';

/**
 * Intelligent Korean Natural Language Schedule Parser
 */
export function parseKoreanScheduleText(rawText, defaultDate = null) {
  if (!rawText || typeof rawText !== 'string') return [];

  const lines = rawText
    .split(/\r?\n|,\s*(?=[0-9가-힣]+시)|;\s*|\s*그리고\s*/)
    .map(l => l.trim())
    .filter(Boolean);

  let currentTargetDate = defaultDate || getTodayDateStr();

  // Check if first line or context contains date reference
  const firstLine = lines[0] || '';
  if (firstLine.includes('내일') || firstLine.includes('tomorrow')) {
    currentTargetDate = getRelativeDateStr(1);
  } else if (firstLine.includes('모레')) {
    currentTargetDate = getRelativeDateStr(2);
  } else if (firstLine.includes('오늘') || firstLine.includes('today')) {
    currentTargetDate = getTodayDateStr();
  }

  const rawParsedItems = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Filter out header/title lines (e.g. "내일 일정:", "오늘 일정:", "스케줄:", "할일 목록:")
    if (line.match(/^(?:내일|오늘|모레|주말|이번주|다음주)?\s*(?:일정|스케줄|할일|투두|계획|task|todo)[:\s]*$/i)) {
      if (line.includes('내일')) currentTargetDate = getRelativeDateStr(1);
      if (line.includes('모레')) currentTargetDate = getRelativeDateStr(2);
      if (line.includes('오늘')) currentTargetDate = getTodayDateStr();
      continue;
    }

    // 1. Time extraction
    let startMinutes = null;
    let endMinutes = null;

    // Range patterns: "14:00 - 15:30", "11시~18시", "오전 9시부터 12시까지"
    const rangeMatch = line.match(/(?:(오전|오후|새벽|저녁|밤)\s*)?(\d{1,2})(?::(\d{2})|시(?:\s*(\d{1,2})분)?)\s*(?:-|~|부터|\sto\s)\s*(?:(오전|오후|새벽|저녁|밤)\s*)?(\d{1,2})(?::(\d{2})|시(?:\s*(\d{1,2})분)?)/);
    
    // Single time patterns: "9시 기상", "저녁 7시에 판교", "14:30 팀 미팅"
    const singleTimeMatch = line.match(/(?:(오전|오후|새벽|저녁|밤)\s*)?(\d{1,2})(?::(\d{2})|시(?:\s*(\d{1,2})분)?)/);

    if (rangeMatch) {
      const p1 = rangeMatch[1];
      let h1 = parseInt(rangeMatch[2], 10);
      const m1 = parseInt(rangeMatch[3] || rangeMatch[4] || '0', 10);
      if ((p1 === '오후' || p1 === '저녁' || p1 === '밤') && h1 < 12) h1 += 12;

      const p2 = rangeMatch[5] || p1;
      let h2 = parseInt(rangeMatch[6], 10);
      const m2 = parseInt(rangeMatch[7] || rangeMatch[8] || '0', 10);
      if ((p2 === '오후' || p2 === '저녁' || p2 === '밤') && h2 < 12) h2 += 12;

      startMinutes = h1 * 60 + m1;
      endMinutes = h2 * 60 + m2;
    } else if (singleTimeMatch) {
      const period = singleTimeMatch[1];
      let h = parseInt(singleTimeMatch[2], 10);
      const m = parseInt(singleTimeMatch[3] || singleTimeMatch[4] || '0', 10);

      // Korean period adjustments
      if ((period === '오후' || period === '저녁' || period === '밤') && h < 12) {
        h += 12;
      } else if (!period) {
        // Heuristic: "7시" with "저녁" in line
        if ((line.includes('저녁') || line.includes('퇴근') || line.includes('돌아옴') || line.includes('복귀') || line.includes('밤')) && h < 12) {
          h += 12;
        } else if (h >= 1 && h <= 6 && !line.includes('새벽') && !line.includes('기상')) {
          // 1~6 with no morning indicator is usually afternoon (e.g. 2시 미팅 = 14:00)
          h += 12;
        }
      }
      startMinutes = h * 60 + m;
    }

    if (startMinutes === null) {
      // Default to 14:00 if no time could be detected
      startMinutes = 14 * 60;
    }

    // 2. Clean Title & Context Extraction
    let title = line
      .replace(/^\s*(?:\d+[\.\)]|[-*•])\s*/, '') // Remove list bullets like "1. ", "2) ", "- "
      .replace(/(?:오전|오후|새벽|저녁|밤)?\s*\d{1,2}(?::\d{2}|시(?:\s*\d{1,2}분)?)(?:\s*(?:-|~|부터|\sto\s)\s*(?:오전|오후|새벽|저녁|밤)?\s*\d{1,2}(?::\d{2}|시(?:\s*\d{1,2}분)?))?(?:에|까지|부터)?/g, '')
      .replace(/^(?:일정|스케줄|등록|추가|할일|투두|task|todo)[:\s]*/i, '')
      .trim();

    if (!title) {
      title = line.replace(/^\s*(?:\d+[\.\)]|[-*•])\s*/, '').trim();
    }
    
    // Polish common short phrases
    if (title === '기상') title = '기상 및 아침 루틴';
    if (title === '학회') title = '학회 참석 및 네트워킹';
    if (title.includes('판교로 돌아옴') || title.includes('판교 복귀')) title = '판교 복귀 및 이동';

    // 3. Category & Location Detection
    let category = 'personal';
    let location = '홈 오피스';
    let defaultDurationMinutes = 60;

    const lower = line.toLowerCase();

    if (lower.includes('학회') || lower.includes('컨퍼런스') || lower.includes('세미나') || lower.includes('심포지엄') || lower.includes('워크샵')) {
      category = 'meeting';
      location = '학회장 / 컨퍼런스 홀';
      defaultDurationMinutes = 360; // 6 hours
    } else if (lower.includes('기상') || lower.includes('아침 루틴') || lower.includes('스트레칭') || lower.includes('기상후')) {
      category = 'personal';
      location = '자택';
      defaultDurationMinutes = 60;
    } else if (lower.includes('돌아옴') || lower.includes('복귀') || lower.includes('귀가') || lower.includes('이동') || lower.includes('출근') || lower.includes('퇴근')) {
      category = 'personal';
      location = lower.includes('판교') ? '판교' : '이동 중';
      defaultDurationMinutes = 60;
    } else if (lower.includes('러닝') || lower.includes('운동') || lower.includes('헬스') || lower.includes('5km') || lower.includes('조깅')) {
      category = 'fitness';
      location = '한강 러닝 트랙';
      defaultDurationMinutes = 60;
    } else if (lower.includes('미팅') || lower.includes('회의') || lower.includes('싱크') || lower.includes('통화') || lower.includes('인터뷰')) {
      category = 'meeting';
      location = lower.includes('zoom') || lower.includes('meet') ? 'Google Meet / Zoom' : '오피스 회의실';
      defaultDurationMinutes = 60;
    } else if (lower.includes('주식') || lower.includes('어닝콜') || lower.includes('fomc') || lower.includes('실적') || lower.includes('ir') || lower.includes('포트폴리오')) {
      category = 'market';
      location = 'L&M OS';
      defaultDurationMinutes = 60;
    } else if (lower.includes('딥워크') || lower.includes('개발') || lower.includes('코딩') || lower.includes('연구') || lower.includes('논문') || lower.includes('집중')) {
      category = 'deepwork';
      location = '홈 오피스';
      defaultDurationMinutes = 90;
    }

    rawParsedItems.push({
      startMinutes,
      endMinutes: endMinutes || (startMinutes + defaultDurationMinutes),
      title,
      category,
      location,
      date: currentTargetDate
    });
  }

  // 4. Sequential Time Alignment (Resolve EndTimes across items)
  rawParsedItems.sort((a, b) => a.startMinutes - b.startMinutes);

  const finalEvents = rawParsedItems.map((item, idx) => {
    let finalEndMin = item.endMinutes;
    const nextItem = rawParsedItems[idx + 1];

    if (nextItem && nextItem.date === item.date) {
      if (finalEndMin > nextItem.startMinutes) {
        finalEndMin = Math.max(item.startMinutes + 30, nextItem.startMinutes - 15);
      }
    }

    // Bound to 23:59
    finalEndMin = Math.min(1439, finalEndMin);

    return {
      id: `evt-ai-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
      date: item.date,
      startTime: minutesToTimeStr(item.startMinutes),
      endTime: minutesToTimeStr(finalEndMin),
      title: item.title,
      category: item.category,
      completed: false,
      location: item.location,
      notes: `✨ AI 지능형 자연어 스케줄러 생성 (${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })})`
    };
  });

  return finalEvents;
}

/**
 * Parse a single schedule line for quick command palette or inline inputs
 */
export function parseSingleScheduleLine(line, defaultDate = null) {
  const events = parseKoreanScheduleText(line, defaultDate);
  return events && events.length > 0 ? events[0] : null;
}

/**
 * Main AI Schedule Optimization Controller (Gemini 1.5 Live AI + High-Precision Local Fallback)
 */
export async function optimizeScheduleWithAI({ 
  userInstruction, 
  currentEvents = [], 
  targetDate = null, 
  apiKey = null 
}) {
  const date = targetDate || getTodayDateStr();
  const key = apiKey || getStoredGeminiApiKey();

  // Try Gemini 1.5 Live API if Key is present
  if (key && key.startsWith('AIza')) {
    try {
      const dayEvents = currentEvents.filter(e => e.date === date);
      const prompt = `당신은 최고 전략 개인 OS 'L&M OS'의 스케줄 총괄 AI 어시스턴트입니다.
사용자의 자연어 일정 입력을 맥락에 맞게 정확히 해석하여 일정 목록을 JSON으로 반환하세요.

[기준 날짜]: ${date}
[현재 등록된 일정]:
${JSON.stringify(dayEvents, null, 2)}

[사용자 입력]:
"${userInstruction}"

[해석 및 변환 규칙]:
1. "9시 기상", "11시 학회", "저녁 7시에 판교로 돌아옴"과 같은 비정형 텍스트를 정확한 24시간 형식(HH:MM) 시작/종료 시간으로 변환하세요.
   - 예: 9시 기상 -> 09:00~10:00 (기상 및 아침 루틴, 카테고리: personal, 장소: 자택)
   - 예: 11시 학회 -> 11:00~18:00 (학회 참석, 카테고리: meeting, 장소: 학회장)
   - 예: 저녁 7시 판교 복귀 -> 19:00~20:00 (판교 복귀 및 귀가, 카테고리: personal, 장소: 판교)
2. "30분 뒤로 미뤄줘", "1시간 연기해줘" 등의 요청은 기존 일정의 시작/종료 시간을 계산하여 조정하세요.
3. 카테고리는 반드시 ["deepwork", "fitness", "market", "meeting", "personal"] 중 하나여야 합니다.

[반환 JSON 규격]:
{
  "summary": "한국어 작업 요약 (예: '내일 기상, 학회, 판교 복귀 일정이 3건 성공적으로 편성되었습니다.')",
  "actionType": "create_bulk" | "shift" | "resolve_conflicts",
  "updatedOrNewEvents": [
    {
      "id": "기존 ID 유지 또는 새 ID",
      "date": "${date}",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "title": "일정 제목",
      "category": "deepwork" | "fitness" | "market" | "meeting" | "personal",
      "completed": false,
      "location": "장소",
      "notes": "메모"
    }
  ]
}`;

      const rawJson = await callGeminiApi({
        prompt,
        jsonMode: true,
        apiKey: key,
        model: 'gemini-1.5-flash'
      });

      const parsed = JSON.parse(rawJson);
      if (parsed.updatedOrNewEvents && Array.isArray(parsed.updatedOrNewEvents)) {
        const otherEvents = currentEvents.filter(e => e.date !== date);
        const merged = [...otherEvents, ...parsed.updatedOrNewEvents];
        return {
          success: true,
          actionType: parsed.actionType || 'gemini_ai',
          summary: `✨ [Gemini 1.5 Live AI] ${parsed.summary}`,
          targetDate: date,
          allEvents: merged,
          modifiedEvents: parsed.updatedOrNewEvents.filter(e => currentEvents.some(ce => ce.id === e.id)),
          newEvents: parsed.updatedOrNewEvents.filter(e => !currentEvents.some(ce => ce.id === e.id))
        };
      }
    } catch (err) {
      console.warn("Gemini Live AI call failed, switching to high-precision local parser:", err);
    }
  }

  // High-Precision Local Rule & NLP Engine Fallback
  const lower = userInstruction.toLowerCase().trim();

  // Time Shifting / Delay
  if (lower.includes('미뤄') || lower.includes('연기') || lower.includes('뒤로') || lower.includes('앞당겨')) {
    let offsetMinutes = 30;
    const minMatch = userInstruction.match(/(\d+)\s*분/);
    const hourMatch = userInstruction.match(/(\d+(?:\.\d+)?)\s*시간/);
    if (hourMatch) offsetMinutes = Math.round(parseFloat(hourMatch[1]) * 60);
    else if (minMatch) offsetMinutes = parseInt(minMatch[1], 10);

    if (lower.includes('앞당겨') || lower.includes('일찍')) offsetMinutes = -offsetMinutes;

    const afterHourMatch = userInstruction.match(/(\d{1,2})시\s*이후/);
    const afterMinutes = afterHourMatch ? parseInt(afterHourMatch[1], 10) * 60 : (lower.includes('오후') ? 720 : 0);

    const updatedEvents = [];
    const modifiedList = [];

    currentEvents.forEach(evt => {
      if (evt.date === date) {
        const startM = timeStrToMinutes(evt.startTime);
        const endM = timeStrToMinutes(evt.endTime);
        const duration = endM - startM;

        if (startM >= afterMinutes) {
          const newStartM = Math.max(0, Math.min(1439, startM + offsetMinutes));
          const newEndM = Math.max(0, Math.min(1439, newStartM + duration));
          const updated = {
            ...evt,
            startTime: minutesToTimeStr(newStartM),
            endTime: minutesToTimeStr(newEndM),
            notes: `${evt.notes || ''} [AI: ${offsetMinutes > 0 ? '+' : ''}${offsetMinutes}분 조정]`
          };
          updatedEvents.push(updated);
          modifiedList.push(updated);
        } else {
          updatedEvents.push(evt);
        }
      } else {
        updatedEvents.push(evt);
      }
    });

    return {
      success: true,
      actionType: 'shift',
      summary: `일정이 ${offsetMinutes > 0 ? '+' : ''}${offsetMinutes}분씩 자동 조정되었습니다. (${modifiedList.length}건 수정)`,
      targetDate: date,
      allEvents: updatedEvents,
      modifiedEvents: modifiedList,
      newEvents: []
    };
  }

  // Conflict Resolution
  if (lower.includes('충돌') || lower.includes('겹치') || lower.includes('버퍼') || lower.includes('정리')) {
    const dayEvents = currentEvents.filter(e => e.date === date);
    const otherEvents = currentEvents.filter(e => e.date !== date);
    dayEvents.sort((a, b) => timeStrToMinutes(a.startTime) - timeStrToMinutes(b.startTime));

    let cursor = timeStrToMinutes(dayEvents[0]?.startTime || '09:00');
    const resolved = [];
    const modified = [];

    dayEvents.forEach((evt, idx) => {
      const startM = timeStrToMinutes(evt.startTime);
      const endM = timeStrToMinutes(evt.endTime);
      const duration = Math.max(30, endM - startM);

      if (idx === 0) {
        resolved.push(evt);
        cursor = endM + 15;
      } else {
        if (startM < cursor) {
          const newStartM = cursor;
          const newEndM = Math.min(1439, newStartM + duration);
          const up = {
            ...evt,
            startTime: minutesToTimeStr(newStartM),
            endTime: minutesToTimeStr(newEndM),
            notes: `${evt.notes || ''} [15분 버퍼 재배치]`
          };
          resolved.push(up);
          modified.push(up);
          cursor = newEndM + 15;
        } else {
          resolved.push(evt);
          cursor = Math.max(cursor, endM + 15);
        }
      }
    });

    return {
      success: true,
      actionType: 'resolve_conflicts',
      summary: `충돌 일정을 감지하여 15분 버퍼를 포함해 순차적으로 최적화했습니다. (${modified.length}건 재배치)`,
      targetDate: date,
      allEvents: [...otherEvents, ...resolved],
      modifiedEvents: modified,
      newEvents: []
    };
  }

  // NLP Schedule Parsing
  const parsedEvents = parseKoreanScheduleText(userInstruction, date);

  if (parsedEvents.length > 0) {
    return {
      success: true,
      actionType: 'create_bulk',
      summary: `AI가 자연어를 분석하여 총 ${parsedEvents.length}건의 일정을 성공적으로 편성했습니다.`,
      targetDate: date,
      allEvents: [...currentEvents, ...parsedEvents],
      modifiedEvents: [],
      newEvents: parsedEvents
    };
  }

  return {
    success: false,
    actionType: 'none',
    summary: '일정 정보를 파싱할 수 없습니다. 시간과 내용을 포함하여 다시 입력해주세요.',
    targetDate: date,
    allEvents: currentEvents,
    modifiedEvents: [],
    newEvents: []
  };
}

/**
 * Schedule Chat & Q&A Assistant (Ask anything about schedules)
 */
export async function askScheduleQuestion({ 
  question, 
  calendarEvents = [], 
  routines = [], 
  apiKey = null 
}) {
  const key = apiKey || getStoredGeminiApiKey();
  const todayStr = getTodayDateStr();

  if (key && key.startsWith('AIza')) {
    try {
      const prompt = `당신은 L&M OS의 일정 및 라이프 프로토콜 전문 지능형 AI 비서입니다.
아래 사용자의 등록된 일정 및 루틴 데이터를 바탕으로 사용자의 질문에 군더더기 없이 간결하고 명확하게 한국어로 답변하세요.

[현재 날짜]: ${todayStr} (${formatKoreanDate(todayStr)})
[사용자 등록 일정 목록 (총 ${calendarEvents.length}건)]:
${calendarEvents.map(e => `• [${e.date}] ${e.startTime}~${e.endTime} | ${e.title} (${e.category}, ${e.location}) [${e.completed ? '완수' : '미완수'}]`).join('\n')}

[데일리 루틴]:
${routines.map(r => `• ${r.title} (${r.completed ? '완료' : '진행전'})`).join('\n')}

[질문]:
${question}`;

      const answer = await callGeminiApi({
        prompt,
        apiKey: key,
        model: 'gemini-1.5-flash'
      });

      return {
        answer,
        source: 'Gemini 1.5 Live AI'
      };
    } catch (err) {
      console.warn("Schedule QA Gemini call error, using local AI engine:", err);
    }
  }

  // Built-in Local AI Engine
  return queryLocalAiEngine(question, { calendarEvents, routines });
}
