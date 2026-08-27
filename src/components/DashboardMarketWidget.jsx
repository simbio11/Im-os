import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Globe, 
  Activity, 
  Sparkles, 
  ChevronRight, 
  RotateCw,
  Zap
} from 'lucide-react';
import { 
  fetchLiveMajorIndices, 
  fetchLiveMacroIndicators, 
  fetchLiveWatchlist,
  DEFAULT_WATCHLIST_CONFIG
} from '../utils/stockApi';
import { 
  MAJOR_INDICES, 
  MACRO_4_INDICATORS, 
  CORE_WATCHLIST, 
  AM_BRIEFING_CONTENT 
} from '../data/sampleData';

export function DashboardMarketWidget({ onGoToMarket }) {
  const [indices, setIndices] = useState(MAJOR_INDICES);
  const [macroIndicators, setMacroIndicators] = useState(MACRO_4_INDICATORS);
  const [watchlist, setWatchlist] = useState(CORE_WATCHLIST);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const savedConfig = localStorage.getItem('lm_watchlist_configs');
      const configs = savedConfig ? JSON.parse(savedConfig) : DEFAULT_WATCHLIST_CONFIG;

      const [liveIdx, liveMacro, liveWatch] = await Promise.all([
        fetchLiveMajorIndices(),
        fetchLiveMacroIndicators(),
        fetchLiveWatchlist(configs)
      ]);

      if (liveIdx && liveIdx.length > 0) setIndices(liveIdx);
      if (liveMacro && liveMacro.length > 0) setMacroIndicators(liveMacro);
      if (liveWatch && liveWatch.length > 0) setWatchlist(liveWatch);
      setLastUpdated(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.warn("Market widget fetch err:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 45000);
    return () => clearInterval(interval);
  }, []);

  // Top 4 watchlist items for compact overview
  const topStocks = watchlist.slice(0, 4);

  // Top key macro items (USD/KRW and 10Y Treasury)
  const usdKrw = macroIndicators.find(m => m.id === 'usdkrw') || { value: '1,385원', change: '-0.29%' };
  const us10y = macroIndicators.find(m => m.id === 'us10y') || { value: '4.65%', change: '-0.85%p' };

  return (
    <div className="dashboard-market-widget glass-card">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-title-with-icon">
          <div className="widget-icon-box market-icon-box">
            <TrendingUp size={18} className="text-emerald" />
          </div>
          <div>
            <div className="widget-header-title">
              <h4>실시간 주식 & 매크로 브리프</h4>
              <span className="status-dot-pulse emerald ml-2" title="실시간 Yahoo Finance 피드 연동"></span>
              <span className="badge badge-emerald ml-1">LIVE FEED</span>
            </div>
            <p className="text-muted text-xs">
              환율 {usdKrw.value} • 미 10년물 {us10y.value} {lastUpdated && `(${lastUpdated} 갱신)`}
            </p>
          </div>
        </div>

        <div className="widget-actions-row">
          <button 
            className="btn btn-icon btn-sm"
            onClick={loadData}
            title="실시간 시세 새로고침"
            disabled={isLoading}
          >
            <RotateCw size={13} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onGoToMarket}
            title="주식 & 매크로 인텔리전스 전체보기"
          >
            <span>전체보기</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Major Indices Quick Bar */}
      <div className="dash-market-indices-strip">
        {indices.slice(0, 4).map((idx, i) => (
          <div key={i} className="dash-index-item">
            <span className="dash-idx-name text-muted text-xs">{idx.name}</span>
            <span className="dash-idx-val mono font-bold">{idx.value}</span>
            <span className={`dash-idx-change mono text-xs ${idx.isUp ? 'text-emerald' : 'text-rose'}`}>
              {idx.isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {idx.change}
            </span>
          </div>
        ))}
      </div>

      {/* Compact Watchlist 2x2 Grid */}
      <div className="dash-watchlist-grid mt-2">
        {topStocks.map(stock => (
          <div 
            key={stock.symbol} 
            className="dash-stock-card glass-card-interactive"
            onClick={onGoToMarket}
          >
            <div className="dash-stock-top">
              <div>
                <strong className="stock-sym mono text-highlight">{stock.symbol}</strong>
                <span className="stock-sub-name text-muted text-xs ml-1">{stock.name}</span>
              </div>
              <div className="text-right">
                <div className="stock-price mono font-bold text-highlight">{stock.price}</div>
                <div className={`stock-change mono text-xs font-bold ${stock.isUp ? 'text-emerald' : 'text-rose'}`}>
                  {stock.change}
                </div>
              </div>
            </div>
            <p className="dash-stock-brief text-xs text-muted mt-1">
              ⚡ {stock.catalyst || stock.aiBrief}
            </p>
          </div>
        ))}
      </div>

      {/* AM Briefing 1-Line Synthesis */}
      <div className="dash-market-footer mt-2" onClick={onGoToMarket}>
        <div className="dash-market-headline">
          <Sparkles size={13} className="text-amber flex-shrink-0" />
          <span className="text-xs text-highlight font-medium truncate">
            {AM_BRIEFING_CONTENT.headline}
          </span>
        </div>
      </div>
    </div>
  );
}
