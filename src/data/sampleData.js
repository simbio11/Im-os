// Initial Seed Data & Sample Intelligence for L&M OS

export const INITIAL_USER_PROFILE = {
  name: "Neo Commander",
  tier: "Cyber Alpha",
  level: 14,
  xp: 3450,
  xpToNextLevel: 4000,
  streak: 12, // 12-day continuous routine streak
  monthlyIncome: 6500000, // 650만원
  fixedCosts: 1850000, // 185만원 (월세, 대출이자, 고정보험, 통신비 등)
  monthlyInvestmentTarget: 3000000 // 목표 300만원
};

export const INITIAL_ROUTINES = [
  {
    id: "r1",
    category: "morning",
    title: "아침 프로토콜: 미온수 500ml + 전해질 & 오메가3/비타민D 섭취",
    time: "06:30 - 07:00",
    completed: true,
    xp: 25,
    streak: 12
  },
  {
    id: "r2",
    category: "morning",
    title: "장전 AM 매크로 브리핑 & 지수 점검 (Obsidian 동기화)",
    time: "07:00 - 07:30",
    completed: true,
    xp: 30,
    streak: 12
  },
  {
    id: "r3",
    category: "fitness",
    title: "주 4회 필수 5km 러닝 (Zone 2~3 페이스 유지)",
    time: "07:30 - 08:15",
    completed: true,
    xp: 60,
    streak: 8
  },
  {
    id: "r4",
    category: "deepwork",
    title: "오전 1차 딥워크: 핵심 엔지니어링 / 시스템 아키텍처 설계 (90분)",
    time: "09:30 - 11:00",
    completed: true,
    xp: 50,
    streak: 15
  },
  {
    id: "r5",
    category: "deepwork",
    title: "오후 2차 딥워크: AI 에이전트 & RAG 파이프라인 개발",
    time: "14:00 - 16:00",
    completed: false,
    xp: 50,
    streak: 10
  },
  {
    id: "r6",
    category: "market",
    title: "장후 PM 오선 브리핑 & 텔레그램 채널 요약 분석",
    time: "18:30 - 19:00",
    completed: false,
    xp: 30,
    streak: 11
  },
  {
    id: "r7",
    category: "night",
    title: "야간 회고 & Obsidian 데일리 노트 마감 + 스크린 오프",
    time: "22:30 - 23:00",
    completed: false,
    xp: 35,
    streak: 9
  }
];

export const TIMEBLOCK_SCHEDULE = [
  { time: "06:30", event: "기상 & 미온수 + 전해질", category: "morning" },
  { time: "07:00", event: "장전 AM 매크로 브리핑", category: "market" },
  { time: "07:30", event: "5km 모닝 러닝 & 샤워", category: "fitness" },
  { time: "08:30", event: "건강식 아침 식사 (그릭요거트/단백질)", category: "diet" },
  { time: "09:30", event: "1차 딥워크: 핵심 프로젝트", category: "deepwork" },
  { time: "12:00", event: "점심 식사 & 15분 가벼운 산책", category: "diet" },
  { time: "14:00", event: "2차 딥워크: AI 파이프라인 개발", category: "deepwork" },
  { time: "17:00", event: "피트니스 & 스트레칭 세션", category: "fitness" },
  { time: "18:30", event: "장후 PM 마켓 브리핑 & 리포트", category: "market" },
  { time: "20:00", event: "저녁 식사 & 개인 독서/학습", category: "personal" },
  { time: "22:30", event: "Obsidian 데일리 노트 마감 및 수면 준비", category: "night" }
];

export const INITIAL_DIET_LOGS = [
  {
    id: "d1",
    mealType: "아침",
    time: "08:30",
    rawText: "무가당 그릭요거트 100g, 바나나 1개, 하루견과 1봉",
    kcal: 355,
    carbs: 36,
    protein: 16.3,
    fat: 17.8
  },
  {
    id: "d2",
    mealType: "점심",
    time: "12:30",
    rawText: "점심 제육볶음 1인분, 밥 2/3공기, 계란후라이 1개",
    kcal: 755,
    carbs: 59.9,
    protein: 42.5,
    fat: 37.8
  }
];

