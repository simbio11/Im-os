import { getTodayDateStr, formatKoreanDate } from '../utils/dateUtils.js';
import { PUBMED_PAPERS_DB } from '../data/pubmedDatabase.js';

const STORAGE_KEY = 'gemini_api_key';

export function getStoredGeminiApiKey() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function saveStoredGeminiApiKey(key) {
  if (key) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Builds real-time comprehensive context of all user data in L&M OS
 */
export function buildGlobalSystemContext({
  calendarEvents = [],
  routines = [],
  dietLogs = [],
  runningLogs = [],
  expenses = [],
  userProfile = {},
  amBriefing = null,
  pmBriefing = null
} = {}) {
  const todayStr = getTodayDateStr();
  const todayFormatted = formatKoreanDate(todayStr);

  const todayEvents = calendarEvents.filter(e => e.date === todayStr);
  const totalKcal = dietLogs.reduce((acc, l) => acc + (l.kcal || 0), 0);
  const totalProtein = dietLogs.reduce((acc, l) => acc + (l.protein || 0), 0).toFixed(1);
  const completedRoutines = routines.filter(r => r.completed).length;

  const variableExpenses = expenses.filter(e => !e.isFixed);
  const totalVar = variableExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const income = userProfile.monthlyIncome ?? 6500000;
  const fixed = userProfile.fixedCosts ?? 1850000;
  const surplus = income - fixed - totalVar;

  return `[시스템 기준 정보]:
- 현재 날짜: ${todayStr} (${todayFormatted})
- 사용자 레벨: Lv.${userProfile.level || 14} (${userProfile.tier || 'Cyber Alpha'}), 연속 달성: ${userProfile.streak || 12}일
- 월 소득: ${(income / 10000).toLocaleString()}만원, 고정비: ${(fixed / 10000).toLocaleString()}만원, 이번 달 투자 가용 잉여금: ${surplus.toLocaleString()}원

[오늘(${todayStr}) 일정 (${todayEvents.length}건)]:
${todayEvents.length > 0 
  ? todayEvents.map(e => `• [${e.startTime} - ${e.endTime}] ${e.title} (${e.category}, ${e.location}) - ${e.completed ? '완수' : '미완수'}`).join('\n')
  : '• 등록된 오늘 일정이 없습니다.'}

[전체 등록된 캘린더 일정 요약 (총 ${calendarEvents.length}건)]:
${calendarEvents.slice(0, 15).map(e => `• [${e.date} ${e.startTime}-${e.endTime}] ${e.title} (${e.category}) - ${e.completed ? '완수' : '미완수'}`).join('\n')}

[오늘 식단 및 루틴 현황]:
- 섭취 칼로리: ${totalKcal} kcal, 단백질: ${totalProtein}g
- 데일리 루틴 달성: ${completedRoutines}/${routines.length}개 완수
- 러닝 기록: 최근 5km 러닝 완수 기록 보유

[최근 시장 브리핑 & 매크로 지표]:
- 10년물 국채: 4.18% (안정), WTI 유가: $73.40, 원/달러 환율: 1,332원, VIX 변동성: 14.85
- 핵심 관심주: NVDA(어닝콜 대기), AAPL, TSLA, QQQ, SOXL

[PubMed 최신 의학 데이터베이스 색인]:
${PUBMED_PAPERS_DB.slice(0, 3).map(p => `• [${p.pmid}] ${p.title} (${p.journal}, ${p.category})`).join('\n')}`;
}

/**
 * Universal Gemini API Caller
 */
export async function callGeminiApi({
  prompt,
  systemInstruction = '',
  jsonMode = false,
  apiKey = null,
  model = 'gemini-1.5-flash'
}) {
  const key = apiKey || getStoredGeminiApiKey();
  if (!key || !key.startsWith('AIza')) {
    throw new Error('MISSING_API_KEY');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const contents = [];
  if (systemInstruction) {
    contents.push({
      role: 'user',
      parts: [{ text: `[시스템 행동 지침]:\n${systemInstruction}\n\n[실제 요청]:\n${prompt}` }]
    });
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });
  }

  const body = {
    contents,
    generationConfig: {
      temperature: 0.2,
      topP: 0.95,
      maxOutputTokens: 2048,
      ...(jsonMode ? { responseMimeType: 'application/json' } : {})
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `API_ERROR_${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
}
