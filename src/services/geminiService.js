// L&M OS Universal Gemini AI Intelligence Service
import { getTodayDateStr, formatKoreanDate } from '../utils/dateUtils.js';
import { PUBMED_PAPERS_DB } from '../data/pubmedDatabase.js';
import { queryLocalAiEngine } from './localAiEngine.js';

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

  return `[기준 정보]:
- 현재 날짜: ${todayStr} (${todayFormatted})
- 사용자 레벨: Lv.${userProfile.level || 14} (${userProfile.tier || 'Cyber Alpha'}), 연속 달성: ${userProfile.streak || 12}일
- 월 총소득: ${(income / 10000).toLocaleString()}만원, 고정비: ${(fixed / 10000).toLocaleString()}만원, 변동지출: ${totalVar.toLocaleString()}원 -> 투자 가용 잉여금: ${surplus.toLocaleString()}원

[전체 등록된 캘린더 일정 목록 (총 ${calendarEvents.length}건)]:
${calendarEvents.map(e => `• [${e.date} ${e.startTime}-${e.endTime}] ${e.title} (${e.category}, ${e.location}) - ${e.completed ? '완수' : '예정'}`).join('\n')}

[식단 및 루틴]:
- 섭취 칼로리: ${totalKcal} kcal, 단백질: ${totalProtein}g
- 데일리 루틴: ${completedRoutines}/${routines.length}개 완료
- 러닝: 주 4회 5km Zone 2 러닝 프로토콜`;
}

/**
 * Universal Gemini API Caller with Multi-Model Fallback & Local Engine Bridge
 */
export async function callGeminiApi({
  prompt,
  systemInstruction = '',
  jsonMode = false,
  apiKey = null,
  model = 'gemini-1.5-flash'
}) {
  const key = apiKey || getStoredGeminiApiKey();
  if (!key || !key.trim()) {
    throw new Error('MISSING_API_KEY');
  }

  // Model fallback candidate list
  const modelsToTry = [model, 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
  const uniqueModels = [...new Set(modelsToTry)];

  let lastError = null;

  for (const m of uniqueModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;

      const body = {
        contents: [
          {
            role: 'user',
            parts: [{ 
              text: systemInstruction 
                ? `[시스템 지침]\n${systemInstruction}\n\n[사용자 질문]\n${prompt}` 
                : prompt 
            }]
          }
        ],
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

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const errJson = await response.json().catch(() => ({}));
        lastError = new Error(errJson?.error?.message || `HTTP ${response.status}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('GEMINI_API_FAILED');
}
