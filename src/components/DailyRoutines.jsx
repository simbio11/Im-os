import React, { useState } from 'react';
import { 
  CheckCircle2, Circle, Clock, Plus, Flame, Zap, Calendar,
  FileText, CheckSquare, Trash2, Edit3, Sparkles, X, Save
} from 'lucide-react';

const CATEGORIES = [
  { id: 'productivity', label: '생산성',   color: 'purple', emoji: '⚡' },
  { id: 'study',        label: '학습',     color: 'cyan',   emoji: '📚' },
  { id: 'leisure',      label: '여가생활', color: 'emerald',emoji: '🎮' },
  { id: 'meal',         label: '식사',     color: 'amber',  emoji: '🍽️' },
  { id: 'appointment',  label: '약속',     color: 'rose',   emoji: '🤝' },
  { id: 'fitness',      label: '운동',     color: 'teal',   emoji: '🏃' },
  { id: 'night',        label: '취침준비', color: 'indigo', emoji: '🌙' },
];

const getCatById = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[0];

const AI_TEMPLATES = [
  { time: '06:30', event: '기상 & 미온수 수분 보충 (500ml)', category: 'fitness' },
  { time: '07:00', event: '아침 스트레칭 & 명상 10분', category: 'night' },
  { time: '08:00', event: '건강식 아침 식사 (단백질/그릭요거트)', category: 'meal' },
  { time: '09:00', event: '1차 딥워크: 핵심 프로젝트 집중 (90분)', category: 'productivity' },
  { time: '10:30', event: '가벼운 산책 & 수분 보충', category: 'fitness' },
  { time: '12:00', event: '점심 식사 & 휴식', category: 'meal' },
  { time: '13:00', event: '개인 학습 & 전문서적 독서 (60분)', category: 'study' },
  { time: '14:00', event: '2차 딥워크: AI 개발 및 리서치 (90분)', category: 'productivity' },
  { time: '17:00', event: '피트니스 운동 & 러닝 (45분)', category: 'fitness' },
  { time: '18:30', event: '저녁 식사', category: 'meal' },
  { time: '20:00', event: '개인 여가 시간 & 취미 생활', category: 'leisure' },
  { time: '22:00', event: '내일 일정 계획 & Obsidian 일기', category: 'study' },
  { time: '22:30', event: '스크린 오프 & 수면 준비', category: 'night' },
];

const DEFAULT_TIMEBLOCKS = [
  { id: 'tb1', time: '06:30', event: '기상 & 미온수 + 전해질', category: 'fitness' },
  { id: 'tb2', time: '08:00', event: '건강식 아침 식사', category: 'meal' },
  { id: 'tb3', time: '09:30', event: '1차 딥워크: 핵심 프로젝트', category: 'productivity' },
  { id: 'tb4', time: '12:00', event: '점심 식사 & 15분 산책', category: 'meal' },
  { id: 'tb5', time: '14:00', event: '2차 딥워크: AI 개발', category: 'productivity' },
  { id: 'tb6', time: '17:00', event: '피트니스 & 스트레칭', category: 'fitness' },
  { id: 'tb7', time: '18:30', event: '저녁 식사', category: 'meal' },
  { id: 'tb8', time: '20:00', event: '개인 독서 & 학습', category: 'study' },
  { id: 'tb9', time: '22:30', event: 'Obsidian 마감 & 수면 준비', category: 'night' },
];