export const INITIAL_RUNNING_LOGS = [
  {
    id: "run1",
    date: "2026-08-26",
    distance: 5.02, // km
    durationMinutes: 26.5, // 26분 30초
    pace: "5'16\"",
    conditionScore: 4, // 1~5점
    fatigueScore: 2, // 1~5점 (낮을수록 좋음)
    heartRateAvg: 148,
    notes: "초반 2km 가볍게 빌드업, 후반 3km 5분대 초반 페이스 유지. 호흡 쾌적."
  },
  {
    id: "run2",
    date: "2026-08-24",
    distance: 5.15,
    durationMinutes: 28.1,
    pace: "5'27\"",
    conditionScore: 5,
    fatigueScore: 1,
    heartRateAvg: 142,
    notes: "페이스 제어 완벽. 주간 목표 2회차 달성."
  },
  {
    id: "run3",
    date: "2026-08-22",
    distance: 5.0,
    durationMinutes: 27.4,
    pace: "5'28\"",
    conditionScore: 3,
    fatigueScore: 3,
    heartRateAvg: 152,
    notes: "전날 야근으로 피로도 살짝 있었으나 안정적으로 완주."
  }
];

export const INITIAL_EXPENSES = [
  {
    id: "e1",
    date: "2026-08-26",
    merchant: "스타벅스 리저브",
    category: "식비/카페",
    amount: 6500,
    paymentMethod: "신한카드",
    isFixed: false
  },
  {
    id: "e2",
    date: "2026-08-26",
    merchant: "배달의민족 (단백질 샐러드)",
    category: "식비",
    amount: 14500,
    paymentMethod: "현대카드",
    isFixed: false
  },
  {
    id: "e3",
    date: "2026-08-25",
    merchant: "교보문고 (AI 엔지니어링 도서)",
    category: "자기계발/도서",
    amount: 38000,
    paymentMethod: "네이버페이",
    isFixed: false
  },
  {
    id: "e4",
    date: "2026-08-24",
    merchant: "쿠팡 로켓프레시 (닭가슴살/야채)",
    category: "식비/장보기",
    amount: 54200,
    paymentMethod: "신한카드",
    isFixed: false
  },
  {
    id: "e5",
    date: "2026-08-20",
    merchant: "토스증권 해외주식 적립식 매수 (QQQ, NVDA)",
    category: "투자/자산",
    amount: 800000,
    paymentMethod: "계좌이체",
    isFixed: false
  }
];

// Market & Macro Intelligence Data
export const MACRO_4_INDICATORS = [
  {
    id: "us10y",
    name: "미 10년물 국채금리",
    symbol: "US10Y",
    value: "4.18%",
    change: "-0.04%p",
    isPositive: false, // 금리 하락은 주식에 우호적
    sentiment: "BULLISH",
    statusText: "연준 금리인하 기대감 반영되며 4.2% 하회 안정세",
    chartData: [4.32, 4.29, 4.25, 4.22, 4.18]
  },
  {
    id: "wti",
    name: "WTI 원유 선물",
    symbol: "CL=F",
    value: "$73.80",
    change: "-1.15%",
    isPositive: false,
    sentiment: "BULLISH",
    statusText: "중동 지정학적 긴장 완화 및 글로벌 원유 수요 둔화 우려로 하향",
    chartData: [76.2, 75.4, 74.8, 74.5, 73.8]
  },
  {
    id: "usdkrw",
    name: "원/달러 환율",
    symbol: "USD/KRW",
    value: "1,348.50원",
    change: "-4.20원",
    isPositive: false, // 환율 하락은 원화 강세
    sentiment: "BULLISH",
    statusText: "외국인 국내 증시 순매수세 및 달러 인덱스 약세 영향",
    chartData: [1362, 1358, 1354, 1350, 1348.5]
  },
  {
    id: "vix",
    name: "VIX 공포지수",
    symbol: "VIX",
    value: "14.85",
    change: "-0.62 (-4.01%)",
    isPositive: false, // VIX 하락은 공포 완화
    sentiment: "BULLISH",
    statusText: "15선 하회로 시장 변동성 위험 선호 심리 회복",
    chartData: [17.5, 16.8, 15.9, 15.2, 14.85]
  }
];

export const MAJOR_INDICES = [
  { name: "S&P 500", value: "5,648.40", change: "+0.85%", isUp: true, spark: [5580, 5600, 5620, 5610, 5648] },
  { name: "NASDAQ 100", value: "19,820.15", change: "+1.32%", isUp: true, spark: [19400, 19550, 19680, 19720, 19820] },
  { name: "다우존스", value: "41,250.50", change: "+0.22%", isUp: true, spark: [41100, 41150, 41200, 41180, 41250] },
  { name: "SOX 반도체", value: "5,280.90", change: "+2.45%", isUp: true, spark: [5120, 5160, 5210, 5230, 5280] },
  { name: "KOSPI", value: "2,715.30", change: "+0.78%", isUp: true, spark: [2680, 2695, 2705, 2710, 2715] }
];

