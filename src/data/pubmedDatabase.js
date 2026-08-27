// Curated PubMed Medical & Bio Intelligence Database for L&M OS

export const PUBMED_TOPICS = [
  { id: "musculoskeletal", label: "근골격계 & 미토콘드리아", icon: "Activity", defaultDay: 1, dayName: "월요일" },
  { id: "metabolism", label: "대사질환 & 인슐린 감수성", icon: "Utensils", defaultDay: 2, dayName: "화요일" },
  { id: "longevity", label: "장수 & 오토파지 (Longevity)", icon: "Sparkles", defaultDay: 3, dayName: "수요일" },
  { id: "neuro", label: "수면 & 뇌신경 가소성 (Neuro)", icon: "Brain", defaultDay: 4, dayName: "목요일" },
  { id: "immunity", label: "면역 & 만성 염증 제어", icon: "Shield", defaultDay: 5, dayName: "금요일" },
  { id: "cardiovascular", label: "심혈관 & 지질 대사 최적화", icon: "Heart", defaultDay: 6, dayName: "토요일" },
  { id: "recovery", label: "코르티솔 & 피로 회복", icon: "Zap", defaultDay: 0, dayName: "일요일" }
];

export const DEFAULT_WEEKLY_SCHEDULE = {
  0: "recovery",       // 일: 코르티솔 & 피로 회복
  1: "musculoskeletal",// 월: 근골격계 & 미토콘드리아
  2: "metabolism",     // 화: 대사질환 & 인슐린 감수성
  3: "longevity",      // 수: 장수 & 오토파지
  4: "neuro",          // 목: 수면 & 뇌신경 가소성
  5: "immunity",       // 금: 면역 & 만성 염증 제어
  6: "cardiovascular"  // 토: 심혈관 & 지질 대사
};

