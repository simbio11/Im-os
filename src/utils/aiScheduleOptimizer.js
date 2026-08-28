// AI Schedule Auto-Optimizer & Bulk Natural Language Processing Engine for L&M OS
import { getTodayDateStr, getRelativeDateStr, timeStrToMinutes, minutesToTimeStr } from './dateUtils';

/**
 * Parses freeform natural language text to extract category, times, title, and location
 */
export function parseSingleScheduleLine(line, defaultDate = null) {
  if (!line || typeof line !== 'string') return null;
  const raw = line.trim().replace(/^[-*•\d.)\]]\s*/, '');
  if (!raw || raw.length < 2) return null;

  const date = defaultDate || getTodayDateStr();

  // 1. Time extraction
  // Pattern 1: Range "14:00 - 15:30", "14:00~16:00", "09:30부터 11:00까지", "9시부터 11시"
  let startTime = "14:00";
  let endTime = "15:00";

  const rangeMatch = raw.match(/(\d{1,2}:\d{2})\s*(?:-|~|부터|\sto\s)\s*(\d{1,2}:\d{2})/);
  const hourRangeMatch = raw.match(/(\d{1,2})시(?:\s*(\d{1,2})분)?\s*(?:-|~|부터)\s*(\d{1,2})시(?:\s*(\d{1,2})분)?/);
  const singleTimeMatch = raw.match(/(\d{1,2}:\d{2})/);
  const singleHourMatch = raw.match(/(\d{1,2})시(?:\s*(\d{1,2})분)?/);
  const durationMatch = raw.match(/(\d+(?:\.\d+)?)\s*(?:시간|분간|hr|min)/);

  if (rangeMatch) {
    startTime = rangeMatch[1].padStart(5, '0');
    endTime = rangeMatch[2].padStart(5, '0');
  } else if (hourRangeMatch) {
    const startH = parseInt(hourRangeMatch[1], 10);
    const startM = parseInt(hourRangeMatch[2] || '0', 10);
    const endH = parseInt(hourRangeMatch[3], 10);
    const endM = parseInt(hourRangeMatch[4] || '0', 10);
    startTime = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
    endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  } else if (singleTimeMatch) {
    startTime = singleTimeMatch[1].padStart(5, '0');
    const startMins = timeStrToMinutes(startTime);
    let durMins = 60;
    if (durationMatch) {
      if (raw.includes('시간') || raw.includes('hr')) {
        durMins = Math.round(parseFloat(durationMatch[1]) * 60);
      } else {
        durMins = parseInt(durationMatch[1], 10);
      }
    }
    endTime = minutesToTimeStr(startMins + durMins);
  } else if (singleHourMatch) {
    let startH = parseInt(singleHourMatch[1], 10);
    const startM = parseInt(singleHourMatch[2] || '0', 10);
    
    // PM heuristic: if user says "2시 미팅" and not specified, if morning passed or context implies afternoon
    if (raw.includes('오후') && startH < 12) {
      startH += 12;
    }
    startTime = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
    const startMins = timeStrToMinutes(startTime);
    let durMins = 60;
    if (durationMatch) {
      if (raw.includes('시간') || raw.includes('hr')) {
        durMins = Math.round(parseFloat(durationMatch[1]) * 60);
      } else {
        durMins = parseInt(durationMatch[1], 10);
      }
    }
    endTime = minutesToTimeStr(startMins + durMins);
  }

  // 2. Category Detection
  let category = 'deepwork';
  const lower = raw.toLowerCase();

  if (lower.includes('러닝') || lower.includes('운동') || lower.includes('헬스') || lower.includes('피트니스') || lower.includes('스트레칭') || lower.includes('5km') || lower.includes('조깅')) {
    category = 'fitness';
  } else if (lower.includes('미팅') || lower.includes('회의') || lower.includes('인터뷰') || lower.includes('싱크') || lower.includes('통화') || lower.includes('클라이언트') || lower.includes('세미나')) {
    category = 'meeting';
  } else if (lower.includes('주식') || lower.includes('어닝콜') || lower.includes('fomc') || lower.includes('브리핑') || lower.includes('매크로') || lower.includes('실적') || lower.includes('ir') || lower.includes('투자')) {
    category = 'market';
  } else if (lower.includes('식사') || lower.includes('점심') || lower.includes('저녁') || lower.includes('독서') || lower.includes('휴식') || lower.includes('약속') || lower.includes('개인') || lower.includes('병원')) {
    category = 'personal';
  } else {
    category = 'deepwork';
  }

  // 3. Location Detection
  let location = '홈 오피스';
  if (lower.includes('zoom') || lower.includes('meet') || lower.includes('온라인') || lower.includes('디스코드')) {
    location = 'Google Meet / Zoom';
  } else if (lower.includes('한강') || lower.includes('트랙') || lower.includes('공원') || lower.includes('헬스장')) {
    location = '한강 러닝 트랙';
  } else if (lower.includes('카페') || lower.includes('스타벅스')) {
    location = '카페';
  } else if (lower.includes('사무실') || lower.includes('회사') || lower.includes('회의실')) {
    location = '오피스 회의실';
  }

  // Clean Title
  let title = raw
    .replace(/(?:오전|오후)?\s*\d{1,2}(?::\d{2}|시(?:\s*\d{1,2}분)?)(?:\s*(?:-|~|부터|\sto\s)\s*(?:오전|오후)?\s*\d{1,2}(?::\d{2}|시(?:\s*\d{1,2}분)?))?/g, '')
    .replace(/\d+(?:\.\d+)?\s*(?:시간|분간|hr|min)/g, '')
    .replace(/^(?:일정|스케줄|등록|추가|할일|투두|task|todo)[:\s]*/i, '')
    .trim();

  if (!title) title = raw;

  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    date,
    startTime,
    endTime,
    title,
    category,
    completed: false,
    location,
    notes: `AI 자동 스케줄링 생성 (${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })})`
  };
}