export const CORE_WATCHLIST = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: "$128.45",
    change: "+4.18%",
    isUp: true,
    marketCap: "$3.15T",
    peRatio: "42.5",
    aiBrief: "차세대 블랙웰(Blackwell) B200 칩 출하 본격화 및 클라우드 CSP 빅4 CAPEX 확대 모멘텀 지속",
    catalyst: "데이터센터 GPU 주문량 견고, AI 추론 수요 급증"
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: "$218.80",
    change: "+3.65%",
    isUp: true,
    marketCap: "$698B",
    peRatio: "58.2",
    aiBrief: "FSD v12.5 글로벌 확장 테스트 긍정적 평가 및 에너지 저장장치(Megapack) 분기 인도량 급증",
    catalyst: "로보택시(Robotaxi) 및 옵티머스 2.0 로드맵 발표 기대감"
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: "$226.50",
    change: "+0.92%",
    isUp: true,
    marketCap: "$3.45T",
    peRatio: "33.1",
    aiBrief: "Apple Intelligence 탑재 아이폰16 교체 슈퍼사이클 및 서비스 부문 마진율 최고치 경신",
    catalyst: "온디바이스 AI 프라이버시 클라우드 생태계 선점"
  },
  {
    symbol: "QQQ",
    name: "Invesco QQQ (나스닥 100 ETF)",
    price: "$482.30",
    change: "+1.28%",
    isUp: true,
    marketCap: "$285B",
    peRatio: "29.4",
    aiBrief: "빅테크 M7 중심 실적 견인 및 국채 금리 하향에 따른 기술주 멀티플 확장",
    catalyst: "소프트랜딩(연착륙) 시나리오 속 금리인하 수혜"
  },
  {
    symbol: "SOXL",
    name: "Direxion Daily Semiconductor 3X",
    price: "$38.90",
    change: "+7.42%",
    isUp: true,
    marketCap: "$11.2B",
    peRatio: "-",
    aiBrief: "HBM3E 메모리 및 AI 가속기 파운드리 가동률 100% 근접에 따른 반도체 3배 레버리지 탄력",
    catalyst: "TSMC 3nm 풀가동 및 마이크론/브로드컴 실적 호조"
  }
];

export const AM_BRIEFING_CONTENT = {
  date: "2026-08-26",
  headline: "미 기술주 랠리 재개: 국채금리 4.1%대 안착 & 엔비디아·반도체 섹터 강한 반등",
  summaryPoints: [
    "미국 10년물 국채 금리가 4.18%로 하향 안정되며 나스닥(+1.32%) 및 SOX 반도체(+2.45%) 지수가 장중 최고가 경신 시도.",
    "엔비디아(NVDA +4.18%)와 TSLA(+3.65%)가 시장 거래대금을 흡수하며 강세를 주도하였고, 애플은 인텔리전스 수요 기대감으로 0.9% 상승.",
    "WTI 유가가 $73선으로 하락하고 VIX 공포지수가 14.8p로 내려앉으며 전형적인 'Risk-On(위험자산 선호)' 장세 전개.",
    "국내 증시 또한 원/달러 환율 1,348원 진입 및 외국인 선물 순매수 전환으로 반도체/AI 밸류체인 갭상승 출발 유력."
  ],
  obsidianTemplate: `---
title: "AM Market Briefing - 2026-08-26"
tags: [macro, market-briefing, us-equity, ai-stocks]
date: 2026-08-26
sentiment: Bullish (Risk-On)
---
# 📊 AM Market & Macro Intelligence (2026-08-26)

## 1. 글로벌 핵심 지표
- **S&P 500**: 5,648.40 (+0.85%)
- **NASDAQ 100**: 19,820.15 (+1.32%)
- **US 10Y 국채금리**: 4.18% (-4bp, 기술주 우호적)
- **WTI 원유**: $73.80 (-1.15%)
- **USD/KRW 환율**: 1,348.50원 (-4.20원)
- **VIX 공포지수**: 14.85 (안정 국면)

## 2. 주도 섹터 & 관심 종목
- **NVDA**: +4.18% (블랙웰 B200 양산 확대)
- **TSLA**: +3.65% (FSD v12.5 글로벌 확장)
- **SOXL**: +7.42% (반도체 3배 레버리지 탄력)

## 3. 전략적 액션
- [x] 장 초반 반도체 밸류체인 수급 확인
- [ ] 정기 적립식 QQQ/NVDA 분할 매수 집행
`
};

