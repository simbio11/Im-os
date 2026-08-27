import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
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
  Zap
} from 'lucide-react';
import { startBinauralBeats, stopBinauralBeats, startAmbientNoise, stopAmbientNoise } from '../utils/audioSynth';

export function Header({ 
  userProfile, 
  levelInfo, 
  onOpenCommandPalette, 
  onOpenObsidianModal, 
  activeTab,
  setActiveTab,
  isMusicPlaying,
  onToggleMusic,
  currentTrack
}) {
  const [kstTime, setKstTime] = useState('');
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

  const toggleAmbientQuick = () => {
    if (ambientPlaying) {
      stopBinauralBeats();
      stopAmbientNoise();
      setAmbientPlaying(false);
    } else {
      startAmbientNoise(0.18);
      startBinauralBeats(0.12);
      setAmbientPlaying(true);
    }
  };

  return (
    <header className="header-container">
      {/* Top Main Navigation Bar */}
      <div className="header-top">
        <div className="header-brand">
          <div className="brand-logo-glow">
            <Terminal size={22} className="text-cyan" />
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
            <span className="clock-label">🇰🇷 SEOUL (KST)</span>
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

        {/* User Level & XP Progress HUD */}
        <div className="user-hud-card">
          <div className="user-hud-info">
            <div className="user-tier-badge" style={{ color: levelInfo?.tier?.color || '#00f0ff' }}>
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

        {/* Action Buttons: Sound, Command Palette, Obsidian Sync */}
        <div className="header-actions">
          <button 
            className={`btn btn-icon ${isMusicPlaying ? 'btn-sound-active' : ''}`}
            onClick={onToggleMusic}
            title={isMusicPlaying ? `재생 중: ${currentTrack?.title || 'YouTube BGM'} (클릭 시 일시정지)` : "YouTube Lofi/BGM 배경음악 재생"}
          >
            {isMusicPlaying ? (
              <Headphones size={18} className="text-cyan animate-pulse" />
            ) : (
              <Volume2 size={18} />
            )}
          </button>

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
            className="btn btn-primary btn-sm"
            onClick={onOpenObsidianModal}
          >
            <Download size={14} />
            <span>Obsidian Sync</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="header-nav-tabs">
        <button 
          className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <TrendingUp size={16} />
          <span>통합 대시보드</span>
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <Clock size={16} />
          <span>캘린더 & 일정</span>
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'life' ? 'active' : ''}`}
          onClick={() => setActiveTab('life')}
        >
          <ShieldCheck size={16} />
          <span>생활 관리 (Daily & Diet)</span>
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          <TrendingUp size={16} />
          <span>주식 & 매크로 인텔리전스</span>
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'rag' ? 'active' : ''}`}
          onClick={() => setActiveTab('rag')}
        >
          <Sparkles size={16} />
          <span>RAG 지식 질의 & AI</span>
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'knowledge' ? 'active' : ''}`}
          onClick={() => setActiveTab('knowledge')}
        >
          <Terminal size={16} />
          <span>PubMed & GitHub 큐레이션</span>
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'soundscape' ? 'active' : ''}`}
          onClick={() => setActiveTab('soundscape')}
        >
          <Headphones size={16} />
          <span>딥워크 포모도로 & 사운드</span>
        </button>
      </nav>
    </header>
  );
}
