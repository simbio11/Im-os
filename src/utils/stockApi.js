// Real-time Stock & Macro Market Data Fetcher for L&M OS
// Uses Yahoo Finance API via local Vite proxy with resilient fallback

export const DEFAULT_INDICES_CONFIG = [
  { symbol: "^GSPC", name: "S&P 500", fallback: { value: "5,800.20", change: "+0.45%", isUp: true, spark: [5750, 5770, 5790, 5780, 5800] } },
  { symbol: "^IXIC", name: "NASDAQ", fallback: { value: "18,250.30", change: "+0.82%", isUp: true, spark: [18100, 18150, 18200, 18220, 18250] } },
  { symbol: "^DJI", name: "다우존스", fallback: { value: "42,100.10", change: "+0.15%", isUp: true, spark: [42000, 42050, 42080, 42090, 42100] } },
  { symbol: "^SOX", name: "SOX 반도체", fallback: { value: "5,150.40", change: "+1.95%", isUp: true, spark: [5050, 5080, 5100, 5120, 5150] } },
  { symbol: "^KS11", name: "KOSPI", fallback: { value: "2,680.50", change: "+0.62%", isUp: true, spark: [2650, 2660, 2670, 2675, 2680] } }
];

export const DEFAULT_MACRO_CONFIG = [
  {
    id: "us10y",
    symbol: "^TNX",
    name: "미 10년물 국채금리",
    sentiment: "BULLISH",
    statusText: "연준 금리 정책 및 국채 입찰 수급 반영",
    isYield: true,
    fallback: { value: "4.25%", change: "-0.03%p", isPositive: false, chartData: [4.35, 4.31, 4.29, 4.27, 4.25] }
  },
  {
    id: "wti",
    symbol: "CL=F",
    name: "WTI 원유 선물",
    sentiment: "BULLISH",
    statusText: "글로벌 지정학적 수급 및 원유 재고 반영",
    fallback: { value: "$74.20", change: "-0.85%", isPositive: false, chartData: [76.5, 75.8, 75.2, 74.8, 74.2] }
  },
  {
    id: "usdkrw",
    symbol: "USDKRW=X",
    name: "원/달러 환율",
    sentiment: "BULLISH",
    statusText: "달러 인덱스 및 외환 시장 실시간 환율",
    fallback: { value: "1,385.00원", change: "-2.50원", isPositive: false, chartData: [1395, 1392, 1389, 1387, 1385] }
  },
  {
    id: "vix",
    symbol: "^VIX",
    name: "VIX 공포지수",
    sentiment: "BULLISH",
    statusText: "S&P 500 옵션 내재 변동성 지수 (15 이하 안정)",
    fallback: { value: "15.20", change: "-0.45", isPositive: false, chartData: [17.2, 16.5, 15.9, 15.5, 15.2] }
  }
];

export const DEFAULT_WATCHLIST_CONFIG = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    aiBrief: "차세대 블랙웰(Blackwell) 가속기 출하 및 빅테크 AI CAPEX 모멘텀",
    catalyst: "데이터센터 AI 추론 및 GPU 독점적 점유율"
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    aiBrief: "FSD v12+ 글로벌 확장 및 에너지 저장장치(Megapack) 성장세",
    catalyst: "자율주행 로보택시 및 옵티머스 2.0 로드맵"
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    aiBrief: "Apple Intelligence 온디바이스 AI 및 서비스 매출 마진 확대",
    catalyst: "아이폰 업그레이드 사이클 및 프라이버시 AI 생태계"
  },
  {
    symbol: "QQQ",
    name: "Invesco QQQ (나스닥 100)",
    aiBrief: "빅테크 M7 주도 나스닥 100 핵심 대표 ETF",
    catalyst: "글로벌 AI 혁신 기업 밸류에이션 리레이팅"
  },
  {
    symbol: "SOXL",
    name: "Direxion Semi 3X Bull",
    aiBrief: "글로벌 반도체 지수 일간 3배 레버리지 ETF",
    catalyst: "HBM3E, 파운드리 및 AI 하드웨어 밸류체인 레버리지"
  },
  {
    symbol: "005930.KS",
    name: "삼성전자",
    aiBrief: "HBM3E 엔비디아 공급 퀄 테스트 통과 및 파운드리 2nm 수주",
    catalyst: "D램/낸드 메모리 업황 회복 및 AI 반도체 밸류에이션"
  },
  {
    symbol: "000660.KS",
    name: "SK하이닉스",
    aiBrief: "HBM3E 독점적 선도 공급자로서 압도적 영업이익률 달성",
    catalyst: "차세대 HBM4 선제 개발 및 데이터센터 수혜"
  }
];

/**
 * Fetch chart & live quote data for a single symbol
 */