/**
 * Intelligent Local Rule Parser for Time Shifting, Delays, & Conflict Optimization
 */
export function executeLocalScheduleOptimization(instruction, currentEvents, targetDate = null) {
  const date = targetDate || getTodayDateStr();
  const lower = instruction.toLowerCase().trim();

  // Scenario 1: Time Shift / Delay (e.g. "30분 뒤로 미뤄줘", "1시간 연기해줘", "1시간 앞당겨줘")
  if (lower.includes('미뤄') || lower.includes('연기') || lower.includes('뒤로') || lower.includes('앞당겨') || lower.includes('shift') || lower.includes('delay')) {
    let offsetMinutes = 30;
    const minMatch = instruction.match(/(\d+)\s*분/);
    const hourMatch = instruction.match(/(\d+(?:\.\d+)?)\s*시간/);

    if (hourMatch) {
      offsetMinutes = Math.round(parseFloat(hourMatch[1]) * 60);
    } else if (minMatch) {
      offsetMinutes = parseInt(minMatch[1], 10);
    }

    if (lower.includes('앞당겨') || lower.includes('일찍')) {
      offsetMinutes = -offsetMinutes;
    }

    // Check if filtering from specific hour (e.g. "14시 이후", "오후 일정만")
    const afterHourMatch = instruction.match(/(\d{1,2})시\s*이후/);
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
      summary: `${formatDateOnly(date)} 일정이 ${offsetMinutes > 0 ? '+' : ''}${offsetMinutes}분씩 자동 조정되었습니다. (총 ${modifiedList.length}건 수정)`,
      targetDate: date,
      allEvents: updatedEvents,
      modifiedEvents: modifiedList,
      newEvents: []
    };
  }

  // Scenario 2: Conflict Resolution & Auto-Spacing (e.g. "겹치는 일정 정리", "충돌 해결")
  if (lower.includes('충돌') || lower.includes('겹치') || lower.includes('정리') || lower.includes('최적화') || lower.includes('conflict')) {
    const dayEvents = currentEvents.filter(e => e.date === date);
    const otherEvents = currentEvents.filter(e => e.date !== date);

    if (dayEvents.length <= 1) {
      return {
        success: true,
        actionType: 'none',
        summary: `${formatDateOnly(date)}에는 충돌하는 일정이 없습니다.`,
        targetDate: date,
        allEvents: currentEvents,
        modifiedEvents: [],
        newEvents: []
      };
    }

    // Sort by startTime
    dayEvents.sort((a, b) => timeStrToMinutes(a.startTime) - timeStrToMinutes(b.startTime));

    let currentCursor = timeStrToMinutes(dayEvents[0].startTime);
    const resolvedDayEvents = [];
    const modifiedList = [];

    dayEvents.forEach((evt, idx) => {
      const startM = timeStrToMinutes(evt.startTime);
      const endM = timeStrToMinutes(evt.endTime);
      const duration = Math.max(30, endM - startM);

      if (idx === 0) {
        resolvedDayEvents.push(evt);
        currentCursor = endM + 15; // 15 min buffer
      } else {
        if (startM < currentCursor) {
          // Conflict detected! Re-align
          const newStartM = currentCursor;
          const newEndM = Math.min(1439, newStartM + duration);
          const updated = {
            ...evt,
            startTime: minutesToTimeStr(newStartM),
            endTime: minutesToTimeStr(newEndM),
            notes: `${evt.notes || ''} [AI 충돌 방지: 15분 버퍼 재배치]`
          };
          resolvedDayEvents.push(updated);
          modifiedList.push(updated);
          currentCursor = newEndM + 15;
        } else {
          resolvedDayEvents.push(evt);
          currentCursor = Math.max(currentCursor, endM + 15);
        }
      }
    });

    return {
      success: true,
      actionType: 'resolve_conflicts',
      summary: `충돌 및 겹치는 시간대를 감지하여 15분 휴식 버퍼를 포함해 순차적으로 최적화했습니다. (${modifiedList.length}건 조정)`,
      targetDate: date,
      allEvents: [...otherEvents, ...resolvedDayEvents],
      modifiedEvents: modifiedList,
      newEvents: []
    };
  }

  // Scenario 3: Bulk Creation from Multi-line or Natural Text
  const lines = instruction.split(/[\n,;]| 그리고 |\s*또는\s*/).map(s => s.trim()).filter(Boolean);
  const createdEvents = [];

  for (const line of lines) {
    // Check if line mentions target date (e.g. "내일", "모레", "8/29", "8월 30일")
    let lineDate = date;
    if (line.includes('내일') || line.includes('tomorrow')) {
      lineDate = getRelativeDateStr(1);
    } else if (line.includes('모레')) {
      lineDate = getRelativeDateStr(2);
    } else if (line.includes('오늘') || line.includes('today')) {
      lineDate = getTodayDateStr();
    } else {
      const specificDateMatch = line.match(/(\d{1,2})월\s*(\d{1,2})일/) || line.match(/(\d{1,2})\/(\d{1,2})/);
      if (specificDateMatch) {
        const m = specificDateMatch[1].padStart(2, '0');
        const d = specificDateMatch[2].padStart(2, '0');
        lineDate = `${new Date().getFullYear()}-${m}-${d}`;
      }
    }

    const parsed = parseSingleScheduleLine(line, lineDate);
    if (parsed) {
      createdEvents.push(parsed);
    }
  }

  if (createdEvents.length > 0) {
    return {
      success: true,
      actionType: 'create_bulk',
      summary: `AI가 자연어를 분석하여 총 ${createdEvents.length}건의 일정을 성공적으로 생성했습니다.`,
      targetDate: date,
      allEvents: [...currentEvents, ...createdEvents],
      modifiedEvents: [],
      newEvents: createdEvents
    };
  }

  // Fallback Template Generation
  const defaultRoutine = [
    {
      id: `evt-gen-${Date.now()}-1`,
      date,
      startTime: "09:30",
      endTime: "11:00",
      title: "🧠 1차 딥워크: 핵심 엔지니어링 및 아키텍처 집중",
      category: "deepwork",
      completed: false,
      location: "홈 오피스",
      notes: "40Hz 감마 바이노럴 비트 몰입"
    },
    {
      id: `evt-gen-${Date.now()}-2`,
      date,
      startTime: "14:00",
      endTime: "15:30",
      title: "📊 테크 포트폴리오 리밸런싱 및 투자 잉여금 점검",
      category: "market",
      completed: false,
      location: "L&M OS",
      notes: "NVDA/QQQ 분할 매수 점검"
    },
    {
      id: `evt-gen-${Date.now()}-3`,
      date,
      startTime: "17:30",
      endTime: "18:15",
      title: "🏃 5km Zone 2 모닝/이브닝 러닝 세션",
      category: "fitness",
      completed: false,
      location: "트랙",
      notes: "페이스 5'15\" 목표"
    }
  ];

  return {
    success: true,
    actionType: 'template',
    summary: `표준 고효율 일일 프로토콜 스케줄 3건이 생성되었습니다.`,
    targetDate: date,
    allEvents: [...currentEvents, ...defaultRoutine],
    modifiedEvents: [],
    newEvents: defaultRoutine
  };
}

