import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  X, 
  Palette, 
  Key, 
  DollarSign, 
  Trash2, 
  Check, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { getStoredGeminiApiKey, saveStoredGeminiApiKey } from '../services/geminiService.js';

export const THEME_COLOR_PRESETS = [
  { id: 'cyan', name: 'Cyber Cyan', hex: '#00f0ff', glow: 'rgba(0, 240, 255, 0.35)', desc: '사이버 네온 시안 (기본)' },
  { id: 'purple', name: 'Neon Purple', hex: '#a855f7', glow: 'rgba(168, 85, 247, 0.35)', desc: '바이올렛 딥워크' },
  { id: 'emerald', name: 'Emerald Alpha', hex: '#10b981', glow: 'rgba(16, 185, 129, 0.35)', desc: '에메랄드 바이탈' },
  { id: 'rose', name: 'Crimson Rose', hex: '#f43f5e', glow: 'rgba(244, 63, 94, 0.35)', desc: '크림슨 포커스' },
  { id: 'amber', name: 'Electric Amber', hex: '#f59e0b', glow: 'rgba(245, 158, 11, 0.35)', desc: '골든 앰버 마켓' },
  { id: 'blue', name: 'Sapphire Blue', hex: '#3b82f6', glow: 'rgba(59, 130, 246, 0.35)', desc: '사파이어 딥블루' }
];

export function applyThemeColor(themeHex, glowRgba) {
  document.documentElement.style.setProperty('--cyan-primary', themeHex);
  document.documentElement.style.setProperty('--cyan-glow', glowRgba);
  document.documentElement.style.setProperty('--border-glow', `0 0 15px ${glowRgba}`);
  localStorage.setItem('lm_theme_color', themeHex);
  localStorage.setItem('lm_theme_glow', glowRgba);
}

