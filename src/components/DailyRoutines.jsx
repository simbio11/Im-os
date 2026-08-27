import React, { useState } from 'react';
import { 
  CheckCircle2, Circle, Clock, Plus, Flame, Zap, Calendar,
  FileText, CheckSquare, Trash2, Edit3, Sparkles, X, Save,
  Briefcase, Sun, BookOpen, HeartPulse, Check
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

const AI_SCHEDULE_PRESETS = [
  {
    id: 'workday',
    title: '💼 평일 집중 근무일',
    desc: '딥워크 2회(오전/오후)와 집중 업무, 규칙적인 식사 및 운동 루틴',
    icon: Briefcase,
    color: 'purple',
    accentClass: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
    items: [
      { time: '06:30', event: '기상 & 미온수 수분 보충 (500ml)', category: 'fitness' },
      { time: '07:00', event: '아침 스트레칭 & 명상 10분', category: 'night' },
      { time: '08:00', event: '건강식 아침 식사 (단백질/그릭요거트)', category: 'meal' },
      { time: '09:00', event: '1차 딥워크: 핵심 프로젝트 집중 (90분)', category: 'productivity' },
      { time: '10:30', event: '가벼운 산책 & 수분 보충', category: 'fitness' },
      { time: '12:00', event: '점심 식사 & 15분 햇볕 산책', category: 'meal' },
      { time: '13:00', event: '업무 관련 리서치 & 지식 습득', category: 'study' },
      { time: '14:00', event: '2차 딥워크: AI 개발 및 리서치 (90분)', category: 'productivity' },
      { time: '17:00', event: '피트니스 운동 & 체력 단련 (45분)', category: 'fitness' },
      { time: '18:30', event: '저녁 식사', category: 'meal' },
      { time: '20:00', event: '개인 여가 시간 & 릴랙스', category: 'leisure' },
      { time: '22:00', event: '내일 일정 계획 & Obsidian 일기', category: 'study' },
      { time: '22:30', event: '스크린 오프 & 수면 준비', category: 'night' },
    ]
  },
  {
    id: 'weekend',
    title: '🌴 주말 & 공휴일 재충전',
    desc: '여유로운 수면, 브런치, 야외 활동, 여가생활과 저녁 모임 루틴',
    icon: Sun,
    color: 'emerald',
    accentClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    items: [
      { time: '08:00', event: '여유로운 기상 & 가벼운 스트레칭', category: 'night' },
      { time: '09:30', event: '브런치 & 모닝 커피 타임', category: 'meal' },
      { time: '11:00', event: '야외 산책 / 가벼운 조깅 (자연 힐링)', category: 'fitness' },
      { time: '13:00', event: '카페 여유 & 관심분야 독서', category: 'study' },
      { time: '15:00', event: '취미 생활 & 엔터테인먼트 여가', category: 'leisure' },
      { time: '18:00', event: '친구 / 가족과의 저녁 식사 & 약속', category: 'appointment' },
      { time: '21:00', event: '홈케어 & 음악 감상 릴랙스', category: 'leisure' },
      { time: '23:00', event: '편안한 숙면 준비', category: 'night' },
    ]
  },
  {
    id: 'study_day',
    title: '🔥 자기계발 & 학습 몰입일',
    desc: '전공/시험/자격증 공부, 사이드 프로젝트, 지식 아카이빙 집중 루틴',
    icon: BookOpen,
    color: 'cyan',
    accentClass: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
    items: [
      { time: '07:00', event: '기상 & 모닝 루틴', category: 'fitness' },
      { time: '08:00', event: '두뇌 활성화 아침 식사', category: 'meal' },
      { time: '09:00', event: '1차 학습: 전문 서적 & 핵심 이론 (120분)', category: 'study' },
      { time: '11:30', event: '눈 휴식 & 전신 스트레칭', category: 'fitness' },
      { time: '12:30', event: '점심 식사 & 산책', category: 'meal' },
      { time: '14:00', event: '2차 몰입: 실전 프로젝트 & 문제 해결 (120분)', category: 'productivity' },
      { time: '16:30', event: '유산소 운동 세션 (30분)', category: 'fitness' },
      { time: '18:30', event: '저녁 식사', category: 'meal' },
      { time: '20:00', event: '온라인 강의 수강 & 노트 정리', category: 'study' },
      { time: '22:00', event: '하루 학습 요약 & Obsidian 지식 정리', category: 'study' },
      { time: '22:30', event: '수면 준비', category: 'night' },
    ]
  },
  {
    id: 'wellness',
    title: '🌿 웰니스 & 힐링 데이',
    desc: '신체 회복, 사우나, 클린 식단, 멘탈 케어와 충분한 수면 중심 루틴',
    icon: HeartPulse,
    color: 'teal',
    accentClass: 'border-teal-500/40 bg-teal-500/10 text-teal-400',
    items: [
      { time: '07:30', event: '자연 채광 기상 & 따뜻한 차 한 잔', category: 'night' },
      { time: '08:30', event: '가벼운 샐러드/클린 푸드 아침 식사', category: 'meal' },
      { time: '10:00', event: '야외 등산 / 러닝 / 라이딩 (유산소)', category: 'fitness' },
      { time: '12:30', event: '영양 균형 점심 식사', category: 'meal' },
      { time: '14:00', event: '사우나 / 반신욕 신체 회복 힐링', category: 'fitness' },
      { time: '16:30', event: '조용한 카페 음악 감상 & 사색', category: 'leisure' },
      { time: '18:30', event: '가벼운 저녁 식사', category: 'meal' },
      { time: '20:00', event: '폼롤러 마사지 & 힐링 명상', category: 'night' },
      { time: '22:00', event: '스크린 완전 오프 & 조기 취침', category: 'night' },
    ]
  }
];

export function DailyRoutines({ 
  routines = [], 
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
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [editingBlock, setEditingBlock] = useState(null);
  const [editBlockData, setEditBlockData] = useState({});
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [newBlock, setNewBlock] = useState({ time: '10:00', event: '', category: 'productivity' });
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState('workday');

  const selectedPreset = AI_SCHEDULE_PRESETS.find(p => p.id === selectedPresetId) || AI_SCHEDULE_PRESETS[0];

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

  const applySelectedAiTemplate = () => {
    saveTimeblocks(selectedPreset.items.map((t, i) => ({ ...t, id: `ai-${selectedPreset.id}-${i}` })));
    setIsAiModalOpen(false);
  };

  const safeRoutines = Array.isArray(routines) ? routines : [];
  const completedCount = safeRoutines.filter(r => r.completed).length;
  const totalCount = safeRoutines.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalEarnedXP = safeRoutines.filter(r => r.completed).reduce((acc, r) => acc + (r.xp || 0), 0);

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
            {safeRoutines.length === 0 ? (
              <div className="empty-state-card flex flex-col items-center justify-center p-8 text-center">
                <CheckSquare size={36} className="text-muted/50 mb-2" />
                <p className="text-muted text-xs font-medium">등록된 데일리 루틴이 없습니다.</p>
                <p className="text-muted/60 text-2xs mt-1">상단 [+ 루틴 추가] 버튼을 눌러 하루 프로토콜을 등록해보세요.</p>
              </div>
            ) : (
              safeRoutines.map(routine => {
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
              })
            )}
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
                className="btn btn-sm btn-primary glowing-btn"
                onClick={() => setIsAiModalOpen(true)}
                title="상황별 AI 맞춤 하루 스케줄 추천"
              >
                <Sparkles size={13} />
                <span>AI 상황별 추천</span>
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

          {/* Timeline Nodes or Clean Empty State */}
          <div className="timeblock-timeline">
            {timeblocks.length === 0 ? (
              <div className="empty-state-card flex flex-col items-center justify-center p-8 text-center">
                <Calendar size={36} className="text-muted/50 mb-2" />
                <p className="text-muted text-xs font-medium">등록된 24h 타임블록이 없습니다.</p>
                <p className="text-muted/60 text-2xs mt-1 mb-3">상황에 맞는 최적 하루 스케줄을 AI 추천으로 바로 완성해보세요.</p>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsAiModalOpen(true)}
                >
                  <Sparkles size={13} />
                  <span>AI 추천 스케줄 둘러보기</span>
                </button>
              </div>
            ) : (
              timeblocks.map(block => {
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
              })
            )}
          </div>
        </div>
      </div>

      {/* 🌟 ULTRA-SLEEK GLASS MODAL FOR AI SCHEDULE PRESETS */}
      {isAiModalOpen && (
        <div className="modal-backdrop-blur" onClick={() => setIsAiModalOpen(false)}>
          <div className="ai-schedule-modal-card glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-top-bar flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="modal-icon-badge bg-purple-500/20 text-purple-400 p-2 rounded-lg">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-highlight">✨ AI 상황별 최적 하루 스케줄 추천</h4>
                  <p className="text-muted text-xs">오늘의 상황에 알맞은 프리셋을 선택하고 한 번에 적용하세요.</p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setIsAiModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* 4 Selectable Preset Cards */}
            <div className="preset-cards-grid grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
              {AI_SCHEDULE_PRESETS.map(preset => {
                const isSelected = selectedPresetId === preset.id;
                const IconComponent = preset.icon;

                return (
                  <div
                    key={preset.id}
                    className={`preset-select-card glass-card p-3 cursor-pointer transition-all ${
                      isSelected 
                        ? `active-preset-card border-${preset.color}-500/60 shadow-lg shadow-${preset.color}-500/10` 
                        : 'hover:border-white/20'
                    }`}
                    onClick={() => setSelectedPresetId(preset.id)}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md bg-${preset.color}-500/20 text-${preset.color}-400`}>
                          <IconComponent size={16} />
                        </div>
                        <span className="font-bold text-xs text-highlight">{preset.title}</span>
                      </div>
                      {isSelected && (
                        <div className="select-check-badge">
                          <Check size={13} />
                        </div>
                      )}
                    </div>
                    <p className="text-muted text-2xs leading-relaxed">{preset.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Preview of Selected Preset Items */}
            <div className="preset-preview-container mt-4 p-3 bg-black/40 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan flex items-center gap-1">
                  <span>{selectedPreset.title} 타임라인 미리보기</span>
                  <span className="badge badge-cyan text-2xs">{selectedPreset.items.length}개 블록</span>
                </span>
                <span className="text-2xs text-muted">선택 시 즉시 반영</span>
              </div>

              <div className="ai-modal-preview-list max-h-48 overflow-y-auto pr-1.5 space-y-1.5">
                {selectedPreset.items.map((t, i) => {
                  const cat = getCatById(t.category);
                  return (
                    <div key={i} className="preview-schedule-row flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="mono text-muted text-2xs w-12 font-bold">{t.time}</span>
                      <span className="text-highlight truncate flex-1 px-2">{cat.emoji} {t.event}</span>
                      <span className={`badge badge-${cat.color} text-2xs`}>{cat.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer-actions flex justify-end gap-2.5 mt-5 pt-3 border-t border-white/10">
              <button className="btn btn-secondary" onClick={() => setIsAiModalOpen(false)}>
                닫기
              </button>
              <button 
                className="btn btn-primary px-5 font-bold glowing-btn" 
                onClick={applySelectedAiTemplate}
              >
                <Sparkles size={15} />
                <span>{selectedPreset.title} 전체 적용하기</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