export const PM_BRIEFING_CONTENT = {
  date: "2026-08-26",
  headline: "외인·기관 동반 순매수로 코스피 2,710선 안착 & 텔레그램 채널 핵심 동향",
  marketSummary: "국내 시장은 장전 미 증시 훈풍을 이어받아 삼성전자, SK하이닉스 등 대형 반도체주로 강력한 외국인 프로그램 매수세가 유입되었습니다. 2차전지 및 바이오 섹터로 순환매가 확산되며 코스닥도 1.4% 상승 마감했습니다.",
  telegramSummaries: [
    {
      channel: "📈 여의도 시황 & 테크 인텔리전스",
      time: "17:45",
      summary: "1) 엔비디아 실적 컨센서스 대비 HBM 공급망 쇼티지 2027년까지 지속 전망 2) 국내 파운드리 및 첨단 패키징 장비주 목표주가 상향 릴레이 3) 기관 투자가 반도체 비중 추가 확대 포지셔닝 포착."
    },
    {
      channel: "🌐 글로벌 매크로 & 연준 모니터",
      time: "18:10",
      summary: "1) 파월 의장 잭슨홀 심포지엄 연설 핵심 요약: '데이터 기반 정책 전환 시점 도래' 2) 9월 FOMC 25bp 금리 인하 확률 88% 반영 3) 미 고용지표 안정으로 경기 침체 없는 연착륙 뷰 확고."
    },
    {
      channel: "⚡ 테슬라 & 자율주행 심층 분석",
      time: "18:40",
      summary: "1) 중국 상하이 공장 8월 생산량 역대 최고치 경신 2) FSD v12.5.1 도심 운행 무개입 거리(Critical Disengagements) 3배 개선 3) 로보택시 플랫폼 공개 이벤트 기대감 고조."
    }
  ]
};

export const POLICY_NEWS = [
  {
    id: "pn1",
    tag: "관세/통상",
    title: "美 상무부, 대중국 첨단 반도체 및 AI 칩 추가 수출통제 가이드라인 확정",
    source: "Bloomberg",
    time: "2시간 전",
    sentiment: "NEUTRAL",
    threeLines: [
      "미국 정부가 HBM3E 및 16nm 이하 첨단 로직 공정에 대한 우회 수출 차단 규제안 발표.",
      "기존 승인된 한국/대만 우방국 제조 팹의 시설 업그레이드는 VEU(검증된 최종 사용자) 지위 유지로 직접 타격 제한적.",
      "엔비디아 H20 및 커스텀 AI 칩의 중국 내 라이선스 심사 요건이 대폭 강화되어 미중 공급망 재편 가속화."
    ]
  },
  {
    id: "pn2",
    tag: "빅테크 규제",
    title: "미 법무부(DOJ), 구글 검색 독점 소송 항소심 돌입 및 크롬 브라우저 분리 검토",
    source: "Reuters",
    time: "4시간 전",
    sentiment: "BEARISH",
    threeLines: [
      "1심 법원의 반독점 판결에 이어 법무부가 알파벳 사업부 분할(Break-up) 옵션까지 구제책으로 공식 제안.",
      "애플과 구글 간 기본 검색엔진 계약(연간 $20B 규모) 무효화 가능성에 따라 사파리 검색 브라우징 지형 변화 예고.",
      "전문가들은 실제 분할까지 수년간의 항소 절차가 소요될 것으로 보며 단기 멀티플 압박 요인으로 평가."
    ]
  },
  {
    id: "pn3",
    tag: "연준/통화정책",
    title: "연준 주요 위원 비둘기파 발언 확산: '실질금리 부담 완화 위해 점진적 인하 시작해야'",
    source: "Financial Times",
    time: "6시간 전",
    sentiment: "BULLISH",
    threeLines: [
      "인플레이션이 2%대 중반으로 안착함에 따라 노동시장 냉각을 방어하기 위한 통화정책 정상화 필요성 강조.",
      "9월 FOMC 기준금리 25bp 인하를 시작으로 연내 총 75bp 인하 경로가 채권 시장에 주류로 프라이싱.",
      "기술주 및 고성장 스타트업의 자금 조달 비용 감소와 밸류에이션 리레이팅 호재로 작용할 전망."
    ]
  }
];

