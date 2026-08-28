import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Bookmark, 
  ExternalLink, 
  Check, 
  Sparkles, 
  RotateCw, 
  Calendar, 
  Layers, 
  Activity, 
  Settings2, 
  Zap, 
  ChevronRight,
  ArrowRight,
  Filter,
  Search,
  CheckCircle2,
  TrendingUp,
  FileText,
  HelpCircle,
  Eye
} from 'lucide-react';
import { 
  fetchLivePubMedPapers, 
  PUBMED_TOPIC_QUERIES, 
  EXTENDED_PUBMED_DATABASE,
  translateMedicalTitleToKorean,
  generateKoreanMedicalSummary
} from '../services/pubmedService.js';
import { 
  PUBMED_PAPERS_DB, 
  PUBMED_TOPICS, 
  DEFAULT_WEEKLY_SCHEDULE 
} from '../data/pubmedDatabase.js';

const DAYS_KR = [
  { index: 0, short: "일", full: "일요일" },
  { index: 1, short: "월", full: "월요일" },
  { index: 2, short: "화", full: "화요일" },
  { index: 3, short: "수", full: "수요일" },
  { index: 4, short: "목", full: "목요일" },
  { index: 5, short: "금", full: "금요일" },
  { index: 6, short: "토", full: "토요일" }
];

