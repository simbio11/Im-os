import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Activity, 
  FileText, 
  Send, 
  Sparkles, 
  Check, 
  Radio, 
  Sun, 
  Moon, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight, 
  ExternalLink,
  RotateCw,
  Plus,
  Trash2,
  AlertCircle
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
  AM_BRIEFING_CONTENT, 
  PM_BRIEFING_CONTENT 
} from '../data/sampleData';

export function MarketBriefing({ onOpenObsidianModal }) {
  const [activeSubTab, setActiveSubTab] = useState('am'); // 'am' or 'pm'
  const [copiedNotification, setCopiedNotification] = useState(false);
  
  // Real-time live data state
  const [indices, setIndices] = useState(MAJOR_INDICES);
  const [macroIndicators, setMacroIndicators] = useState(MACRO_4_INDICATORS);
  
  // Watchlist configuration with LocalStorage persistence
  const [watchlistConfigs, setWatchlistConfigs] = useState(() => {
    const saved = localStorage.getItem('lm_watchlist_configs');
    return saved ? JSON.parse(saved) : DEFAULT_WATCHLIST_CONFIG;
  });

  const [watchlist, setWatchlist] = useState(CORE_WATCHLIST);
  const [selectedStock, setSelectedStock] = useState(CORE_WATCHLIST[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isLiveOnline, setIsLiveOnline] = useState(true);

  // Custom ticker add modal state
  const [showAddTickerModal, setShowAddTickerModal] = useState(false);
  const [newTickerSymbol, setNewTickerSymbol] = useState('');
  const [newTickerName, setNewTickerName] = useState('');
  const [newTickerBrief, setNewTickerBrief] = useState('');

  // Fetch live market data
  const loadLiveMarketData = async () => {
    setIsLoading(true);
    try {
      const [liveIdx, liveMacro, liveWatch] = await Promise.all([
        fetchLiveMajorIndices(),
        fetchLiveMacroIndicators(),
        fetchLiveWatchlist(watchlistConfigs)
      ]);

      if (liveIdx && liveIdx.length > 0) setIndices(liveIdx);
      if (liveMacro && liveMacro.length > 0) setMacroIndicators(liveMacro);
      if (liveWatch && liveWatch.length > 0) {
        setWatchlist(liveWatch);
        setSelectedStock(prev => liveWatch.find(s => s.symbol === prev?.symbol) || liveWatch[0]);
      }
      setIsLiveOnline(true);
      setLastUpdated(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn("Live market data fetch error:", err);
      setIsLiveOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load & periodic refresh (every 45s)
  useEffect(() => {
    loadLiveMarketData();
    const interval = setInterval(loadLiveMarketData, 45000);
    return () => clearInterval(interval);
  }, [watchlistConfigs]);

  // Sync custom watchlist to localStorage
  useEffect(() => {
    localStorage.setItem('lm_watchlist_configs', JSON.stringify(watchlistConfigs));
  }, [watchlistConfigs]);

  // Add custom ticker
  const handleAddCustomTicker = (e) => {
    e.preventDefault();
    if (!newTickerSymbol.trim()) return;

    const sym = newTickerSymbol.trim().toUpperCase();
    if (watchlistConfigs.some(w => w.symbol === sym)) {
      alert("이미 등록된 티커입니다.");
      return;
    }

    const newConfig = {
      symbol: sym,
      name: newTickerName.trim() || sym,
      aiBrief: newTickerBrief.trim() || "사용자 등록 관심 종목",
      catalyst: "실시간 시세 및 펀더멘털 트래킹"
    };

    setWatchlistConfigs(prev => [...prev, newConfig]);
    setNewTickerSymbol('');
    setNewTickerName('');
    setNewTickerBrief('');
    setShowAddTickerModal(false);
  };

  // Delete custom ticker
  const handleDeleteTicker = (symbol, e) => {
    e.stopPropagation();
    if (watchlistConfigs.length <= 1) {
      alert("최소 1개 이상의 관심 종목이 유지되어야 합니다.");
      return;
    }
    setWatchlistConfigs(prev => prev.filter(w => w.symbol !== symbol));
  };

  const handleCopyObsidianBrief = () => {
    navigator.clipboard.writeText(AM_BRIEFING_CONTENT.obsidianTemplate);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="market-briefing-container">
      {/* Top Global Indices Live Ticker Bar with Live Indicator */}
      <div className="indices-ticker-bar glass-card">
        <div className="ticker-label">
          <Globe size={14} className="text-cyan" />
          <span>REAL-TIME INDICES</span>
          <span className="status-dot-pulse emerald ml-1" title="실시간 Yahoo Finance 피드 연동"></span>
        </div>
        <div className="indices-scroll-row">
          {indices.map((idx, i) => (
            <div key={i} className="index-chip">
              <span className="index-name">{idx.name}</span>
              <span className="index-val mono font-bold">{idx.value}</span>
              <span className={`index-change mono ${idx.isUp ? 'text-emerald' : 'text-rose'}`}>
                {idx.isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {idx.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Controls Bar: Status & Refresh */}
      <div className="market-live-controls-bar glass-card mt-2">
        <div className="live-status-pill">
          <span className={`status-dot ${isLiveOnline ? 'emerald' : 'amber'}`}></span>
          <span className="text-xs font-bold text-highlight">
            {isLiveOnline ? '🟢 실시간 주식 & 환율 연동 중 (Live Feed)' : '⚠️ 실시간 피드 재시도 중'}
          </span>
          {lastUpdated && (
            <span className="text-xs text-muted mono ml-2">
              (최근 갱신: {lastUpdated})
            </span>
          )}
        </div>

        <div className="market-actions-group">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowAddTickerModal(true)}
            title="새 관심 종목 티커 추가"
          >
            <Plus size={14} />
            <span>종목 추가</span>
          </button>

          <button 
            className={`btn btn-secondary btn-sm ${isLoading ? 'loading-spin' : ''}`}
            onClick={loadLiveMarketData}
            disabled={isLoading}
            title="실시간 시세 새로고침"
          >
            <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? '조회 중...' : '실시간 갱신'}</span>
          </button>
        </div>
      </div>

      {/* Mode Switch Tabs: AM Pre-Market vs PM Post-Market */}
      <div className="briefing-mode-tabs mt-3">
        <button 
          className={`briefing-tab-btn ${activeSubTab === 'am' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('am')}
        >
          <Sun size={16} className="text-amber" />
          <span>장전 AM 브리핑 & 매크로 4대 지표</span>
          <span className="badge badge-amber">Pre-Market</span>
        </button>
        <button 
          className={`briefing-tab-btn ${activeSubTab === 'pm' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('pm')}
        >
          <Moon size={16} className="text-purple" />
          <span>장후 PM 오선 브리핑 & 텔레그램 요약</span>
          <span className="badge badge-purple">Post-Market & Telegram</span>
        </button>
      </div>

      {/* AM PRE-MARKET BRIEFING SECTION */}
      {activeSubTab === 'am' && (
        <div className="am-briefing-view">
          {/* Macro 4 Indicators Grid */}
          <div className="macro-4-section">
            <div className="section-title-row">
              <div className="panel-title-with-icon">
                <Activity size={18} className="text-cyan" />
                <h4>글로벌 매크로 4대 핵심 신호등 (Live Macro Signals)</h4>
              </div>
              <span className="badge badge-cyan">Real-time Global Data</span>
            </div>

            <div className="macro-cards-grid">
              {macroIndicators.map(m => (
                <div key={m.id} className="macro-card glass-card">
                  <div className="macro-card-top">
                    <span className="macro-name">{m.name}</span>
                    <span className={`badge ${m.isPositive ? 'badge-emerald' : 'badge-amber'}`}>{m.sentiment}</span>
                  </div>
                  <div className="macro-value-row">
                    <span className="macro-val mono text-highlight font-bold">{m.value}</span>
                    <span className={`macro-change mono ${m.change.includes('+') ? (m.id === 'us10y' ? 'text-rose' : 'text-emerald') : 'text-emerald'}`}>
                      {m.change}
                    </span>
                  </div>
                  <p className="macro-status-text text-muted text-xs">
                    {m.statusText}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AM Synthesis & Obsidian Sync Card */}
          <div className="am-synthesis-card glass-card">
            <div className="panel-header">
              <div className="panel-title-with-icon">
                <Sparkles size={18} className="text-amber" />
                <h4>{AM_BRIEFING_CONTENT.headline}</h4>
              </div>
              <div className="action-buttons-row">
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopyObsidianBrief}
                >
                  <FileText size={14} />
                  <span>{copiedNotification ? '✓ 클립보드 복사됨' : 'Obsidian 템플릿 복사'}</span>
                </button>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={onOpenObsidianModal}
                >
                  <Send size={14} />
                  <span>Obsidian 데일리 저장</span>
                </button>
              </div>
            </div>

            <div className="am-bullets-list">
              {AM_BRIEFING_CONTENT.summaryPoints.map((point, idx) => (
                <div key={idx} className="am-bullet-item">
                  <span className="bullet-num mono">{idx + 1}</span>
                  <p className="bullet-text">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Core Live Watchlist Section */}
          <div className="watchlist-section">
            <div className="section-title-row">
              <div className="panel-title-with-icon">
                <TrendingUp size={18} className="text-emerald" />
                <h4>실시간 관심 종목 & AI 브리프 ({watchlist.length}개 종목)</h4>
              </div>
              <span className="badge badge-emerald">Live Stock Quotes</span>
            </div>

            <div className="watchlist-grid">
              {watchlist.map(stock => (
                <div 
                  key={stock.symbol} 
                  className={`stock-card glass-card ${selectedStock?.symbol === stock.symbol ? 'selected' : ''}`}
                  onClick={() => setSelectedStock(stock)}
                >
                  <div className="stock-top-row">
                    <div>
                      <div className="stock-sym-row">
                        <strong className="stock-sym mono text-highlight">{stock.symbol}</strong>
                        <button 
                          className="btn-icon-micro text-faint hover-rose ml-2"
                          onClick={(e) => handleDeleteTicker(stock.symbol, e)}
                          title="관심 종목 삭제"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                      <div className="stock-full-name text-muted text-xs">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="stock-price mono font-bold text-highlight">{stock.price}</div>
                      <div className={`stock-change mono font-bold ${stock.isUp ? 'text-emerald' : 'text-rose'}`}>
                        {stock.change}
                      </div>
                    </div>
                  </div>

                  <div className="stock-ai-brief-box">
                    <span className="badge badge-cyan text-xs">AI 원인 분석</span>
                    <p className="ai-brief-text text-xs">{stock.aiBrief}</p>
                  </div>

                  <div className="stock-catalyst-row text-xs text-muted">
                    <span>⚡ 촉매: {stock.catalyst}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PM POST-MARKET BRIEFING SECTION */}
      {activeSubTab === 'pm' && (
        <div className="pm-briefing-view">
          {/* Post-Market Synthesis Card */}
          <div className="pm-market-card glass-card">
            <div className="panel-header">
              <div className="panel-title-with-icon">
                <Moon size={18} className="text-purple" />
                <h4>{PM_BRIEFING_CONTENT.headline}</h4>
              </div>
              <span className="badge badge-purple">PM Market Closing</span>
            </div>
            <p className="pm-summary-paragraph text-muted">
              {PM_BRIEFING_CONTENT.marketSummary}
            </p>
          </div>

          {/* Telegram Channels 3-Line Summary Feed */}
          <div className="telegram-feed-section">
            <div className="section-title-row">
              <div className="panel-title-with-icon">
                <Radio size={18} className="text-cyan" />
                <h4>지정 텔레그램 채널 핵심 메시지 3줄 AI 요약</h4>
              </div>
              <span className="badge badge-cyan">Auto Telegram Synthesis</span>
            </div>

            <div className="telegram-cards-list">
              {PM_BRIEFING_CONTENT.telegramSummaries.map((tg, idx) => (
                <div key={idx} className="telegram-card glass-card">
                  <div className="tg-header">
                    <strong className="tg-channel text-highlight">{tg.channel}</strong>
                    <span className="mono text-xs text-muted">{tg.time}</span>
                  </div>
                  <div className="tg-content">
                    <p className="text-sm">{tg.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Ticker Modal */}
      {showAddTickerModal && (
        <div className="modal-overlay" onClick={() => setShowAddTickerModal(false)}>
          <div className="modal-content add-event-modal" onClick={e => e.stopPropagation()}>
            <div className="panel-header">
              <div className="panel-title-with-icon">
                <Plus size={18} className="text-cyan" />
                <h4>새 관심 종목 티커 추가</h4>
              </div>
              <span className="badge badge-cyan">Custom Watchlist</span>
            </div>

            <form onSubmit={handleAddCustomTicker} className="add-event-form">
              <div className="form-group">
                <label className="text-xs text-muted">티커 심볼 (Ticker Symbol)</label>
                <input
                  type="text"
                  className="input-text mono"
                  placeholder="예: MSFT, PLTR, GOOGL, META, 005930.KS, BTC-USD"
                  value={newTickerSymbol}
                  onChange={e => setNewTickerSymbol(e.target.value.toUpperCase())}
                  required
                  autoFocus
                />
                <span className="text-faint text-xs mt-1">
                  * 미국 주식: NVDA, TSLA, AAPL / 국내 주식: 005930.KS(삼성전자), 000660.KS(SK하이닉스) / 코인: BTC-USD
                </span>
              </div>

              <div className="form-group mt-3">
                <label className="text-xs text-muted">종목명 (표시 이름)</label>
                <input
                  type="text"
                  className="input-text"
                  placeholder="예: 마이크로소프트, 팔란티어, 삼성전자"
                  value={newTickerName}
                  onChange={e => setNewTickerName(e.target.value)}
                />
              </div>

              <div className="form-group mt-3">
                <label className="text-xs text-muted">투자 메모 & 핵심 테마</label>
                <input
                  type="text"
                  className="input-text"
                  placeholder="예: AI 엔터프라이즈 클라우드 소프트웨어 대장주"
                  value={newTickerBrief}
                  onChange={e => setNewTickerBrief(e.target.value)}
                />
              </div>

              <div className="modal-actions-row mt-4">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddTickerModal(false)}
                >
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>실시간 종목 추가</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
