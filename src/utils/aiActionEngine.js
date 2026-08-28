// L&M OS Smart Action & Ultra-Precise Schedule Execution Engine
import { callGeminiApi, getStoredGeminiApiKey, buildGlobalSystemContext } from '../services/geminiService.js';
import { getTodayDateStr, formatKoreanDate, getRelativeDateStr } from './dateUtils.js';

/**
 * Robust JSON Extractor
 */
export function extractJson(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const trimmed = rawText.trim();
  
  try {
    return JSON.parse(trimmed);
  } catch (e) {}

  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (e) {}
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.substring(firstBrace, lastBrace + 1));
    } catch (e) {}
  }

  return null;
}

/**
 * Generates all dates in a date range matching specified weekdays (0=Sun, 1=Mon, ..., 6=Sat)
 */
export function generateDatesFromRule({ startDate, endDate, weekdays = [] }) {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  const current = new Date(start);
  while (current <= end) {
    if (!weekdays || weekdays.length === 0 || weekdays.includes(current.getDay())) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Parses time expressions into 24-hour HH:MM format
 * e.g. "9시부터 오후 6시", "09:00~18:00", "오후 3시", "10시 반"
 */
export function parseTimeRange(text) {
  let startTime = '09:00';
  let endTime = '18:00';

  // Pattern: [오전/오후] A시 ~ [오전/오후] B시
  const rangeMatch = text.match(/(오전|오후|아침|저녁|새벽)?\s*(\d{1,2})(?:시|:)?(\d{2})?(?:부터|~|-|\s)\s*(오전|오후|아침|저녁|새벽)?\s*(\d{1,2})(?:시|:)?(\d{2})?/);
  if (rangeMatch) {
    let startHour = parseInt(rangeMatch[2], 10);
    const startMin = rangeMatch[3] ? parseInt(rangeMatch[3], 10) : 0;
    const startPeriod = rangeMatch[1];
    if ((startPeriod === '오후' || startPeriod === '저녁') && startHour < 12) startHour += 12;

    let endHour = parseInt(rangeMatch[5], 10);
    const endMin = rangeMatch[6] ? parseInt(rangeMatch[6], 10) : 0;
    const endPeriod = rangeMatch[4] || (endHour < startHour ? '오후' : null);
    if ((endPeriod === '오후' || endPeriod === '저녁' || (endHour <= 7 && startHour >= 8)) && endHour < 12) {
      endHour += 12;
    }

    startTime = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
    endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
    return { startTime, endTime };
  }

  // Single time match e.g. "오후 3시", "14:00"
  const singleMatch = text.match(/(오전|오후|아침|저녁|새벽)?\s*(\d{1,2})(?:시|:)?(\d{2})?/);
  if (singleMatch) {
    let hour = parseInt(singleMatch[2], 10);
    const min = singleMatch[3] ? parseInt(singleMatch[3], 10) : 0;
    if ((singleMatch[1] === '오후' || singleMatch[1] === '저녁') && hour < 12) hour += 12;
    startTime = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    endTime = `${String(Math.min(23, hour + 1)).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    return { startTime, endTime };
  }

  return { startTime: '09:00', endTime: '18:00' };
}

/**
 * Strict and Accurate Weekday Parser (Prevents '일' in '일정' from triggering Sunday)
 */
export function parseWeekdaysStrict(text) {
  const weekdays = [];
  const dayMap = { '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6, '일': 0 };

  // 1. Direct regex for explicit weekday phrases after '매주' or before '요일'
  const recurringSectionMatch = text.match(/매주\s*([월화수목금토일,\s/·~]+)/);
  if (recurringSectionMatch && recurringSectionMatch[1]) {
    const rawSec = recurringSectionMatch[1].replace(/요일|에|마다|일정/g, '');
    for (const [char, val] of Object.entries(dayMap)) {
      if (rawSec.includes(char)) {
        if (!weekdays.includes(val)) weekdays.push(val);
      }
    }
  }

  // 2. Combo phrases like "월 목", "월, 목", "월/목", "월수금", "화목"
  if (weekdays.length === 0) {
    if (/월\s*목|월,\s*목|월\/목/.test(text)) {
      weekdays.push(1, 4);
    } else if (/월\s*수\s*금/.test(text)) {
      weekdays.push(1, 3, 5);
    } else if (/화\s*목/.test(text)) {
      weekdays.push(2, 4);
    } else if (/화\s*금/.test(text)) {
      weekdays.push(2, 5);
    } else {
      // Check explicit "X요일" patterns only
      for (const [char, val] of Object.entries(dayMap)) {
        if (text.includes(`${char}요일`)) {
          if (!weekdays.includes(val)) weekdays.push(val);
        }
      }
    }
  }

  return weekdays;
}

/**
 * Ultra-Precise Local Rule Parser
 */
export function parseLocalScheduleInstruction(text, todayStr = getTodayDateStr()) {
  const [currentYearStr, currentMonthStr] = todayStr.split('-');
  const currentYear = parseInt(currentYearStr, 10);
  const currentMonth = parseInt(currentMonthStr, 10);

  // Check full clear commands
  if (/(?:전체|모든|전부|다)\s*(?:일정)?\s*(?:삭제|지워|제거|비워|초기화)|캘린더\s*(?:초기화|비워)/i.test(text)) {
    return {
      answer: "캘린더의 모든 일정이 성공적으로 초기화(삭제)되었습니다.",
      actions: [{ type: 'CLEAR_ALL_CALENDAR_EVENTS' }]
    };
  }

  // Check delete by keyword commands
  if (/삭제|지워|제거|취소|빼줘/i.test(text)) {
    const cleanKw = text
      .replace(/일정|삭제해줘|지워줘|제거해줘|취소해줘|빼줘|모두|전부/g, '')
      .trim();
    return {
      answer: `'${cleanKw || '해당'}' 관련 일정을 캘린더에서 삭제했습니다.`,
      actions: [{ type: 'DELETE_CALENDAR_EVENT_BY_TITLE', keyword: cleanKw }]
    };
  }

  // 1. Strict Weekday detection
  const weekdays = parseWeekdaysStrict(text);

  // 2. Accurate Time Range
  const { startTime, endTime } = parseTimeRange(text);

  // 3. Date & Period detection
  let startDate = todayStr;
  let endDate = todayStr;
  let isRecurring = weekdays.length > 0 || /매주|마다|동안|까지/i.test(text);

  if (isRecurring) {
    let targetYear = currentYear;
    let targetMonth = currentMonth;

    if (text.includes('내년')) {
      targetYear = currentYear + 1;
    }

    const yearMonthMatch = text.match(/(?:(\d{4})년\s*)?(\d{1,2})월/);
    if (yearMonthMatch) {
      if (yearMonthMatch[1]) targetYear = parseInt(yearMonthMatch[1], 10);
      targetMonth = parseInt(yearMonthMatch[2], 10);
      if (!yearMonthMatch[1] && !text.includes('내년') && targetMonth < currentMonth) {
        targetYear = currentYear + 1;
      }
    }

    const lastDay = new Date(targetYear, targetMonth, 0).getDate();
    endDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  } else {
    // Single day
    if (text.includes('내일')) startDate = endDate = getRelativeDateStr(1, todayStr);
    else if (text.includes('모레')) startDate = endDate = getRelativeDateStr(2, todayStr);
    else {
      const singleDateMatch = text.match(/(?:(\d{4})년\s*)?(\d{1,2})월\s*(\d{1,2})일/);
      if (singleDateMatch) {
        const y = singleDateMatch[1] ? parseInt(singleDateMatch[1], 10) : currentYear;
        const m = String(parseInt(singleDateMatch[2], 10)).padStart(2, '0');
        const d = String(parseInt(singleDateMatch[3], 10)).padStart(2, '0');
        startDate = endDate = `${y}-${m}-${d}`;
      }
    }
  }

  // 4. Location extraction
  let location = '진료지';
  const locMatch = text.match(/(서면|판교|강남|여의도|본원|분원|자택|연구실|병원|클리닉|사무실)/);
  if (locMatch) {
    location = locMatch[1];
  }

  // 5. Clean Title extraction (Pristine surgical cleanup)
  let cleanTitle = text
    .replace(/(?:내년|\d{4}년|\d{1,2}월(?:까지|말|동안)?|\d{1,2}일)/g, ' ')
    .replace(/매주\s*[월화수목금토일,\s/·~]+(?:요일)?(?:에|마다)?/g, ' ')
    .replace(/[월화수목금토일,\s/·~]+요일(?:에|마다)?/g, ' ')
    .replace(/시간은\s*[^\s]+(?:부터|~|-)\s*[^\s]+(?:까지)?/g, ' ')
    .replace(/(?:오전|오후|아침|저녁|새벽)?\s*\d{1,2}(?:시|:)?(?:\d{2})?(?:부터|~|-|\s)*(?:오전|오후|아침|저녁|새벽)?\s*\d{1,2}(?:시|:)?(?:\d{2})?(?:까지)?/g, ' ')
    .replace(/일정\s*(?:넣어줘|추가해줘|등록해줘|잡아줘|편성해줘|기록해줘|넣어|추가|등록)/g, ' ')
    .replace(/(?:넣어줘|추가해줘|등록해줘|잡아줘|편성해줘|기록해줘|넣어|추가|등록)/g, ' ')
    .replace(/시간은|시간|일정/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If user mentioned location, ensure cleanTitle includes or formats properly
  if (!cleanTitle || cleanTitle.length < 2) {
    cleanTitle = /진료|순회/.test(text) ? '서면 순회진료' : '예정 일정';
  }

  // 6. Category
  let category = 'meeting';
  if (/진료|병원|클리닉|당직|순회|외래/i.test(text)) category = 'meeting';
  else if (/딥워크|코딩|개발|연구|논문|공부|집중/i.test(text)) category = 'deepwork';
  else if (/러닝|운동|헬스|피트니스|zone/i.test(text)) category = 'fitness';
  else if (/주식|어닝|장전|fomc|매매/i.test(text)) category = 'market';

  // 7. Generate final events
  const targetDates = generateDatesFromRule({ startDate, endDate, weekdays });
  const weekdayKorean = weekdays.length > 0 
    ? weekdays.map(w => ['일','월','화','수','목','금','토'][w]).join(', ') + '요일'
    : '';

  const events = targetDates.map((d, idx) => ({
    id: `ai-evt-${Date.now()}-${idx}`,
    date: d,
    startTime,
    endTime,
    title: cleanTitle,
    category,
    location,
    completed: false,
    notes: isRecurring ? `정기 일정 (${weekdayKorean} ${startTime}~${endTime})` : `AI 일정 등록`
  }));

  const summary = isRecurring
    ? `${endDate.split('-')[0]}년 ${parseInt(endDate.split('-')[1], 10)}월까지 매주 ${weekdayKorean} (${startTime}~${endTime}) '${cleanTitle}'(${location}) 총 ${events.length}건의 일정을 캘린더에 성공적으로 등록했습니다.`
    : `${formatKoreanDate(startDate)} (${startTime}~${endTime}) '${cleanTitle}'(${location}) 일정을 등록했습니다.`;

  return {
    answer: summary,
    actions: [{ type: 'ADD_CALENDAR_EVENTS', events }]
  };
}

/**
 * Master Execution Function: Interacts with Gemini and executes real state changes
 */
export async function processAiCopilotInstruction({
  userInput,
  calendarEvents = [],
  routines = [],
  dietLogs = [],
  runningLogs = [],
  expenses = [],
  userProfile = {}
}) {
  const currentKey = getStoredGeminiApiKey();
  const todayStr = getTodayDateStr();
  const todayFormatted = formatKoreanDate(todayStr);

  // 1. Try Gemini Live API with Structured Schedule Rule Protocol
  if (currentKey && currentKey.trim()) {
    try {
      const systemContext = buildGlobalSystemContext({
        calendarEvents,
        routines,
        dietLogs,
        runningLogs,
        expenses,
        userProfile
      });

      const prompt = `당신은 최고 전략 개인 OS 'L&M OS'의 수석 AI 비서이자 초정밀 스케줄링 엔진(Action Copilot)입니다.
사용자의 자연어 명령에서 일정 생성 규칙(Rule)이나 데이터 작업 명령을 추출하여 정확한 JSON을 반환하세요.

[현재 기준 시점]:
- 오늘 날짜: ${todayStr} (${todayFormatted})

[사용자 전체 데이터]:
${systemContext}

[사용자 명령]:
"${userInput}"

[추출 및 정제 규칙]:
1. 제목(title): "서면 순회진료" 또는 "순회진료"처럼 핵심 일정 이름만 깔끔하게 남기세요. 문장의 군더더기(내년 3월까지, 매주 월 목, 시간은 9시부터, 일정 넣어줘 등)는 전부 제거하세요.
2. 장소(location): 문장에 등장한 장소(예: "서면", "판교", "강남", "본원" 등)를 추출하세요. 없으면 "진료지".
3. 시간(startTime, endTime): 24시간 형식 "HH:MM" (예: "09:00", "18:00").
4. 반복 범위:
   - 시작일(startDate): 오늘(${todayStr})
   - 종료일(endDate): 지정된 시점 (예: 내년 3월 -> 2027-03-31, 9월 -> 2026-09-30). 단일 일정이면 시작일과 동일.
   - 반복 요일(weekdays): 정확히 지정된 요일만 배열로 반환 (0=일, 1=월, 2=화, 3=수, 4=목, 5=금, 6=토). 예: 월, 목 -> [1, 4]. 단일 일정이면 []. 절대로 언급되지 않은 일요일(0)을 넣지 마세요!
5. 카테고리(category): ["deepwork", "fitness", "market", "meeting", "personal"] 중 하나.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "answer": "2027년 3월까지 매주 월, 목요일 (09:00~18:00) '서면 순회진료' 일정을 캘린더에 성공적으로 등록했습니다.",
  "rule": {
    "title": "서면 순회진료",
    "location": "서면",
    "category": "meeting",
    "startTime": "09:00",
    "endTime": "18:00",
    "startDate": "${todayStr}",
    "endDate": "2027-03-31",
    "weekdays": [1, 4],
    "notes": "서면 순회진료 정기 일정"
  },
  "diet": null,
  "expense": null,
  "deleteKeyword": null
}`;

      const rawResult = await callGeminiApi({
        prompt,
        apiKey: currentKey,
        model: 'gemini-2.0-flash'
      });

      const parsed = extractJson(rawResult);
      if (parsed && typeof parsed.answer === 'string') {
        const actions = [];

        // 1. If schedule rule was extracted, generate events
        if (parsed.rule && parsed.rule.title) {
          const targetDates = generateDatesFromRule({
            startDate: parsed.rule.startDate || todayStr,
            endDate: parsed.rule.endDate || todayStr,
            weekdays: parsed.rule.weekdays || []
          });

          const generatedEvents = targetDates.map((d, idx) => ({
            id: `ai-gen-${Date.now()}-${idx}`,
            date: d,
            startTime: parsed.rule.startTime || '09:00',
            endTime: parsed.rule.endTime || '18:00',
            title: parsed.rule.title,
            category: parsed.rule.category || 'meeting',
            location: parsed.rule.location || '서면',
            completed: false,
            notes: parsed.rule.notes || '정기 일정'
          }));

          if (generatedEvents.length > 0) {
            actions.push({
              type: 'ADD_CALENDAR_EVENTS',
              events: generatedEvents
            });
          }
        }

        // 2. Delete action
        if (parsed.deleteKeyword) {
          actions.push({
            type: 'DELETE_CALENDAR_EVENT_BY_TITLE',
            keyword: parsed.deleteKeyword
          });
        }

        // 3. Diet action
        if (parsed.diet) {
          actions.push({
            type: 'ADD_DIET_LOG',
            log: parsed.diet
          });
        }

        // 4. Expense action
        if (parsed.expense) {
          actions.push({
            type: 'ADD_EXPENSE',
            expense: parsed.expense
          });
        }

        return {
          answer: parsed.answer,
          actions,
          source: 'gemini'
        };
      }
    } catch (err) {
      console.warn("Gemini Copilot API execution failed, falling back to smart local parser:", err);
    }
  }

  // 2. High-Precision Local Rule Parser Fallback
  const localResult = parseLocalScheduleInstruction(userInput, todayStr);
  if (localResult) {
    return {
      answer: localResult.answer,
      actions: localResult.actions,
      source: 'local'
    };
  }

  // 3. Fallback
  return {
    answer: "요청하신 내용을 확인했습니다. 일정 추가, 변경, 삭제 등 원하는 작업을 자유롭게 말씀해 주세요.",
    actions: [],
    source: 'fallback'
  };
}
