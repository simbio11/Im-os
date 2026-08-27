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
  Filter
} from 'lucide-react';
import { 
  PUBMED_PAPERS_DB, 
  PUBMED_TOPICS, 
  DEFAULT_WEEKLY_SCHEDULE 
} from '../data/pubmedDatabase';

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
  // Current day of week (0: Sun ~ 6: Sat)
  const currentDayIndex = new Date().getDay();

  // Weekly topic schedule (Day -> Topic ID) with LocalStorage persistence
  const [weeklySchedule, setWeeklySchedule] = useState(() => {
    try {
      const saved = localStorage.getItem('lm_pubmed_weekly_schedule');
      return saved ? JSON.parse(saved) : DEFAULT_WEEKLY_SCHEDULE;
    } catch (e) {
      return DEFAULT_WEEKLY_SCHEDULE;
    }
  });

  // Active selected day or topic
  const [selectedDay, setSelectedDay] = useState(currentDayIndex);
  const [selectedTopic, setSelectedTopic] = useState(() => {
    return weeklySchedule[currentDayIndex] || "musculoskeletal";
  });

  // Current active paper
  const [currentPaperIndex, setCurrentPaperIndex] = useState(0);
  const [activePaper, setActivePaper] = useState(() => {
    const initialTopic = weeklySchedule[currentDayIndex] || "musculoskeletal";
    const matched = PUBMED_PAPERS_DB.filter(p => p.topic === initialTopic);
    return matched[0] || PUBMED_PAPERS_DB[0];
  });

  // Bookmarked / Archived paper IDs
  const [archivedIds, setArchivedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('lm_pubmed_archived_ids');
      return saved ? JSON.parse(saved) : ['pmd-101'];
    } catch (e) {
      return ['pmd-101'];
    }
  });

  // UI States
  const [isSpinning, setIsSpinning] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState('');

  // Persist weekly schedule
  useEffect(() => {
    localStorage.setItem('lm_pubmed_weekly_schedule', JSON.stringify(weeklySchedule));
  }, [weeklySchedule]);

  // Persist bookmarks
  useEffect(() => {
    localStorage.setItem('lm_pubmed_archived_ids', JSON.stringify(archivedIds));
  }, [archivedIds]);

  // When selected topic changes, set active paper to the first matching paper
  const handleSelectTopic = (topicId) => {
    setSelectedTopic(topicId);
    const matched = PUBMED_PAPERS_DB.filter(p => p.topic === topicId);
    if (matched.length > 0) {
      setActivePaper(matched[0]);
      setCurrentPaperIndex(0);
    }
  };

  // When day pill is clicked
  const handleSelectDay = (dayIdx) => {
    setSelectedDay(dayIdx);
    const topicForDay = weeklySchedule[dayIdx] || "musculoskeletal";
    handleSelectTopic(topicForDay);
  };

  // Refresh / Cycle to another paper
  const handleRefreshNewPaper = () => {
    setIsSpinning(true);
    
    // Find papers in current topic (or all papers if none)
    const topicPapers = PUBMED_PAPERS_DB.filter(p => p.topic === selectedTopic);
    const candidatePapers = topicPapers.length > 1 ? topicPapers : PUBMED_PAPERS_DB;

    // Pick next or random paper different from current
    const remaining = candidatePapers.filter(p => p.id !== activePaper?.id);
    const nextPaper = remaining.length > 0 
      ? remaining[Math.floor(Math.random() * remaining.length)] 
      : candidatePapers[0];

    setTimeout(() => {
      setActivePaper(nextPaper);
      setIsSpinning(false);
      setRefreshNotice(`✨ 새로운 ${nextPaper.topicLabel} 논문이 로드되었습니다.`);
      setTimeout(() => setRefreshNotice(''), 3000);
    }, 300);
  };

  // Toggle bookmark archive
  const handleToggleArchive = (paperId) => {
    setArchivedIds(prev => {
      if (prev.includes(paperId)) {
        return prev.filter(id => id !== paperId);
      } else {
        return [...prev, paperId];
      }
    });
  };

  // Update schedule for a specific day
  const handleUpdateScheduleDay = (dayIdx, newTopicId) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [dayIdx]: newTopicId
    }));
    if (selectedDay === dayIdx) {
      handleSelectTopic(newTopicId);
    }
  };

  // Recommended other papers (excluding currently active one)
  const recommendedPapers = PUBMED_PAPERS_DB.filter(p => p.id !== activePaper?.id).slice(0, 3);
  const isCurrentArchived = activePaper && archivedIds.includes(activePaper.id);

  return (
    <div className="pubmed-curator-container glass-card">
      {/* 1. Header with Actions */}
      <div className="panel-header">
        <div className="panel-title-with-icon">
          <BookOpen size={20} className="text-emerald" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4>PubMed 데일리 의학/바이오 논문 큐레이터</h4>
              <span className="badge badge-emerald">Evidence-Based</span>
              <span className="badge badge-cyan mono">PMID Curation</span>
            </div>
            <p className="text-muted text-xs mt-1">
              요일별 맞춤 의학 분야 ➔ 매일 엄선된 1편의 임상 논문 한글 요약 & 실시간 관련 논문 추천
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
            <span>요일별 분야 설정</span>
          </button>

          {/* Refresh / Next Paper Button */}
          <button 
            className={`btn btn-secondary btn-sm ${isSpinning ? 'loading-spin' : ''}`}
            onClick={handleRefreshNewPaper}
            title="새로운 논문 새로고침"
          >
            <RotateCw size={14} className={isSpinning ? 'animate-spin' : ''} />
            <span>다른 논문 새로고침</span>
          </button>

          {/* Archive / Bookmark Button */}
          <button 
            className={`btn btn-sm ${isCurrentArchived ? 'btn-emerald' : 'btn-secondary'}`}
            onClick={() => activePaper && handleToggleArchive(activePaper.id)}
            title={isCurrentArchived ? "아카이브 저장됨" : "아카이브에 저장"}
          >
            <Bookmark size={13} />
            <span>{isCurrentArchived ? '✓ 아카이브 완료' : '아카이브 저장'}</span>
          </button>
        </div>
      </div>

      {/* 2. Weekly Schedule Day Selector Bar */}
      <div className="pubmed-weekly-bar mt-3">
        <div className="weekly-bar-label">
          <Calendar size={13} className="text-cyan" />
          <span className="text-xs font-bold text-highlight">요일별 큐레이션:</span>
        </div>
        <div className="weekly-days-list">
          {DAYS_KR.map(d => {
            const topicId = weeklySchedule[d.index] || "musculoskeletal";
            const topicConfig = PUBMED_TOPICS.find(t => t.id === topicId) || PUBMED_TOPICS[0];
            const isToday = d.index === currentDayIndex;
            const isSelected = d.index === selectedDay;

            return (
              <button
                key={d.index}
                className={`weekly-day-chip ${isSelected ? 'selected' : ''} ${isToday ? 'is-today' : ''}`}
                onClick={() => handleSelectDay(d.index)}
                title={`${d.full}: ${topicConfig.label}`}
              >
                <div className="day-chip-header">
                  <span className="day-name font-bold">{d.short}</span>
                  {isToday && <span className="today-badge">오늘</span>}
                </div>
                <span className="day-topic-label truncate">{topicConfig.label.split('&')[0].trim()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Direct Topic Switcher Pills */}
      <div className="pubmed-topics-row mt-3">
        {PUBMED_TOPICS.map((t) => (
          <button 
            key={t.id}
            className={`topic-pill ${selectedTopic === t.id ? 'active' : ''}`}
            onClick={() => handleSelectTopic(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notice Alert (when refreshed) */}
      {refreshNotice && (
        <div className="pubmed-refresh-alert mt-2">
          <Sparkles size={14} className="text-emerald" />
          <span className="text-xs font-medium text-emerald">{refreshNotice}</span>
        </div>
      )}

      {/* 4. Featured Paper Hero Card */}
      {activePaper && (
        <div className="paper-hero-card mt-3">
          <div className="paper-meta-strip">
            <span className="badge badge-emerald font-bold">{activePaper.journal}</span>
            <span className="badge badge-cyan mono">{activePaper.pmid}</span>
            <span className="badge badge-purple">{activePaper.keyword}</span>
            <span className="badge badge-amber mono">{activePaper.impactScore}</span>
          </div>

          <h3 className="paper-korean-title font-bold text-highlight">
            {activePaper.title}
          </h3>

          <div className="paper-english-title text-muted text-xs mb-3">
            Original: <em>{activePaper.englishTitle}</em> ({activePaper.year})
          </div>

          {/* 3 Korean Key Clinical Findings */}
          <div className="korean-findings-box">
            <div className="findings-header text-xs font-bold text-emerald mb-2">
              🧬 의학 전문의/연구원 관점의 핵심 요약 & 메커니즘 분석:
            </div>
            <div className="findings-list">
              {activePaper.koreanSummary.map((point, idx) => (
                <div key={idx} className="finding-item text-xs">
                  <span className="finding-dot"></span>
                  <p className="leading-relaxed text-main">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Protocol Application */}
          <div className="paper-protocol-box">
            <span className="protocol-title text-xs font-bold text-cyan">
              ⚡ L&M OS 프로토콜 적용 권고점:
            </span>
            <p className="text-xs text-muted mt-1">
              {activePaper.protocolTakeaway}
            </p>
          </div>

          {/* Footer with External PubMed Link */}
          <div className="paper-footer-row mt-3">
            <span className="text-xs text-muted">
              L&M OS Medical Intelligence Curation DB 연동됨
            </span>

            <div className="flex items-center gap-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleToggleArchive(activePaper.id)}
              >
                <Bookmark size={13} className={isCurrentArchived ? "text-emerald" : ""} />
                <span>{isCurrentArchived ? "저장됨" : "아카이브"}</span>
              </button>
              <a 
                href={activePaper.link} 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-primary btn-sm"
              >
                <span>PubMed 원문(NCBI) 확인</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 5. Recommended Other Papers Grid (새로 추천하는 다른 논문들) */}
      <div className="pubmed-recommendations-section mt-4">
        <div className="recommend-header">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber" />
            <h5 className="font-bold text-highlight">함께 추천하는 최신 바이오 & 의학 논문 큐레이션</h5>
          </div>
          <span className="text-xs text-muted">클릭 시 해당 논문으로 즉시 전환됩니다.</span>
        </div>

        <div className="recommended-papers-grid mt-2">
          {recommendedPapers.map(paper => (
            <div 
              key={paper.id} 
              className="recommend-paper-card glass-card-interactive"
              onClick={() => {
                setActivePaper(paper);
                setSelectedTopic(paper.topic);
              }}
            >
              <div className="recommend-card-top">
                <span className="badge badge-cyan text-xs">{paper.topicLabel}</span>
                <span className="mono text-xs text-muted">{paper.pmid}</span>
              </div>
              <h6 className="recommend-paper-title font-semibold text-xs mt-2 text-highlight line-clamp-2">
                {paper.title}
              </h6>
              <div className="recommend-card-bottom mt-2">
                <span className="text-xs text-muted truncate">{paper.journal}</span>
                <span className="read-more-btn text-xs text-cyan font-bold">
                  상세보기 <ArrowRight size={11} className="inline ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Day-by-Day Schedule Configuration Modal */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-content pubmed-schedule-modal" onClick={e => e.stopPropagation()}>
            <div className="panel-header">
              <div className="panel-title-with-icon">
                <Calendar size={18} className="text-cyan" />
                <h4>요일별 PubMed 큐레이션 분야 설정</h4>
              </div>
              <span className="badge badge-cyan">Weekly Config</span>
            </div>

            <p className="text-xs text-muted mb-3">
              요일별로 매일 우선적으로 큐레이션할 의학/생명과학 주제 분야를 지정합니다. 매일 자정에 해당 분야가 자동으로 첫 탭으로 선택됩니다.
            </p>

            <div className="schedule-config-list">
              {DAYS_KR.map(d => {
                const assignedTopic = weeklySchedule[d.index] || "musculoskeletal";
                const isToday = d.index === currentDayIndex;

                return (
                  <div key={d.index} className="schedule-day-config-row glass-card">
                    <div className="day-label-box">
                      <span className="font-bold text-sm text-highlight">{d.full}</span>
                      {isToday && <span className="badge badge-emerald text-xs ml-2">오늘</span>}
                    </div>

                    <select
                      className="select-input select-topic-dropdown"
                      value={assignedTopic}
                      onChange={e => handleUpdateScheduleDay(d.index, e.target.value)}
                    >
                      {PUBMED_TOPICS.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <div className="modal-actions-row mt-4">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setWeeklySchedule(DEFAULT_WEEKLY_SCHEDULE);
                }}
              >
                기본값으로 복원
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setShowScheduleModal(false)}
              >
                <Check size={16} />
                <span>설정 완료</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
