import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Flame, 
  Zap, 
  Calendar, 
  FileText, 
  CheckSquare, 
  Sparkles,
  Trash2
} from 'lucide-react';
import { TIMEBLOCK_SCHEDULE } from '../data/sampleData';

export function DailyRoutines({ 
  routines, 
  onToggleRoutine, 
  onAddRoutine, 
  onDeleteRoutine, 
  onOpenObsidianModal 
}) {
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00 - 10:00');
  const [newCategory, setNewCategory] = useState('deepwork');
  const [newXP, setNewXP] = useState(30);
  const [showAddForm, setShowAddForm] = useState(false);

  const completedCount = routines.filter(r => r.completed).length;
  const totalCount = routines.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalEarnedXP = routines.filter(r => r.completed).reduce((acc, r) => acc + r.xp, 0);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddRoutine({
      id: `r-${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      time: newTime,
      completed: false,
      xp: parseInt(newXP, 10) || 30,
      streak: 1
    });

    setNewTitle('');
    setShowAddForm(false);
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'morning': return 'cyan';
      case 'fitness': return 'emerald';
      case 'deepwork': return 'purple';
      case 'market': return 'amber';
      case 'night': return 'rose';
      default: return 'cyan';
    }
  };

  return (
    <div className="daily-routines-container">
      {/* Header Stat HUD */}
      <div className="routine-summary-banner glass-card">
        <div className="summary-left">
          <div className="summary-title-row">
            <h3>⚡ 일일 핵심 프로토콜 & 데일리 루틴</h3>
            <span className="badge badge-cyan">{completedCount} / {totalCount} 완수 ({progressPercent}%)</span>
          </div>
          <p className="text-muted text-xs">
            각 루틴 체크 시 경험치(+XP)가 실시간 적립되며 Obsidian 데일리 노트(`YYYY-MM-DD.md`)에 마크다운 태스크로 동기화됩니다.
          </p>

          <div className="progress-bar-large">
            <div 
              className="progress-fill-emerald" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="summary-right">
          <div className="xp-earned-badge">
            <Zap size={16} className="text-amber" />
            <div>
              <span className="xp-val mono">+{totalEarnedXP}</span>
              <span className="xp-lbl">오늘 획득 XP</span>
            </div>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={onOpenObsidianModal}>
            <FileText size={14} />
            <span>Obsidian 연동</span>
          </button>
        </div>
      </div>

      <div className="routine-content-grid">
        {/* Left Column: Routine Checklist */}
        <div className="routine-checklist-col glass-card">
          <div className="panel-header">
            <div className="panel-title-with-icon">
              <CheckSquare size={18} className="text-cyan" />
              <h4>오늘의 프로토콜 체크리스트</h4>
            </div>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus size={14} />
              <span>{showAddForm ? '닫기' : '루틴 추가'}</span>
            </button>
          </div>

          {/* Quick Add Form */}
          {showAddForm && (
            <form className="add-routine-form" onSubmit={handleAddSubmit}>
              <input
                type="text"
                className="input-text"
                placeholder="루틴 제목 (예: 야간 딥워크 90분, 폼롤러 스트레칭)"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
              />
              <div className="form-row">
                <input
                  type="text"
                  className="input-text"
                  placeholder="시간대 (예: 21:00 - 22:00)"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                />
                <select 
                  className="select-input" 
                  value={newCategory} 
                  onChange={e => setNewCategory(e.target.value)}
                >
                  <option value="morning">아침 루틴 (Morning)</option>
                  <option value="fitness">운동/러닝 (Fitness)</option>
                  <option value="deepwork">딥워크 (Deepwork)</option>
                  <option value="market">주식/브리핑 (Market)</option>
                  <option value="night">야간 마감 (Night)</option>
                </select>
                <input
                  type="number"
                  className="input-text w-24"
                  placeholder="XP"
                  value={newXP}
                  onChange={e => setNewXP(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm">추가</button>
              </div>
            </form>
          )}

          {/* Checklist Items */}
          <div className="routine-items-list">
            {routines.map(routine => {
              const color = getCategoryColor(routine.category);
              return (
                <div 
                  key={routine.id} 
                  className={`routine-item ${routine.completed ? 'completed' : ''}`}
                  onClick={() => onToggleRoutine(routine.id)}
                >
                  <div className="routine-checkbox">
                    {routine.completed ? (
                      <CheckCircle2 size={20} className="text-emerald" />
                    ) : (
                      <Circle size={20} className="text-faint" />
                    )}
                  </div>

                  <div className="routine-info">
                    <div className="routine-title-row">
                      <span className={`routine-title ${routine.completed ? 'line-through text-muted' : ''}`}>
                        {routine.title}
                      </span>
                      <span className={`badge badge-${color}`}>{routine.category.toUpperCase()}</span>
                    </div>
                    <div className="routine-meta-row">
                      <span className="routine-time mono text-muted text-xs">
                        <Clock size={11} /> {routine.time}
                      </span>
                      <span className="routine-xp mono text-amber text-xs">
                        +{routine.xp} XP
                      </span>
                      {routine.streak > 0 && (
                        <span className="routine-streak text-xs text-rose">
                          <Flame size={12} /> {routine.streak}일 연속
                        </span>
                      )}
                    </div>
                  </div>

                  <button 
                    className="btn-icon btn-delete" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRoutine(routine.id);
                    }}
                    title="루틴 삭제"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: 24h Timeblock Schedule Template */}
        <div className="timeblock-col glass-card">
          <div className="panel-header">
            <div className="panel-title-with-icon">
              <Calendar size={18} className="text-purple" />
              <h4>24h 타임블록 스케줄러 템플릿</h4>
            </div>
            <span className="badge badge-purple">Timeblocking</span>
          </div>

          <div className="timeblock-timeline">
            {TIMEBLOCK_SCHEDULE.map((block, idx) => {
              const color = getCategoryColor(block.category);
              return (
                <div key={idx} className="timeline-node">
                  <div className="node-time mono">{block.time}</div>
                  <div className={`node-connector ${color}`}></div>
                  <div className="node-card">
                    <div className="node-event-title">{block.event}</div>
                    <span className={`badge badge-${color} text-xs`}>{block.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
