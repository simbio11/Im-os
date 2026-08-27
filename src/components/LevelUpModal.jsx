import React from 'react';
import { Award, Zap, Sparkles, Check, ChevronRight } from 'lucide-react';

export function LevelUpModal({ isOpen, onClose, level, tier, earnedXP }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content level-up-modal" onClick={e => e.stopPropagation()}>
        <div className="level-up-glow-ring">
          <Award size={48} className="text-cyan animate-bounce" />
        </div>

        <div className="level-up-header">
          <div className="badge badge-cyan">LEVEL UP DETECTED</div>
          <h2>축하합니다! 레벨 상승</h2>
          <p className="text-muted">
            지속적인 프로토콜 완수로 상위 운영자 티어에 진입했습니다.
          </p>
        </div>

        <div className="level-up-stats-box">
          <div className="level-badge-huge" style={{ borderColor: tier?.color || '#00f0ff' }}>
            <span className="lvl-text">LEVEL</span>
            <span className="lvl-val mono">{level}</span>
          </div>

          <div className="tier-info-box">
            <div className="tier-title" style={{ color: tier?.color || '#00f0ff' }}>
              <Zap size={16} />
              <span>{tier?.name || 'Cyber Operator'}</span>
            </div>
            <div className="tier-desc text-muted text-xs">
              데일리 루틴 및 운동 완수로 +{earnedXP || 100} XP 획득
            </div>
          </div>
        </div>

        <div className="level-up-perks">
          <div className="perk-item">
            <Check size={14} className="text-emerald" />
            <span>최대 집중 딥워크 보너스 승수 적용</span>
          </div>
          <div className="perk-item">
            <Check size={14} className="text-emerald" />
            <span>Obsidian 데일리 아카이브 프로토콜 강화</span>
          </div>
        </div>

        <button className="btn btn-primary w-full" onClick={onClose}>
          <span>프로토콜 계속하기</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
