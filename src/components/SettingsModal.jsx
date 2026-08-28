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
  Sliders,
  CheckCircle2,
  Lock,
  Layers,
  Cpu
} from 'lucide-react';
import { getStoredGeminiApiKey, saveStoredGeminiApiKey } from '../services/geminiService.js';

export const THEME_PRESETS = [
  { 
    id: 'cyan', 
    name: 'Cyber Cyan', 
    koreanName: '사이버 틸 시안',
    bgCore: '#070b14',
    bgSurface: '#0d1527',
    bgSurfaceElevated: '#121d36',
    bgGlass: 'rgba(13, 21, 39, 0.82)',
    bgGlassCard: 'rgba(18, 29, 54, 0.68)',
    accent: '#06b6d4', 
    accentSecondary: '#38bdf8',
    glow: 'rgba(6, 182, 212, 0.22)',
    borderGlass: 'rgba(6, 182, 212, 0.2)',
    desc: '세련되고 차분한 딥 틸 & 아이스 블루' 
  },
  { 
    id: 'purple', 
    name: 'Obsidian Violet', 
    koreanName: '옵시디언 바이올렛',
    bgCore: '#0e0e15',
    bgSurface: '#14141f',
    bgSurfaceElevated: '#1b1a29',
    bgGlass: 'rgba(20, 20, 31, 0.82)',
    bgGlassCard: 'rgba(27, 26, 41, 0.68)',
    accent: '#8b5cf6', 
    accentSecondary: '#a78bfa',
    glow: 'rgba(139, 92, 246, 0.22)',
    borderGlass: 'rgba(139, 92, 246, 0.2)',
    desc: '몰입형 딥워크 & 은은한 라벤더 바이올렛' 
  },
  { 
    id: 'emerald', 
    name: 'Emerald Matrix', 
    koreanName: '에메랄드 매트릭스',
    bgCore: '#05110c',
    bgSurface: '#0a1d15',
    bgSurfaceElevated: '#0f291e',
    bgGlass: 'rgba(10, 29, 21, 0.82)',
    bgGlassCard: 'rgba(15, 41, 30, 0.68)',
    accent: '#10b981', 
    accentSecondary: '#34d399',
    glow: 'rgba(16, 185, 129, 0.22)',
    borderGlass: 'rgba(16, 185, 129, 0.2)',
    desc: '눈이 편안한 세이지 & 바이탈 에메랄드' 
  },
  { 
    id: 'rose', 
    name: 'Crimson Stealth', 
    koreanName: '크림슨 스텔스',
    bgCore: '#11070a',
    bgSurface: '#1d0c11',
    bgSurfaceElevated: '#281118',
    bgGlass: 'rgba(29, 12, 17, 0.82)',
    bgGlassCard: 'rgba(40, 17, 24, 0.68)',
    accent: '#e11d48', 
    accentSecondary: '#fb7185',
    glow: 'rgba(225, 29, 72, 0.22)',
    borderGlass: 'rgba(225, 29, 72, 0.2)',
    desc: '묵직한 카리스마 & 와인 루비 크림슨' 
  },
  { 
    id: 'amber', 
    name: 'Midnight Gold', 
    koreanName: '미드나잇 골드',
    bgCore: '#110d05',
    bgSurface: '#1c160a',
    bgSurfaceElevated: '#271f0f',
    bgGlass: 'rgba(28, 22, 10, 0.82)',
    bgGlassCard: 'rgba(39, 31, 15, 0.68)',
    accent: '#d97706', 
    accentSecondary: '#f59e0b',
    glow: 'rgba(217, 119, 6, 0.22)',
    borderGlass: 'rgba(217, 119, 6, 0.2)',
    desc: '고급스러운 샴페인 앰버 & 럭셔리 골드' 
  },
  { 
    id: 'blue', 
    name: 'Abyssal Sapphire', 
    koreanName: '어비셜 사파이어',
    bgCore: '#050b16',
    bgSurface: '#0b1424',
    bgSurfaceElevated: '#101d33',
    bgGlass: 'rgba(11, 20, 36, 0.82)',
    bgGlassCard: 'rgba(16, 29, 51, 0.68)',
    accent: '#2563eb', 
    accentSecondary: '#60a5fa',
    glow: 'rgba(37, 99, 235, 0.22)',
    borderGlass: 'rgba(37, 99, 235, 0.2)',
    desc: '깊이감 있는 심해 네이비 & 로열 사파이어' 
  }
];

export function applyFullTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty('--bg-core', theme.bgCore);
  root.style.setProperty('--bg-surface', theme.bgSurface);
  root.style.setProperty('--bg-surface-elevated', theme.bgSurfaceElevated);
  root.style.setProperty('--bg-glass', theme.bgGlass);
  root.style.setProperty('--bg-glass-card', theme.bgGlassCard);
  
  root.style.setProperty('--cyan-primary', theme.accent);
  root.style.setProperty('--cyan-glow', theme.glow);
  root.style.setProperty('--cyan-dim', theme.accentSecondary);
  
  root.style.setProperty('--purple-primary', theme.accent);
  root.style.setProperty('--purple-glow', theme.glow);
  root.style.setProperty('--purple-dim', theme.accentSecondary);
  
  root.style.setProperty('--border-glass', theme.borderGlass);
  root.style.setProperty('--border-glow', `0 0 20px ${theme.glow}`);
  
  localStorage.setItem('lm_active_theme_id', theme.id);
}

