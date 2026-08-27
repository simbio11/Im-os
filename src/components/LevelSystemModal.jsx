import React, { useState } from 'react';
import { 
  Award, 
  Zap, 
  Flame, 
  Check, 
  Lock, 
  Sparkles, 
  X, 
  ChevronRight, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  RotateCcw,
  Plus
} from 'lucide-react';
import { TIERS, fireLevelUpConfetti } from '../utils/gamification';

export function LevelSystemModal({ 
  isOpen, 
  onClose, 
  userProfile, 
  levelInfo, 
  onAwardXP,
  onResetXP
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'tiers', 'guide'

  if (!isOpen) return null;

  const handleBonusXP = (amount) => {
    onAwardXP(amount, "보너스 XP 획득");
    fireLevelUpConfetti();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content level-system-modal glass-card" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="level-modal-header">
          <div className="level-header-left">
            <div className="level-icon-glow" style={{ borderColor: levelInfo?.tier?.color || '#a855f7' }}>
              <Award size={26} style={{ color: levelInfo?.tier?.color || '#a855f7' }} />
            </div>
            <div>
              <div className="level-modal-title-row">
                <h3>오퍼레이터 레벨 & 프로토콜 티어 허브</h3>
                <span className="badge badge-purple">Gamification</span>
              </div>
              <p className="text-muted text-xs">
                루틴, 딥워크, 러닝 완수로 XP를 적립하고 상위 티어 특전을 해금하세요.
              </p>
            </div>
          </div>
          <button className="btn-icon btn-sm" onClick={onClose} title="닫기">
            <X size={16} />
          </button>
        </div>

        {/* Modal Nav Tabs */}
        <div className="level-modal-tabs">
          <button 
            className={`level-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Zap size={14} />
            <span>내 현황 & 진행도</span>
          </button>
          <button 
            className={`level-tab-btn ${activeTab === 'tiers' ? 'active' : ''}`}
            onClick={() => setActiveTab('tiers')}
          >
            <ShieldCheck size={14} />
            <span>5단계 티어 로드맵</span>
          </button>
          <button 
            className={`level-tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            <Sparkles size={14} />
            <span>XP 획득 가이드</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="level-overview-tab">
            {/* Main Stats Card */}
            <div className="level-hero-card">
              <div className="level-hero-badge" style={{ borderColor: levelInfo?.tier?.color || '#a855f7' }}>
                <span className="hero-lvl-label">LEVEL</span>
                <span className="hero-lvl-num mono">{levelInfo?.level || 1}</span>
              </div>

              <div className="level-hero-info">
                <div className="hero-tier-title" style={{ color: levelInfo?.tier?.color || '#a855f7' }}>
                  <Zap size={18} />
                  <span>{levelInfo?.tier?.name || 'Novice Protocol'}</span>
                  <span className="hero-tier-tag">{levelInfo?.tier?.badge || 'BRONZE'}</span>
                </div>
                <div className="hero-stats-row">
                  <div className="hero-stat-item">
                    <span className="stat-label">총 누적 XP</span>
                    <span className="stat-value mono">{userProfile?.xp || 0} XP</span>
                  </div>
                  <div className="hero-stat-item">
                    <span className="stat-label">연속 달성 스트릭</span>
                    <span className="stat-value mono text-amber">
                      <Flame size={14} className="inline mr-1" />
                      {userProfile?.streak || 1}일 연속
                    </span>
                  </div>
                  <div className="hero-stat-item">
                    <span className="stat-label">다음 레벨까지</span>
                    <span className="stat-value mono text-purple">
                      {levelInfo ? levelInfo.xpNeededForNext - levelInfo.currentLevelXP : 0} XP 남음
                    </span>
                  </div>
                </div>

                {/* Big XP Progress Bar */}
                <div className="hero-xp-progress-block">
                  <div className="hero-xp-bar-labels mono text-xs">
                    <span>현재 {levelInfo?.currentLevelXP || 0} XP</span>
                    <span>목표 {levelInfo?.xpNeededForNext || 250} XP ({levelInfo?.progressPercent || 0}%)</span>
                  </div>
                  <div className="hero-xp-track">
                    <div 
                      className="hero-xp-fill"
                      style={{ width: `${levelInfo?.progressPercent || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & XP Simulation Box */}
            <div className="level-quick-actions-box mt-3">
              <div className="box-title text-xs font-bold text-muted mb-2">
                ⚡ 즉시 보너스 XP 적립 & 효과 테스트
              </div>
              <div className="actions-buttons-grid">
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleBonusXP(100)}
                >
                  <Plus size={14} className="text-emerald" />
                  <span>+100 XP 보너스</span>
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleBonusXP(500)}
                >
                  <Sparkles size={14} className="text-purple" />
                  <span>+500 XP 대형 보너스</span>
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={fireLevelUpConfetti}
                >
                  🎉 축하 효과
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    if (window.confirm("경험치를 0(Level 1)으로 초기화하시겠습니까?")) {
                      onResetXP();
                    }
                  }}
                  title="경험치 0으로 초기화"
                >
                  <RotateCcw size={13} />
                  <span>0 XP 리셋</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TIERS ROADMAP */}
        {activeTab === 'tiers' && (
          <div className="level-tiers-tab">
            <div className="tiers-roadmap-list">
              {TIERS.map((tier, idx) => {
                const isCurrentTier = levelInfo?.tier?.name === tier.name;
                const isUnlocked = levelInfo?.level >= tier.minLevel;

                return (
                  <div 
                    key={idx} 
                    className={`tier-roadmap-card ${isCurrentTier ? 'current-tier' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`}
                  >
                    <div className="tier-card-left">
                      <div 
                        className="tier-badge-pill"
                        style={{ borderColor: tier.color, color: tier.color }}
                      >
                        {tier.badge}
                      </div>
                      <div>
                        <div className="tier-name-row">
                          <span className="tier-name font-bold" style={{ color: isUnlocked ? tier.color : 'inherit' }}>
                            {tier.name}
                          </span>
                          <span className="tier-level-range mono text-xs text-muted">
                            Lv.{tier.minLevel} ~ {tier.maxLevel >= 100 ? 'Lv.100' : `Lv.${tier.maxLevel}`}
                          </span>
                          <span className="badge badge-secondary text-xs mono">
                            ⏳ {tier.requiredDays}
                          </span>
                          {isCurrentTier && (
                            <span className="badge badge-purple text-xs">현재 내 위치</span>
                          )}
                        </div>
                        <div className="tier-perks-text text-xs text-muted mt-1">
                          {tier.tagline}
                        </div>
                      </div>
                    </div>

                    <div className="tier-status-icon">
                      {isUnlocked ? (
                        <Check size={18} className="text-emerald" />
                      ) : (
                        <Lock size={16} className="text-faint" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: XP GUIDE */}
        {activeTab === 'guide' && (
          <div className="level-guide-tab">
            <div className="xp-guide-grid">
              <div className="xp-guide-card">
                <div className="guide-icon-box bg-cyan-dim">
                  <Zap size={18} className="text-cyan" />
                </div>
                <div className="guide-info">
                  <div className="guide-title font-bold text-xs">🧠 딥워크 25분 완수</div>
                  <div className="guide-desc text-xs text-muted">포모도로 집중 세션 완료 시</div>
                  <div className="guide-xp text-xs mono text-purple font-bold mt-1">+50 XP</div>
                </div>
              </div>

              <div className="xp-guide-card">
                <div className="guide-icon-box bg-emerald-dim">
                  <Activity size={18} className="text-emerald" />
                </div>
                <div className="guide-info">
                  <div className="guide-title font-bold text-xs">🏃 5km 모닝 러닝 / 피트니스</div>
                  <div className="guide-desc text-xs text-muted">Zone 2 페이스 운동 기록 시</div>
                  <div className="guide-xp text-xs mono text-emerald font-bold mt-1">+60 XP</div>
                </div>
              </div>

              <div className="xp-guide-card">
                <div className="guide-icon-box bg-purple-dim">
                  <ShieldCheck size={18} className="text-purple" />
                </div>
                <div className="guide-info">
                  <div className="guide-title font-bold text-xs">⚡ 일일 루틴 프로토콜 체크</div>
                  <div className="guide-desc text-xs text-muted">개별 루틴 항목 완수 시</div>
                  <div className="guide-xp text-xs mono text-amber font-bold mt-1">+30 XP</div>
                </div>
              </div>

              <div className="xp-guide-card">
                <div className="guide-icon-box bg-amber-dim">
                  <TrendingUp size={18} className="text-amber" />
                </div>
                <div className="guide-info">
                  <div className="guide-title font-bold text-xs">📅 핵심 캘린더 일정 완수</div>
                  <div className="guide-desc text-xs text-muted">오늘의 일정 체크박스 완수 시</div>
                  <div className="guide-xp text-xs mono text-cyan font-bold mt-1">+20 XP</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="level-modal-footer">
          <button className="btn btn-primary w-full" onClick={onClose}>
            <span>확인 완료</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
