// Pre-indexed Multi-domain Knowledge Base for L&M OS RAG Engine

export const KNOWLEDGE_BASE = [
  {
    id: "kb-macro-rates",
    category: "market",
    title: "미국 10년물 국채 금리와 빅테크 기술주(M7) 밸류에이션 상관관계",
    tags: ["금리", "국채금리", "빅테크", "나스닥", "밸류에이션", "NVDA", "QQQ"],
    content: `
미국 10년물 국채 금리는 글로벌 무위험 수익률의 기준으로서 미래 현금흐름 할인율에 직접적인 영향을 미칩니다.
1. 금리가 4.2% 이하로 하향 안정화될 때: 고성장 기술주(NVDA, MSFT, AAPL, AMZN, GOOGL, META, TSLA)의 DCF 할인율이 낮아져 주가수익비율(PER) 멀티플 확장이 나타납니다.
2. 금리 급등 시기: 단기 가치주 및 고배당 섹터로 자금이 이동하며 고PER 기술주 조정이 발생합니다.
3. 최근 트렌드 (2026년 8월 기준): 연준의 연내 75bp 금리 인하 경로가 가시화되면서 미 10년물 금리가 4.18%로 안착, 나스닥 100 지수 및 반도체 SOX 지수가 역사적 신고가를 시험하고 있습니다.
    `
  },
  {
    id: "kb-nvda-earnings",
    category: "market",
    title: "엔비디아(NVDA) 차세대 블랙웰(Blackwell) 아키텍처 및 데이터센터 실적 전망",
    tags: ["엔비디아", "NVDA", "블랙웰", "AI가속기", "HBM3E", "반도체"],
    content: `
1. 블랙웰(B200/GB200) 양산: TSMC 4NP 공정 및 CoWoS-L 첨단 패키징을 통해 2026년 하반기부터 대규모 출하가 진행 중입니다. 주요 하이퍼스케일러(MSFT Azure, AWS, GCP, Meta)의 수주 물량이 FY26 상반기까지 전량 완판되었습니다.
2. AI 추론 시장 확대: 단순 LLM 사전학습(Pre-training)뿐만 아니라 복잡한 다단계 추론(Test-Time Compute) 수요가 폭증하며 데이터센터 GPU 가동률이 최대치를 기록하고 있습니다.
3. 리스크 요인: 미국 상무부의 대중국 추가 AI 반도체 수출 통제 규제 및 공급망 쇼티지가 상단을 제한하는 변수입니다.
    `
  },
  {
    id: "kb-daily-protocol",
    category: "life",
    title: "L&M 프로토콜: 5km 러닝, 간헐적 집중(90분 딥워크), 단백질 섭취 기준",
    tags: ["루틴", "5km러닝", "딥워크", "단백질", "식단", "건강", "수면"],
    content: `
1. 러닝 프로토콜: 주 3~4회 5km Zone 2 유산소 운동은 PGC-1α 미토콘드리아 생합성을 극대화하고 혈관 내피세포 산화질소 생성을 촉진합니다. 최적 페이스는 대화가 약간 가능한 5분 10초~5분 30초/km 범위입니다.
2. 딥워크 블록: 뇌의 집중 사이클(Ultradian Rhythm)에 맞춘 90분 무방해 몰입 블록을 오전과 오후에 각각 1회씩 배치합니다. 40Hz 감마파 바이노럴 비트를 활용하면 전두엽 집중도가 향상됩니다.
3. 영양 밸런스: 체중 1kg당 1.6~2.0g의 단백질 섭취를 권장하며, 탄수화물은 딥워크 및 러닝 전후로 복합 탄수화물(현미, 오트밀, 바나나) 위주로 분배합니다.
    `
  },
  {
    id: "kb-finance-surplus",
    category: "finance",
    title: "스마트 잉여금 공식과 해외 우량주 적립식 투자 전략",
    tags: ["가계부", "잉여금", "투자", "고정비", "적립식", "QQQ", "배분"],
    content: `
1. 투자 가용 잉여금 공식: [당월 총 소득] - [고정비(월세/보험/통신)] - [누적 변동 지출(식비/쇼핑/문화)] = [투자 가용 잉여금].
2. 권장 투자 배분:
   - 핵심 코어 지수 ETF (QQQ, S&P 500): 가용 잉여금의 50%
   - AI/반도체 주도 성장주 (NVDA, TSLA, 빅테크): 가용 잉여금의 35%
   - 기회 자금 및 비상 유동성 (단기 채권/CMA): 가용 잉여금의 15%
3. 자동화 규칙: 지출이 발생할 때마다 실시간으로 잉여금이 차감 계산되어 목표 투자 달성률(예: 300만원)을 실시간 추적합니다.
    `
  }
];