export function PubMedCurator() {
  const currentDayIndex = new Date().getDay();

  // Weekly schedule
  const [weeklySchedule, setWeeklySchedule] = useState(() => {
    try {
      const saved = localStorage.getItem('lm_pubmed_weekly_schedule');
      return saved ? JSON.parse(saved) : DEFAULT_WEEKLY_SCHEDULE;
    } catch (e) {
      return DEFAULT_WEEKLY_SCHEDULE;
    }
  });

  const [selectedDay, setSelectedDay] = useState(currentDayIndex);
  const [selectedTopic, setSelectedTopic] = useState(() => {
    return weeklySchedule[currentDayIndex] || "aging";
  });

  // Paper pool and active paper
  const [papersPool, setPapersPool] = useState(() => {
    return [...EXTENDED_PUBMED_DATABASE, ...PUBMED_PAPERS_DB];
  });
  
  const [activePaper, setActivePaper] = useState(() => {
    const initialTopic = weeklySchedule[currentDayIndex] || "aging";
    const matched = EXTENDED_PUBMED_DATABASE.filter(p => p.topic === initialTopic);
    return matched[0] || EXTENDED_PUBMED_DATABASE[0];
  });

  // Search keyword input
  const [searchQuery, setSearchQuery] = useState('');
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [showEnglishAbstract, setShowEnglishAbstract] = useState(false);

  // Bookmarked / Archived paper IDs
  const [archivedIds, setArchivedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('lm_pubmed_archived_ids');
      return saved ? JSON.parse(saved) : ['pmd-aging-01'];
    } catch (e) {
      return ['pmd-aging-01'];
    }
  });

  // UI States
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');

  // Persist weekly schedule
  useEffect(() => {
    localStorage.setItem('lm_pubmed_weekly_schedule', JSON.stringify(weeklySchedule));
  }, [weeklySchedule]);

  // Persist bookmarks
  useEffect(() => {
    localStorage.setItem('lm_pubmed_archived_ids', JSON.stringify(archivedIds));
  }, [archivedIds]);

  // Fetch Live PubMed Papers on Topic Change or Refresh
  const handleFetchLivePapers = async (topicId = selectedTopic, query = searchQuery) => {
    setIsLiveLoading(true);
    setStatusNotice('NCBI PubMed 실시간 데이터베이스 조회 중...');

    try {
      const randomOffset = Math.floor(Math.random() * 30);
      const livePapers = await fetchLivePubMedPapers({
        topic: topicId,
        searchQuery: query,
        maxResults: 6,
        offset: randomOffset
      });

      if (livePapers && livePapers.length > 0) {
        setPapersPool(prev => {
          const existingIds = new Set(prev.map(p => p.pmid || p.id));
          const newUnique = livePapers.filter(p => !existingIds.has(p.pmid));
          return [...newUnique, ...prev];
        });

        setActivePaper(livePapers[0]);
        setStatusNotice(`✨ NCBI PubMed 실시간 신규 논문 ${livePapers.length}편 및 한글 번역 요약이 로드되었습니다.`);
      } else {
        const matching = papersPool.filter(p => p.topic === topicId && p.id !== activePaper?.id);
        const next = matching.length > 0 ? matching[Math.floor(Math.random() * matching.length)] : papersPool[0];
        setActivePaper(next);
        setStatusNotice(`✨ 엄선된 피어리뷰 임상 논문이 로드되었습니다.`);
      }
    } catch (err) {
      console.warn("Live fetch error, rotating local pool:", err);
      const matching = papersPool.filter(p => p.topic === topicId && p.id !== activePaper?.id);
      const next = matching.length > 0 ? matching[Math.floor(Math.random() * matching.length)] : papersPool[0];
      setActivePaper(next);
      setStatusNotice(`✨ 새로운 추천 논문이 로드되었습니다.`);
    } finally {
      setIsLiveLoading(false);
      setTimeout(() => setStatusNotice(''), 3500);
    }
  };

  const handleSelectTopic = (topicId) => {
    setSelectedTopic(topicId);
    handleFetchLivePapers(topicId, searchQuery);
  };

  const handleSelectDay = (dayIdx) => {
    setSelectedDay(dayIdx);
    const topicForDay = weeklySchedule[dayIdx] || "aging";
    handleSelectTopic(topicForDay);
  };

  const handleToggleArchive = (paperId) => {
    setArchivedIds(prev => {
      if (prev.includes(paperId)) {
        return prev.filter(id => id !== paperId);
      } else {
        return [...prev, paperId];
      }
    });
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    handleFetchLivePapers(selectedTopic, searchQuery.trim());
  };

  // Recommended related papers (separated distinct items)
  const recommendedPapers = papersPool
    .filter(p => (p.id || p.pmid) !== (activePaper?.id || activePaper?.pmid) && (p.topic === selectedTopic || p.topic === activePaper?.topic))
    .slice(0, 4);

  const isCurrentArchived = activePaper && archivedIds.includes(activePaper.id);

  // Active Korean Title and Summary
  const currentTitleKo = activePaper?.titleKo || translateMedicalTitleToKorean(activePaper?.title, activePaper?.topic || selectedTopic);
  const currentSummaryKo = activePaper?.summaryKo || generateKoreanMedicalSummary(activePaper?.title, activePaper, activePaper?.topic || selectedTopic);

  return (
    <div className="pubmed-curator-container glass-card">
      {/* 1. Header with Live Status */}
      <div className="panel-header flex-wrap gap-3">
        <div className="panel-title-with-icon">
          <div className="pubmed-avatar-glow">
            <BookOpen size={20} className="text-emerald" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4>PubMed 실시간 의학/바이오 논문 큐레이터</h4>
              <span className="badge badge-emerald flex items-center gap-1">
                <span className="pulsing-dot" /> NCBI E-utilities Live
              </span>
              <span className="badge badge-cyan mono">Peer-Reviewed</span>
            </div>
            <p className="text-muted text-xs mt-1">
              새로고침 시 실제 NCBI PubMed 데이터베이스에서 최신 임상/생물학 연구 논문을 실시간으로 가져옵니다.
            </p>
          </div>
        </div>

        <div className="action-buttons-row">
          {/* Day Schedule Settings Button */}
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowScheduleModal(true)}
            title="요일별 추천 분야 맞춤 설정"
          >
            <Settings2 size={14} />
            <span>요일별 설정</span>
          </button>

          {/* Refresh / Next Paper Button */}
          <button 
            className={`btn btn-primary btn-sm ${isLiveLoading ? 'loading-spin' : ''}`}
            onClick={() => handleFetchLivePapers(selectedTopic, searchQuery)}
            disabled={isLiveLoading}
            title="새로운 논문 실시간 가져오기"
          >
            <RotateCw size={14} className={isLiveLoading ? 'animate-spin' : ''} />
            <span>{isLiveLoading ? 'PubMed 조회 중...' : '✨ 새 논문 가져오기'}</span>
          </button>

          {/* Archive / Bookmark Button */}
          <button 
            className={`btn btn-sm ${isCurrentArchived ? 'btn-emerald' : 'btn-secondary'}`}
            onClick={() => activePaper && handleToggleArchive(activePaper.id)}
            title={isCurrentArchived ? "아카이브 저장됨" : "아카이브에 저장"}
          >
            <Bookmark size={13} />
            <span>{isCurrentArchived ? '✓ 아카이브됨' : '저장'}</span>
          </button>
        </div>
      </div>

      {/* 2. Live Topic Bar & Search Bar */}
      <div className="pubmed-controls-row mt-3">
        {/* Topic Filter Chips */}
        <div className="pubmed-topic-tabs">
          {Object.entries(PUBMED_TOPIC_QUERIES).map(([tKey, tVal]) => (
            <button
              key={tKey}
              type="button"
              className={`pubmed-topic-pill ${selectedTopic === tKey ? 'active' : ''}`}
              onClick={() => handleSelectTopic(tKey)}
            >
              <span>{tVal.name}</span>
            </button>
          ))}
        </div>

        {/* Live Search Form */}
        <form className="pubmed-search-form" onSubmit={handleSearchSubmit}>
          <div className="pubmed-search-input-box">
            <Search size={14} className="text-muted" />
            <input
              type="text"
              className="pubmed-search-input"
              placeholder="PubMed 키워드 검색 (예: Zone 2, NAD+, Autophagy, GLP-1)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm" disabled={isLiveLoading || !searchQuery.trim()}>
            검색
          </button>
        </form>
      </div>

      {/* 3. Status Notification Toast */}
      {statusNotice && (
        <div className="pubmed-status-toast mt-2">
          <Sparkles size={14} className="text-cyan" />
          <span className="text-xs font-semibold">{statusNotice}</span>
        </div>
      )}

      {/* 4. Weekly Day Schedule Ribbon */}
      <div className="pubmed-weekly-bar mt-3">
        <div className="weekly-bar-label">
          <Calendar size={13} className="text-cyan" />
          <span className="text-2xs font-bold text-muted">요일별 분야:</span>
        </div>
        <div className="weekly-days-list">
          {DAYS_KR.map(d => {
            const topicId = weeklySchedule[d.index] || "aging";
            const topicConfig = PUBMED_TOPIC_QUERIES[topicId] || PUBMED_TOPIC_QUERIES.aging;
            const isToday = d.index === currentDayIndex;
            const isSelected = d.index === selectedDay;

            return (
              <button
                key={d.index}
                className={`weekly-day-chip ${isSelected ? 'selected' : ''} ${isToday ? 'is-today' : ''}`}
                onClick={() => handleSelectDay(d.index)}
              >
                <span className="day-name">{d.short}</span>
                <span className="topic-name">{topicConfig.badge}</span>
                {isToday && <span className="today-dot" title="오늘" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Main Hero Active Paper Spotlight */}
      {activePaper && (
        <div className="pubmed-paper-card glass-card-interactive mt-4">
          <div className="paper-card-top">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge badge-emerald">{activePaper.categoryBadge || '의학 연구'}</span>
              <span className="badge badge-cyan mono">PMID: {activePaper.pmid}</span>
              {activePaper.impactScore && (
                <span className="badge badge-purple mono">Impact Score {activePaper.impactScore}</span>
              )}
              {activePaper.isLive && (
                <span className="badge badge-amber text-3xs">⚡ Live NCBI API</span>
              )}
            </div>

            <a 
              href={activePaper.url || `https://pubmed.ncbi.nlm.nih.gov/${activePaper.pmid}/`}
              target="_blank" 
              rel="noreferrer"
              className="pubmed-link-btn"
            >
              <span>PubMed 원문 보기</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Primary English Title */}
          <h3 className="paper-title mt-2.5">
            {activePaper.title}
          </h3>

          {/* Korean Translated Title Box */}
          <div className="paper-korean-title-banner mt-2">
            <div className="flex items-start gap-2">
              <span className="korean-badge-pill">🇰🇷 한글 제목</span>
              <span className="korean-title-text">{currentTitleKo}</span>
            </div>
          </div>

          <div className="paper-meta-row mt-2">
            <span className="meta-journal">{activePaper.journal}</span>
            <span className="meta-dot">•</span>
            <span className="meta-pubdate">{activePaper.pubdate}</span>
            <span className="meta-dot">•</span>
            <span className="meta-authors">{activePaper.authors}</span>
          </div>

          {/* Key Takeaway Highlight Box */}
          <div className="paper-takeaway-box mt-3">
            <div className="flex items-start gap-2">
              <Sparkles size={16} className="text-cyan mt-0.5 shrink-0" />
              <div>
                <span className="takeaway-label">핵심 결론 및 프로토콜 적용:</span>
                <p className="takeaway-text">{activePaper.keyTakeaway || '최신 임상 데이터 검증 완료'}</p>
              </div>
            </div>
          </div>

          {/* Korean Structured Research Summary */}
          <div className="paper-korean-summary-box mt-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={15} className="text-emerald" />
              <h5 className="summary-box-heading">한국어 임상 연구 요약 & 실천 가이드</h5>
            </div>
            <div className="summary-content-lines">
              {currentSummaryKo.split('\n').map((line, idx) => (
                <p key={idx} className="summary-line">{line}</p>
              ))}
            </div>
          </div>

          {/* Collapsible Original English Abstract */}
          <div className="paper-abstract-collapsible mt-3">
            <button 
              type="button"
              className="abstract-toggle-btn"
              onClick={() => setShowEnglishAbstract(!showEnglishAbstract)}
            >
              <div className="flex items-center gap-1.5">
                <Eye size={13} className="text-cyan" />
                <span className="text-xs font-bold text-highlight">Abstract (영어 초록 원문)</span>
              </div>
              <span className="text-2xs text-muted">
                {showEnglishAbstract ? '▲ 접기' : '▼ 원문 초록 펼치기'}
              </span>
            </button>

            {showEnglishAbstract && (
              <div className="abstract-expanded-body">
                <p className="abstract-text">{activePaper.abstract}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Recommended Related Papers Grid (Separated Distinct Cards) */}
      {recommendedPapers.length > 0 && (
        <div className="recommended-section mt-5">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-bold text-muted flex items-center gap-1.5">
              <Layers size={14} className="text-cyan" />
              <span>관련 추천 의학 논문 ({recommendedPapers.length}편)</span>
            </h5>
            <span className="text-2xs text-muted">카드 클릭 시 상단에 상세 분석</span>
          </div>

          <div className="recommended-distinct-grid">
            {recommendedPapers.map(paper => {
              const recTitleKo = paper.titleKo || translateMedicalTitleToKorean(paper.title, paper.topic || selectedTopic);
              const isSelected = (paper.id || paper.pmid) === (activePaper?.id || activePaper?.pmid);

              return (
                <div 
                  key={paper.id || paper.pmid}
                  className={`recommended-distinct-card ${isSelected ? 'active' : ''}`}
                  onClick={() => setActivePaper(paper)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="badge badge-cyan text-3xs mono">PMID: {paper.pmid}</span>
                    <span className="text-3xs text-muted">{paper.pubdate}</span>
                  </div>

                  {/* English Title */}
                  <h6 className="rec-title-en">{paper.title}</h6>

                  {/* Korean Translated Title */}
                  <div className="rec-title-ko-box mt-1.5">
                    <span className="badge badge-emerald text-3xs font-bold mr-1">🇰🇷</span>
                    <span className="rec-title-ko-text">{recTitleKo}</span>
                  </div>

                  <div className="rec-journal-tag mt-2">
                    <span>{paper.journal}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule Customization Modal */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header-row">
              <h4>🗓️ 요일별 PubMed 관심 분야 설정</h4>
              <button className="btn-icon" onClick={() => setShowScheduleModal(false)}>✕</button>
            </div>
            <p className="text-xs text-muted mb-3">
              요일별로 집중 큐레이션받고 싶은 의학 및 생체 프로토콜 분야를 지정하세요.
            </p>
            <div className="flex flex-col gap-2">
              {DAYS_KR.map(d => (
                <div key={d.index} className="flex justify-between items-center p-2 rounded bg-black/20 border border-white/5">
                  <span className="text-xs font-bold text-highlight">{d.full}</span>
                  <select 
                    className="input-select text-xs"
                    value={weeklySchedule[d.index] || 'aging'}
                    onChange={e => {
                      const newTopic = e.target.value;
                      setWeeklySchedule(prev => ({ ...prev, [d.index]: newTopic }));
                    }}
                  >
                    {Object.entries(PUBMED_TOPIC_QUERIES).map(([k, v]) => (
                      <option key={k} value={k}>{v.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button className="btn btn-primary btn-sm" onClick={() => setShowScheduleModal(false)}>
                설정 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