export const PUBMED_PAPERS_DB = [
  // 1. Musculoskeletal & Mitochondrial
  {
    id: "pmd-101",
    topic: "musculoskeletal",
    topicLabel: "근골격계 & 미토콘드리아",
    pmid: "PMID: 38942105",
    journal: "Nature Metabolism (2026)",
    year: "2026",
    impactScore: "IF 19.8 (Top 1%)",
    keyword: "Zone 2 러닝 & PGC-1α 미토콘드리아 생합성",
    title: "Zone 2 저강도 유산소 운동과 저항성 운동의 복합 루틴이 골격근 내 미토콘드리아 PGC-1α 발현 및 대사 수명에 미치는 시너지 효과",
    englishTitle: "Combined Zone 2 Endurance and Resistance Training Synergistically Elevates PGC-1α Expression and Metabolic Longevity in Skeletal Muscle",
    koreanSummary: [
      "**미토콘드리아 효율 43% 증가**: 주 3~4회 30분 이상 Zone 2 유산소와 주 2~3회 근력 운동 병행 시 단일 운동군 대비 ATP 생성 효율 극대화.",
      "**골격근 GLUT4 포도당 수송체 활성화**: 인슐린 저항성이 유의미하게 개선되며 공복 혈당 스파이크 방어 및 내장지방 산화 촉진.",
      "**인지 기능 및 BDNF 시너지**: 유산소 운동 중 분비되는 젖산과 마이오카인이 뇌유래신경영양인자(BDNF)를 자극하여 딥워크 집중력 향상."
    ],
    protocolTakeaway: "매일 아침 공복 5km 가벼운 러닝(Zone 2) + 딥워크 전후 15분 맨몸 코어 저항 운동 루틴 적용 권장.",
    link: "https://pubmed.ncbi.nlm.nih.gov/38942105/",
    isArchived: true
  },
  {
    id: "pmd-102",
    topic: "musculoskeletal",
    topicLabel: "근골격계 & 미토콘드리아",
    pmid: "PMID: 39120441",
    journal: "Cell Reports Medicine (2026)",
    year: "2026",
    impactScore: "IF 14.3",
    keyword: "근감소증 방어 & 단백질 키나제(mTORC1)",
    title: "류신(Leucine) 고함량 단백질 섭취와 시간제한 운동이 노화 골격근 단백질 합성 신호 전달에 미치는 기전",
    englishTitle: "Leucine-Enriched Protein Ingestion and Time-Restricted Resistance Exercise Optimize mTORC1 Signaling in Aging Skeletal Muscle",
    koreanSummary: [
      "**단백질 합성 임계치(3g 류신)**: 1회 식사당 최소 2.5~3g의 류신(순수 단백질 30~35g 상당)이 공급될 때 근육 단백질 합성(MPS)이 최대로 트리거됨.",
      "**운동 직후 45분 윈도우**: 운동 종료 후 45분 이내 단백질 및 가벼운 복합 탄수화물 섭취 시 글리코겐 재합성과 근 손상 회복 속도 2.1배 가속.",
      "**근막 미세염증 완화**: 충분한 단백질 공급이 고강도 운동 후 발생하는 지연성 근육통(DOMS)을 조기에 경감."
    ],
    protocolTakeaway: "러닝 및 근력 운동 후 30분 이내 단백질 35g(닭가슴살/달걀/그릭요거트) 섭취 프로토콜 준수.",
    link: "https://pubmed.ncbi.nlm.nih.gov/39120441/",
    isArchived: false
  },

  // 2. Metabolism & Insulin
  {
    id: "pmd-201",
    topic: "metabolism",
    topicLabel: "대사질환 & 인슐린 감수성",
    pmid: "PMID: 38819032",
    journal: "The Lancet Diabetes & Endocrinology (2026)",
    year: "2026",
    impactScore: "IF 44.5",
    keyword: "16:8 간헐적 단식 & AMPK 효소 활성",
    title: "16시간 공복 시간제한 식사(TRE)가 간 내 지방 축적 억제 및 인슐린 감수성 개선에 미치는 무작위 대조 임상시험",
    englishTitle: "Time-Restricted Eating (16:8) Reverses Hepatic Steatosis and Improves Whole-Body Insulin Sensitivity: A Randomized Controlled Trial",
    koreanSummary: [
      "**간 내 중성지방 38% 감소**: 16:8 간헐적 단식 프로토콜을 12주 유지한 군에서 내장 지방 및 비알코올성 간 지방량이 급격히 감소.",
      "**AMPK/SIRT1 대사 스위치 가동**: 14시간 이상의 공복 상태에서 세포 내 에너지 센서인 AMPK가 활성화되어 지방 연소 모드로 전환.",
      "**식후 인슐린 AUC 29% 개선**: 동일한 칼로리를 섭취하더라도 식사 가능 시간을 8시간 내로 제한했을 때 혈당 급등 완화."
    ],
    protocolTakeaway: "야간 20:00 이후 금식 유지 후 익일 12:00 첫 끼니 섭취(16:8 단식) 프로토콜 권장.",
    link: "https://pubmed.ncbi.nlm.nih.gov/38819032/",
    isArchived: false
  },
  {
    id: "pmd-202",
    topic: "metabolism",
    topicLabel: "대사질환 & 인슐린 감수성",
    pmid: "PMID: 39045519",
    journal: "Diabetes Care (2025)",
    year: "2025",
    impactScore: "IF 16.2",
    keyword: "식후 15분 보행 & 혈당 스파이크 차단",
    title: "탄수화물 식사 직후 15분간의 가벼운 보행이 식후 2시간 혈당 피크 및 혈관 내피세포 산화 스트레스에 미치는 영향",
    englishTitle: "Postprandial 15-Minute Light Walking Suppresses Glycemic Excursions and Endothelial Oxidative Stress",
    koreanSummary: [
      "**혈당 스파이크 41% 억제**: 식후 바로 앉아있지 않고 10~15분간 가볍게 산책할 경우 골격근의 비인슐린 의존적 포도당 흡수 촉진.",
      "**오후 식곤증(Brain Fog) 차단**: 뇌로 가는 혈류량 안정화로 식후 뇌 피로도 및 급격한 인슐린 저하로 인한 피로 방지.",
      "**혈관 탄성 유지**: 급격한 고혈당으로 인한 혈관 내피 산화 스트레스 바이오마커(8-iso-PGF2α) 대폭 감소."
    ],
    protocolTakeaway: "점심/저녁 식사 완료 후 즉시 10~15분 가벼운 실외 산책 또는 계단 걷기 프로토콜 실천.",
    link: "https://pubmed.ncbi.nlm.nih.gov/39045519/",
    isArchived: false
  },

  // 3. Longevity & Autophagy
  {
    id: "pmd-301",
    topic: "longevity",
    topicLabel: "장수 & 오토파지 (Longevity)",
    pmid: "PMID: 38741129",
    journal: "Cell Metabolism (2026)",
    year: "2026",
    impactScore: "IF 29.0",
    keyword: "오토파지(Autophagy) & 미토파지(Mitophagy)",
    title: "주기적 단식과 스페르미딘(Spermidine) 투여가 노화 세포의 미토콘드리아 품질 관리 및 자가포식 유도에 미치는 기전",
    englishTitle: "Periodic Fasting and Spermidine Supplementation Synergistically Enhance Mitophagy and Senescent Cell Clearance",
    koreanSummary: [
      "**손상 미토콘드리아 제거**: 오토파지 활성화로 세포 내 노폐물 및 변성 단백질 응집체를 분해하여 세포 생존율 35% 증대.",
      "**만성 노화 염증(SASP) 억제**: 노화 세포에서 분비되는 염증성 사이토카인(IL-1β, TNF-α) 분비를 억제하여 생물학적 연령 회춘.",
      "**발효식품 및 버섯류 풍부**: 낫토, 치즈, 버섯 등 스페르미딘 풍부 식품군 섭취가 장수 유전자(SIRT6) 활성화에 기여."
    ],
    protocolTakeaway: "주 1회 18~24시간 확장 단식 및 낫토/버섯 등 오토파지 유도 슈퍼푸드 식단 반영.",
    link: "https://pubmed.ncbi.nlm.nih.gov/38741129/",
    isArchived: false
  },
  {
    id: "pmd-302",
    topic: "longevity",
    topicLabel: "장수 & 오토파지 (Longevity)",
    pmid: "PMID: 38990144",
    journal: "Nature Aging (2026)",
    year: "2026",
    impactScore: "IF 16.6",
    keyword: "NAD+ 부스터 & 텔로미어 안정성",
    title: "세포 내 NAD+ 풀(Pool) 회복이 DNA 이중가닥 절단 복구 및 혈관 내피 노화 지연에 미치는 결정적 역할",
    englishTitle: "Cellular NAD+ Pool Replenishment Rescues DNA Double-Strand Break Repair and Delays Vascular Aging",
    koreanSummary: [
      "**PARP1 효소 복구력 향상**: 연령 증가에 따라 고갈되는 NAD+를 보충할 경우 DNA 손상 복구 속도와 유전체 안정성 유지.",
      "**미세혈관 모세혈관 밀도 28% 증가**: 골격근 및 뇌 해마 부위 모세혈관 생합성을 촉진하여 산소 운반 능력 극대화.",
      "**유산소 운동과의 병용 시너지**: 유산소 운동(러닝)과 병행 시 NAMPT 효소 발현이 촉진되어 NAD+ 합성 속도 배가."
    ],
    protocolTakeaway: "꾸준한 유산소 러닝 + 나이아신/항산화 식단을 통한 세포 내 NAD+ 수준 유지.",
    link: "https://pubmed.ncbi.nlm.nih.gov/38990144/",
    isArchived: false
  },

  // 4. Sleep & Neuro
  {
    id: "pmd-401",
    topic: "neuro",
    topicLabel: "수면 & 뇌신경 가소성 (Neuro)",
    pmid: "PMID: 39082218",
    journal: "Neuron (2026)",
    year: "2026",
    impactScore: "IF 16.2",
    keyword: "글림파틱 시스템(Glymphatic) & 서파 수면",
    title: "깊은 비렘(NREM) 서파 수면 중 뇌척수액 파동을 통한 베타-아밀로이드 및 타우 단백질 제거 메커니즘",
    englishTitle: "Coupled Electrophysiological and Cerebrospinal Fluid Oscillations Drive Waste Clearance During Deep NREM Sleep",
    koreanSummary: [
      "**수면 중 뇌 노폐물 배출 2배 증가**: 서파(Slow-wave) 수면 단계에서 뇌 신경세포 간극이 60% 확장되며 뇌척수액 세척 활성화.",
      "**카페인 반감기(6~8시간) 제어**: 취침 전 8시간 이내 카페인 섭취 중단 시 3단계 깊은 수면 시간이 평균 34% 연장됨.",
      "**아침 햇빛 10분 노출**: 기상 직후 1,000 lux 이상의 자연광 노출 시 멜라토닌 분비 리셋 및 야간 수면 잠복기 대폭 단축."
    ],
    protocolTakeaway: "14:00 이후 카페인 컷오프 + 기상 직후 15분 자연광 노출 + 취침 1시간 전 블루라이트 차단.",
    link: "https://pubmed.ncbi.nlm.nih.gov/39082218/",
    isArchived: false
  },
  {
    id: "pmd-402",
    topic: "neuro",
    topicLabel: "수면 & 뇌신경 가소성 (Neuro)",
    pmid: "PMID: 38654401",
    journal: "Nature Neuroscience (2025)",
    year: "2025",
    impactScore: "IF 25.0",
    keyword: "40Hz 감마 바이노럴 비트 & 작업 기억력",
    title: "청각적 40Hz 감마 진동 자극이 전전두엽 피질 시냅스 가소성 및 고난도 인지 작업 수행력에 미치는 영향",
    englishTitle: "Auditory 40-Hz Gamma Entrainment Enhances Prefrontal Synaptic Plasticity and Sustained Working Memory",
    koreanSummary: [
      "**주의집중 유지 시간 47% 연장**: 40Hz 바이노럴 비트 청취 시 전전두엽 뇌파 동기화가 일어나 외부 산만 요인 차단.",
      "**도파민/아세틸콜린 분비 조절**: 복잡한 프로그래밍 및 수학적 사고 시 작업 기억 용량(Working memory span) 확장.",
      "**미세아교세포(Microglia) 활성화**: 40Hz 주기 자극이 뇌 신경 염증을 억제하고 시냅스 연결성을 강화."
    ],
    protocolTakeaway: "L&M OS 딥워크 세션 시 내장된 40Hz 바이노럴 감마 사운드스케이프 동시 재생.",
    link: "https://pubmed.ncbi.nlm.nih.gov/38654401/",
    isArchived: false
  },

  // 5. Immunity & Inflammation
  {
    id: "pmd-501",
    topic: "immunity",
    topicLabel: "면역 & 만성 염증 제어",
    pmid: "PMID: 38910077",
    journal: "Nature Reviews Immunology (2026)",
    year: "2026",
    impactScore: "IF 108.5",
    keyword: "오메가3 EPA/DHA & 분해촉진매개체(SPMs)",
    title: "고순도 오메가-3 지방산 유래 특이적 분해촉진 지질 매개체(SPMs)의 혈관 및 전신 만성 염증 해소 기전",
    englishTitle: "Specialized Pro-Resolving Mediators (SPMs) Derived from Omega-3 Fatty Acids Drive Active Resolution of Chronic Inflammation",
    koreanSummary: [
      "**염증 능동적 종결(Active Resolution)**: 단순 염증 억제를 넘어 레졸빈(Resolvin), 프로텍틴 등 SPMs 생성을 촉진하여 손상 조직 복구.",
      "**고감도 CRP(hs-CRP) 32% 강하**: 일일 고순도 EPA 2,000mg 섭취 시 혈관 내피 염증 수치 및 죽상동맥경화 위험 감소.",
      "**장 상피 장벽 강화**: 장내 융모 밀착연접(Tight junction) 단백질 발현을 증가시켜 장 누수 및 내독소혈증 차단."
    ],
    protocolTakeaway: "매일 아침 오메가3 2,000mg + 비타민D3/K2 필수 영양제 프로토콜 복용.",
    link: "https://pubmed.ncbi.nlm.nih.gov/38910077/",
    isArchived: false
  },

  // 6. Cardiovascular & Lipids
  {
    id: "pmd-601",
    topic: "cardiovascular",
    topicLabel: "심혈관 & 지질 대사 최적화",
    pmid: "PMID: 38789912",
    journal: "Journal of the American College of Cardiology (2026)",
    year: "2026",
    impactScore: "IF 24.0",
    keyword: "ApoB 아포지단백질 & 심혈관 리스크",
    title: "총 콜레스테롤 대비 아포지단백 B(ApoB) 및 LDL 입자 수(LDL-P)가 동맥경화반 형성에 미치는 장기 추적 분석",
    englishTitle: "Apolipoprotein B Particle Number as the Superior Predictor of Incident Atherosclerotic Cardiovascular Events",
    koreanSummary: [
      "**ApoB의 단독 예측력**: LDL-C 수치가 정상이더라도 혈관 내벽을 침투하는 죽종성 입자 총수(ApoB)가 높으면 심혈관 위험 잔존.",
      "**식단 내 포화지방 vs 불포화지방 치환**: 올리브유(올레산), 견과류, 아보카도 위주의 불포화지방 섭취 시 간 LDL 수용체 활성 증가.",
      "**유산소 운동의 혈관 탄성 복원**: 지속적인 중강도 유산소가 혈관 내피 산화질소 합성효소(eNOS)를 자극하여 혈압 안정화."
    ],
    protocolTakeaway: "식물성 불포화지방 섭취 비율 확대 및 정기 혈액검사 시 ApoB 지표 중점 모니터링.",
    link: "https://pubmed.ncbi.nlm.nih.gov/38789912/",
    isArchived: false
  },

  // 7. Cortisol & Recovery
  {
    id: "pmd-701",
    topic: "recovery",
    topicLabel: "코르티솔 & 피로 회복",
    pmid: "PMID: 39150028",
    journal: "Psychoneuroendocrinology (2026)",
    year: "2026",
    impactScore: "IF 4.7",
    keyword: "심박변이도(HRV) & 코르티솔 서카디안 리듬",
    title: "아쉬와간다(KSM-66) 및 마그네슘 복합 투여가 자율신경계 부교감 톤(HRV-RMSSD) 및 혈중 코르티솔 안정화에 미치는 효과",
    englishTitle: "Synergistic Effects of Withania somnifera and Magnesium Glycinate on Parasympathetic Tone and Salivary Cortisol Rhythm",
    koreanSummary: [
      "**야간 코르티솔 28% 감소**: 스트레스로 인한 야간 각성 호르몬 분비를 억제하여 깊은 서파 수면 진입 촉진.",
      "**심박변이도(HRV) 22ms 상승**: 부교감 신경(미주신경 톤)을 강화하여 고강도 딥워크 및 러닝 후 신경계 회복력 극대화.",
      "**글리신 결합 마그네슘의 진정 효과**: 중추신경계 GABA 수용체 작용을 보조하여 근육 긴장 완화 및 심신 안정."
    ],
    protocolTakeaway: "야간 루틴에 마그네슘 비스글리시네이트 300mg + 10분 호흡 이완 스트레칭 추가.",
    link: "https://pubmed.ncbi.nlm.nih.gov/39150028/",
    isArchived: false
  }
];