/**
 * Main AI Schedule Optimization Controller (Supports Gemini 1.5 Live API or Local Intelligent Fallback)
 */
export async function optimizeScheduleWithAI({ userInstruction, currentEvents = [], targetDate = null, apiKey = null }) {
  const date = targetDate || getTodayDateStr();

  if (apiKey && apiKey.startsWith('AIza')) {
    try {
      const dayEvents = currentEvents.filter(e => e.date === date);
      const prompt = `당신은 개인 최고 전략 OS "L&M OS"의 지능형 일정 최적화 AI입니다.
사용자의 요청에 따라 캘린더 일정을 추가, 수정, 시간 시프트, 또는 충돌 해결하여 유효한 JSON 형식으로만 반환하세요.

[현재 날짜]: ${date}
[현재 등록된 일정]:
${JSON.stringify(dayEvents, null, 2)}

[사용자 요청]:
"${userInstruction}"

[응답 규칙]:
반드시 아래와 같은 순수 JSON 형식만 반환하세요 (마크다운 백틱 제외):
{
  "summary": "한국어로 수행한 작업 요약 (예: 2개 일정이 30분씩 뒤로 이동되었고 1개 새 일정이 추가되었습니다)",
  "actionType": "shift" | "create_bulk" | "resolve_conflicts" | "template",
  "updatedOrNewEvents": [
    {
      "id": "기존 ID 유지 또는 새 ID",
      "date": "YYYY-MM-DD",
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

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawText) {
        const parsedJson = JSON.parse(rawText);
        if (parsedJson.updatedOrNewEvents && Array.isArray(parsedJson.updatedOrNewEvents)) {
          // Merge with other date events
          const otherEvents = currentEvents.filter(e => e.date !== date);
          const mergedAll = [...otherEvents, ...parsedJson.updatedOrNewEvents];
          return {
            success: true,
            actionType: parsedJson.actionType || 'gemini_ai',
            summary: `✨ [Gemini Live AI] ${parsedJson.summary}`,
            targetDate: date,
            allEvents: mergedAll,
            modifiedEvents: parsedJson.updatedOrNewEvents.filter(e => currentEvents.some(ce => ce.id === e.id)),
            newEvents: parsedJson.updatedOrNewEvents.filter(e => !currentEvents.some(ce => ce.id === e.id))
          };
        }
      }
    } catch (err) {
      console.warn("Gemini schedule optimization failed, using local AI engine:", err);
    }
  }

  // Local AI Fallback Engine
  return executeLocalScheduleOptimization(userInstruction, currentEvents, date);
}

function formatDateOnly(dateStr) {
  return dateStr;
}