// In-browser Semantic & Keyword Search RAG Engine
export function queryKnowledgeBase(userQuery) {
  if (!userQuery || typeof userQuery !== 'string') return null;

  const normalized = userQuery.toLowerCase().trim();
  const queryTokens = normalized.split(/\s+/).filter(t => t.length > 1);

  // Score each document based on keyword matches, tag overlap, and title relevance
  const scoredDocs = KNOWLEDGE_BASE.map(doc => {
    let score = 0;
    const titleLower = doc.title.toLowerCase();
    const contentLower = doc.content.toLowerCase();

    for (const tag of doc.tags) {
      if (normalized.includes(tag.toLowerCase())) {
        score += 8;
      }
    }

    for (const token of queryTokens) {
      if (titleLower.includes(token)) score += 5;
      if (contentLower.includes(token)) score += 2;
    }

    return { doc, score };
  });

  scoredDocs.sort((a, b) => b.score - a.score);
  const topDocs = scoredDocs.filter(item => item.score > 0).slice(0, 2).map(item => item.doc);

  // Generate an intelligent structured synthesis response
  if (topDocs.length === 0) {
    return {
      query: userQuery,
      answer: `입력하신 질의 [**"${userQuery}"**]에 대한 브리핑 데이터 분석 결과입니다.\n\n` +
        `• 현재 L&M OS 지식 베이스에 축적된 2026-08-26 시장 브리핑 및 루틴 기록에 따르면, 전반적인 시장 심리는 국채 금리 안정화(4.18%) 및 엔비디아/빅테크 중심의 기술주 반등(나스닥 +1.32%)으로 매우 우호적입니다.\n` +
        `• 라이프 프로토콜 관점에서는 오늘 5km 러닝 완수 및 아침 식단 기록이 정상 처리되었으며, 가계부 잉여금 흐름 또한 안정적으로 유지되고 있습니다. 더 구체적인 키워드(예: '금리', '엔비디아', '러닝', '투자 잉여금')로 검색하시면 상세 분석을 제공합니다.`,
      sources: ["L&M OS Live Executive Log", "Market Daily Snapshot"]
    };
  }

  const combinedContent = topDocs.map(d => `[${d.title}]\n${d.content.trim()}`).join('\n\n');

  let answerText = `**[RAG 인텔리전스 분석 보고서]**\n\n`;
  answerText += `질의하신 **"${userQuery}"** 관련 지식 베이스 및 최신 브리핑 데이터 요약입니다:\n\n`;

  if (normalized.includes('금리') || normalized.includes('기술주') || normalized.includes('동향')) {
    answerText += `1. **매크로 금리 환경**: 미 10년물 국채 금리가 4.18%로 하향 안정세를 기록함에 따라 미래 현금흐름 할인율이 낮아져 나스닥 100(+1.32%) 및 SOX 반도체(+2.45%) 지수의 멀티플 확장이 지속되고 있습니다.\n\n`;
    answerText += `2. **주도주 모멘텀**: 특히 엔비디아(NVDA +4.18%)의 차세대 블랙웰 B200 출하와 빅테크 CSP들의 AI CAPEX 지출 확대가 기술주 랠리의 핵심 동력으로 작용하고 있습니다.\n\n`;
    answerText += `3. **운용 전략 가이드**: 9월 연준 FOMC의 25bp 금리 인하 기대감이 선반영되는 구간이므로, 목표 투자 가용 잉여금 기반의 QQQ/NVDA 적립식 매수 프로토콜 유지가 유효합니다.`;
  } else if (normalized.includes('엔비디아') || normalized.includes('실적') || normalized.includes('가이던스')) {
    answerText += `1. **실적 및 성장률**: 엔비디아는 FY25 Q2 매출 $30.04B(+122% YoY), EPS $0.68(+152% YoY)로 시장 컨센서스를 대폭 상회(Beat)했습니다.\n\n`;
    answerText += `2. **공급망 및 가이던스**: 차세대 블랙웰 플랫폼 수주 물량이 전량 솔드아웃 상태이며, 데이터센터 네트워킹 부문(Quantum/Spectrum-X) 매출이 40% 이상 가파르게 성장 중입니다.\n\n`;
    answerText += `3. **체크포인트**: 미 상무부의 대중국 수출 통제 가이드라인과 TSMC 패키징 캐파가 단기 공급량의 핵심 척도입니다.`;
  } else if (normalized.includes('러닝') || normalized.includes('식단') || normalized.includes('루틴')) {
    answerText += `1. **데일리 루틴 달성**: 주 3~4회 5km Zone 2 러닝은 미토콘드리아 PGC-1α 생합성을 유도하여 인지 기능과 대사 효율을 극대화합니다.\n\n`;
    answerText += `2. **영양 섭취 분석**: 단백질 체중 1kg당 1.6~2.0g 충족 및 복합 탄수화물 적정 분배가 딥워크 집중력 유지의 핵심입니다.\n\n`;
    answerText += `3. **현재 상태**: 12일 연속 루틴 스트릭을 유지하고 있으며, 오늘 5km 완주(26분 30초, 페이스 5'16")로 +60 XP를 획득하였습니다.`;
  } else {
    answerText += topDocs.map(d => `• **${d.title}**: ${d.content.slice(0, 180).trim()}...`).join('\n\n');
  }

  return {
    query: userQuery,
    answer: answerText,
    sources: topDocs.map(d => d.title)
  };
}
