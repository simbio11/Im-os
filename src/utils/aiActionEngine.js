// L&M OS Smart Action & Natural Language Execution Engine
import { callGeminiApi, getStoredGeminiApiKey, buildGlobalSystemContext } from '../services/geminiService.js';
import { getTodayDateStr, formatKoreanDate, getRelativeDateStr } from './dateUtils.js';

/**
 * Robust JSON Extractor from raw AI responses (handles markdown fences, prefixes, etc.)
 */
export function extractJson(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const trimmed = rawText.trim();
  
  // 1. Direct parse
  try {
    return JSON.parse(trimmed);
  } catch (e) {}

  // 2. Markdown fence ```json ... ``` or ``` ... ```
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (e) {}
  }

  // 3. Substring between outermost { and }
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
 * Parses weekday tokens in Korean to 0..6 (0=Sun, 1=Mon, ..., 6=Sat)
 */
export function extractWeekdays(text) {
  const weekdays = new Set();
  const dayMap = {
    '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6, '일': 0
  };

  // Check combinations like "월 목", "월, 목", "월/목", "월수금", "화목", "매주 월요일과 목요일"
  for (const [char, val] of Object.entries(dayMap)) {
    // Matches if char is followed by 요일 or standalone surrounded by separators/spaces
    const regex = new RegExp(`(?:^|[\\s,/·~-])${char}(?:요일)?(?=[\\s,/·~-]|에|마다|일정|$)`, 'g');
    if (regex.test(text) || text.includes(`${char}요일`) || text.includes(`${char},`) || text.includes(`${char}/`)) {
      weekdays.add(val);
    }
  }

  // Also catch direct compact formats like "월목", "월수금", "화목토"
  if (weekdays.size === 0) {
    for (const [char, val] of Object.entries(dayMap)) {
      if (text.includes(char)) {
        weekdays.add(val);
      }
    }
  }

  return Array.from(weekdays);
}

/**
 * Generates all dates in a date range matching specified weekdays
 */