export function DailyRoutines({ 
  routines, 
  onToggleRoutine, 
  onAddRoutine, 
  onDeleteRoutine, 
  onOpenObsidianModal 
}) {
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00 - 10:00');
  const [newCategory, setNewCategory] = useState('productivity');
  const [newXP, setNewXP] = useState(30);
  const [showAddForm, setShowAddForm] = useState(false);

  const [timeblocks, setTimeblocks] = useState(() => {
    try {
      const saved = localStorage.getItem('lm_timeblocks');
      return saved ? JSON.parse(saved) : DEFAULT_TIMEBLOCKS;
    } catch {
      return DEFAULT_TIMEBLOCKS;
    }
  });

  const [editingBlock, setEditingBlock] = useState(null);
  const [editBlockData, setEditBlockData] = useState({});
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [newBlock, setNewBlock] = useState({ time: '10:00', event: '', category: 'productivity' });
  const [showAiPanel, setShowAiPanel] = useState(false);

  const saveTimeblocks = (updated) => {
    const sorted = [...updated].sort((a, b) => a.time.localeCompare(b.time));
    setTimeblocks(sorted);
    localStorage.setItem('lm_timeblocks', JSON.stringify(sorted));
  };

  const startEditBlock = (block) => {
    setEditingBlock(block.id);
    setEditBlockData({ time: block.time, event: block.event, category: block.category });
  };

  const commitEditBlock = (id) => {
    const updated = timeblocks.map(b => b.id === id ? { ...b, ...editBlockData } : b);
    saveTimeblocks(updated);
    setEditingBlock(null);
  };

  const deleteBlock = (id) => {
    saveTimeblocks(timeblocks.filter(b => b.id !== id));
  };

  const addBlock = () => {
    if (!newBlock.event.trim()) return;
    saveTimeblocks([...timeblocks, { ...newBlock, id: `tb-${Date.now()}` }]);
    setNewBlock({ time: '10:00', event: '', category: 'productivity' });
    setShowAddBlock(false);
  };

  const applyAiTemplate = () => {
    saveTimeblocks(AI_TEMPLATES.map((t, i) => ({ ...t, id: `ai-${i}` })));
    setShowAiPanel(false);
  };

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
            각 루틴 체크 시 경험치(+XP)가 실시간 적립되며 Obsidian 데일리 노트와 자동 동기화됩니다.
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

          {showAddForm && (
            <form className="add-routine-form" onSubmit={handleAddSubmit}>
              <input
                type="text"
                className="input-text"
                placeholder="루틴 제목 (예: 아침 명상 10분, 주간 독서 1시간)"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
              />
              <div className="form-row">
                <input
                  type="text"
                  className="input-text"
                  placeholder="시간대 (예: 09:00 - 10:00)"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                />
                <select
                  className="select-input"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  className="input-text w-20"
                  placeholder="XP"
                  value={newXP}
                  onChange={e => setNewXP(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm">추가</button>
              </div>
            </form>
          )}

          <div className="routine-items-list">
            {routines.map(routine => {
              const cat = getCatById(routine.category);
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
                        {cat.emoji} {routine.title}
                      </span>
                      <span className={`badge badge-${cat.color}`}>
                        {cat.label}
                      </span>
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

        {/* Right Column: Editable 24h Timeblock Scheduler with AI Template */}
        <div className="timeblock-col glass-card">
          <div className="panel-header">
            <div className="panel-title-with-icon">
              <Calendar size={18} className="text-purple" />
              <h4>24h 타임블록 스케줄러</h4>
            </div>
            <div className="flex gap-2">
              <button 
                className={`btn btn-sm ${showAiPanel ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setShowAiPanel(!showAiPanel)}
                title="AI 최적 하루 스케줄 템플릿 추천"
              >
                <Sparkles size={13} />
                <span>AI 추천</span>
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setShowAddBlock(!showAddBlock)}
              >
                <Plus size={13} />
                <span>추가</span>
              </button>
            </div>
          </div>

          {/* AI Schedule Template Recommendation Panel */}
          {showAiPanel && (
            <div className="ai-template-panel glass-card p-3 mb-3 border border-purple-500/30">
              <div className="ai-panel-header flex items-center gap-1">
                <Sparkles size={14} className="text-purple" />
                <span className="text-xs font-bold text-highlight">✨ AI 최적 하루 루틴 스케줄 추천</span>
              </div>
              <p className="text-muted text-xs mt-1 mb-2">
                딥워크 2회(오전/오후)와 식사, 운동, 학습, 취침이 최적 배분된 13개 일정 템플릿입니다. 적용 시 현재 타임블록이 교체됩니다.
              </p>
              <div className="ai-preview-list max-h-36 overflow-y-auto pr-1 space-y-1">
                {AI_TEMPLATES.map((t, i) => {
                  const cat = getCatById(t.category);
                  return (
                    <div key={i} className="ai-preview-row flex items-center justify-between text-xs py-0.5">
                      <span className="mono text-muted">{t.time}</span>
                      <span className="text-highlight truncate px-2">{cat.emoji} {t.event}</span>
                      <span className={`badge badge-${cat.color} text-xs`}>{cat.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-3">
                <button className="btn btn-primary btn-sm flex-1" onClick={applyAiTemplate}>
                  <Sparkles size={13} /> 템플릿 전체 적용
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAiPanel(false)}>
                  취소
                </button>
              </div>
            </div>
          )}

          {/* Add New Timeblock Form */}
          {showAddBlock && (
            <div className="add-block-form glass-card p-3 mb-3">
              <div className="form-row flex gap-2">
                <input 
                  type="time" 
                  className="input-text w-28" 
                  value={newBlock.time} 
                  onChange={e => setNewBlock(p => ({ ...p, time: e.target.value }))} 
                />
                <input 
                  type="text" 
                  className="input-text flex-1" 
                  placeholder="일정 내용 (예: 1차 딥워크, 점심 식사)" 
                  value={newBlock.event} 
                  onChange={e => setNewBlock(p => ({ ...p, event: e.target.value }))} 
                />
              </div>
              <div className="form-row flex gap-2 mt-2">
                <select 
                  className="select-input flex-1" 
                  value={newBlock.category} 
                  onChange={e => setNewBlock(p => ({ ...p, category: e.target.value }))}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                  ))}
                </select>
                <button className="btn btn-primary btn-sm" onClick={addBlock}>
                  <Save size={13} /> 저장
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAddBlock(false)}>
                  <X size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Timeline Nodes */}
          <div className="timeblock-timeline">
            {timeblocks.map(block => {
              const cat = getCatById(block.category);
              const isEditing = editingBlock === block.id;

              return (
                <div key={block.id} className="timeline-node">
                  {isEditing ? (
                    <div className="timeline-edit-row flex items-center gap-2 w-full">
                      <input 
                        type="time" 
                        className="input-text node-time-input w-24" 
                        value={editBlockData.time} 
                        onChange={e => setEditBlockData(p => ({ ...p, time: e.target.value }))} 
                      />
                      <input 
                        type="text" 
                        autoFocus 
                        className="input-text flex-1" 
                        value={editBlockData.event} 
                        onChange={e => setEditBlockData(p => ({ ...p, event: e.target.value }))} 
                        onKeyDown={e => e.key === 'Enter' && commitEditBlock(block.id)} 
                      />
                      <select 
                        className="select-input" 
                        value={editBlockData.category} 
                        onChange={e => setEditBlockData(p => ({ ...p, category: e.target.value }))}
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                        ))}
                      </select>
                      <button className="btn btn-primary btn-sm" onClick={() => commitEditBlock(block.id)}>
                        <Save size={12} />
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingBlock(null)}>
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="node-time mono">{block.time}</div>
                      <div className={`node-connector ${cat.color}`}></div>
                      <div className="node-card flex-1">
                        <div className="node-event-title">{cat.emoji} {block.event}</div>
                        <span className={`badge badge-${cat.color} text-xs`}>{cat.label}</span>
                      </div>
                      <div className="node-actions flex items-center gap-1">
                        <button 
                          className="btn-icon" 
                          onClick={() => startEditBlock(block)}
                          title="일정 수정"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button 
                          className="btn-icon btn-delete" 
                          onClick={() => deleteBlock(block.id)}
                          title="일정 삭제"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
