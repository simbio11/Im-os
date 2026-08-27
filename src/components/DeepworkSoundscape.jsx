import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Zap, 
  Sparkles, 
  Flame, 
  Check, 
  Radio,
  Sliders,
  Link,
  Music,
  ExternalLink,
  Plus,
  Compass
} from 'lucide-react';
import { 
  YOUTUBE_PRESETS, 
  extractYouTubeVideoId 
} from '../data/soundPresets';

function YoutubeIcon({ size = 18, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}
import { 
  startBinauralBeats, 
  stopBinauralBeats, 
  setBinauralVolume,
  startAmbientNoise, 
  stopAmbientNoise, 
  setNoiseVolume,
  playLevelUpSound 
} from '../utils/audioSynth';

export function DeepworkSoundscape({ 
  onCompleteDeepwork, 
  isMusicPlaying, 
  onToggleMusic, 
  currentTrack, 
  onSelectTrack 
}) {
  // Timer States (Default 90 minutes = 5400s)
  const [selectedDuration, setSelectedDuration] = useState(90); // 25, 50, 90 min
  const [timeLeft, setTimeLeft] = useState(90 * 60);
  const [isActive, setIsActive] = useState(false);

  // Custom YouTube URL Input State
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [customUrlError, setCustomUrlError] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Ambient Layer States (optional sound blend)
  const [ambientRainActive, setAmbientRainActive] = useState(false);
  const [ambientRainVol, setAmbientRainVol] = useState(0.15);

  // Timer Tick
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Completed Deepwork session!
      setIsActive(false);
      playLevelUpSound();
      if (onCompleteDeepwork) {
        onCompleteDeepwork(selectedDuration);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, selectedDuration, onCompleteDeepwork]);

  const handleSelectDuration = (min) => {
    setSelectedDuration(min);
    setTimeLeft(min * 60);
    setIsActive(false);
  };

  const toggleTimer = () => {
    if (!isActive) {
      setIsActive(true);
      // Auto-start music if not playing
      if (!isMusicPlaying) {
        onToggleMusic();
      }
    } else {
      setIsActive(false);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(selectedDuration * 60);
  };

  // Handle Custom YouTube Link Submission
  const handleApplyCustomUrl = (e) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    const videoId = extractYouTubeVideoId(customUrlInput);
    if (!videoId) {
      setCustomUrlError("올바른 유튜브 링크(URL) 또는 11자리 비디오 ID 형식이 아닙니다.");
      return;
    }

    setCustomUrlError('');
    const newTrack = {
      id: `custom-${Date.now()}`,
      title: "사용자 등록 유튜브 스트림",
      channel: "Custom YouTube Audio",
      videoId: videoId,
      category: "custom",
      badge: "사용자 지정 🎵",
      badgeColor: "cyan",
      desc: customUrlInput.trim(),
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };

    onSelectTrack(newTrack);
    setCustomUrlInput('');
    setShowCustomInput(false);
  };

  // Optional Ambient Rain Toggle
  const toggleAmbientRain = () => {
    if (ambientRainActive) {
      stopAmbientNoise();
      setAmbientRainActive(false);
    } else {
      startAmbientNoise(ambientRainVol);
      setAmbientRainActive(true);
    }
  };

  const handleRainVolChange = (val) => {
    setAmbientRainVol(val);
    setNoiseVolume(val);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.round(((selectedDuration * 60 - timeLeft) / (selectedDuration * 60)) * 100);

  return (
    <div className="deepwork-soundscape-container glass-card">
      {/* 1. Header with Status */}
      <div className="panel-header">
        <div className="panel-title-with-icon">
          <Headphones size={22} className="text-cyan" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4>딥워크 포모도로 & 유튜브 스트림 사운드스케이프</h4>
              <span className="badge badge-cyan">YouTube Audio Hub</span>
              {isMusicPlaying && <span className="status-dot-pulse emerald ml-1" title="음악 재생 중"></span>}
            </div>
            <p className="text-muted text-xs mt-1">
              원하는 유튜브 음악(Lofi, 신스웨이브, 피아노 BGM) 및 맞춤 URL을 백그라운드로 연속 재생하며 몰입을 유지합니다.
            </p>
          </div>
        </div>
        <span className="badge badge-cyan">+50 XP Deepwork Reward</span>
      </div>

      <div className="soundscape-grid mt-3">
        {/* Left Column: Pomodoro Timer Visualizer */}
        <div className="timer-section">
          <div className="timer-preset-buttons">
            <button 
              className={`preset-btn ${selectedDuration === 25 ? 'active' : ''}`}
              onClick={() => handleSelectDuration(25)}
            >
              25분 스프린트
            </button>
            <button 
              className={`preset-btn ${selectedDuration === 50 ? 'active' : ''}`}
              onClick={() => handleSelectDuration(50)}
            >
              50분 몰입
            </button>
            <button 
              className={`preset-btn ${selectedDuration === 90 ? 'active' : ''}`}
              onClick={() => handleSelectDuration(90)}
            >
              ⚡ 90분 딥워크 프로토콜
            </button>
          </div>

          <div className="timer-clock-display">
            <div className="timer-ring-glow">
              <span className="timer-digits mono">{formatTime(timeLeft)}</span>
              <span className="timer-status-text text-muted text-xs">
                {isActive ? '🧠 DEEPWORK IN PROGRESS' : 'PAUSED'}
              </span>
            </div>
          </div>

          <div className="timer-progress-track">
            <div className="timer-progress-bar" style={{ width: `${progressPercent}%` }}></div>
          </div>

          <div className="timer-controls-row">
            <button 
              className={`btn btn-lg ${isActive ? 'btn-danger' : 'btn-primary'}`}
              onClick={toggleTimer}
            >
              {isActive ? <Pause size={18} /> : <Play size={18} />}
              <span>{isActive ? '일시 정지' : '딥워크 시작 (+50 XP)'}</span>
            </button>

            <button className="btn btn-secondary btn-icon" onClick={resetTimer} title="타이머 리셋">
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Currently Playing Track Quick Bar */}
          <div className="timer-current-track-banner glass-card mt-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`track-disc-icon ${isMusicPlaying ? 'spinning' : ''}`}>
                <Music size={16} className="text-cyan" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-highlight truncate">
                  {currentTrack?.title || "Lofi Girl - Beats to Relax/Study to"}
                </div>
                <span className="text-muted text-xs truncate block">{currentTrack?.channel}</span>
              </div>
            </div>

            <button 
              className={`btn btn-sm ${isMusicPlaying ? 'btn-emerald' : 'btn-secondary'}`}
              onClick={onToggleMusic}
            >
              {isMusicPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isMusicPlaying ? '재생 중' : '재생'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: YouTube Music Presets & Visualizer Hub */}
        <div className="youtube-music-hub-section glass-card">
          <div className="panel-header">
            <div className="panel-title-with-icon">
              <YoutubeIcon size={20} className="text-rose" />
              <h5 className="text-highlight">유튜브 배경음악 & 사운드 프리셋</h5>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setShowCustomInput(!showCustomInput)}
              title="내 유튜브 링크 직접 입력"
            >
              <Link size={13} />
              <span>{showCustomInput ? '닫기' : '내 유튜브 링크 추가'}</span>
            </button>
          </div>

          {/* Custom YouTube URL Form */}
          {showCustomInput && (
            <form onSubmit={handleApplyCustomUrl} className="custom-youtube-form glass-card mb-3">
              <label className="text-xs font-semibold text-cyan block mb-1">
                🔗 원하는 유튜브 영상 링크(URL) 붙여넣기:
              </label>
              <div className="input-with-button">
                <input
                  type="text"
                  className="input-text flex-1"
                  placeholder="예: https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
                  value={customUrlInput}
                  onChange={e => {
                    setCustomUrlInput(e.target.value);
                    setCustomUrlError('');
                  }}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  <Check size={14} />
                  <span>적용 & 재생</span>
                </button>
              </div>
              {customUrlError && (
                <span className="text-rose text-xs mt-1 block">{customUrlError}</span>
              )}
            </form>
          )}

          {/* Preset Tracks Grid */}
          <div className="youtube-presets-grid">
            {YOUTUBE_PRESETS.map((preset) => {
              const isSelected = currentTrack?.videoId === preset.videoId;
              return (
                <div 
                  key={preset.id}
                  className={`youtube-preset-card glass-card-interactive ${isSelected ? 'active-track' : ''}`}
                  onClick={() => onSelectTrack(preset)}
                >
                  <div className="preset-card-top">
                    <span className={`badge badge-${preset.badgeColor} text-xs font-bold`}>
                      {preset.badge}
                    </span>
                    {isSelected && (
                      <span className="badge badge-emerald text-xs">
                        {isMusicPlaying ? '▶ 재생 중' : '선택됨'}
                      </span>
                    )}
                  </div>

                  <strong className="preset-title font-bold text-sm text-highlight mt-1 line-clamp-1">
                    {preset.title}
                  </strong>
                  <p className="preset-desc text-xs text-muted mt-1 line-clamp-2">
                    {preset.desc}
                  </p>

                  <div className="preset-card-bottom mt-2">
                    <span className="preset-channel text-xs text-muted truncate">
                      {preset.channel}
                    </span>
                    <span className="preset-action text-xs text-cyan font-bold">
                      {isSelected && isMusicPlaying ? '일시정지' : '선택 및 재생 →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Live YouTube Embed Player Container */}
          <div className="live-youtube-embed-box glass-card mt-3">
            <div className="embed-header">
              <div className="flex items-center gap-2">
                <YoutubeIcon size={16} className="text-rose" />
                <span className="text-xs font-bold text-highlight truncate">
                  {currentTrack?.title || "Lofi Girl (Live Stream)"}
                </span>
              </div>
              <a 
                href={`https://www.youtube.com/watch?v=${currentTrack?.videoId || 'jfKfPfyJRdk'}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted hover-cyan flex items-center gap-1"
              >
                <span>YouTube에서 열기</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <div className="youtube-iframe-wrapper">
              <iframe
                id="deepwork-live-player"
                src={`https://www.youtube.com/embed/${currentTrack?.videoId || 'jfKfPfyJRdk'}?enablejsapi=1&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
                title="YouTube Audio Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Optional Ambient Rain Sound Layer Mixer */}
          <div className="ambient-mixer-card glass-card mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-purple" />
                <div>
                  <strong className="text-xs text-highlight">🌧️ 앰비언트 빗소리 레이어 믹싱</strong>
                  <p className="text-faint text-xs">유튜브 음악과 함께 잔잔한 빗소리 백색소음을 믹스합니다.</p>
                </div>
              </div>
              <button 
                className={`btn btn-sm ${ambientRainActive ? 'btn-emerald' : 'btn-secondary'}`}
                onClick={toggleAmbientRain}
              >
                {ambientRainActive ? '빗소리 ON' : '빗소리 OFF'}
              </button>
            </div>

            {ambientRainActive && (
              <div className="channel-slider-row mt-2">
                <Volume2 size={13} className="text-muted" />
                <input
                  type="range"
                  min="0"
                  max="0.4"
                  step="0.01"
                  value={ambientRainVol}
                  onChange={e => handleRainVolChange(parseFloat(e.target.value))}
                  className="sound-range-slider"
                />
                <span className="mono text-xs text-muted">{Math.round(ambientRainVol * 250)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
