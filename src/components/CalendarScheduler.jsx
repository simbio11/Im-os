import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  MapPin, 
  FileText, 
  Sparkles, 
  Filter, 
  Check, 
  Zap,
  TrendingUp,
  Activity,
  User,
  Users,
  Grid,
  Columns,
  List,
  Edit2,
  Search,
  CheckSquare,
  Copy,
  Wand2
} from 'lucide-react';
import { CALENDAR_CATEGORIES } from '../data/calendarEvents';
import { 
  getTodayDateStr, 
  getRelativeDateStr, 
  formatKoreanDate, 
  formatShortKoreanDate, 
  isDateToday,
  getHolidayInfo,
  isRedDay
} from '../utils/dateUtils';
import { AiScheduleOptimizerModal } from './AiScheduleOptimizerModal';

export function CalendarScheduler({ 
  events, 
  onAddEvent, 
  onToggleEvent, 
  onEditEvent,
  onDeleteEvent,
  onBulkUpdateEvents,
  onOpenObsidianModal,
  geminiApiKey = null,
  onOpenKeyModal = null,
  routines = []
}) {
  const now = new Date();
  const todayStr = getTodayDateStr();

  // Calendar Navigation State
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("month"); // "month", "week", "day", "list"
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Add / Edit / Duplicate / AI Optimizer
  const [showModal, setShowModal] = useState(false);
  const [showAiOptimizerModal, setShowAiOptimizerModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [isDuplicateMode, setIsDuplicateMode] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(todayStr);
  const [formStartTime, setFormStartTime] = useState('14:00');
  const [formEndTime, setFormEndTime] = useState('15:00');
  const [formCategory, setFormCategory] = useState('deepwork');
  const [formLocation, setFormLocation] = useState('홈 오피스');
  const [formNotes, setFormNotes] = useState('');

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToday = () => {
    const freshNow = new Date();
    setCurrentYear(freshNow.getFullYear());
    setCurrentMonth(freshNow.getMonth());
    setSelectedDate(getTodayDateStr());
  };

  // Open Add Modal
  const handleOpenAddModal = (date = selectedDate) => {
    setEditingEventId(null);
    setIsDuplicateMode(false);
    setFormTitle('');
    setFormDate(date);
    setFormStartTime('14:00');
    setFormEndTime('15:00');
    setFormCategory('deepwork');
    setFormLocation('홈 오피스');
    setFormNotes('');
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (evt) => {
    setEditingEventId(evt.id);
    setIsDuplicateMode(false);
    setFormTitle(evt.title);
    setFormDate(evt.date);
    setFormStartTime(evt.startTime);
    setFormEndTime(evt.endTime);
    setFormCategory(evt.category);
    setFormLocation(evt.location || '');
    setFormNotes(evt.notes || '');
    setShowModal(true);
  };

  // Open Duplicate (Copy) Modal
  const handleOpenDuplicateModal = (evt) => {
    setEditingEventId(null); // Brand new event
    setIsDuplicateMode(true);
    setFormTitle(evt.title);
    
    // Auto-suggest next day or selected date
    const d = new Date(evt.date);
    d.setDate(d.getDate() + 1);
    const nextDayStr = d.toISOString().split('T')[0];
    setFormDate(nextDayStr);

    setFormStartTime(evt.startTime);
    setFormEndTime(evt.endTime);
    setFormCategory(evt.category);
    setFormLocation(evt.location || '');
    setFormNotes(evt.notes || '');
    setShowModal(true);
  };

  // Quick Date shift helper inside modal
  const handleShiftDate = (days) => {
    const base = new Date(formDate || '2026-08-26');
    base.setDate(base.getDate() + days);
    setFormDate(base.toISOString().split('T')[0]);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingEventId) {
      // Edit existing
      onEditEvent({
        id: editingEventId,
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        title: formTitle.trim(),
        category: formCategory,
        location: formLocation.trim() || '홈 오피스',
        notes: formNotes.trim()
      });
    } else {
      // Create new (or Duplicated new)
      onAddEvent({
        id: `evt-${Date.now()}`,
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        title: formTitle.trim(),
        category: formCategory,
        completed: false,
        location: formLocation.trim() || '홈 오피스',
        notes: formNotes.trim()
      });
    }

    setShowModal(false);
  };

  // Calendar Calculation for Month Grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays = [];

  // Pad previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const m = currentMonth === 0 ? 12 : currentMonth;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${y}-${m.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
    calendarDays.push({ dayNum, dateStr, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const m = currentMonth + 1;
    const dateStr = `${currentYear}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    calendarDays.push({ dayNum: d, dateStr, isCurrentMonth: true });
  }

  // Pad next month leading days to complete 35 or 42 grid cells
  const remainingCells = 42 - calendarDays.length;
  for (let d = 1; d <= remainingCells; d++) {
    const m = currentMonth === 11 ? 1 : currentMonth + 2;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    calendarDays.push({ dayNum: d, dateStr, isCurrentMonth: false });
  }

  // Calculate Week Days for Week Timeline View (Current week around selectedDate)
  const selDateObj = new Date(selectedDate);
  const dayOfWeek = selDateObj.getDay(); // 0=Sun, 1=Mon, ...
  const sundayOffset = -dayOfWeek;
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(selDateObj);
    d.setDate(selDateObj.getDate() + sundayOffset + i);
    const dateStr = d.toISOString().split('T')[0];
    weekDays.push({
      dateStr,
      dayNum: d.getDate(),
      dayName: ['일', '월', '화', '수', '목', '금', '토'][i],
      isToday: isDateToday(dateStr),
      isSelected: dateStr === selectedDate
    });
  }

  // Filter events by Category & Search
  const filteredEvents = events.filter(e => {
    const matchesCategory = selectedCategoryFilter === 'ALL' || e.category === selectedCategoryFilter;
    const matchesSearch = !searchQuery.trim() || 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const selectedDateEvents = filteredEvents.filter(e => e.date === selectedDate);

  const monthNames = [
    "1월 (Jan)", "2월 (Feb)", "3월 (Mar)", "4월 (Apr)", 
    "5월 (May)", "6월 (Jun)", "7월 (Jul)", "8월 (Aug)", 
    "9월 (Sep)", "10월 (Oct)", "11월 (Nov)", "12월 (Dec)"
  ];

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'deepwork': return <Zap size={13} className="text-cyan" />;
      case 'fitness': return <Activity size={13} className="text-emerald" />;
      case 'market': return <TrendingUp size={13} className="text-amber" />;
      case 'meeting': return <Users size={13} className="text-purple" />;
      case 'personal': return <User size={13} className="text-rose" />;
      default: return <CalendarIcon size={13} />;
    }
  };

  const hoursList = Array.from({ length: 16 }, (_, i) => i + 7); // 07:00 to 22:00

  return (
    <div className="calendar-scheduler-container">
      {/* Top Banner: Calendar Navigation, View Mode Switcher, & Actions */}
      <div className="calendar-header-banner glass-card">
        <div className="cal-header-left">
          <div className="panel-title-with-icon">
            <div className="cal-icon-glow">
              <CalendarIcon size={22} className="text-cyan" />
            </div>
            <div>
              <div className="cal-title-row">
                <h3>캘린더 & 일정 관리 프로토콜</h3>
                <span className="badge badge-cyan ml-2">Real-time Schedule Hub</span>
              </div>
              <p className="text-muted text-xs">
                딥워크 타임블록, 5km 러닝, 주식 어닝콜/FOMC 및 주요 업무 일정을 실시간 조율하고 Obsidian과 동기화합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Controls: View Switcher, Month Navigation & Add Button */}
        <div className="cal-header-right">
          {/* View Switcher Pills */}
          <div className="cal-view-switcher">
            <button 
              className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
              title="월간 캘린더 그리드"
            >
              <Grid size={14} />
              <span>월간</span>
            </button>
            <button 
              className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
              title="주간 타임블록 뷰"
            >
              <Columns size={14} />
              <span>주간</span>
            </button>
            <button 
              className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => setViewMode('day')}
              title="일간 아젠다 뷰"
            >
              <CheckSquare size={14} />
              <span>일간</span>
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="전체 일정 타임라인"
            >
              <List size={14} />
              <span>전체 목록</span>
            </button>
          </div>

          {/* Month Navigation */}
          <div className="month-navigation-box">
            <button className="btn-icon" onClick={handlePrevMonth} title="이전 달">
              <ChevronLeft size={16} />
            </button>
            <span className="current-month-label mono font-bold text-highlight">
              {currentYear}년 {monthNames[currentMonth]}
            </span>
            <button className="btn-icon" onClick={handleNextMonth} title="다음 달">
              <ChevronRight size={16} />
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleGoToday}>
              오늘
            </button>
          </div>

          {/* Obsidian Sync & Add Event Buttons */}
          <div className="flex items-center gap-2">
            <button 
              className="btn btn-primary btn-sm"
              style={{ background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(168, 85, 247, 0.25))', borderColor: 'var(--cyan-primary)', color: 'var(--cyan-primary)' }}
              onClick={() => setShowAiOptimizerModal(true)}
              title="자연어로 일정을 일괄 등록하거나 시간을 자동 최적화합니다"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span>✨ AI 일정 편집</span>
            </button>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={onOpenObsidianModal}
              title="옵시디언 마크다운으로 일정 즉시 동기화"
            >
              <FileText size={14} className="text-purple" />
              <span>옵시디언 싱크</span>
            </button>

            {events && events.length > 0 && onBulkUpdateEvents && (
              <button 
                type="button"
                className="btn btn-secondary btn-sm text-rose hover:border-rose/40"
                onClick={() => {
                  if (window.confirm("등록된 모든 일정을 캘린더에서 삭제하시겠습니까?")) {
                    onBulkUpdateEvents([]);
                  }
                }}
                title="캘린더의 모든 일정 초기화"
              >
                <Trash2 size={13} className="text-rose" />
                <span>일정 비우기</span>
              </button>
            )}

            <button 
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenAddModal(selectedDate)}
            >
              <Plus size={15} />
              <span>일정 추가</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter & Search Bar */}
      <div className="cal-filter-toolbar glass-card mt-3">
        <div className="cal-category-filters-row">
          <span className="text-xs text-muted font-bold">카테고리:</span>
          <button 
            className={`cal-filter-pill ${selectedCategoryFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategoryFilter('ALL')}
          >
            전체 ({events.length})
          </button>
          {Object.entries(CALENDAR_CATEGORIES).map(([key, config]) => {
            const count = events.filter(e => e.category === key).length;
            return (
              <button
                key={key}
                className={`cal-filter-pill ${selectedCategoryFilter === key ? 'active' : ''}`}
                onClick={() => setSelectedCategoryFilter(key)}
                style={{
                  borderColor: selectedCategoryFilter === key ? config.color : undefined,
                  color: selectedCategoryFilter === key ? config.color : undefined
                }}
              >
                {getCategoryIcon(key)}
                <span>{config.label} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div className="cal-search-input-wrapper">
          <Search size={14} className="search-icon text-muted" />
          <input
            type="text"
            className="input-text cal-search-input"
            placeholder="일정 검색 (예: 어닝콜, 러닝, 딥워크)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* VIEW 1: MONTH GRID VIEW */}
      {viewMode === 'month' && (
        <div className="calendar-main-grid mt-4">
          {/* Left Column: Month Grid */}
          <div className="calendar-month-card glass-card">
            <div className="weekdays-grid">
              {['일 (Sun)', '월 (Mon)', '화 (Tue)', '수 (Wed)', '목 (Thu)', '금 (Fri)', '토 (Sat)'].map((day, idx) => (
                <div key={idx} className={`weekday-label ${idx === 0 || idx === 6 ? 'text-rose font-bold' : ''}`}>
                  {day}
                </div>
              ))}
            </div>

            <div className="days-grid">
              {calendarDays.map((cell, idx) => {
                const dayEvents = filteredEvents.filter(e => e.date === cell.dateStr);
                const isSelected = cell.dateStr === selectedDate;
                const isToday = isDateToday(cell.dateStr);
                const holiday = getHolidayInfo(cell.dateStr);
                const isWeekendOrHoliday = idx % 7 === 0 || idx % 7 === 6 || holiday.isHoliday;

                return (
                  <div
                    key={idx}
                    className={`day-cell ${cell.isCurrentMonth ? '' : 'other-month'} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isWeekendOrHoliday ? 'is-holiday-day' : ''}`}
                    onClick={() => setSelectedDate(cell.dateStr)}
                  >
                    <div className="day-cell-top">
                      <div className="flex items-center gap-1">
                        <span className={`day-number mono ${isToday ? 'today-badge' : ''} ${isWeekendOrHoliday && !isToday && !isSelected ? 'text-rose font-bold' : ''}`}>
                          {cell.dayNum}
                        </span>
                        {holiday.isHoliday && (
                          <span className="holiday-mini-pill" title={holiday.name}>
                            {holiday.name}
                          </span>
                        )}
                      </div>
                      {dayEvents.length > 0 && (
                        <span className="event-count-badge mono">{dayEvents.length}</span>
                      )}
                    </div>

                    {/* Event Badges Preview */}
                    <div className="cell-events-container">
                      {dayEvents.slice(0, 3).map((evt, eIdx) => {
                        const catConfig = CALENDAR_CATEGORIES[evt.category] || CALENDAR_CATEGORIES.deepwork;
                        return (
                          <div 
                            key={eIdx} 
                            className={`cell-event-chip ${evt.completed ? 'completed' : ''}`}
                            style={{ borderLeftColor: catConfig.color }}
                            title={`${evt.startTime} ${evt.title}`}
                          >
                            <span className="chip-text truncate">{evt.title}</span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <span className="more-events-tag text-xs text-muted">
                          +{dayEvents.length - 3}개 더보기
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Day Agenda */}
          <div className="calendar-agenda-card glass-card">
            <div className="agenda-header">
              <div>
                <span className="badge badge-cyan">SELECTED AGENDA</span>
                <h4 className="agenda-date-title mt-1 font-bold text-highlight">
                  📅 {selectedDate} 일정 ({selectedDateEvents.length}건)
                </h4>
              </div>

              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => handleOpenAddModal(selectedDate)}
              >
                <Plus size={14} />
                <span>추가</span>
              </button>
            </div>

            {/* Agenda Events List */}
            <div className="agenda-events-list">
              {selectedDateEvents.length === 0 ? (
                <div className="empty-agenda-state">
                  <CalendarIcon size={36} className="text-faint" />
                  <p className="text-muted text-xs">
                    {selectedDate}에 등록된 일정이 없습니다.
                    <br />
                    '+ 추가' 버튼으로 새 스케줄을 등록하세요.
                  </p>
                </div>
              ) : (
                selectedDateEvents.map(evt => {
                  const catConfig = CALENDAR_CATEGORIES[evt.category] || CALENDAR_CATEGORIES.deepwork;
                  return (
                    <div 
                      key={evt.id} 
                      className={`agenda-event-item ${evt.completed ? 'completed' : ''}`}
                    >
                      <div 
                        className="agenda-item-checkbox"
                        onClick={() => onToggleEvent(evt.id)}
                        title={evt.completed ? "완료 해제" : "일정 완수 (+15 XP)"}
                      >
                        {evt.completed ? (
                          <CheckCircle2 size={18} className="text-emerald" />
                        ) : (
                          <Circle size={18} className="text-faint" />
                        )}
                      </div>

                      <div className="agenda-item-body">
                        <div className="agenda-item-header">
                          <span 
                            className={`badge text-xs font-bold`}
                            style={{ 
                              background: `${catConfig.color}22`, 
                              color: catConfig.color,
                              borderColor: `${catConfig.color}66`
                            }}
                          >
                            {getCategoryIcon(evt.category)}
                            <span>{catConfig.label.split(' ')[0]}</span>
                          </span>

                          <span className="agenda-time mono text-xs text-muted ml-auto">
                            <Clock size={11} /> {evt.startTime} ~ {evt.endTime}
                          </span>
                        </div>

                        <h5 className={`agenda-title ${evt.completed ? 'line-through text-muted' : 'text-highlight'}`}>
                          {evt.title}
                        </h5>

                        {evt.location && (
                          <div className="agenda-location text-xs text-muted">
                            <MapPin size={11} /> <span>{evt.location}</span>
                          </div>
                        )}

                        {evt.notes && (
                          <p className="agenda-notes text-xs text-faint mt-1">
                            "{evt.notes}"
                          </p>
                        )}
                      </div>

                      <div className="agenda-item-actions">
                        <button 
                          className="btn-icon btn-copy-action"
                          onClick={() => handleOpenDuplicateModal(evt)}
                          title="일정 복사 (날짜만 변경하여 새로 등록)"
                        >
                          <Copy size={13} className="text-cyan" />
                        </button>
                        <button 
                          className="btn-icon"
                          onClick={() => handleOpenEditModal(evt)}
                          title="일정 수정"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          className="btn-icon btn-delete" 
                          onClick={() => onDeleteEvent(evt.id)}
                          title="일정 삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Sync with Obsidian Daily Note */}
            <div className="agenda-footer-action">
              <button 
                className="btn btn-secondary w-full btn-sm"
                onClick={onOpenObsidianModal}
              >
                <FileText size={14} />
                <span>Obsidian Daily Note 동기화</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: WEEK TIMELINE VIEW */}
      {viewMode === 'week' && (
        <div className="calendar-week-view glass-card mt-4">
          <div className="week-view-header">
            <div className="time-col-header">TIME</div>
            {weekDays.map((wd, idx) => {
              const holiday = getHolidayInfo(wd.dateStr);
              const isWkRed = wd.dayName.includes('일') || wd.dayName.includes('토') || holiday.isHoliday;

              return (
                <div 
                  key={idx} 
                  className={`week-day-col-header ${wd.isSelected ? 'selected' : ''} ${wd.isToday ? 'today' : ''} ${isWkRed ? 'is-holiday-col' : ''}`}
                  onClick={() => setSelectedDate(wd.dateStr)}
                >
                  <span className={`week-day-name ${isWkRed ? 'text-rose font-bold' : ''}`}>
                    {wd.dayName} {holiday.isHoliday ? `(${holiday.name})` : ''}
                  </span>
                  <span className={`week-day-num mono ${wd.isToday ? 'today-pill' : (isWkRed ? 'text-rose font-bold' : '')}`}>
                    {wd.dayNum}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="week-view-body">
            {hoursList.map((hour, hIdx) => {
              const timeStr = `${hour.toString().padStart(2, '0')}:00`;
              return (
                <div key={hIdx} className="week-hour-row">
                  <div className="week-time-label mono">{timeStr}</div>
                  {weekDays.map((wd, dIdx) => {
                    const dayEventsInHour = filteredEvents.filter(e => {
                      if (e.date !== wd.dateStr) return false;
                      const eHour = parseInt(e.startTime.split(':')[0], 10);
                      return eHour === hour;
                    });

                    return (
                      <div 
                        key={dIdx} 
                        className={`week-hour-cell ${wd.isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedDate(wd.dateStr)}
                      >
                        {dayEventsInHour.map(evt => {
                          const catConfig = CALENDAR_CATEGORIES[evt.category] || CALENDAR_CATEGORIES.deepwork;
                          return (
                            <div
                              key={evt.id}
                              className={`week-event-card ${evt.completed ? 'completed' : ''}`}
                              style={{ borderLeftColor: catConfig.color }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(evt);
                              }}
                              title={`${evt.startTime} ~ ${evt.endTime}: ${evt.title}`}
                            >
                              <div className="week-event-top">
                                <span className="week-event-time mono">{evt.startTime}</span>
                                <div className="week-card-micro-actions">
                                  <button
                                    className="btn-icon-micro"
                                    onClick={(ev) => {
                                      ev.stopPropagation();
                                      handleOpenDuplicateModal(evt);
                                    }}
                                    title="일정 복사 (날짜 변경 등록)"
                                  >
                                    <Copy size={11} className="text-cyan" />
                                  </button>
                                  {getCategoryIcon(evt.category)}
                                </div>
                              </div>
                              <div className="week-event-title truncate">{evt.title}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: DAY AGENDA VIEW */}
      {viewMode === 'day' && (
        <div className="calendar-day-detail-view glass-card mt-4">
          <div className="day-view-header">
            <div className="day-nav-group">
              <button 
                className="btn-icon"
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <h3 className="mono font-bold text-highlight">📅 {selectedDate} 집중 일정표</h3>
              <button 
                className="btn-icon"
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button 
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenAddModal(selectedDate)}
            >
              <Plus size={14} />
              <span>오늘 일정 추가</span>
            </button>
          </div>

          <div className="day-timeline-list mt-4">
            {selectedDateEvents.length === 0 ? (
              <div className="empty-agenda-state p-8 text-center">
                <CalendarIcon size={40} className="text-faint mx-auto mb-2" />
                <p className="text-muted">해당 날짜에 등록된 일정이 없습니다.</p>
              </div>
            ) : (
              selectedDateEvents.map(evt => {
                const catConfig = CALENDAR_CATEGORIES[evt.category] || CALENDAR_CATEGORIES.deepwork;
                return (
                  <div key={evt.id} className={`day-timeline-card glass-card ${evt.completed ? 'completed' : ''}`}>
                    <div className="day-timeline-left">
                      <div 
                        className="day-checkbox"
                        onClick={() => onToggleEvent(evt.id)}
                      >
                        {evt.completed ? <CheckCircle2 size={20} className="text-emerald" /> : <Circle size={20} className="text-faint" />}
                      </div>
                      <div className="day-time-range mono">
                        <span className="start-time">{evt.startTime}</span>
                        <span className="end-time text-muted">~ {evt.endTime}</span>
                      </div>
                    </div>

                    <div className="day-timeline-body">
                      <div className="day-card-header">
                        <span 
                          className="badge text-xs font-bold"
                          style={{ background: `${catConfig.color}22`, color: catConfig.color, borderColor: `${catConfig.color}66` }}
                        >
                          {getCategoryIcon(evt.category)}
                          <span>{catConfig.label}</span>
                        </span>
                        {evt.location && (
                          <span className="location-tag text-xs text-muted">
                            <MapPin size={11} /> {evt.location}
                          </span>
                        )}
                      </div>

                      <h4 className={`day-event-heading mt-2 ${evt.completed ? 'line-through text-muted' : 'text-highlight'}`}>
                        {evt.title}
                      </h4>

                      {evt.notes && (
                        <p className="day-event-notes text-xs text-muted mt-2 bg-dark-subtle p-3 rounded">
                          {evt.notes}
                        </p>
                      )}
                    </div>

                    <div className="day-card-actions">
                      <button 
                        className="btn-icon btn-copy-action" 
                        onClick={() => handleOpenDuplicateModal(evt)} 
                        title="일정 복사 (날짜만 변경하여 추가)"
                      >
                        <Copy size={14} className="text-cyan" />
                      </button>
                      <button className="btn-icon" onClick={() => handleOpenEditModal(evt)} title="수정">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn-icon btn-delete" onClick={() => onDeleteEvent(evt.id)} title="삭제">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: ALL SCHEDULES LIST VIEW */}
      {viewMode === 'list' && (
        <div className="calendar-list-view glass-card mt-4">
          <div className="panel-header">
            <h4>전체 일정 타임라인 ({filteredEvents.length}건)</h4>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenAddModal(selectedDate)}
            >
              <Plus size={14} />
              <span>새 일정 추가</span>
            </button>
          </div>

          <div className="all-events-table-wrapper mt-3">
            <table className="custom-data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>완료</th>
                  <th>날짜</th>
                  <th>시간</th>
                  <th>카테고리</th>
                  <th>일정 제목 / 프로토콜</th>
                  <th>장소</th>
                  <th style={{ width: '110px' }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map(evt => {
                  const catConfig = CALENDAR_CATEGORIES[evt.category] || CALENDAR_CATEGORIES.deepwork;
                  return (
                    <tr key={evt.id} className={evt.completed ? 'row-completed' : ''}>
                      <td>
                        <button 
                          className="btn-icon" 
                          onClick={() => onToggleEvent(evt.id)}
                        >
                          {evt.completed ? <CheckCircle2 size={16} className="text-emerald" /> : <Circle size={16} className="text-faint" />}
                        </button>
                      </td>
                      <td className="mono font-bold">{evt.date}</td>
                      <td className="mono text-muted">{evt.startTime} ~ {evt.endTime}</td>
                      <td>
                        <span 
                          className="badge text-xs font-bold"
                          style={{ background: `${catConfig.color}22`, color: catConfig.color, borderColor: `${catConfig.color}66` }}
                        >
                          {getCategoryIcon(evt.category)}
                          <span>{catConfig.label.split(' ')[0]}</span>
                        </span>
                      </td>
                      <td className={evt.completed ? 'line-through text-muted' : 'text-highlight font-semibold'}>
                        {evt.title}
                        {evt.notes && <div className="text-xs text-faint mt-1 truncate max-w-md">{evt.notes}</div>}
                      </td>
                      <td className="text-xs text-muted">{evt.location || '-'}</td>
                      <td>
                        <div className="actions-cell">
                          <button 
                            className="btn-icon btn-copy-action" 
                            onClick={() => handleOpenDuplicateModal(evt)} 
                            title="일정 복사 (날짜만 변경하여 등록)"
                          >
                            <Copy size={13} className="text-cyan" />
                          </button>
                          <button className="btn-icon" onClick={() => handleOpenEditModal(evt)} title="수정">
                            <Edit2 size={13} />
                          </button>
                          <button className="btn-icon btn-delete" onClick={() => onDeleteEvent(evt.id)} title="삭제">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit / Duplicate Event Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content add-event-modal" onClick={e => e.stopPropagation()}>
            <div className="panel-header">
              <div className="panel-title-with-icon">
                {isDuplicateMode ? (
                  <Copy size={18} className="text-cyan" />
                ) : (
                  <CalendarIcon size={18} className="text-cyan" />
                )}
                <div>
                  <h4>
                    {isDuplicateMode 
                      ? '📋 일정 복사 및 날짜 지정' 
                      : editingEventId 
                        ? '일정 프로토콜 수정' 
                        : '새 일정 & 프로토콜 등록'}
                  </h4>
                  {isDuplicateMode && (
                    <p className="text-xs text-muted">기존 일정의 내용이 그대로 복사되었습니다. 새 날짜를 선택하세요.</p>
                  )}
                </div>
              </div>
              <span className={`badge ${isDuplicateMode ? 'badge-cyan' : editingEventId ? 'badge-purple' : 'badge-emerald'}`}>
                {isDuplicateMode ? 'Copy & Clone' : editingEventId ? 'Edit Event' : 'New Schedule'}
              </span>
            </div>

            <form onSubmit={handleFormSubmit} className="add-event-form">
              <div className="form-group">
                <label className="text-xs text-muted">일정 제목 / 내용</label>
                <input
                  type="text"
                  className="input-text"
                  placeholder="예: 엔비디아 어닝콜 분석, 5km 러닝, AI 아키텍처 딥워크"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  required
                  autoFocus={!isDuplicateMode}
                />
              </div>

              {/* Date selection with Quick Presets */}
              <div className="form-group mt-3">
                <div className="date-field-header">
                  <label className="text-xs text-muted">날짜 (YYYY-MM-DD)</label>
                  <div className="date-preset-pills">
                    <button type="button" className="btn-preset-chip" onClick={() => setFormDate(getTodayDateStr())}>오늘 ({getTodayDateStr().slice(5)})</button>
                    <button type="button" className="btn-preset-chip" onClick={() => setFormDate(getRelativeDateStr(1))}>내일 ({getRelativeDateStr(1).slice(5)})</button>
                    <button type="button" className="btn-preset-chip" onClick={() => setFormDate(getRelativeDateStr(2))}>모레 ({getRelativeDateStr(2).slice(5)})</button>
                    <button type="button" className="btn-preset-chip" onClick={() => handleShiftDate(7)}>+7일 뒤</button>
                    <button type="button" className="btn-preset-chip" onClick={() => handleShiftDate(14)}>+14일 뒤</button>
                  </div>
                </div>
                <input
                  type="date"
                  className="input-text mono"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  required
                  autoFocus={isDuplicateMode}
                />
              </div>

              <div className="form-grid-2 mt-3">
                <div className="form-group">
                  <label className="text-xs text-muted">시작 시간</label>
                  <input
                    type="time"
                    className="input-text mono"
                    value={formStartTime}
                    onChange={e => setFormStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="text-xs text-muted">종료 시간</label>
                  <input
                    type="time"
                    className="input-text mono"
                    value={formEndTime}
                    onChange={e => setFormEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2 mt-3">
                <div className="form-group">
                  <label className="text-xs text-muted">카테고리</label>
                  <select 
                    className="select-input"
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                  >
                    <option value="deepwork">🧠 딥워크 (Deepwork)</option>
                    <option value="fitness">🏃 운동/러닝 (Fitness)</option>
                    <option value="market">📈 주식/매크로 (Market)</option>
                    <option value="meeting">💼 미팅/업무 (Meeting)</option>
                    <option value="personal">👤 개인/학습 (Personal)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="text-xs text-muted">장소 / 플랫폼</label>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="예: 홈 오피스, Google Meet, 트랙"
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group mt-3">
                <label className="text-xs text-muted">메모 & 핵심 목표</label>
                <textarea
                  className="textarea-input"
                  rows={2}
                  placeholder="세부 목표, 준비 사항 또는 회고 내용"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions-row mt-4">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  {isDuplicateMode ? <Copy size={16} /> : <Check size={16} />}
                  <span>
                    {isDuplicateMode 
                      ? '📋 새 날짜로 복사 등록' 
                      : editingEventId 
                        ? '수정 내용 저장' 
                        : '일정 저장'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* AI Schedule Optimizer Modal */}
      <AiScheduleOptimizerModal
        isOpen={showAiOptimizerModal}
        onClose={() => setShowAiOptimizerModal(false)}
        currentEvents={events}
        routines={routines}
        onApplyOptimizedEvents={(updatedEvents) => {
          if (onBulkUpdateEvents) {
            onBulkUpdateEvents(updatedEvents);
          }
        }}
        defaultTargetDate={selectedDate}
        apiKey={geminiApiKey}
        onOpenKeyModal={onOpenKeyModal}
      />
    </div>
  );
}
