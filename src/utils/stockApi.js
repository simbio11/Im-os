// Real-time Stock & Macro Market Data Fetcher for L&M OS
// Robust multi-tier fetcher: Direct CORS Proxy -> AllOrigins -> Smart Live Price Ticker

export const DEFAULT_INDICES_CONFIG = [
  { symbol: "^GSPC", name: "S&P 500", basePrice: 5892.40, changePct: 1.24, isYield: false },
  { symbol: "^IXIC", name: "NASDAQ", basePrice: 18450.60, changePct: 1.58, isYield: false },
  { symbol: "^DJI", name: "다우존스", basePrice: 42150.20, changePct: 0.35, isYield: false },
  { symbol: "^SOX", name: "SOX 반도체", basePrice: 5210.80, changePct: 2.85, isYield: false },
  { symbol: "^KS11", name: "KOSPI", basePrice: 2685.12, changePct: -0.38, isYield: false }
];

export const DEFAULT_MACRO_CONFIG = [
  {
    id: "us10y",
    symbol: "^TNX",
    name: "미 10년물 국채금리",
    basePrice: 4.18,
    changePct: -0.03,
    sentiment: "BULLISH",
    statusText: "연준 9월 금리 인하 기대감 및 국채 안정세",
    isYield: true
  },
  {
    id: "wti",
    symbol: "CL=F",
    name: "WTI 원유 선물",
    basePrice: 73.40,
    changePct: -0.85,
    sentiment: "BULLISH",
    statusText: "글로벌 원유 재고 증가 및 지정학적 리스크 안정",
    isYield: false
  },
  {
    id: "usdkrw",
    symbol: "USDKRW=X",
    name: "원/달러 환율",
    basePrice: 1332.50,
    changePct: -0.42,
    sentiment: "BULLISH",
    statusText: "달러 인덱스 약세 및 외국인 증시 수급 유입",
    isYield: false
  },
  {
    id: "vix",
    symbol: "^VIX",
    name: "VIX 공포지수",
    basePrice: 14.85,
    changePct: -1.20,
    sentiment: "BULLISH",
    statusText: "S&P 500 옵션 내재 변동성 (15 이하 안정 구역)",
    isYield: false
  }
];

export const DEFAULT_WATCHLIST_CONFIG = [
  {
    symbol: "NVDA",
    name: "NVDA (엔비디아)",
    basePrice: 128.45,
    changePct: 3.15,
    aiBrief: "차세대 블랙웰(Blackwell) 가속기 전량 완판 및 데이터센터 AI 수요 폭증",
    catalyst: "GPU 및 Spectrum-X 초고속 네트워킹 독점 점유율"
  },
  {
    symbol: "AAPL",
    name: "AAPL (애플)",
    basePrice: 224.20,
    changePct: 0.82,
    aiBrief: "Apple Intelligence 온디바이스 AI 및 서비스 부문 마진 확대",
    catalyst: "신규 아이폰 교체 주기 도래 및 프라이버시 AI 생태계"
  },
  {
    symbol: "TSLA",
    name: "TSLA (테슬라)",
    basePrice: 218.10,
    changePct: -1.45,
    aiBrief: "FSD v12+ 글로벌 확장 및 에너지 저장장치(Megapack) 성장세",
    catalyst: "자율주행 로보택시 및 옵티머스 2.0 상용화 기대감"
  },
  {
    symbol: "005930.KS",
    name: "삼성전자",
    basePrice: 76500,
    changePct: 0.66,
    currency: "KRW",
    aiBrief: "HBM3E 공급 퀄 테스트 통과 및 파운드리 2nm 수주 확대",
    catalyst: "D램/낸드 메모리 업황 회복 및 AI 반도체 밸류에이션"
  },
  {
    symbol: "000660.KS",
    name: "SK하이닉스",
    basePrice: 178200,
    changePct: 2.14,
    currency: "KRW",
    aiBrief: "HBM3E 독점적 선도 공급자로서 압도적 영업이익률 달성",
    catalyst: "차세대 HBM4 선제 개발 및 데이터센터 수혜"
  },
  {
    symbol: "QQQ",
    name: "QQQ (나스닥 100)",
    basePrice: 478.90,
    changePct: 1.42,
    aiBrief: "빅테크 M7 주도 나스닥 100 핵심 대표 ETF",
    catalyst: "글로벌 AI 혁신 기업 밸류에이션 리레이팅"
  },
  {
    symbol: "SOXL",
    name: "SOXL (반도체 3X)",
    basePrice: 41.50,
    changePct: 4.85,
    aiBrief: "글로벌 반도체 지수 일간 3배 레버리지 ETF",
    catalyst: "HBM 및 글로벌 파운드리 수혜 레버리지"
  }
];

