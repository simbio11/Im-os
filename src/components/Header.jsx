import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Volume2, 
  VolumeX, 
  Download, 
  Command, 
  Headphones, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  Zap, 
  RotateCw, 
  Cloud,
  LayoutDashboard,
  CalendarDays,
  Activity,
  Bot,
  BookOpenCheck,
  Terminal,
  Key,
  Settings
} from 'lucide-react';
import { startBinauralBeats, stopBinauralBeats, startAmbientNoise, stopAmbientNoise } from '../utils/audioSynth';

export function Header({ 
  userProfile, 
  levelInfo, 
  onOpenCommandPalette, 
  onOpenObsidianModal, 
  onOpenLevelModal,
  onOpenAuthModal,
  onOpenGeminiKeyModal,
  onOpenSettingsModal,
  geminiApiKey,
  currentUser,
  activeTab,
  setActiveTab,
  isMusicPlaying,
  onToggleMusic,
  onShuffleMusic,
  currentTrack
}) {
  const [kstTime, setKstTime] = useState('');
  const [kstDate, setKstDate] = useState('');
  const [estTime, setEstTime] = useState('');
  const [isNyseOpen, setIsNyseOpen] = useState(false);

  // Dual World Clock updates
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      // KST (Seoul: UTC+9)
      const kstStr = now.toLocaleTimeString('ko-KR', { 
        timeZone: 'Asia/Seoul', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: false 
      });
      setKstTime(kstStr);

      const kstDateFormatted = now.toLocaleDateString('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
      setKstDate(kstDateFormatted);

      // EST / EDT (New York: America/New_York)
      const estStr = now.toLocaleTimeString('en-US', { 
        timeZone: 'America/New_York', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
      setEstTime(estStr);

      // Determine NYSE Market Status (9:30 AM to 4:00 PM EST, Mon-Fri)
      const estHour = parseInt(now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', hour12: false }), 10);
      const estDay = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' })).getDay();
      const isOpen = estDay >= 1 && estDay <= 5 && estHour >= 9 && estHour < 16;
      setIsNyseOpen(isOpen);
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header-container">
      {/* Top Main Navigation Bar */}
      <div className="header-top">
        <div className="header-brand">
          <div className="brand-logo-glow" style={{ background: 'var(--cyan-glow)', border: '1px solid var(--cyan-primary)' }}>
            <Zap size={20} className="text-cyan" />
          </div>
          <div>
            <div className="brand-title">
              <span>L&M</span> OS <span className="version-tag">v2.6 PROTOCOL</span>
            </div>
            <div className="brand-subtitle">Life Protocol & Macro Intelligence</div>
          </div>
        </div>

        {/* Dual Market Clocks HUD */}
        <div className="market-clocks-hud">
          <div className="clock-badge">
            <div className="flex items-center gap-1.5">
              <span className="clock-label">🇰🇷 SEOUL (KST)</span>
              <span className="text-2xs font-semibold text-cyan mono">{kstDate}</span>
            </div>
            <span className="clock-time mono">{kstTime}</span>
          </div>
          <div className="clock-badge">
            <div className="nyse-status-indicator">
              <span className={`status-dot ${isNyseOpen ? 'emerald' : 'rose'}`}></span>
              <span className="clock-label">🇺🇸 NYSE (EST)</span>
            </div>
            <span className="clock-time mono">{estTime}</span>
            <span className="nyse-tag">{isNyseOpen ? 'MARKET OPEN' : 'PRE/CLOSED'}</span>
          </div>
        </div>

        {/* User Level & XP Progress HUD (Clickable Hub) */}
        <div 
          className="user-hud-card user-hud-card-interactive"
          onClick={onOpenLevelModal}
          title="클릭하여 레벨 및 티어 프로토콜 허브 열기"
          role="button"
          tabIndex={0}
        >
          <div className="user-hud-info">
            <div className="user-tier-badge" style={{ color: levelInfo?.tier?.color || 'var(--purple-primary)' }}>
              <Zap size={13} />
              <span>{levelInfo?.tier?.name || 'Cyber Alpha'}</span>
              <span className="level-number mono">Lv.{levelInfo?.level || 14}</span>
            </div>
            <div className="streak-badge">
              <Flame size={14} className="text-amber" />
              <span className="mono font-bold">{userProfile?.streak || 12}일 연속</span>
            </div>
          </div>
          
          <div className="xp-bar-container">
            <div 
              className="xp-bar-fill" 
              style={{ width: `${levelInfo?.progressPercent || 65}%` }}
            ></div>
          </div>
          <div className="xp-text-sub mono">
            <span>{levelInfo?.currentLevelXP || 0} XP</span>
            <span>{levelInfo?.xpNeededForNext || 4000} XP ({levelInfo?.progressPercent || 0}%)</span>
          </div>
        </div>

        {/* Action Buttons: Sound, Music Theme Refresh, Command Palette, Obsidian Sync */}
        <div className="header-actions">
          <div className="music-control-group">
            <button 
              className={`btn btn-icon ${isMusicPlaying ? 'btn-sound-active' : ''}`}
              onClick={onToggleMusic}
              title={isMusicPlaying ? `재생 중: ${currentTrack?.title || 'YouTube BGM'} (일시정지)` : `YouTube BGM 배경음악 재생 (${currentTrack?.badge || 'Chill Lofi'})`}
            >
              {isMusicPlaying ? (
                <Headphones size={18} className="text-purple animate-pulse" />
              ) : (
                <Volume2 size={18} />
              )}
            </button>
            <button 
              className="btn btn-icon btn-shuffle"
              onClick={onShuffleMusic}
              title={`음악 테마 새로고침 (다음 곡/장르로 변경)\n현재: ${currentTrack?.title || 'Lofi'}`}
            >
              <RotateCw size={14} className="text-purple" />
            </button>
            <span className="current-music-tag text-xs font-bold mono">
              {currentTrack?.badge?.split(' ')[0] || '🎵'}
            </span>
          </div>

          <button 
            className="btn btn-secondary btn-sm cmd-btn"
            onClick={onOpenCommandPalette}
            title="빠른 커맨드 입력창 열기 (Ctrl+K)"
          >
            <Command size={14} />
            <span className="cmd-text">Quick Cmd</span>
            <kbd className="cmd-kbd">Ctrl+K</kbd>
          </button>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenGeminiKeyModal}
            title="Google Gemini AI API Key 설정 (무료 발급 및 연동)"
          >
            <Key size={14} className={geminiApiKey ? "text-emerald" : "text-amber"} />
            <span className="btn-obsidian-text">
              {geminiApiKey ? "Gemini AI 🟢" : "Gemini Key ⚡"}
            </span>
          </button>

          <button 
            className={`btn btn-sm ${currentUser ? 'btn-secondary' : 'btn-secondary'}`}
            onClick={onOpenAuthModal}
            title={currentUser ? `클라우드 동기화 중 (${currentUser.email || '로그인됨'})` : "PC ↔ 스마트폰 실시간 클라우드 동기화"}
          >
            <Cloud size={14} className={currentUser ? "text-emerald" : "text-purple"} />
            <span className="btn-obsidian-text">
              {currentUser ? "클라우드 🟢" : "클라우드 동기화"}
            </span>
          </button>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenSettingsModal}
            title="테마 색상 및 시스템 설정"
          >
            <Settings size={14} className="text-cyan" />
            <span className="btn-obsidian-text">설정</span>
          </button>

          <button 
            className="btn btn-primary btn-sm"
            onClick={onOpenObsidianModal}
          >
            <Download size={14} />
            <span className="btn-obsidian-text">Obsidian Sync</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs with Modern Icons */}
      <nav className="header-nav-tabs">
        <button 
          className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={15} />
          <span>통합 대시보드</span>
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <CalendarDays size={15} />
          <span>캘린더 & 일정</span>
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'life' ? 'active' : ''}`}
          onClick={() => setActiveTab('life')}
        >
          <Activity size={15} />
          <span>생활 관리 (Daily & Diet)</span>
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          <TrendingUp size={15} />
          <span>주식 & 매크로 인텔리전스</span>
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'knowledge' ? 'active' : ''}`}
          onClick={() => setActiveTab('knowledge')}
        >
          <BookOpenCheck size={15} />
          <span>PubMed & GitHub 큐레이션</span>
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'soundscape' ? 'active' : ''}`}
          onClick={() => setActiveTab('soundscape')}
        >
          <Headphones size={15} />
          <span>딥워크 포모도로 & 사운드</span>
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'rag' ? 'active' : ''}`}
          onClick={() => setActiveTab('rag')}
        >
          <Bot size={15} />
          <span>RAG 지식 질의 & AI</span>
        </button>
      </nav>
    </header>
  );
}
