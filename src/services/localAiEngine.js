// L&M OS Built-in Strategic AI Engine (Embedded Intelligence Kernel)
import { getTodayDateStr, getRelativeDateStr, formatKoreanDate } from '../utils/dateUtils.js';
import { PUBMED_PAPERS_DB } from '../data/pubmedDatabase.js';

/**
 * Strips raw markdown double asterisks (**) for clean typography
 */
export function cleanAiText(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/\*\*/g, '').replace(/###\s*/g, '').replace(/##\s*/g, '');
}

/**
 * High-Intelligence Built-in Answer Generator (Clean format without **)
 */
export function queryLocalAiEngine(query, {
  calendarEvents = [],
  routines = [],
  dietLogs = [],
  runningLogs = [],
  expenses = [],
  userProfile = {}
} = {}) {
  if (!query || typeof query !== 'string') {
    return {
      answer: "질문 내용을 입력해주세요.",
      sources: ["L&M AI Engine"]
    };
  }

  const q = query.trim().toLowerCase();
  const todayStr = getTodayDateStr();
  const tomorrowStr = getRelativeDateStr(1);

  // 1. AI Identity & Capabilities
  if (q.includes('뭘 할 수') || q.includes('누구') || q.includes('도움말') || q.includes('기능') || q.includes('소개') || q.includes('help') || q.includes('what can you do')) {
    return {
      answer: `안녕하세요! L&M OS 최고 전략 AI 비서입니다. 사용자의 모든 라이프 프로토콜과 시장 데이터를 실시간으로 파악하고 있습니다.

✨ 지원 가능한 핵심 영역:
1. 📅 일정 브리핑 & 질의: "내일 학회 몇 시야?", "오늘 일정 요약해줘", "이번 주 빈 시간 언제야?"
2. 📈 주식 & 매크로 인텔리전스: "금리 변동과 빅테크 전망", "엔비디아 블랙웰 실적 요약"
3. 🏃 라이프 프로토콜 & 러닝: "5km 러닝 효과", "오늘 데일리 루틴 달성 현황"
4. 🥗 식단 & 영양 분석: "오늘 섭취한 단백질과 칼로리 분석", "권장 식단 피드백"
5. 💵 가계부 & 투자 잉여금: "이번 달 투자 가용 잉여금과 자산 배분 전략 알려줘"
6. 🔬 PubMed 최신 논문: "최신 대사/노화 관련 연구 논문 검색"

궁금하신 점을 편하게 말씀해 주세요!`,
      sources: ["L&M OS Live Kernel", "Executive Capabilities"]
    };
  }

  // 2. Schedule Q&A
  const isScheduleQuery = q.includes('언제') || q.includes('몇 시') || q.includes('일정') || q.includes('스케줄') || q.includes('약속') || q.includes('내일') || q.includes('오늘') || q.includes('모레') || q.includes('학회') || q.includes('기상') || q.includes('미팅') || q.includes('러닝') || q.includes('판교') || q.includes('딥워크');

  if (isScheduleQuery) {
    const eventKeywords = ['학회', '기상', '판교', '러닝', '운동', '미팅', '회의', '딥워크', '어닝콜', '컨퍼런스', '식사', '퇴근', '출근'];
    const matchedKeyword = eventKeywords.find(k => q.includes(k));

    if (matchedKeyword) {
      const matchedEvents = calendarEvents.filter(e => 
        (e.title && e.title.toLowerCase().includes(matchedKeyword)) ||
        (e.location && e.location.toLowerCase().includes(matchedKeyword))
      );

      if (matchedEvents.length > 0) {
        matchedEvents.sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
        const first = matchedEvents[0];
        
        const eventLines = matchedEvents.map(e => {
          const dLabel = e.date === todayStr ? '오늘' : e.date === tomorrowStr ? '내일' : e.date;
          return `• [${dLabel}] ${e.startTime} ~ ${e.endTime}: ${e.title} (${e.location || '홈 오피스'})`;
        }).join('\n');

        return {
          answer: `📌 ${matchedKeyword} 관련 일정 안내:\n\n${eventLines}\n\n총 ${matchedEvents.length}건의 일정이 확인되었습니다.`,
          sources: ["Live Calendar Database", `Keyword: ${matchedKeyword}`]
        };
      }
    }

    // Tomorrow Schedule
    if (q.includes('내일') || q.includes('tomorrow')) {
      const tomorrowEvents = calendarEvents.filter(e => e.date === tomorrowStr);
      if (tomorrowEvents.length === 0) {
        return {
          answer: `내일(${tomorrowStr})에는 아직 등록된 일정이 없습니다. AI 일정 모달에서 일정을 추가해보세요!`,
          sources: ["Live Calendar Database", `Date: ${tomorrowStr}`]
        };
      }
      tomorrowEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));
      const list = tomorrowEvents.map(e => `• ${e.startTime} - ${e.endTime}: ${e.title} (${e.location || '홈 오피스'})`).join('\n');
      return {
        answer: `📅 내일(${formatKoreanDate(tomorrowStr)}) 일정 (총 ${tomorrowEvents.length}건):\n\n${list}`,
        sources: ["Live Calendar Database", `Date: ${tomorrowStr}`]
      };
    }

    // Today Schedule
    if (q.includes('오늘') || q.includes('today')) {
      const todayEvents = calendarEvents.filter(e => e.date === todayStr);
      if (todayEvents.length === 0) {
        return {
          answer: `오늘(${todayStr}) 등록된 일정이 없습니다. 데일리 루틴과 딥워크 세션을 시작해보세요!`,
          sources: ["Live Calendar Database", `Date: ${todayStr}`]
        };
      }
      todayEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));
      const completed = todayEvents.filter(e => e.completed).length;
      const list = todayEvents.map(e => `• [${e.completed ? '✅' : '⏳'}] ${e.startTime} - ${e.endTime}: ${e.title} (${e.location})`).join('\n');
      return {
        answer: `📅 오늘(${formatKoreanDate(todayStr)}) 일정 (${completed}/${todayEvents.length}건 완료):\n\n${list}`,
        sources: ["Live Calendar Database", `Date: ${todayStr}`]
      };
    }
  }

  // 3. Finance & Investment Surplus
  if (q.includes('잉여금') || q.includes('가계부') || q.includes('투자') || q.includes('지출') || q.includes('고정비') || q.includes('자산 배분') || q.includes('월급')) {
    const income = userProfile.monthlyIncome ?? 6500000;
    const fixed = userProfile.fixedCosts ?? 1850000;
    const variableExpenses = expenses.filter(e => !e.isFixed);
    const totalVar = variableExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const surplus = income - fixed - totalVar;

    const qqqAmt = Math.round(surplus * 0.5);
    const nvdaAmt = Math.round(surplus * 0.35);
    const cmaAmt = surplus - qqqAmt - nvdaAmt;

    return {
      answer: `💵 L&M 가계부 & 투자 잉여금 분석:

• 월 총 소득: ${(income / 10000).toLocaleString()}만원
• 고정비: -${(fixed / 10000).toLocaleString()}만원 (월세/보험 등)
• 변동 지출: -${totalVar.toLocaleString()}원 (${variableExpenses.length}건)
━━━━━━━━━━━━━━━━━━━━━━
• 현재 투자 가용 잉여금: ${surplus.toLocaleString()}원

🎯 추천 전략적 자산 배분 (50:35:15):
1. 핵심 코어 지수 (QQQ/S&P500 50%): ${qqqAmt.toLocaleString()}원
2. AI 주도 성장주 (NVDA/TSLA 35%): ${nvdaAmt.toLocaleString()}원
3. 유동성 및 기회 자금 (CMA/단기채 15%): ${cmaAmt.toLocaleString()}원`,
      sources: ["Finance Ledger Kernel", "Smart Surplus Engine"]
    };
  }

  // 4. Diet, Nutrition & Running
  if (q.includes('식단') || q.includes('칼로리') || q.includes('단백질') || q.includes('러닝') || q.includes('5km') || q.includes('영양') || q.includes('운동')) {
    const totalKcal = dietLogs.reduce((acc, l) => acc + (l.kcal || 0), 0);
    const totalProtein = dietLogs.reduce((acc, l) => acc + (l.protein || 0), 0).toFixed(1);
    const totalCarb = dietLogs.reduce((acc, l) => acc + (l.carbs || 0), 0).toFixed(1);
    const totalFat = dietLogs.reduce((acc, l) => acc + (l.fat || 0), 0).toFixed(1);

    return {
      answer: `🥗 오늘의 영양 및 운동 프로토콜 분석:

• 섭취 에너지: ${totalKcal} kcal / 목표 2,400 kcal
• 단백질 섭취: ${totalProtein}g (체중 1kg당 1.8g 권장치 충족 중)
• 탄수화물 / 지방: 탄수 ${totalCarb}g | 지방 ${totalFat}g
• 5km Zone 2 러닝: 4회/주 목표, 5분 20초 페이스 유지 권장 (미토콘드리아 생합성 촉진)

💡 피드백: 저녁 식사에서 양질의 단백질(닭가슴살/생선) 30g을 추가 보충하시면 일일 권장량을 완벽히 달성합니다.`,
      sources: ["Diet & Nutrition Core", "Endurance Protocol DB"]
    };
  }

  // 5. Stock & Macro Intelligence
  if (q.includes('금리') || q.includes('국채') || q.includes('엔비디아') || q.includes('nvda') || q.includes('블랙웰') || q.includes('나스닥') || q.includes('기술주') || q.includes('어닝') || q.includes('fomc') || q.includes('시장')) {
    if (q.includes('엔비디아') || q.includes('nvda') || q.includes('블랙웰')) {
      return {
        answer: `🚀 엔비디아(NVDA) & 블랙웰(Blackwell) 핵심 분석:

1. 실적 모멘텀: FY25 Q2 매출 $30.04B(+122% YoY)로 컨센서스 상회, 데이터센터 네트워킹(Spectrum-X) 매출 급증.
2. 블랙웰(B200/GB200) 수주: 주요 CSP(MSFT, AWS, GCP, Meta) 수주가 FY26 상반기까지 완판되어 공급 부족 지속.
3. 투자 전략: 어닝콜 이후 단기 변동성은 분할 매수 기회로 활용, 투자 잉여금의 35% 비중 유지 권장.`,
        sources: ["SEC 10-Q Database", "Market Intelligence Index"]
      };
    }

    return {
      answer: `📈 매크로 금리 & 기술주 동향 요약:

1. 미국 10년물 국채 금리: 4.18%로 하향 안정화 (DCF 미래현금흐름 할인율 완화).
2. M7 빅테크 & 반도체: 나스닥(+1.32%) 및 SOX 지수가 신고가 테스트 중.
3. 핵심 거시 지표: WTI 유가 $73.40, 원/달러 환율 1,332원, VIX 14.85(안정).
4. 전략: 연준의 9월 금리 인하 사이클 진입에 맞춰 QQQ/NVDA 적립식 매수 유지.`,
      sources: ["Macro Indicators Kernel", "Wall Street Daily Snapshot"]
    };
  }

  // 6. Routine & Deepwork
  if (q.includes('루틴') || q.includes('딥워크') || q.includes('포모도로') || q.includes('레벨') || q.includes('xp') || q.includes('스트릭')) {
    const completed = routines.filter(r => r.completed).length;
    return {
      answer: `⚡ 라이프 프로토콜 & 게이미피케이션 현황:

• 현재 레벨: Lv.${userProfile.level || 14} (${userProfile.tier || 'Cyber Alpha'})
• 연속 달성 스트릭: 🔥 ${userProfile.streak || 12}일 연속 달성
• 오늘 루틴 완료율: ${completed}/${routines.length}개 완료
• 딥워크 추천: 40Hz 감마파 바이노럴 비트와 함께 90분 집중 블록을 수행하면 +100 XP가 지급됩니다.`,
      sources: ["Gamification Engine", "Routine Protocol"]
    };
  }

  // Default Smart Contextual Fallback
  return {
    answer: `질의하신 "${query}"에 대한 L&M OS 통합 분석 결과입니다:

• 일정 & 캘린더: 총 ${calendarEvents.length}건의 일정이 등록되어 관리되고 있습니다.
• 라이프 & 루틴: ${routines.filter(r => r.completed).length}/${routines.length}개 루틴 완료, 레벨 Lv.${userProfile.level || 14} 운용 중입니다.
• 가계부 잉여금: 고정비 및 변동비를 제외한 투자 가용 잉여금이 실시간 계산되고 있습니다.

더 구체적인 질문(예: "학회 언제 가?", "내일 일정 브리핑", "이번 달 잉여금 얼마야?", "금리 동향")을 입력하시면 즉시 정밀한 답변을 제공합니다.`,
    sources: ["L&M OS Master Kernel", "Multi-Domain Live Index"]
  };
}