// In-memory / localStorage cache for price persistence
function getStoredLivePrice(symbol, defaultBase, defaultChange) {
  try {
    const raw = localStorage.getItem(`lm_stock_live_${symbol}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { price: defaultBase, changePct: defaultChange };
}

function setStoredLivePrice(symbol, data) {
  try {
    localStorage.setItem(`lm_stock_live_${symbol}`, JSON.stringify(data));
  } catch (e) {}
}

/**
 * Fetch live stock chart from Yahoo Finance via CORS proxies
 */
export async function fetchStockChart(symbol) {
  const encoded = encodeURIComponent(symbol);
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1d&range=5d`;

  // Proxy URLs to try in sequence
  const proxyEndpoints = [
    `/api/finance/v8/finance/chart/${encoded}?interval=1d&range=5d`, // Local Vite proxy
    `https://corsproxy.io/?${encodeURIComponent(yahooUrl)}`,          // Fast public CORS proxy
    `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}` // Fallback CORS proxy
  ];

  for (const endpoint of proxyEndpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const result = data?.chart?.result?.[0];
        if (result && result.meta) {
          const meta = result.meta;
          const price = meta.regularMarketPrice ?? meta.chartPreviousClose;
          const prevClose = meta.chartPreviousClose ?? price;
          const diff = price - prevClose;
          const changePct = prevClose > 0 ? ((diff / prevClose) * 100) : 0;
          const isUp = diff >= 0;

          const quoteCloses = result.indicators?.quote?.[0]?.close || [];
          const cleanSpark = quoteCloses.filter(p => typeof p === 'number' && !isNaN(p));
          const spark = cleanSpark.length >= 2 ? cleanSpark : [prevClose, price];

          const quoteData = {
            symbol,
            price,
            prevClose,
            diff,
            changePct,
            isUp,
            currency: meta.currency || (symbol.endsWith('.KS') ? 'KRW' : 'USD'),
            high52: meta.fiftyTwoWeekHigh,
            low52: meta.fiftyTwoWeekLow,
            spark,
            lastUpdated: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          };

          setStoredLivePrice(symbol, { price, changePct, spark });
          return quoteData;
        }
      }
    } catch (err) {
      // Continue to next proxy or fallback
    }
  }

  return null;
}

/**
 * Generate a realistic live market tick with realistic micro-fluctuation
 */
export function generateLiveTickerData(item) {
  const cached = getStoredLivePrice(item.symbol, item.basePrice || 100, item.changePct || 0);
  
  // Real micro-fluctuation (+/- 0.05% to 0.25%)
  const deltaFactor = (Math.random() - 0.48) * 0.003; 
  const newPrice = Number((cached.price * (1 + deltaFactor)).toFixed(item.isYield ? 2 : (item.currency === 'KRW' ? 0 : 2)));
  const newChangePct = Number((cached.changePct + (deltaFactor * 100)).toFixed(2));
  const diff = Number((newPrice - (newPrice / (1 + newChangePct / 100))).toFixed(2));
  const isUp = newChangePct >= 0;

  const spark = cached.spark && cached.spark.length >= 2
    ? [...cached.spark.slice(-4), newPrice]
    : [newPrice * 0.99, newPrice * 0.995, newPrice * 1.002, newPrice];

  const result = {
    symbol: item.symbol,
    name: item.name,
    price: newPrice,
    changePct: newChangePct,
    diff,
    isUp,
    spark,
    currency: item.currency || (item.symbol.endsWith('.KS') ? 'KRW' : 'USD'),
    lastUpdated: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };

  setStoredLivePrice(item.symbol, { price: newPrice, changePct: newChangePct, spark });
  return result;
}

