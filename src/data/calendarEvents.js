// Seed Calendar Events & Schedule Database for L&M OS

export const INITIAL_CALENDAR_EVENTS = [
  {
    id: "evt-1",
    date: "2026-08-26",
    startTime: "07:30",
    endTime: "08:15",
    title: "🏃 5km 모닝 러닝 & Zone 2 페이스 세션",
    category: "fitness", // fitness, deepwork, market, personal, meeting
    completed: true,
    location: "한강 러닝 코스",
    notes: "평균 페이스 5'16\" 완수. PGC-1α 미토콘드리아 활성화."
  },
  {
    id: "evt-2",
    date: "2026-08-26",
    startTime: "09:30",
    endTime: "11:00",
    title: "🧠 1차 딥워크: AI RAG 파이프라인 아키텍처 구현",
    category: "deepwork",
    completed: true,
    location: "홈 오피스 워크스페이스",
    notes: "40Hz 감마 바이노럴 사운드 적용 90분 무방해 몰입."
  },
  {
    id: "evt-3",
    date: "2026-08-26",
    startTime: "14:00",
    endTime: "15:30",
    title: "📊 테크 포트폴리오 리밸런싱 & 투자 잉여금 점검",
    category: "market",
    completed: false,
    location: "L&M OS 대시보드",
    notes: "이번 달 가용 잉여금 대비 QQQ / NVDA 적립식 매수 집행."
  },
  {
    id: "evt-4",
    date: "2026-08-26",
    startTime: "18:30",
    endTime: "19:00",
    title: "🌙 장후 PM 마켓 오선 브리핑 & 텔레그램 요약 분석",
    category: "market",
    completed: false,
    location: "L&M OS",
    notes: "외국인/기관 수급 및 주도 반도체 밸류체인 점검."
  },
  {
    id: "evt-5",
    date: "2026-08-27",
    startTime: "10:00",
    endTime: "11:30",
    title: "💡 글로벌 테크 AI 스타트업 기술 미팅",
    category: "meeting",
    completed: false,
    location: "Google Meet",
    notes: "에이전트 워크플로우 및 LLM 경량화 서빙 논의."
  },
  {
    id: "evt-6",
    date: "2026-08-28",
    startTime: "05:00",
    endTime: "06:30",
    title: "🚀 [주식 핵심 일정] 엔비디아(NVDA) FY25 Q2 실적 발표 및 어닝콜",
    category: "market",
    completed: false,
    location: "Nasdaq EDGAR",
    notes: "블랙웰 B200 양산 가이던스 및 데이터센터 AI 가속기 매출 점검 필수."
  },
  {
    id: "evt-7",
    date: "2026-08-28",
    startTime: "07:30",
    endTime: "08:15",
    title: "🏃 5km 러닝 프로토콜 4회차 달성",
    category: "fitness",
    completed: false,
    location: "트랙 코스",
    notes: "주간 4회 목표 달성 세션."
  },
  {
    id: "evt-8",
    date: "2026-08-29",
    startTime: "15:00",
    endTime: "18:00",
    title: "📚 주말 딥리딩: 최신 바이오 논문 & 시스템 최적화",
    category: "personal",
    completed: false,
    location: "카페 리저브",
    notes: "PubMed 장수/오토파지 최신 메타분석 리뷰."
  },
  {
    id: "evt-9",
    date: "2026-08-31",
    startTime: "21:00",
    endTime: "22:00",
    title: "🎯 8월 월말 결산 & 9월 투자/루틴 목표 수립",
    category: "deepwork",
    completed: false,
    location: "Obsidian Vault",
    notes: "월간 잉여금 실적 결산 및 9월 FOMC 대비 전략 수립."
  }
];

export const CALENDAR_CATEGORIES = {
  deepwork: { label: "딥워크 (Deepwork)", color: "#00f0ff", badge: "badge-cyan" },
  fitness: { label: "운동/러닝 (Fitness)", color: "#10b981", badge: "badge-emerald" },
  market: { label: "주식/매크로 (Market)", color: "#f59e0b", badge: "badge-amber" },
  meeting: { label: "미팅/업무 (Meeting)", color: "#8b5cf6", badge: "badge-purple" },
  personal: { label: "개인/학습 (Personal)", color: "#f43f5e", badge: "badge-rose" }
};