export async function fetchStockChart(symbol) {
  try {
    const encoded = encodeURIComponent(symbol);
    const endpoint = `/api/finance/v8/finance/chart/${encoded}?interval=1d&range=5d`;
    const res = await fetch(endpoint);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result || !result.meta) {
      throw new Error("Invalid response structure");
    }

    const meta = result.meta;
    const price = meta.regularMarketPrice ?? meta.chartPreviousClose;
    const prevClose = meta.chartPreviousClose ?? price;
    const diff = price - prevClose;
    const changePct = prevClose > 0 ? ((diff / prevClose) * 100) : 0;
    const isUp = diff >= 0;

    // Extract closing prices for sparkline
    const quoteCloses = result.indicators?.quote?.[0]?.close || [];
    const cleanSpark = quoteCloses.filter(p => typeof p === 'number' && !isNaN(p));
    const spark = cleanSpark.length >= 2 ? cleanSpark : [prevClose, price];

    return {
      symbol,
      price,
      prevClose,
      diff,
      changePct,
      isUp,
      currency: meta.currency || 'USD',
      exchangeName: meta.exchangeName || '',
      high52: meta.fiftyTwoWeekHigh,
      low52: meta.fiftyTwoWeekLow,
      spark,
      lastUpdated: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  } catch (err) {
    console.warn(`[stockApi] Failed to fetch live data for ${symbol}:`, err.message);
    return null;
  }
}

/**
 * Format numbers cleanly depending on currency / index
 */
export function formatPrice(price, symbol, currency = 'USD') {
  if (typeof price !== 'number' || isNaN(price)) return '-';

  if (symbol.startsWith('^TNX')) {
    // 10Y Treasury yield: e.g. 4.656%
    const yieldVal = price > 10 ? price / 10 : price;
    return `${yieldVal.toFixed(2)}%`;
  }
  if (symbol === 'USDKRW=X' || symbol.endsWith('.KS') || symbol.endsWith('.KQ') || currency === 'KRW') {
    return `${Math.round(price).toLocaleString()}원`;
  }
  if (symbol.startsWith('^')) {
    return `${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatChange(diff, changePct, symbol) {
  if (typeof changePct !== 'number') return '+0.00%';
  const sign = changePct >= 0 ? '+' : '';
  
  if (symbol === 'USDKRW=X') {
    return `${sign}${diff.toFixed(2)}원 (${sign}${changePct.toFixed(2)}%)`;
  }
  if (symbol.startsWith('^TNX')) {
    return `${sign}${changePct.toFixed(2)}%p`;
  }
  return `${sign}${changePct.toFixed(2)}%`;
}

/**
 * Fetch all Major Indices
 */
export async function fetchLiveMajorIndices(configs = DEFAULT_INDICES_CONFIG) {
  const promises = configs.map(async (cfg) => {
    const live = await fetchStockChart(cfg.symbol);
    if (live) {
      return {
        name: cfg.name,
        symbol: cfg.symbol,
        value: formatPrice(live.price, cfg.symbol, live.currency),
        change: formatChange(live.diff, live.changePct, cfg.symbol),
        isUp: live.isUp,
        spark: live.spark,
        rawPrice: live.price
      };
    }
    return { ...cfg.fallback, name: cfg.name, symbol: cfg.symbol };
  });

  return Promise.all(promises);
}

/**
 * Fetch 4 Macro Indicators
 */
export async function fetchLiveMacroIndicators(configs = DEFAULT_MACRO_CONFIG) {
  const promises = configs.map(async (cfg) => {
    const live = await fetchStockChart(cfg.symbol);
    if (live) {
      const isPositive = cfg.id === 'us10y' ? !live.isUp : (cfg.id === 'vix' ? !live.isUp : live.isUp);
      return {
        id: cfg.id,
        name: cfg.name,
        symbol: cfg.symbol,
        value: formatPrice(live.price, cfg.symbol, live.currency),
        change: formatChange(live.diff, live.changePct, cfg.symbol),
        isPositive,
        sentiment: isPositive ? "BULLISH" : "CAUTION",
        statusText: cfg.statusText,
        chartData: live.spark,
        rawPrice: live.price
      };
    }
    return { ...cfg, ...cfg.fallback };
  });

  return Promise.all(promises);
}

/**
 * Fetch Core Watchlist Stocks
 */
export async function fetchLiveWatchlist(watchlistConfigs = DEFAULT_WATCHLIST_CONFIG) {
  const promises = watchlistConfigs.map(async (cfg) => {
    const live = await fetchStockChart(cfg.symbol);
    if (live) {
      return {
        symbol: cfg.symbol,
        name: cfg.name,
        price: formatPrice(live.price, cfg.symbol, live.currency),
        change: formatChange(live.diff, live.changePct, cfg.symbol),
        isUp: live.isUp,
        rawPrice: live.price,
        diff: live.diff,
        changePct: live.changePct,
        spark: live.spark,
        aiBrief: cfg.aiBrief || "실시간 시장 수급 및 모멘텀 분석 중",
        catalyst: cfg.catalyst || "실시간 기업 펀더멘털 및 실적 지표",
        marketCap: live.currency === 'KRW' ? '국내 대형주' : 'Global Tech',
        lastUpdated: live.lastUpdated
      };
    }
    return {
      symbol: cfg.symbol,
      name: cfg.name,
      price: "$150.00",
      change: "+0.00%",
      isUp: true,
      aiBrief: cfg.aiBrief,
      catalyst: cfg.catalyst
    };
  });

  return Promise.all(promises);
}