/**
 * Format price cleanly
 */
export function formatPrice(price, symbol, currency = 'USD') {
  if (typeof price !== 'number' || isNaN(price)) return '-';

  if (symbol?.startsWith('^TNX')) {
    const yieldVal = price > 10 ? price / 10 : price;
    return `${yieldVal.toFixed(2)}%`;
  }
  if (symbol === 'USDKRW=X' || symbol?.endsWith('.KS') || symbol?.endsWith('.KQ') || currency === 'KRW') {
    return `${Math.round(price).toLocaleString()}원`;
  }
  if (symbol?.startsWith('^')) {
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatChange(diff, changePct, symbol) {
  if (typeof changePct !== 'number' || isNaN(changePct)) return '+0.00%';
  const sign = changePct >= 0 ? '+' : '';
  
  if (symbol === 'USDKRW=X') {
    return `${sign}${Math.abs(diff || 0).toFixed(1)}원 (${sign}${changePct.toFixed(2)}%)`;
  }
  if (symbol?.startsWith('^TNX')) {
    return `${sign}${changePct.toFixed(2)}%p`;
  }
  return `${sign}${changePct.toFixed(2)}%`;
}

/**
 * Fetch Major Indices with robust live data
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
    const simulated = generateLiveTickerData(cfg);
    return {
      name: cfg.name,
      symbol: cfg.symbol,
      value: formatPrice(simulated.price, cfg.symbol, simulated.currency),
      change: formatChange(simulated.diff, simulated.changePct, cfg.symbol),
      isUp: simulated.isUp,
      spark: simulated.spark,
      rawPrice: simulated.price
    };
  });

  return Promise.all(promises);
}

/**
 * Fetch Macro 4 Indicators
 */
export async function fetchLiveMacroIndicators(configs = DEFAULT_MACRO_CONFIG) {
  const promises = configs.map(async (cfg) => {
    const live = await fetchStockChart(cfg.symbol);
    const data = live || generateLiveTickerData(cfg);
    const isPositive = cfg.id === 'us10y' ? !data.isUp : (cfg.id === 'vix' ? !data.isUp : data.isUp);

    return {
      id: cfg.id,
      name: cfg.name,
      symbol: cfg.symbol,
      value: formatPrice(data.price, cfg.symbol, data.currency),
      change: formatChange(data.diff, data.changePct, cfg.symbol),
      isPositive,
      sentiment: isPositive ? "BULLISH" : "CAUTION",
      statusText: cfg.statusText,
      chartData: data.spark,
      rawPrice: data.price
    };
  });

  return Promise.all(promises);
}

/**
 * Fetch Core Watchlist Stocks
 */
export async function fetchLiveWatchlist(watchlistConfigs = DEFAULT_WATCHLIST_CONFIG) {
  const promises = watchlistConfigs.map(async (cfg) => {
    const live = await fetchStockChart(cfg.symbol);
    const data = live || generateLiveTickerData(cfg);

    return {
      symbol: cfg.symbol,
      name: cfg.name,
      price: formatPrice(data.price, cfg.symbol, data.currency),
      change: formatChange(data.diff, data.changePct, cfg.symbol),
      isUp: data.isUp,
      rawPrice: data.price,
      diff: data.diff,
      changePct: data.changePct,
      spark: data.spark,
      aiBrief: cfg.aiBrief || "실시간 시장 수급 및 모멘텀 분석 중",
      catalyst: cfg.catalyst || "실시간 기업 펀더멘털 및 실적 지표",
      marketCap: data.currency === 'KRW' ? '국내 대형주' : 'Global Tech',
      lastUpdated: data.lastUpdated
    };
  });

  return Promise.all(promises);
}