export function getDatesBetween(startDateStr, endDateStr, weekdaysArray = []) {
  const dates = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const current = new Date(start);
  while (current <= end) {
    if (weekdaysArray.length === 0 || weekdaysArray.includes(current.getDay())) {
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
 * High-Precision Local Rule & NLP Engine Fallback
 * Handles complex recurring schedules like "2027년 3월까지 매주 월 목에 서면 순회진료 일정 넣어줘"
 */
export function parseLocalInstruction(text, todayStr = getTodayDateStr()) {
  const lower = text.toLowerCase().trim();
  const [currentYearStr, currentMonthStr, currentDayStr] = todayStr.split('-');
  const currentYear = parseInt(currentYearStr, 10);
  const currentMonth = parseInt(currentMonthStr, 10);

  // Determine if this is an action command
  const isAddCommand = /넣어|추가|등록|생성|편성|잡아|기록/i.test(text);
  const isDeleteCommand = /삭제|지워|제거|취소|빼줘/i.test(text);

  if (isDeleteCommand) {
    const cleanKw = text
      .replace(/일정|삭제해줘|지워줘|제거해줘|취소해줘|빼줘|모두|전부/g, '')
      .trim();
    return {
      answer: `'${cleanKw || '해당'}' 관련 일정을 캘린더에서 삭제했습니다.`,
      actions: [{ type: 'DELETE_CALENDAR_EVENT_BY_TITLE', keyword: cleanKw }]
    };
  }

  if (!isAddCommand) {
    return null;
  }

  // 1. RECURRING SCHEDULE WITH DURATION (e.g., "2027년 3월까지 매주 월 목에 서면 순회진료 일정 넣어줘")
  // or "9월 매주 월, 목 순회진료", "올해 말까지 매주 금요일 딥워크"
  const untilMatch = text.match(/(?:(\d{4})년\s*)?(\d{1,2})월(?:말|까지|동안|내내)?/);
  const isRecurring = /매주|마다|월\s*목|화\s*목|월수금|주\s*\d회/i.test(text);

  if (untilMatch && isRecurring) {
    let targetYear = untilMatch[1] ? parseInt(untilMatch[1], 10) : currentYear;
    const targetMonth = parseInt(untilMatch[2], 10);

    // If year wasn't specified and month is before current month, assume next year
    if (!untilMatch[1] && targetMonth < currentMonth) {
      targetYear = currentYear + 1;
    }

    const lastDayOfTargetMonth = new Date(targetYear, targetMonth, 0).getDate();
    const startDate = todayStr;
    const endDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(lastDayOfTargetMonth).padStart(2, '0')}`;

    // Extract weekdays
    let weekdays = extractWeekdays(text);
    if (weekdays.length === 0) {
      weekdays = [1, 4]; // Default Mon, Thu if not detected
    }

    // Extract clean title and location
    let cleanTitle = text
      .replace(/(?:\d{4}년\s*)?\d{1,2}월(?:말|까지|동안|내내)?/g, '')
      .replace(/매주|마다|[월화수목금토일,\s/·~-]+(?:요일)?(?:에|마다)?/g, '')
      .replace(/일정|넣어줘|등록해줘|추가해줘|잡아줘|편성해줘|기록해줘/g, '')
      .trim();

    if (!cleanTitle) cleanTitle = '순회진료';

    // Location detection
    let location = '지정 장소';
    const locMatch = cleanTitle.match(/(서면|판교|강남|여의도|본원|분원|자택|연구실|병원|클리닉)/);
    if (locMatch) {
      location = locMatch[1];
    } else if (/진료|순회/.test(cleanTitle)) {
      location = '진료지 / 파견지';
    }

    // Category detection
    let category = 'meeting';
    if (/진료|병원|클리닉|당직|순회|외래/i.test(cleanTitle)) category = 'meeting';
    else if (/딥워크|코딩|개발|연구|논문|공부|집중/i.test(cleanTitle)) category = 'deepwork';
    else if (/러닝|운동|헬스|피트니스|zone/i.test(cleanTitle)) category = 'fitness';
    else if (/주식|어닝|장전|fomc|매매/i.test(cleanTitle)) category = 'market';

    const targetDates = getDatesBetween(startDate, endDate, weekdays);
    const weekdayKorean = weekdays.map(w => ['일','월','화','수','목','금','토'][w]).join(', ');

    const events = targetDates.map((d, idx) => ({
      id: `ai-rec-${Date.now()}-${idx}`,
      date: d,
      startTime: '09:00',
      endTime: '12:00',
      title: cleanTitle,
      category,
      location,
      completed: false,
      notes: `AI 지능형 자동 편성 (매주 ${weekdayKorean}요일 반복)`
    }));

    return {
      answer: `${targetYear}년 ${targetMonth}월까지 매주 ${weekdayKorean}요일에 총 ${events.length}건의 '${cleanTitle}'(${location}) 일정을 캘린더에 성공적으로 등록했습니다.`,
      actions: [{ type: 'ADD_CALENDAR_EVENTS', events }]
    };
  }

  // 2. SINGLE DAY OR SPECIFIC DATE SCHEDULE
  let targetDate = todayStr;
  if (lower.includes('내일')) targetDate = getRelativeDateStr(1, todayStr);
  else if (lower.includes('모레')) targetDate = getRelativeDateStr(2, todayStr);
  else if (lower.includes('글피')) targetDate = getRelativeDateStr(3, todayStr);
  else {
    const specificDateMatch = text.match(/(?:(\d{4})년\s*)?(\d{1,2})월\s*(\d{1,2})일/);
    if (specificDateMatch) {
      const y = specificDateMatch[1] ? parseInt(specificDateMatch[1], 10) : currentYear;
      const m = String(parseInt(specificDateMatch[2], 10)).padStart(2, '0');
      const d = String(parseInt(specificDateMatch[3], 10)).padStart(2, '0');
      targetDate = `${y}-${m}-${d}`;
    }
  }

  let startTime = '14:00';
  let endTime = '15:30';
  const timeMatch = text.match(/(오전|오후|저녁|아침|새벽)?\s*(\d{1,2})(?:시|:)?(\d{2})?/);
  if (timeMatch) {
    const isPm = timeMatch[1] === '오후' || timeMatch[1] === '저녁';
    let hour = parseInt(timeMatch[2], 10);
    const min = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
    if (isPm && hour < 12) hour += 12;
    startTime = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    endTime = `${String(Math.min(23, hour + 1)).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }

  let cleanTitle = text
    .replace(/(?:내일|모레|오늘|\d{4}년|\d{1,2}월\s*\d{1,2}일)/g, '')
    .replace(/(오전|오후|저녁|아침|새벽)?\s*\d{1,2}시(?:\d{2}분)?/g, '')
    .replace(/일정|추가해줘|넣어줘|등록해줘|잡아줘|편성해줘|기록해줘/g, '')
    .trim() || '새 일정';

  let category = 'personal';
  if (/딥워크|개발|연구|논문|코딩|집중/i.test(cleanTitle)) category = 'deepwork';
  else if (/러닝|운동|헬스|피트니스/i.test(cleanTitle)) category = 'fitness';
  else if (/회의|미팅|진료|상담|순회|외래/i.test(cleanTitle)) category = 'meeting';
  else if (/주식|매매|실적|어닝|fomc/i.test(cleanTitle)) category = 'market';

  const newEvent = {
    id: `ai-evt-${Date.now()}`,
    date: targetDate,
    startTime,
    endTime,
    title: cleanTitle,
    category,
    location: /진료|병원|순회/.test(cleanTitle) ? '진료지' : '지정 장소',
    completed: false,
    notes: 'AI Copilot 자연어 자동 생성'
  };

  return {
    answer: `${formatKoreanDate(targetDate)} ${startTime}~${endTime} '${cleanTitle}' 일정을 캘린더에 등록했습니다.`,
    actions: [{ type: 'ADD_CALENDAR_EVENTS', events: [newEvent] }]
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

  // 1. Try Gemini 3.1 Pro / Live API with Action JSON Protocol
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

      const prompt = `당신은 최고 전략 개인 OS 'L&M OS'의 수석 AI 비서이자 실시간 실행 엔진(Action Copilot)입니다.
사용자는 질문을 하거나, 실제로 캘린더 일정 추가/삭제/변경, 식단 추가, 가계부 지출 기록 등의 실제 명령을 내립니다.

[현재 기준 시점]:
- 오늘 날짜: ${todayStr} (${todayFormatted})

[사용자 전체 데이터]:
${systemContext}

[사용자 명령/질문]:
"${userInput}"

[핵심 실행 규칙]:
1. 사용자가 반복 일정(예: "2027년 3월까지 매주 월 목에 서면 순회진료 일정 넣어줘", "9월 매주 화, 금 운동 추가")을 요청하면:
   - 시작일(오늘: ${todayStr})부터 지정된 종료일까지의 기간 동안 해당 요일에 해당하는 **모든 날짜(YYYY-MM-DD)를 빠짐없이 계산**하여 events 배열에 전부 추가하세요.
   - 단일 일정이 아니라 기간 내 매주 해당 요일마다 1개씩 모든 이벤트 객체를 생성해야 합니다.
   - 제목, 장소(서면 등), 카테고리(meeting, deepwork, fitness, market, personal), 시간(기본 09:00~12:00 등)을 스마트하게 입력하세요.
2. 사용자가 삭제를 요청하면:
   - "DELETE_CALENDAR_EVENT_BY_TITLE" 액션을 사용하세요.
3. 단순 질문인 경우:
   - actions 배열은 빈 배열 []로 두고, 군더더기 없이 명확하게 answer에 답변하세요.

반드시 유효한 JSON 형식으로만 응답하세요. 마크다운 코드블록이나 불필요한 설명 없이 JSON만 반환하세요:
{
  "answer": "친절하고 명확한 한국어 작업 요약 안내 메시지 (등록된 총 건수와 기간 명시)",
  "actions": [
    {
      "type": "ADD_CALENDAR_EVENTS",
      "events": [
        {
          "date": "YYYY-MM-DD",
          "startTime": "09:00",
          "endTime": "12:00",
          "title": "일정명",
          "category": "meeting",
          "location": "장소",
          "notes": "메모"
        }
      ]
    },
    {
      "type": "DELETE_CALENDAR_EVENT_BY_TITLE",
      "keyword": "검색어"
    },
    {
      "type": "ADD_DIET_LOG",
      "log": {
        "mealType": "lunch",
        "foodName": "음식명",
        "kcal": 0,
        "protein": 0
      }
    },
    {
      "type": "ADD_EXPENSE",
      "expense": {
        "title": "항목명",
        "amount": 0,
        "category": "식비"
      }
    }
  ]
}`;

      const rawResult = await callGeminiApi({
        prompt,
        apiKey: currentKey,
        model: 'gemini-3.1-pro-preview'
      });

      const parsed = extractJson(rawResult);
      if (parsed && typeof parsed.answer === 'string' && Array.isArray(parsed.actions)) {
        const sanitizedActions = parsed.actions.map(action => {
          if (action.type === 'ADD_CALENDAR_EVENTS' && Array.isArray(action.events)) {
            return {
              ...action,
              events: action.events.map((e, idx) => ({
                ...e,
                id: e.id || `ai-gen-${Date.now()}-${idx}`,
                completed: Boolean(e.completed),
                location: e.location || '지정 장소',
                notes: e.notes || 'Gemini AI 자동 생성'
              }))
            };
          }
          return action;
        });

        // If action was executed, return it
        if (sanitizedActions.length > 0 || parsed.answer) {
          return {
            answer: parsed.answer,
            actions: sanitizedActions,
            source: 'gemini'
          };
        }
      }
    } catch (err) {
      console.warn("Gemini Action Copilot processing fallback:", err);
    }
  }

  // 2. High-Precision Local Rule & NLP Engine Fallback
  const localAction = parseLocalInstruction(userInput, todayStr);
  if (localAction) {
    return {
      answer: localAction.answer,
      actions: localAction.actions,
      source: 'local'
    };
  }

  // 3. Fallback General QA
  return {
    answer: "요청하신 내용을 확인했습니다. 일정이나 데이터 변경이 필요한 경우 '2027년 3월까지 매주 월, 목 순회진료 추가해줘' 또는 '내일 3시 회의 추가해줘'처럼 말씀해 주시면 실제 캘린더에 즉시 등록됩니다.",
    actions: [],
    source: 'fallback'
  };
}