export function SettingsModal({
  isOpen,
  onClose,
  userProfile = {},
  onUpdateUserProfile,
  onClearAllCalendarEvents,
  onResetAllData
}) {
  const [activeSubTab, setActiveSubTab] = useState('theme'); // 'theme', 'ai', 'profile', 'data'
  const [currentColor, setCurrentColor] = useState(() => localStorage.getItem('lm_theme_color') || '#00f0ff');
  const [apiKeyInput, setApiKeyInput] = useState(() => getStoredGeminiApiKey());
  const [saveStatus, setSaveStatus] = useState(null);

  // Profile Form
  const [income, setIncome] = useState(userProfile.monthlyIncome ?? 6500000);
  const [fixedCosts, setFixedCosts] = useState(userProfile.fixedCosts ?? 1850000);

  useEffect(() => {
    if (userProfile.monthlyIncome) setIncome(userProfile.monthlyIncome);
    if (userProfile.fixedCosts) setFixedCosts(userProfile.fixedCosts);
  }, [userProfile]);

  if (!isOpen) return null;

  const handleSelectTheme = (preset) => {
    setCurrentColor(preset.hex);
    applyThemeColor(preset.hex, preset.glow);
    setSaveStatus('✨ 테마 색상이 즉시 적용되었습니다!');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    saveStoredGeminiApiKey(trimmed);
    setSaveStatus('✨ Gemini API 키가 저장되었습니다!');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleSaveProfile = () => {
    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        ...userProfile,
        monthlyIncome: Number(income),
        fixedCosts: Number(fixedCosts)
      });
    }
    setSaveStatus('✨ 사용자 재무 정보가 업데이트되었습니다!');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header-row">
          <div className="panel-title-with-icon">
            <div className="cal-icon-glow" style={{ background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(168, 85, 247, 0.3))' }}>
              <Settings size={20} className="text-cyan" />
            </div>
            <div>
              <h4>L&M OS 시스템 설정</h4>
              <p className="text-muted text-xs">
                테마 색상, Gemini AI 엔진, 재무 프로필 및 시스템 데이터를 관리합니다.
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Sub Tabs */}
        <div className="modal-subtabs-row flex gap-2 border-b border-white/10 pb-2.5 mt-2">
          <button 
            type="button" 
            className={`btn btn-xs ${activeSubTab === 'theme' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('theme')}
          >
            <Palette size={13} />
            <span>🎨 테마 색상</span>
          </button>
          <button 
            type="button" 
            className={`btn btn-xs ${activeSubTab === 'ai' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('ai')}
          >
            <Key size={13} />
            <span>🤖 Gemini AI 키</span>
          </button>
          <button 
            type="button" 
            className={`btn btn-xs ${activeSubTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('profile')}
          >
            <DollarSign size={13} />
            <span>💵 재무 & 프로필</span>
          </button>
          <button 
            type="button" 
            className={`btn btn-xs ${activeSubTab === 'data' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('data')}
          >
            <Trash2 size={13} />
            <span>🧹 데이터 관리</span>
          </button>
        </div>

        {/* Tab 1: Theme Colors */}
        {activeSubTab === 'theme' && (
          <div className="theme-settings-pane mt-4 space-y-3">
            <h5 className="text-xs font-bold text-highlight">메인 악센트 & 네온 테마 선택</h5>
            <p className="text-2xs text-muted">선택하신 색상으로 전체 시스템의 네온 글로우, 버튼, 링크, 헤더 포인트가 즉시 변경됩니다.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
              {THEME_COLOR_PRESETS.map(preset => {
                const isSelected = currentColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`theme-color-card p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                      isSelected ? 'border-cyan bg-white/10 shadow-lg' : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                    onClick={() => handleSelectTheme(preset)}
                  >
                    <div 
                      className="w-7 h-7 rounded-full shadow-inner flex items-center justify-center shrink-0" 
                      style={{ background: preset.hex, boxShadow: `0 0 10px ${preset.glow}` }}
                    >
                      {isSelected && <Check size={14} className="text-black font-bold" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-highlight">{preset.name}</span>
                      <span className="text-2xs text-muted">{preset.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: AI Settings */}
        {activeSubTab === 'ai' && (
          <div className="ai-settings-pane mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-highlight">Google Gemini AI Engine 연동</h5>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-cyan text-xs font-bold hover:underline inline-flex items-center gap-1"
              >
                무료 API 키 발급받기 <ExternalLink size={12} />
              </a>
            </div>

            <div className="form-group">
              <label className="text-2xs text-muted font-bold">Gemini API Key</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="password"
                  className="input-text mono flex-1"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                />
                <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveApiKey}>
                  저장
                </button>
              </div>
              <span className="text-2xs text-faint block mt-1">
                * 키는 브라우저 로컬 저장소에만 안전하게 보관되며, 플로팅 AI 어시스턴트 및 RAG 지식 비서의 두뇌로 동작합니다.
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Financial & Profile Settings */}
        {activeSubTab === 'profile' && (
          <div className="profile-settings-pane mt-4 space-y-3">
            <h5 className="text-xs font-bold text-highlight">월 소득 & 고정 지출 설정</h5>
            <p className="text-2xs text-muted">투자 가용 잉여금 자동 계산 및 자산 배분 인텔리전스의 기준값입니다.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="form-group">
                <label className="text-2xs text-muted font-bold">월 총소득 (원)</label>
                <input
                  type="number"
                  className="input-text mono mt-1"
                  value={income}
                  onChange={e => setIncome(e.target.value)}
                  step="100000"
                />
                <span className="text-2xs text-cyan block mt-1">{(Number(income) / 10000).toLocaleString()} 만원</span>
              </div>

              <div className="form-group">
                <label className="text-2xs text-muted font-bold">월 고정비 (원)</label>
                <input
                  type="number"
                  className="input-text mono mt-1"
                  value={fixedCosts}
                  onChange={e => setFixedCosts(e.target.value)}
                  step="50000"
                />
                <span className="text-2xs text-rose block mt-1">{(Number(fixedCosts) / 10000).toLocaleString()} 만원</span>
              </div>
            </div>

            <button type="button" className="btn btn-primary btn-sm mt-2" onClick={handleSaveProfile}>
              재무 프로필 저장
            </button>
          </div>
        )}

        {/* Tab 4: Data Management */}
        {activeSubTab === 'data' && (
          <div className="data-settings-pane mt-4 space-y-3">
            <h5 className="text-xs font-bold text-highlight">시스템 데이터 초기화 & 관리</h5>
            <p className="text-2xs text-muted">테스트용으로 누적된 일정이나 데이터를 안전하게 초기화할 수 있습니다.</p>

            <div className="flex flex-col gap-2 mt-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                <div>
                  <span className="text-xs font-bold text-highlight block">캘린더 전체 일정 비우기</span>
                  <span className="text-2xs text-muted">등록된 모든 일정을 캘린더에서 깨끗하게 삭제합니다.</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm text-rose border-rose/30"
                  onClick={() => {
                    if (window.confirm("등록된 모든 캘린더 일정을 정말로 삭제하시겠습니까?")) {
                      if (onClearAllCalendarEvents) onClearAllCalendarEvents();
                      setSaveStatus('✨ 모든 일정이 초기화되었습니다.');
                      setTimeout(() => setSaveStatus(null), 2000);
                    }
                  }}
                >
                  <Trash2 size={13} />
                  <span>일정 비우기</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Toast */}
        {saveStatus && (
          <div className="status-alert-box success mt-4 py-2 px-3 flex items-center gap-2">
            <Sparkles size={14} className="text-emerald" />
            <span className="text-xs text-emerald font-bold">{saveStatus}</span>
          </div>
        )}

        {/* Footer */}
        <div className="modal-actions-row mt-5">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
