import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Zap, 
  TrendingUp, 
  Activity, 
  Users, 
  User, 
  ChevronRight,
  ChevronLeft,
  Check,
  ListTodo,
  Grid,
  FileText,
  Sparkles
} from 'lucide-react';
import { CALENDAR_CATEGORIES } from '../data/calendarEvents';
import { getTodayDateStr, formatKoreanDate, formatShortKoreanDate } from '../utils/dateUtils';
import { AiScheduleOptimizerModal } from './AiScheduleOptimizerModal';

export function DashboardCalendarWidget({ 
  events, 
  onToggleEvent, 
  onAddEvent, 
  onBulkUpdateEvents,
  onGoToCalendar,
  onOpenObsidianModal,
  geminiApiKey = null
}) {
  const now = new Date();
  const todayDateStr = getTodayDateStr();
  const [activeViewMode, setActiveViewMode] = useState('today'); // 'today' or 'month'
  const [selectedDate, setSelectedDate] = useState(todayDateStr);
  const [showAiOptimizerModal, setShowAiOptimizerModal] = useState(false);

  const todayEvents = events.filter(e => e.date === todayDateStr);
  const completedCount = todayEvents.filter(e => e.completed).length;
  const progressPercent = todayEvents.length > 0 ? Math.round((completedCount / todayEvents.length) * 100) : 0;

  // Selected date events for month preview
  const selectedDateEvents = events.filter(e => e.date === selectedDate);

  // Quick Inline Add State
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickStartTime, setQuickStartTime] = useState('16:00');
  const [quickEndTime, setQuickEndTime] = useState('17:00');
  const [quickCategory, setQuickCategory] = useState('deepwork');
  const [quickLocation, setQuickLocation] = useState('홈 오피스');

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    onAddEvent({
      id: `evt-${Date.now()}`,
      date: activeViewMode === 'month' ? selectedDate : todayDateStr,
      startTime: quickStartTime,
      endTime: quickEndTime,
      title: quickTitle.trim(),
      category: quickCategory,
      completed: false,
      location: quickLocation.trim() || '홈 오피스',
      notes: ''
    });

    setQuickTitle('');
    setShowQuickAdd(false);
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'deepwork': return <Zap size={12} className="text-cyan" />;
      case 'fitness': return <Activity size={12} className="text-emerald" />;
      case 'market': return <TrendingUp size={12} className="text-amber" />;
      case 'meeting': return <Users size={12} className="text-purple" />;
      case 'personal': return <User size={12} className="text-rose" />;
      default: return <CalendarIcon size={12} />;
    }
  };

  // Mini Month Grid Calculation (Dynamic Current Month)
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

  const miniDays = [];
  // Prev month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    const prevM = currentMonth === 0 ? 12 : currentMonth;
    const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    miniDays.push({ day: d, isCurrentMonth: false, dateStr });
  }
  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    miniDays.push({ day: d, isCurrentMonth: true, dateStr });
  }
  // Next month padding
  const remaining = 35 - miniDays.length;
  for (let d = 1; d <= (remaining > 0 ? remaining : 42 - miniDays.length); d++) {
    const nextM = currentMonth === 11 ? 1 : currentMonth + 2;
    const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    miniDays.push({ day: d, isCurrentMonth: false, dateStr });
  }

  const weekdaysShort = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="dashboard-calendar-widget glass-card">
      {/* Widget Header */}
      <div className="panel-header">
        <div className="panel-title-with-icon">
          <div className="widget-icon-box">
            <CalendarIcon size={18} className="text-cyan" />
          </div>
          <div>
            <div className="widget-header-title">
              <h4>핵심 일정 & 캘린더</h4>
              <span className="badge badge-cyan ml-2">{currentYear}. {String(currentMonth + 1).padStart(2, '0')}월</span>
            </div>
            <p className="text-muted text-xs">
              {activeViewMode === 'today' 
                ? `오늘 일정 ${todayEvents.length}건 중 ${completedCount}건 완수 (${progressPercent}%)`
                : `${currentMonth + 1}월 전체 일정 ${events.length}건 등록됨 (클릭하여 날짜별 확인)`}
            </p>
          </div>
        </div>

        <div className="widget-actions-row">
          {/* Mode Switch Pills */}
          <div className="widget-view-switch">
            <button 
              className={`widget-switch-btn ${activeViewMode === 'today' ? 'active' : ''}`}
              onClick={() => setActiveViewMode('today')}
              title="오늘 일정 타임블록 보기"
            >
              <ListTodo size={13} />
              <span>오늘 ({todayEvents.length})</span>
            </button>
            <button 
              className={`widget-switch-btn ${activeViewMode === 'month' ? 'active' : ''}`}
              onClick={() => setActiveViewMode('month')}
              title="한달 미니 캘린더 그리드 보기"
            >
              <Grid size={13} />
              <span>한달 요약</span>
            </button>
          </div>

          <button 
            className="btn btn-primary btn-xs"
            style={{ background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(168, 85, 247, 0.25))', borderColor: 'var(--cyan-primary)', color: 'var(--cyan-primary)' }}
            onClick={() => setShowAiOptimizerModal(true)}
            title="자연어로 일정을 일괄 등록하거나 시간을 자동 최적화합니다"
          >
            <Sparkles size={11} className="animate-pulse" />
            <span>✨ AI 편집</span>
          </button>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenObsidianModal}
            title="옵시디언 마크다운으로 일정 즉시 동기화"
          >
            <FileText size={13} className="text-purple" />
            <span>싱크</span>
          </button>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowQuickAdd(prev => !prev)}
            title="빠른 일정 추가"
          >
            <Plus size={14} />
            <span>추가</span>
          </button>

          <button 
            className="btn btn-icon btn-sm"
            onClick={onGoToCalendar}
            title="전체 캘린더 허브로 이동"
          >
            <ArrowRight size={15} className="text-cyan" />
          </button>
        </div>
      </div>

      {/* Progress Bar (Shown in Today mode) */}
      {activeViewMode === 'today' && (
        <div className="widget-progress-container mt-2">
          <div className="widget-progress-bar">
            <div 
              className="widget-progress-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Quick Add Form Inline Dropdown */}
      {showQuickAdd && (
        <form onSubmit={handleQuickSubmit} className="quick-add-event-form glass-card mt-3">
          <div className="quick-add-inputs-row">
            <input
              type="text"
              className="input-text flex-1"
              placeholder={activeViewMode === 'month' ? `${selectedDate} 일정 제목 입력` : "오늘 일정 제목 입력 (예: 16:00 테크 분석)"}
              value={quickTitle}
              onChange={e => setQuickTitle(e.target.value)}
              autoFocus
              required
            />
            <input
              type="time"
              className="input-text mono time-input-compact"
              value={quickStartTime}
              onChange={e => setQuickStartTime(e.target.value)}
            />
            <select
              className="select-input category-select-compact"
              value={quickCategory}
              onChange={e => setQuickCategory(e.target.value)}
            >
              {Object.entries(CALENDAR_CATEGORIES).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary btn-sm">
              <Check size={14} />
              <span>등록</span>
            </button>
          </div>
        </form>
      )}

      {/* VIEW 1: TODAY'S SCHEDULE CHECKLIST */}
      {activeViewMode === 'today' && (
        <div className="today-events-list mt-3">
          {todayEvents.length === 0 ? (
            <div className="empty-events-box text-center text-muted text-xs py-4">
              오늘 예정된 일정이 없습니다. 우측 상단 '+ 추가' 버튼으로 등록하세요.
            </div>
          ) : (
            todayEvents.map(evt => (
              <div 
                key={evt.id} 
                className={`dashboard-event-row ${evt.completed ? 'completed' : ''}`}
              >
                <button 
                  className={`event-check-btn ${evt.completed ? 'checked' : ''}`}
                  onClick={() => onToggleEvent(evt.id)}
                  title={evt.completed ? "완수 취소" : "완수 체크 (+20 XP)"}
                >
                  {evt.completed ? (
                    <CheckCircle2 size={16} className="text-emerald" />
                  ) : (
                    <Circle size={16} className="text-muted" />
                  )}
                </button>

                <div className="event-time-badge mono text-xs">
                  <Clock size={11} className="text-faint mr-1" />
                  <span>{evt.startTime} - {evt.endTime}</span>
                </div>

                <div className="event-title-block flex-1 min-w-0">
                  <span className="event-title-text font-medium text-xs truncate">
                    {evt.title}
                  </span>
                </div>

                <div className="event-cat-chip">
                  {getCategoryIcon(evt.category)}
                  <span className="text-xs">{CALENDAR_CATEGORIES[evt.category]?.label || evt.category}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW 2: MONTHLY MINI-CALENDAR GRID SUMMARY */}
      {activeViewMode === 'month' && (
        <div className="mini-month-view-wrapper mt-3">
          {/* Weekday Row */}
          <div className="mini-weekdays-grid">
            {weekdaysShort.map((w, idx) => (
              <span key={idx} className={`mini-weekday-label ${idx === 0 || idx === 6 ? 'text-rose font-bold' : ''}`}>
                {w}
              </span>
            ))}
          </div>

          {/* Mini Days Grid */}
          <div className="mini-days-grid">
            {miniDays.map((item, idx) => {
              const dayEvts = events.filter(e => e.date === item.dateStr);
              const isToday = item.dateStr === todayDateStr;
              const isSelected = item.dateStr === selectedDate;
              const hasEvents = dayEvts.length > 0;
              const isWeekend = idx % 7 === 0 || idx % 7 === 6;

              return (
                <div
                  key={idx}
                  className={`mini-day-cell ${!item.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasEvents ? 'has-events' : ''}`}
                  onClick={() => setSelectedDate(item.dateStr)}
                  title={`${item.dateStr}: ${dayEvts.length}건 일정`}
                >
                  <span className={`mini-day-num mono ${isWeekend && !isToday && !isSelected ? 'text-rose font-bold' : ''}`}>{item.day}</span>
                  {hasEvents && (
                    <div className="mini-event-dots">
                      {dayEvts.slice(0, 3).map((_, i) => (
                        <span key={i} className="mini-dot"></span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Date Mini Agenda Preview */}
          <div className="mini-selected-agenda mt-3 glass-card">
            <div className="mini-agenda-header">
              <span className="text-xs font-bold text-highlight">
                📅 {selectedDate} ({selectedDate === todayDateStr ? '오늘' : `${selectedDate.split('-')[1]}월 ${selectedDate.split('-')[2]}일`}) 일정 ({selectedDateEvents.length}건)
              </span>
              <button 
                className="btn-preset-chip"
                onClick={() => setShowQuickAdd(true)}
              >
                + 이 날짜에 추가
              </button>
            </div>

            <div className="mini-agenda-items mt-1">
              {selectedDateEvents.length === 0 ? (
                <span className="text-faint text-xs">등록된 일정이 없습니다.</span>
              ) : (
                selectedDateEvents.map(evt => (
                  <div key={evt.id} className="mini-agenda-item">
                    <span className="mono text-faint text-xs">{evt.startTime}</span>
                    <span className={`text-xs text-highlight flex-1 truncate ${evt.completed ? 'line-through opacity-60' : ''}`}>
                      {evt.title}
                    </span>
                    <button 
                      className="btn-icon-micro"
                      onClick={() => onToggleEvent(evt.id)}
                    >
                      {evt.completed ? <CheckCircle2 size={12} className="text-emerald" /> : <Circle size={12} />}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* AI Schedule Optimizer Modal */}
      <AiScheduleOptimizerModal
        isOpen={showAiOptimizerModal}
        onClose={() => setShowAiOptimizerModal(false)}
        currentEvents={events}
        onApplyOptimizedEvents={(updatedEvents) => {
          if (onBulkUpdateEvents) {
            onBulkUpdateEvents(updatedEvents);
          }
        }}
        defaultTargetDate={selectedDate}
        apiKey={geminiApiKey}
      />
    </div>
  );
}
