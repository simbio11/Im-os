import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Utensils, 
  BookOpen, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Sparkles,
  Activity,
  Check,
  Droplets,
  Tag
} from 'lucide-react';
import { PUBMED_PAPERS_DB } from '../data/pubmedDatabase';

export function DashboardCockpit({
  calendarEvents = [],
  onToggleCalendarEvent,
  onAddCalendarEvent,
  routines = [],
  onToggleRoutine,
  onAddRoutine,
  dietLogs = [],
  userProfile = {},
  onNavigateTab,
  onOpenObsidianModal
}) {
  // -------------------------------------------------------------
  // 1. Calendar Mini Grid & Selected Day State
  // -------------------------------------------------------------
  const todayDateStr = "2026-08-26";
  const [selectedDate, setSelectedDate] = useState(todayDateStr);
  const [showQuickEventModal, setShowQuickEventModal] = useState(false);
  const [quickEventTitle, setQuickEventTitle] = useState('');
  const [quickEventTime, setQuickEventTime] = useState('09:00 - 10:00');

  // Month navigation calculation (August 2026 default)
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const baseYear = 2026;
  const baseMonth = 7; // August (0-indexed)

  const displayedDate = new Date(baseYear, baseMonth + currentMonthOffset, 1);
  const dispYear = displayedDate.getFullYear();
  const dispMonth = displayedDate.getMonth();
  const monthNameStr = `${dispYear}. ${String(dispMonth + 1).padStart(2, '0')}월`;

  const firstDayIndex = new Date(dispYear, dispMonth, 1).getDay();
  const totalDaysInMonth = new Date(dispYear, dispMonth + 1, 0).getDate();
  const prevMonthTotalDays = new Date(dispYear, dispMonth, 0).getDate();

  const miniDays = [];
  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    const prevM = dispMonth === 0 ? 12 : dispMonth;
    const prevY = dispMonth === 0 ? dispYear - 1 : dispYear;
    const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    miniDays.push({ day: d, isCurrentMonth: false, dateStr });
  }
  // Current month
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateStr = `${dispYear}-${String(dispMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    miniDays.push({ day: d, isCurrentMonth: true, dateStr });
  }
  // Next month padding
  const remaining = 35 - miniDays.length;
  for (let d = 1; d <= (remaining > 0 ? remaining : 42 - miniDays.length); d++) {
    const nextM = dispMonth === 11 ? 1 : dispMonth + 2;
    const nextY = dispMonth === 11 ? dispYear + 1 : dispYear;
    const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    miniDays.push({ day: d, isCurrentMonth: false, dateStr });
  }

  const selectedDateEvents = calendarEvents.filter(e => e.date === selectedDate);
  const todayEvents = calendarEvents.filter(e => e.date === todayDateStr);
  const activeEventList = selectedDate === todayDateStr ? todayEvents : selectedDateEvents;

  const handleQuickAddEvent = (e) => {
    e.preventDefault();
    if (!quickEventTitle.trim()) return;
    const times = quickEventTime.split('-').map(t => t.trim());
    onAddCalendarEvent({
      id: `evt-${Date.now()}`,
      date: selectedDate,
      startTime: times[0] || '09:00',
      endTime: times[1] || '10:00',
      title: quickEventTitle.trim(),
      category: 'deepwork',
      completed: false,
      location: '오피스',
      notes: ''
    });
    setQuickEventTitle('');
    setShowQuickEventModal(false);
  };

  // -------------------------------------------------------------
  // 2. Life & Diet State Calculations
  // -------------------------------------------------------------
  const [showRoutineAdd, setShowRoutineAdd] = useState(false);
  const [newRoutineTitle, setNewRoutineTitle] = useState('');

  const handleQuickAddRoutine = (e) => {
    e.preventDefault();
    if (!newRoutineTitle.trim()) return;
    onAddRoutine({
      id: `rt-${Date.now()}`,
      title: newRoutineTitle.trim(),
      time: '08:00 - 09:00',
      category: 'morning',
      completed: false,
      xp: 25,
      streak: 1
    });
    setNewRoutineTitle('');
    setShowRoutineAdd(false);
  };

  const totalKcal = dietLogs.reduce((acc, log) => acc + (log.kcal || 0), 0);
  const totalCarbs = parseFloat(dietLogs.reduce((acc, log) => acc + (log.carbs || 0), 0).toFixed(1));
  const totalProtein = parseFloat(dietLogs.reduce((acc, log) => acc + (log.protein || 0), 0).toFixed(1));
  const totalFat = parseFloat(dietLogs.reduce((acc, log) => acc + (log.fat || 0), 0).toFixed(1));

  const goalKcal = 2200;
  const goalCarbs = 200;
  const goalProtein = 140;
  const goalFat = 65;

  // -------------------------------------------------------------
  // 3. Stocks & Market Intelligence Mini Data
  // -------------------------------------------------------------
  const stockIndices = [
    { name: 'S&P 500', value: '5,892.40', change: '+1.24%', isUp: true },
    { name: 'KOSPI', value: '2,685.12', change: '-0.38%', isUp: false }
  ];

  const portfolioWatchlist = [
    { name: 'NVDA (엔비디아)', price: '$128.45', change: '+3.15%', isUp: true },
    { name: 'AAPL (애플)', price: '$224.20', change: '+0.82%', isUp: true },
    { name: 'TSLA (테슬라)', price: '$218.10', change: '-1.45%', isUp: false },
    { name: '삼성전자', price: '76,500원', change: '+0.66%', isUp: true }
  ];

  const marketHeadlines = [
    { title: '美 연준 금리 경로 시사 및 잭슨홀 미팅 매크로 안도 랠리 지속', time: '10분 전' },
    { title: '글로벌 AI 반도체 수요 폭증 및 빅테크 CAPEX 상향 기조 유지', time: '35분 전' },
    { title: '국내 증시 외국인 순매수 유입 및 반도체·바이오 섹터 강세 마감', time: '1시간 전' }
  ];

  // -------------------------------------------------------------
  // 4. PubMed Research Mini Curation & Topic Filters
  // -------------------------------------------------------------
  const [selectedTopicTag, setSelectedTopicTag] = useState('All');
  const [pubmedSearchQuery, setPubmedSearchQuery] = useState('');

  const pubmedTopicTags = [
    'Neuroscience',
    'Aging & Longevity',
    'AI & Bio',
    'Medicine',
    'Metabolism',
    'Psychology'
  ];

  const curatedPapers = PUBMED_PAPERS_DB.slice(0, 2);

  return (
    <div className="dashboard-cockpit-grid">
      {/* ========================================================================= */}
      {/* 1. TOP-LEFT: 캘린더 (Calendar)                                            */}
      {/* ========================================================================= */}
      <div className="cockpit-card">
        {/* Header */}
        <div className="cockpit-card-header">
          <div className="cockpit-title-group">
            <div className="cockpit-icon-badge" style={{ background: 'rgba(168, 85, 247, 0.12)', borderColor: 'rgba(168, 85, 247, 0.3)', color: 'var(--purple-primary)' }}>
              <CalendarIcon size={16} />
            </div>
            <h4>캘린더 <span className="text-muted text-xs font-normal">(Calendar)</span></h4>
          </div>

          <div className="cockpit-header-actions">
            <div className="mini-month-nav" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '2px 6px', border: '1px solid var(--border-subtle)' }}>
              <button 
                className="btn-icon-micro" 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setCurrentMonthOffset(prev => prev - 1)}
                title="이전 달"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="mono text-xs font-bold px-1" style={{ color: 'var(--text-highlight)' }}>{monthNameStr}</span>
              <button 
                className="btn-icon-micro" 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setCurrentMonthOffset(prev => prev + 1)}
                title="다음 달"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <button 
              className="btn btn-secondary btn-xs ml-1"
              onClick={() => setShowQuickEventModal(prev => !prev)}
            >
              <Plus size={12} />
              <span>빠른 추가</span>
            </button>
          </div>
        </div>

        {/* Quick Add Inline Form */}
        {showQuickEventModal && (
          <form onSubmit={handleQuickAddEvent} style={{ marginTop: '10px', padding: '10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              className="input-text text-xs" 
              style={{ flex: 1 }}
              placeholder="일정 제목 (예: 14:00 투자 전략 회의)" 
              value={quickEventTitle}
              onChange={e => setQuickEventTitle(e.target.value)}
              autoFocus
              required
            />
            <input 
              type="text" 
              className="input-text mono text-xs" 
              style={{ width: '100px' }}
              placeholder="09:00 - 10:00" 
              value={quickEventTime}
              onChange={e => setQuickEventTime(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-xs">등록</button>
          </form>
        )}

        {/* 2-Column Split: Mini Calendar Grid + Today's Agenda */}
        <div className="cockpit-split-columns">
          {/* Left: Mini Month Calendar Grid */}
          <div className="cockpit-col-left cockpit-mini-cal-wrapper">
            {/* Weekdays Grid (Strict 7 columns) */}
            <div className="cockpit-weekdays-row">
              <span style={{ color: 'var(--rose-primary)' }}>일</span>
              <span>월</span>
              <span>화</span>
              <span>수</span>
              <span>목</span>
              <span>금</span>
              <span style={{ color: 'var(--cyan-primary)' }}>토</span>
            </div>
            
            {/* Days Grid (Strict 7 columns) */}
            <div className="cockpit-days-grid">
              {miniDays.map((item, idx) => {
                const dayEvents = calendarEvents.filter(e => e.date === item.dateStr);
                const isToday = item.dateStr === todayDateStr;
                const isSelected = item.dateStr === selectedDate;
                const hasEvents = dayEvents.length > 0;

                return (
                  <div
                    key={idx}
                    className={`cockpit-day-tile ${item.isCurrentMonth ? 'current-month' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedDate(item.dateStr)}
                  >
                    <span className="mono">{item.day}</span>
                    {hasEvents && !isSelected && (
                      <span className="cockpit-event-dot"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Date Agenda List */}
          <div className="cockpit-col-right">
            <div>
              <div className="cockpit-section-subhead">
                <span className="text-xs font-bold text-highlight">
                  {selectedDate === todayDateStr ? '오늘의 주요 일정' : `${selectedDate} 일정`}
                </span>
                <span className="mono text-2xs text-muted">
                  {activeEventList.length}건
                </span>
              </div>

              <div className="cockpit-agenda-list">
                {activeEventList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '16px 8px', border: '1px dashed var(--border-subtle)', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.01)' }}>
                    <p className="text-muted text-xs" style={{ margin: 0 }}>등록된 일정이 없습니다.</p>
                    <button 
                      className="btn btn-secondary btn-xs"
                      style={{ marginTop: '8px' }}
                      onClick={() => setShowQuickEventModal(true)}
                    >
                      + 일정 추가
                    </button>
                  </div>
                ) : (
                  activeEventList.map(evt => (
                    <div 
                      key={evt.id} 
                      className={`cockpit-agenda-row ${evt.completed ? 'completed' : ''}`}
                      onClick={() => onToggleCalendarEvent(evt.id)}
                    >
                      <div className="cockpit-agenda-bar"></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="agenda-title text-xs font-medium truncate" style={{ color: evt.completed ? 'var(--text-muted)' : 'var(--text-highlight)' }}>
                          {evt.title}
                        </div>
                        <div className="mono text-2xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Clock size={10} />
                          <span>{evt.startTime} - {evt.endTime}</span>
                        </div>
                      </div>
                      {evt.completed ? (
                        <CheckCircle2 size={15} className="text-emerald" style={{ flexShrink: 0 }} />
                      ) : (
                        <Circle size={15} className="text-muted" style={{ flexShrink: 0 }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <button 
              className="cockpit-link-btn"
              onClick={() => onNavigateTab('calendar')}
            >
              <span>캘린더 전체보기</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP-RIGHT: 생활관리 (Life Management)                                  */}
      {/* ========================================================================= */}
      <div className="cockpit-card">
        {/* Header */}
        <div className="cockpit-card-header">
          <div className="cockpit-title-group">
            <div className="cockpit-icon-badge" style={{ background: 'rgba(0, 240, 255, 0.1)', borderColor: 'rgba(0, 240, 255, 0.3)', color: 'var(--cyan-primary)' }}>
              <Activity size={16} />
            </div>
            <h4>생활관리 <span className="text-muted text-xs font-normal">(Life Management)</span></h4>
          </div>

          <div className="cockpit-header-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '999px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <Flame size={12} className="text-amber" />
              <span className="mono text-xs font-bold text-amber">{userProfile?.streak || 12}일 연속</span>
            </div>

            <button 
              className="btn btn-secondary btn-xs ml-1"
              onClick={() => setShowRoutineAdd(prev => !prev)}
            >
              <Plus size={12} />
              <span>루틴 추가</span>
            </button>
          </div>
        </div>

        {/* Quick Routine Add Form */}
        {showRoutineAdd && (
          <form onSubmit={handleQuickAddRoutine} style={{ marginTop: '10px', padding: '10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              className="input-text text-xs" 
              style={{ flex: 1 }}
              placeholder="새 루틴 제목 (예: 모닝 명상 10분, 비타민 섭취)" 
              value={newRoutineTitle}
              onChange={e => setNewRoutineTitle(e.target.value)}
              autoFocus
              required
            />
            <button type="submit" className="btn btn-primary btn-xs">추가</button>
          </form>
        )}

        {/* 2-Column Split: Daily Routines Checklist + Daily Diet */}
        <div className="cockpit-split-columns">
          {/* Left: Daily Routines Checklist */}
          <div className="cockpit-col-left">
            <div className="cockpit-section-subhead">
              <span className="text-xs font-bold text-highlight">일일 루틴 프로토콜</span>
              <span className="mono text-2xs text-muted">
                {routines.filter(r => r.completed).length} / {routines.length} 완수
              </span>
            </div>

            <div className="cockpit-routines-stack">
              {routines.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 8px', border: '1px dashed var(--border-subtle)', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.01)' }}>
                  <p className="text-muted text-xs" style={{ margin: 0 }}>등록된 데일리 루틴이 없습니다.</p>
                  <button 
                    className="btn btn-secondary btn-xs"
                    style={{ marginTop: '8px' }}
                    onClick={() => setShowRoutineAdd(true)}
                  >
                    + 루틴 등록
                  </button>
                </div>
              ) : (
                routines.slice(0, 5).map(routine => (
                  <div 
                    key={routine.id}
                    className={`cockpit-routine-item ${routine.completed ? 'completed' : ''}`}
                    onClick={() => onToggleRoutine(routine.id)}
                  >
                    {routine.completed ? (
                      <CheckCircle2 size={15} className="text-emerald" style={{ flexShrink: 0 }} />
                    ) : (
                      <Circle size={15} className="text-muted" style={{ flexShrink: 0 }} />
                    )}
                    <span className="routine-name text-xs" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {routine.title}
                    </span>
                    <span className="mono text-2xs text-amber font-semibold" style={{ flexShrink: 0 }}>
                      +{routine.xp || 20} XP
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Daily Diet & Macronutrient Card */}
          <div className="cockpit-col-right cockpit-diet-box">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-xs font-bold text-highlight">Daily Diet</span>
                <Utensils size={13} className="text-cyan" />
              </div>

              <div style={{ marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span className="mono text-lg font-extrabold text-cyan">{totalKcal}</span>
                  <span className="mono text-2xs text-muted">/ {goalKcal} kcal</span>
                </div>
                <div style={{ marginTop: '4px', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div 
                    style={{ height: '100%', background: 'var(--cyan-primary)', borderRadius: '999px', width: `${Math.min(100, Math.round((totalKcal / goalKcal) * 100))}%`, transition: 'width 0.3s' }}
                  ></div>
                </div>
              </div>

              {/* Nutrients Macro Bars */}
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                    <span className="text-muted">탄수화물</span>
                    <span className="mono text-cyan font-bold">{totalCarbs}g / {goalCarbs}g</span>
                  </div>
                  <div className="cockpit-macro-bar-track">
                    <div className="cockpit-macro-bar-fill" style={{ background: 'var(--cyan-primary)', width: `${Math.min(100, Math.round((totalCarbs / goalCarbs) * 100))}%` }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                    <span className="text-muted">단백질</span>
                    <span className="mono text-emerald font-bold">{totalProtein}g / {goalProtein}g</span>
                  </div>
                  <div className="cockpit-macro-bar-track">
                    <div className="cockpit-macro-bar-fill" style={{ background: 'var(--emerald-primary)', width: `${Math.min(100, Math.round((totalProtein / goalProtein) * 100))}%` }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                    <span className="text-muted">지방</span>
                    <span className="mono text-amber font-bold">{totalFat}g / {goalFat}g</span>
                  </div>
                  <div className="cockpit-macro-bar-track">
                    <div className="cockpit-macro-bar-fill" style={{ background: 'var(--amber-primary)', width: `${Math.min(100, Math.round((totalFat / goalFat) * 100))}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              className="cockpit-link-btn"
              onClick={() => onNavigateTab('life')}
            >
              <span>식단 상세 관리</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM-LEFT: 주식 (Stocks) & 마켓 인텔리전스                           */}
      {/* ========================================================================= */}
      <div className="cockpit-card">
        {/* Header */}
        <div className="cockpit-card-header">
          <div className="cockpit-title-group">
            <div className="cockpit-icon-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)', color: 'var(--emerald-primary)' }}>
              <TrendingUp size={16} />
            </div>
            <h4>주식 <span className="text-muted text-xs font-normal">(Stocks) & 마켓</span></h4>
          </div>

          <div className="cockpit-header-actions">
            <button 
              className="btn btn-secondary btn-xs"
              onClick={() => onNavigateTab('market')}
            >
              <Plus size={12} />
              <span>종목 추가</span>
            </button>
          </div>
        </div>

        {/* 2-Column Split: Indices & Watchlist + Market News */}
        <div className="cockpit-split-columns split-stocks">
          {/* Left: Major Indices & Watchlist */}
          <div className="cockpit-col-left">
            {/* Top 2 Index Mini Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {stockIndices.map((idxItem, i) => (
                <div key={i} className="cockpit-index-mini-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span className="text-muted font-bold">{idxItem.name}</span>
                    <span className={`mono font-bold ${idxItem.isUp ? 'text-emerald' : 'text-rose'}`}>
                      {idxItem.change}
                    </span>
                  </div>
                  <div className="mono text-sm font-extrabold text-highlight" style={{ marginTop: '4px' }}>
                    {idxItem.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Watchlist Table (Optimized Compact Stack) */}
            <div className="cockpit-watchlist-stack" style={{ marginTop: '6px' }}>
              {portfolioWatchlist.map((item, i) => (
                <div key={i} className="cockpit-watchlist-row">
                  <span className="text-xs font-medium text-highlight">{item.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mono text-xs font-bold text-highlight">{item.price}</span>
                    <span className={`mono text-2xs font-bold ${item.isUp ? 'text-emerald' : 'text-rose'}`}>
                      {item.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Today's Market News & Macro Briefing */}
          <div className="cockpit-col-right">
            <div>
              <div className="cockpit-section-subhead">
                <span className="text-xs font-bold text-highlight">오늘의 마켓 뉴스 & 매크로</span>
                <span className="badge badge-purple text-2xs">실시간</span>
              </div>

              <div className="cockpit-news-stack">
                {marketHeadlines.map((news, i) => (
                  <div key={i} className="cockpit-news-item">
                    <p className="text-xs text-highlight font-medium leading-snug" style={{ margin: 0 }}>
                      {news.title}
                    </p>
                    <span className="text-2xs text-muted mono" style={{ display: 'inline-block', marginTop: '4px' }}>
                      {news.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              className="cockpit-link-btn"
              onClick={() => onNavigateTab('market')}
            >
              <span>마켓 인텔리전스 전체보기</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM-RIGHT: PubMed 논문 & 학술 큐레이션                              */}
      {/* ========================================================================= */}
      <div className="cockpit-card">
        {/* Header */}
        <div className="cockpit-card-header">
          <div className="cockpit-title-group">
            <div className="cockpit-icon-badge" style={{ background: 'rgba(168, 85, 247, 0.12)', borderColor: 'rgba(168, 85, 247, 0.3)', color: 'var(--purple-primary)' }}>
              <BookOpen size={16} />
            </div>
            <h4>PubMed 논문 <span className="text-muted text-xs font-normal">& 리서치</span></h4>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)' }}>
            <Search size={11} className="text-muted" />
            <input 
              type="text" 
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '11px', color: 'var(--text-highlight)', width: '100px' }}
              placeholder="PubMed 검색..."
              value={pubmedSearchQuery}
              onChange={e => setPubmedSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 2-Column Split: Curated Papers (Left 1.15fr) + Topic Filter Tags & Action (Right 0.85fr) */}
        <div className="cockpit-split-columns split-pubmed">
          {/* Left: Latest Curated Papers with AI Key Findings */}
          <div className="cockpit-col-left" style={{ gap: '8px' }}>
            <div className="cockpit-section-subhead" style={{ marginBottom: '2px' }}>
              <span className="text-xs font-bold text-highlight">최신 PubMed 큐레이션</span>
              <span className="badge badge-cyan text-2xs">AI 요약</span>
            </div>

            {curatedPapers.map((paper, i) => (
              <div key={paper.id || i} className="cockpit-paper-item">
                <h5 className="text-xs font-bold text-highlight leading-snug" style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {paper.title}
                </h5>
                <p className="text-2xs text-muted" style={{ margin: '2px 0 0 0' }}>
                  {paper.authors} · {paper.journal}
                </p>
                <div className="cockpit-ai-findings">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--cyan-primary)', fontSize: '10px', fontWeight: 'bold' }}>
                    <Sparkles size={10} />
                    <span>AI Key Findings</span>
                  </div>
                  <p className="text-2xs text-muted" style={{ margin: '2px 0 0 0', lineHeight: '1.4' }}>
                    {paper.findings}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Interest Topic Tags, Recommendation Tags & Action */}
          <div className="cockpit-col-right">
            <div>
              <div className="cockpit-section-subhead">
                <span className="text-xs font-bold text-highlight">나의 관심 분야</span>
                <span className="mono text-2xs text-muted">Filter</span>
              </div>

              <div className="cockpit-topic-tags">
                {pubmedTopicTags.map((tag, i) => (
                  <button
                    key={i}
                    className={`cockpit-topic-chip ${selectedTopicTag === tag ? 'active' : ''}`}
                    onClick={() => setSelectedTopicTag(tag === selectedTopicTag ? 'All' : tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Recommended Search Keywords Pill Box */}
              <div style={{ marginTop: '10px', padding: '8px 10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <Tag size={10} />
                  <span>오늘의 추천 키워드</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  <span className="badge badge-purple text-2xs cursor-pointer" onClick={() => onNavigateTab('pubmed')}>#서파수면</span>
                  <span className="badge badge-cyan text-2xs cursor-pointer" onClick={() => onNavigateTab('pubmed')}>#Glymphatic</span>
                  <span className="badge badge-emerald text-2xs cursor-pointer" onClick={() => onNavigateTab('pubmed')}>#미토콘드리아</span>
                  <span className="badge badge-amber text-2xs cursor-pointer" onClick={() => onNavigateTab('pubmed')}>#인슐린감수성</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '10px', textAlign: 'center', background: 'rgba(168, 85, 247, 0.06)', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
              <p className="text-xs font-bold text-highlight" style={{ margin: 0 }}>PubMed Search Hub</p>
              <p className="text-2xs text-muted" style={{ margin: '2px 0 0 0' }}>
                원하는 학술 논문을 실시간 색인하고 옵시디언으로 동기화하세요.
              </p>
              <button 
                className="btn btn-primary btn-xs mt-2"
                style={{ width: '100%', fontWeight: 'bold' }}
                onClick={() => onNavigateTab('pubmed')}
              >
                <Search size={12} />
                <span>논문 허브 이동</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