export function initializeTheme() {
  const savedId = localStorage.getItem('lm_active_theme_id') || 'cyan';
  const found = THEME_PRESETS.find(p => p.id === savedId) || THEME_PRESETS[0];
  applyFullTheme(found);
}

export function SettingsModal({
  isOpen,
  onClose,
  userProfile = {},
  onUpdateUserProfile,
  onClearAllCalendarEvents
}) {
  const [activeSubTab, setActiveSubTab] = useState('theme');
  const [activeThemeId, setActiveThemeId] = useState(() => localStorage.getItem('lm_active_theme_id') || 'cyan');
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

  const handleSelectTheme = (theme) => {
    setActiveThemeId(theme.id);
    applyFullTheme(theme);
    setSaveStatus(`✨ '${theme.name}' 풀 시스템 테마(배경+글로우)가 적용되었습니다!`);
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    saveStoredGeminiApiKey(trimmed);
    setSaveStatus('✨ Gemini API 키가 브라우저 보안 저장소에 저장되었습니다.');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleSaveProfile = () => {
    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        ...userProfile,
        monthlyIncome: Number(income),
        fixedCosts: Number(fixedCosts)
      });
    }
    setSaveStatus('✨ 월 소득 및 고정비 설정이 업데이트되었습니다.');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(24px)', backgroundColor: 'rgba(0, 0, 0, 0.78)' }}>
      <div 
        className="modal-content heavy-settings-dialog" 
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="settings-header-banner">
          <div className="flex items-center gap-3">
            <div className="settings-icon-badge">
              <Cpu size={22} className="text-cyan" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="settings-main-title">L&M OS Executive Settings</h3>
                <span className="settings-sys-tag">KERNEL v2.6</span>
              </div>
              <p className="settings-sub-title">
                전체 배경 톤 & 네온 테마, Gemini 2.0 AI 인텔리전스, 재무 매크로 프로필 관리
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="settings-close-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Heavy Navigation Switcher Tabs */}
        <div className="settings-nav-bar">
          <button 
            type="button" 
            className={`settings-tab-btn ${activeSubTab === 'theme' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('theme')}
          >
            <Palette size={15} />
            <span>🎨 배경 & 네온 테마</span>
          </button>
          <button 
            type="button" 
            className={`settings-tab-btn ${activeSubTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('ai')}
          >
            <Key size={15} />
            <span>🤖 Gemini AI 연동</span>
          </button>
          <button 
            type="button" 
            className={`settings-tab-btn ${activeSubTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('profile')}
          >
            <DollarSign size={15} />
            <span>💵 재무 & 소득 프로필</span>
          </button>
          <button 
            type="button" 
            className={`settings-tab-btn ${activeSubTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('data')}
          >
            <Trash2 size={15} />
            <span>🧹 데이터 관리</span>
          </button>
        </div>

        {/* Body Content Container */}
        <div className="settings-body-viewport">
          {/* TAB 1: Full Theme & Background Palette */}
          {activeSubTab === 'theme' && (
            <div className="settings-pane-theme animate-fadeIn">
              <div className="pane-section-header">
                <div>
                  <h4 className="pane-heading">풀 시스템 테마 & 배경 톤 선택</h4>
                  <p className="pane-desc">배경 화면, 헤더, 대시보드 카드, 네온 글로우, 버튼 색상이 일관되게 전체 전환됩니다.</p>
                </div>
              </div>

              {/* 3x2 Grid Theme Palette Selector */}
              <div className="theme-palette-grid">
                {THEME_PRESETS.map(theme => {
                  const isSelected = activeThemeId === theme.id;
                  return (
                    <div
                      key={theme.id}
                      className={`theme-card-box ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectTheme(theme)}
                      role="button"
                      tabIndex={0}
                    >
                      {/* Theme Visual Preview Header */}
                      <div 
                        className="theme-card-preview"
                        style={{ 
                          background: `linear-gradient(135deg, ${theme.bgSurface}, ${theme.bgCore})`,
                          borderColor: isSelected ? theme.accent : 'rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span 
                              className="theme-swatch-dot" 
                              style={{ background: theme.accent, boxShadow: `0 0 12px ${theme.glow}` }}
                            />
                            <span className="theme-name-text">{theme.name}</span>
                          </div>
                          {isSelected && (
                            <span className="theme-active-badge" style={{ background: theme.accent, color: '#000' }}>
                              <Check size={11} className="font-extrabold" />
                            </span>
                          )}
                        </div>

                        {/* Visual Mock Bars */}
                        <div className="theme-mini-bars">
                          <div className="mini-bar" style={{ background: theme.accent, width: '70%' }} />
                          <div className="mini-bar-sub" style={{ background: theme.accentSecondary, width: '45%' }} />
                        </div>
                      </div>

                      {/* Theme Description */}
                      <div className="theme-card-meta">
                        <span className="theme-kr-title font-bold text-highlight">{theme.koreanName}</span>
                        <p className="theme-kr-desc text-muted">{theme.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: AI Settings */}
          {activeSubTab === 'ai' && (
            <div className="settings-pane-ai animate-fadeIn">
              <div className="pane-section-header">
                <div>
                  <h4 className="pane-heading">Google Gemini 2.0 AI 연동</h4>
                  <p className="pane-desc">자연어 일정 자동 생성, 실시간 일정 질의, 식단/가계부 분석의 핵심 두뇌입니다.</p>
                </div>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-secondary btn-xs inline-flex items-center gap-1.5 text-cyan border-cyan/30"
                >
                  <span>Google AI Studio Key 발급</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="settings-input-card">
                <label className="input-card-label">Gemini API Key</label>
                <div className="flex gap-2.5 mt-2">
                  <input
                    type="password"
                    className="input-text mono flex-1"
                    placeholder="AIzaSy..."
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="btn btn-primary btn-sm px-4" 
                    onClick={handleSaveApiKey}
                  >
                    키 저장
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-2xs text-faint mt-2.5">
                  <Lock size={12} className="text-cyan" />
                  <span>입력하신 API 키는 브라우저 로컬 저장소(LocalStorage)에만 안전하게 보관됩니다.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Financial Profile */}
          {activeSubTab === 'profile' && (
            <div className="settings-pane-profile animate-fadeIn">
              <div className="pane-section-header">
                <div>
                  <h4 className="pane-heading">월 소득 & 고정 지출 프로필</h4>
                  <p className="pane-desc">투자 가용 잉여금 자동 계산 및 자산 배분 전략의 기준값으로 활용됩니다.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="settings-input-card">
                  <label className="input-card-label">월 총소득 (원)</label>
                  <input
                    type="number"
                    className="input-text mono mt-2 text-base"
                    value={income}
                    onChange={e => setIncome(e.target.value)}
                    step="100000"
                  />
                  <span className="text-xs text-cyan font-bold block mt-2">
                    {(Number(income) / 10000).toLocaleString()} 만원
                  </span>
                </div>

                <div className="settings-input-card">
                  <label className="input-card-label">월 고정비 (원)</label>
                  <input
                    type="number"
                    className="input-text mono mt-2 text-base"
                    value={fixedCosts}
                    onChange={e => setFixedCosts(e.target.value)}
                    step="50000"
                  />
                  <span className="text-xs text-rose font-bold block mt-2">
                    {(Number(fixedCosts) / 10000).toLocaleString()} 만원
                  </span>
                </div>
              </div>

              <button 
                type="button" 
                className="btn btn-primary btn-sm mt-4 px-5"
                onClick={handleSaveProfile}
              >
                재무 설정 저장
              </button>
            </div>
          )}

          {/* TAB 4: Data Management */}
          {activeSubTab === 'data' && (
            <div className="settings-pane-data animate-fadeIn">
              <div className="pane-section-header">
                <div>
                  <h4 className="pane-heading">시스템 데이터 초기화 & 리셋</h4>
                  <p className="pane-desc">테스트로 누적된 일정을 깨끗하게 비우거나 기본 상태로 리셋합니다.</p>
                </div>
              </div>

              <div className="settings-action-panel">
                <div>
                  <h5 className="text-sm font-bold text-highlight">캘린더 전체 일정 비우기</h5>
                  <p className="text-xs text-muted mt-0.5">등록된 모든 캘린더 일정을 삭제하여 초기 상태로 만듭니다.</p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm text-rose border-rose/30 hover:bg-rose/10"
                  onClick={() => {
                    if (window.confirm("등록된 모든 캘린더 일정을 정말로 삭제하시겠습니까?")) {
                      if (onClearAllCalendarEvents) onClearAllCalendarEvents();
                      setSaveStatus('✨ 모든 일정이 깨끗하게 초기화되었습니다.');
                      setTimeout(() => setSaveStatus(null), 2500);
                    }
                  }}
                >
                  <Trash2 size={14} />
                  <span>전체 일정 비우기</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Status Notification Toast */}
        {saveStatus && (
          <div className="settings-toast-banner">
            <Sparkles size={15} className="text-emerald shrink-0" />
            <span className="text-xs text-emerald font-bold">{saveStatus}</span>
          </div>
        )}

        {/* Bottom Actions Footer */}
        <div className="settings-footer-row">
          <div className="text-2xs text-faint">L&M OS Executive Kernel Config</div>
          <button type="button" className="btn btn-secondary btn-sm px-6" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
