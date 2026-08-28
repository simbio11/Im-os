// L&M OS Smart Action & Natural Language Execution Engine
import { callGeminiApi, getStoredGeminiApiKey, buildGlobalSystemContext } from '../services/geminiService.js';
import { getTodayDateStr, formatKoreanDate, getRelativeDateStr } from './dateUtils.js';

/**
 * Parses weekday names in Korean to 0..6 (0=Sun, 1=Mon, ..., 6=Sat)
 */
const KOREAN_WEEKDAYS_MAP = {
  '일': 0, '일요일': 0,
  '월': 1, '월요일': 1,
  '화': 2, '화요일': 2,
  '수': 3, '수요일': 3,
  '목': 4, '목요일': 4,
  '금': 5, '금요일': 5,
  '토': 6, '토요일': 6
};

/**
 * Generates all dates in a specific year & month matching given weekdays
 */
export function getDatesForMonthWeekdays(year, month, weekdaysArray) {
  const dates = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    if (weekdaysArray.includes(d.getDay())) {
      const yStr = String(year);
      const mStr = String(month).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      dates.push(`${yStr}-${mStr}-${dStr}`);
    }
  }
  return dates;
}

/**
 * Fallback rule-based local parser for calendar events, diets, and expenses
 */
export function parseLocalInstruction(text, todayStr = getTodayDateStr()) {
  const lower = text.toLowerCase().trim();
  const [currentYearStr, currentMonthStr] = todayStr.split('-');
  const currentYear = parseInt(currentYearStr, 10);
  const currentMonth = parseInt(currentMonthStr, 10);

  // 1. Check for recurring monthly weekday schedule: e.g. "9월 매주 월, 목에 순회진료 일정 넣어줘"
  const monthlyRecurringMatch = text.match(/(\d{1,2})월\s*(?:매주)?\s*([월화수목금토일,\s]+)(?:에|마다)?\s*(.*?)(?:일정\s*)?(?:넣어|추가|등록|생성)/);
  if (monthlyRecurringMatch) {
    const targetMonth = parseInt(monthlyRecurringMatch[1], 10);
    const rawWeekdays = monthlyRecurringMatch[2];
    const rawTitle = monthlyRecurringMatch[3].trim() || '순회진료';

    const weekdays = [];
    for (const [key, val] of Object.entries(KOREAN_WEEKDAYS_MAP)) {
      if (rawWeekdays.includes(key) && !weekdays.includes(val)) {
        weekdays.push(val);
      }
    }

    if (weekdays.length > 0) {
      const year = targetMonth < currentMonth ? currentYear + 1 : currentYear;
      const targetDates = getDatesForMonthWeekdays(year, targetMonth, weekdays);
      
      const cleanTitle = rawTitle
        .replace(/일정|넣어줘|등록해줘|추가해줘|잡아줘/g, '')
        .trim() || '순회진료';

      let category = 'meeting';
      if (/진료|병원|클리닉|당직|순회/i.test(cleanTitle)) category = 'meeting';
      else if (/딥워크|코딩|개발|연구|논문|공부/i.test(cleanTitle)) category = 'deepwork';
      else if (/러닝|운동|헬스|피트니스/i.test(cleanTitle)) category = 'fitness';
      else if (/주식|어닝|장전|fomc/i.test(cleanTitle)) category = 'market';

      const events = targetDates.map((d, idx) => ({
        id: `ai-rec-${Date.now()}-${idx}`,
        date: d,
        startTime: '09:00',
        endTime: '12:00',
        title: cleanTitle,
        category,
        location: /진료|병원|순회/.test(cleanTitle) ? '진료지 / 파견지' : '지정 장소',
        completed: false,
        notes: `AI 자동 편성 (매주 반복 일정)`
      }));

      return {
        answer: `${year}년 ${targetMonth}월 매주 ${weekdays.map(w => ['일','월','화','수','목','금','토'][w]).join(', ')}요일 총 ${events.length}건의 '${cleanTitle}' 일정을 캘린더에 성공적으로 등록했습니다.`,
        actions: [{ type: 'ADD_CALENDAR_EVENTS', events }]
      };
    }
  }

  // 2. Check for single day event additions: "내일 3시 딥워크 일정 추가", "8월 29일 오후 2시 회의"
  if (lower.includes('추가') || lower.includes('넣어') || lower.includes('등록') || lower.includes('잡아')) {
    let targetDate = todayStr;
    if (lower.includes('내일')) targetDate = getRelativeDateStr(1, todayStr);
    else if (lower.includes('모레')) targetDate = getRelativeDateStr(2, todayStr);
    else {
      const specificDateMatch = text.match(/(\d{1,2})월\s*(\d{1,2})일/);
      if (specificDateMatch) {
        const m = String(parseInt(specificDateMatch[1], 10)).padStart(2, '0');
        const d = String(parseInt(specificDateMatch[2], 10)).padStart(2, '0');
        targetDate = `${currentYear}-${m}-${d}`;
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

    const title = text
      .replace(/내일|모레|오늘|\d{1,2}월\s*\d{1,2}일|(오전|오후|저녁|아침|새벽)?\s*\d{1,2}시(\d{2}분)?|일정|추가해줘|넣어줘|등록해줘|잡아줘/g, '')
      .trim() || '새 일정';

    let category = 'personal';
    if (/딥워크|개발|연구|논문|코딩/i.test(title)) category = 'deepwork';
    else if (/러닝|운동|헬스/i.test(title)) category = 'fitness';
    else if (/회의|미팅|진료|상담/i.test(title)) category = 'meeting';
    else if (/주식|매매|실적/i.test(title)) category = 'market';

    const newEvent = {
      id: `ai-evt-${Date.now()}`,
      date: targetDate,
      startTime,
      endTime,
      title,
      category,
      location: '지정 장소',
      completed: false,
      notes: 'AI Copilot 자연어 자동 생성'
    };

    return {
      answer: `${formatKoreanDate(targetDate)} ${startTime}~${endTime} '${title}' 일정을 캘린더에 등록했습니다.`,
      actions: [{ type: 'ADD_CALENDAR_EVENTS', events: [newEvent] }]
    };
  }

  return null;
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

      const prompt = `당신은 최고 전략 개인 OS 'L&M OS'의 수석 AI 비서이자 실행 엔진(Action Copilot)입니다.
사용자는 당신에게 질문을 하거나, 실제로 캘린더 일정 추가/삭제/변경, 식단 추가, 가계부 지출 기록 등의 실제 명령을 내릴 수 있습니다.

[현재 기준 시점]:
- 오늘 날짜: ${todayStr} (${todayFormatted})

[사용자 전체 데이터]:
${systemContext}

[사용자 명령/질문]:
"${userInput}"

[수행 지침]:
1. 사용자의 요청이 일정 추가/수정/삭제, 식단 추가, 지출 추가 등 **데이터 변경 명령**인 경우, 실제로 캘린더에 등록할 정확한 이벤트 목록을 "actions" 배열에 포함하세요.
   - 예: "9월 매주 월, 목에 순회진료 일정 넣어줘" -> 2026년 9월의 모든 월요일과 목요일 날짜(2026-09-03, 2026-09-07, 2026-09-10, 2026-09-14, 2026-09-17, 2026-09-21, 2026-09-24, 2026-09-28 등)를 계산하여 개별 일정 객체들로 events 배열에 모두 추가합니다.
   - 카테고리(category)는 ["deepwork", "fitness", "market", "meeting", "personal"] 중 가장 적합한 것을 선택하세요.
   - 기본 시간은 명시되지 않았다면 적절한 시간(예: 09:00~12:00 등)을 배정하세요.
2. 단순 질문인 경우 actions 배열은 빈 배열 []로 두고, 군더더기 없이 명확하게 answer에 답변하세요.
3. 절대로 마크다운 볼드(**)나 불필요한 특수문자를 남발하지 말고, 간결하고 정중하게 한국어로 답변하세요.

반드시 아래 JSON 스키마 형식으로만 응답하세요:
{
  "answer": "사용자에게 보여줄 친절하고 명확한 한국어 안내 메시지",
  "actions": [
    {
      "type": "ADD_CALENDAR_EVENTS",
      "events": [
        {
          "date": "YYYY-MM-DD",
          "startTime": "HH:MM",
          "endTime": "HH:MM",
          "title": "일정명",
          "category": "deepwork" | "fitness" | "market" | "meeting" | "personal",
          "location": "장소",
          "notes": "메모"
        }
      ]
    },
    {
      "type": "DELETE_CALENDAR_EVENT_BY_TITLE",
      "keyword": "삭제할 일정 검색어"
    },
    {
      "type": "ADD_DIET_LOG",
      "log": {
        "mealType": "breakfast" | "lunch" | "dinner" | "snack",
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
        "category": "식비" | "교통" | "쇼핑" | "기타"
      }
    }
  ]
}`;

      const rawResult = await callGeminiApi({
        prompt,
        jsonMode: true,
        apiKey: currentKey,
        model: 'gemini-3.1-pro-preview'
      });

      const parsed = JSON.parse(rawResult);
      if (parsed && typeof parsed.answer === 'string') {
        // Ensure actions have valid IDs
        const sanitizedActions = (parsed.actions || []).map(action => {
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

        return {
          answer: parsed.answer,
          actions: sanitizedActions,
          source: 'gemini'
        };
      }
    } catch (err) {
      console.warn("Gemini Action Copilot processing fallback:", err);
    }
  }

  // 2. High-Precision Local Rule Engine Fallback
  const localAction = parseLocalInstruction(userInput, todayStr);
  if (localAction) {
    return {
      answer: localAction.answer,
      actions: localAction.actions,
      source: 'local'
    };
  }

  // 3. Fallback to normal text answering
  return {
    answer: "요청하신 내용을 확인했습니다. 일정이나 데이터 변경이 필요한 경우 '9월 매주 월, 목 순회진료 추가해줘' 또는 '내일 3시 회의 추가해줘'처럼 말씀해 주시면 실제 캘린더에 즉시 등록됩니다.",
    actions: [],
    source: 'fallback'
  };
}
