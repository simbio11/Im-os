// Natural Language & SMS Parsers for Expenses & Workouts

// Card SMS & Natural Language Expense Parser
// Examples:
// - "[신한카드] 08/26 12:30 스타벅스 6,500원 결제"
// - "[현대카드] 승인 24,000원 (일시불) 배달의민족 08/26"
// - "쿠팡 생필품 34000원"
// - "점심 김치찌개 9,000원 식비"
// - "월세 550000원 고정비"
export function parseExpenseNaturalLanguage(input) {
  if (!input || typeof input !== 'string') return null;

  const raw = input.trim();

  // 1. Amount Extraction (Look for numbers with optional commas followed by '원' or standalone numbers)
  let amount = 0;
  const amountMatch = raw.match(/([\d,]+)\s*원/) || raw.match(/(?:승인|결제|금액|pay|paid)\s*[:]?\s*([\d,]+)/i) || raw.match(/(\d{3,9})/);
  if (amountMatch && amountMatch[1]) {
    amount = parseInt(amountMatch[1].replace(/,/g, ''), 10);
  }

  // 2. Merchant / Title Extraction
  let merchant = raw;
  // Strip out card prefixes like [신한카드], [KB국민], [현대카드], [삼성카드], [토스]
  let cleanText = raw.replace(/\[[^\]]+\]/g, '').replace(/승인|결제|일시불|\d{1,2}\/\d{1,2}|\d{1,2}:\d{1,2}/g, '').trim();

  // 3. Category Automatic Classification
  let category = "기타/변동비";
  let isFixed = false;

  const lower = raw.toLowerCase();

  if (lower.includes("스타벅스") || lower.includes("커피") || lower.includes("카페") || lower.includes("투썸") || lower.includes("이디야") || lower.includes("아메리카노")) {
    category = "식비/카페";
    merchant = cleanText.match(/(스타벅스|투썸|이디야|메가커피|컴포즈|폴바셋|커피|카페[\w\s]*)/)?.[0] || "카페/커피";
  } else if (lower.includes("배달의민족") || lower.includes("배민") || lower.includes("요기요") || lower.includes("쿠팡이츠") || lower.includes("식당") || lower.includes("제육") || lower.includes("찌개") || lower.includes("샐러드") || lower.includes("점심") || lower.includes("저녁") || lower.includes("식비")) {
    category = "식비";
    merchant = cleanText.match(/(배달의민족|요기요|쿠팡이츠|식당|샐러드|제육볶음|김치찌개|점심|저녁)/)?.[0] || cleanText.slice(0, 18);
  } else if (lower.includes("월세") || lower.includes("관리비") || lower.includes("보험") || lower.includes("대출") || lower.includes("이자") || lower.includes("통신비") || lower.includes("고정비") || lower.includes("구독")) {
    category = "고정비";
    isFixed = true;
    merchant = cleanText.match(/(월세|관리비|보험료|통신비|구독료|대출이자)/)?.[0] || "고정비 항목";
  } else if (lower.includes("토스증권") || lower.includes("키움") || lower.includes("주식") || lower.includes("etf") || lower.includes("매수") || lower.includes("적립") || lower.includes("투자") || lower.includes("코인") || lower.includes("청약")) {
    category = "투자/자산";
    merchant = cleanText.match(/(해외주식|국내주식|ETF매수|적립식투자|토스증권|청약저축)/)?.[0] || "투자/자산 매수";
  } else if (lower.includes("교보문고") || lower.includes("yes24") || lower.includes("알라딘") || lower.includes("인프런") || lower.includes("유데미") || lower.includes("도서") || lower.includes("강의") || lower.includes("자기계발") || lower.includes("클래스")) {
    category = "자기계발/도서";
    merchant = cleanText.match(/(교보문고|yes24|알라딘|도서구매|강의수강|세미나)/)?.[0] || "자기계발/학습";
  } else if (lower.includes("쿠팡") || lower.includes("네이버페이") || lower.includes("마켓컬리") || lower.includes("쇼핑") || lower.includes("마트") || lower.includes("올리브영") || lower.includes("다이소")) {
    category = "생활/쇼핑";
    merchant = cleanText.match(/(쿠팡|네이버쇼핑|마켓컬리|올리브영|다이소|이마트)/)?.[0] || "생활용품/쇼핑";
  } else if (lower.includes("지하철") || lower.includes("버스") || lower.includes("택시") || lower.includes("카카오T") || lower.includes("주유") || lower.includes("교통")) {
    category = "교통/유류";
    merchant = cleanText.match(/(카카오T|택시|주유소|교통카드|코레일)/)?.[0] || "교통비";
  } else {
    // General fallback
    merchant = cleanText.replace(/[\d,]+원?/g, '').trim() || "일반 지출";
  }

  // Detect payment method
  let paymentMethod = "카드결제";
  if (raw.includes("신한")) paymentMethod = "신한카드";
  else if (raw.includes("현대")) paymentMethod = "현대카드";
  else if (raw.includes("국민") || raw.includes("KB")) paymentMethod = "KB국민카드";
  else if (raw.includes("삼성")) paymentMethod = "삼성카드";
  else if (raw.includes("토스")) paymentMethod = "토스페이";
  else if (raw.includes("네이버")) paymentMethod = "네이버페이";
  else if (raw.includes("카카오")) paymentMethod = "카카오페이";
  else if (raw.includes("계좌") || raw.includes("이체")) paymentMethod = "계좌이체";

  return {
    id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    rawInput: input,
    merchant: merchant.trim(),
    amount: amount || 10000,
    category,
    isFixed,
    paymentMethod,
    date: new Date().toISOString().split('T')[0]
  };
}

// Running Pace & Stats Calculator
export function calculateRunningPace(distanceKm, durationMinutes) {
  if (!distanceKm || !durationMinutes || distanceKm <= 0) return "0'00\"";

  const totalSeconds = durationMinutes * 60;
  const secondsPerKm = totalSeconds / distanceKm;

  const paceMin = Math.floor(secondsPerKm / 60);
  const paceSec = Math.round(secondsPerKm % 60);

  return `${paceMin}'${paceSec.toString().padStart(2, '0')}"`;
}