export const SEC_EARNINGS_BRIEFS = [
  {
    id: "sec1",
    symbol: "NVDA",
    quarter: "FY25 Q2 Earnings",
    releaseDate: "2026-08-28 예정",
    revenue: "$30.04B",
    revenueSurprise: "+122% YoY (Beat)",
    eps: "$0.68",
    epsSurprise: "+152% YoY (Beat)",
    guidance: [
      "차세대 블랙웰(Blackwell) 플랫폼 풀가동 양산, FY26 초까지 생산 물량 완판(Sold-out) 상태.",
      "데이터센터 AI 네트워킹(Quantum-X InfiniBand 및 Spectrum-X 이더넷) 매출 비중 40% 이상 급성장.",
      "주주환원을 위한 $50B 규모의 신규 자사주 매입 프로그램 승인."
    ]
  },
  {
    id: "sec2",
    symbol: "TSLA",
    quarter: "2026 Q2 Earnings",
    releaseDate: "공시 완료",
    revenue: "$25.50B",
    revenueSurprise: "+2.1% (In-line)",
    eps: "$0.52",
    epsSurprise: "-1.8% (Miss)",
    guidance: [
      "에너지 저장장치(Megapack) 사업부 마진율 24% 돌파하며 자동차 마진 하락 상쇄.",
      "저가형 차세대 모델(Next-gen platform) 2026년 상반기 양산 개시 목표 재확인.",
      "FSD v13 기반 무인 감독 주행 상용화 라이선스 계약 타 OEM과 협의 진행 중."
    ]
  }
];

export const PUBMED_DAILY_CURATION = {
  id: "pmd-2026-08-26",
  keyword: "근골격계 & 미토콘드리아 생합성 (Musculoskeletal & Mitochondrial Biogenesis)",
  pmid: "PMID: 38942105",
  journal: "Nature Metabolism (2026)",
  title: "Zone 2 지구력 운동과 저항성 운동의 복합 루틴이 근육 내 미토콘드리아 PGC-1α 발현 및 대사 수명에 미치는 영향",
  englishTitle: "Combined Zone 2 Endurance and Resistance Training Synergistically Elevates PGC-1α Expression and Metabolic Longevity in Skeletal Muscle",
  koreanSummary: [
    "**핵심 발견**: 주 3~4회 30분 이상의 저강도 유산소(Zone 2 러닝)와 주 2~3회 근력 운동을 병행할 경우, 단일 운동군 대비 미토콘드리아 ATP 생성 효율이 43% 향상됨.",
    "**대사 질환 방어**: 골격근 내 포도당 수송체(GLUT4) 활성화로 인슐린 저항성이 유의미하게 개선되었으며 내장지방 분해 호르몬 분비 촉진.",
    "**임상 프로토콜 적용점**: 매일 아침 공복 5km 가벼운 러닝과 오후 딥워크 전후 15분 맨몸 저항 운동이 인지 기능 향상과 뇌유래신경영양인자(BDNF) 상승에 최적 조합임."
  ],
  isArchived: true,
  link: "https://pubmed.ncbi.nlm.nih.gov/38942105/"
};

export const GITHUB_AI_TRENDING = [
  {
    id: "gh1",
    repo: "deepseek-ai/DeepSeek-R1",
    stars: "115.4k",
    todayStars: "+1,240",
    category: "LLM / Reasoning",
    language: "Python / C++",
    description: "강화학습 기반 오픈 가중치 추론(Reasoning) 모델. OpenAI o1 수준의 수학/코딩/논리 사고력 달성 및 초경량 로컬 파인튜닝 지원.",
    url: "https://github.com/deepseek-ai/DeepSeek-R1"
  },
  {
    id: "gh2",
    repo: "vllm-project/vllm",
    stars: "42.8k",
    todayStars: "+480",
    category: "AI Inference Engine",
    language: "Python / CUDA",
    description: "PagedAttention 기반 고속 LLM 서빙 프레임워크. 토큰 처리량 3~5배 향상 및 다중 LoRA 어댑터 실시간 스위칭 지원.",
    url: "https://github.com/vllm-project/vllm"
  },
  {
    id: "gh3",
    repo: "google/smolagents",
    stars: "22.6k",
    todayStars: "+890",
    category: "Autonomous Agent",
    language: "Python",
    description: "단 1000줄 미만의 코드로 구축하는 경량화 자율 AI 에이전트 프레임워크. 함수 호출 및 브라우저/도구 조작 최적화.",
    url: "https://github.com/google/smolagents"
  },
  {
    id: "gh4",
    repo: "med-intelligence/open-biomed-rag",
    stars: "14.2k",
    todayStars: "+310",
    category: "HealthTech / BioAI",
    language: "TypeScript / Python",
    description: "PubMed 3,500만 편 논문 및 ClinVar 유전체 임상 데이터를 실시간 임베딩하여 질의하는 오픈소스 의료 RAG 플랫폼.",
    url: "https://github.com/med-intelligence/open-biomed-rag"
  }
];
