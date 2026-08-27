import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw,
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
  Compass,
  Trash2
} from 'lucide-react';
import { 
  YOUTUBE_PRESETS, 
  extractYouTubeVideoId 
} from '../data/soundPresets';
import { 
  startBinauralBeats, 
  stopBinauralBeats, 
  setBinauralVolume,
  startAmbientNoise, 
  stopAmbientNoise, 
  setNoiseVolume,
  playLevelUpSound 
} from '../utils/audioSynth';

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

  // Category Filter State
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Custom YouTube Saved Tracks
  const [customSavedTracks, setCustomSavedTracks] = useState(() => {
    try {
      const saved = localStorage.getItem('lm_custom_music_tracks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Custom YouTube URL Input State
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [customTitleInput, setCustomTitleInput] = useState('');
  const [customUrlError, setCustomUrlError] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Ambient Layer States (optional sound blend)
  const [ambientRainActive, setAmbientRainActive] = useState(false);
  const [ambientRainVol, setAmbientRainVol] = useState(0.15);

  useEffect(() => {
    localStorage.setItem('lm_custom_music_tracks', JSON.stringify(customSavedTracks));
  }, [customSavedTracks]);

  // Combine Presets + Custom
  const allTracks = [...customSavedTracks, ...YOUTUBE_PRESETS];

  // Filtered tracks
  const displayedTracks = selectedCategory === 'all' 
    ? allTracks 
    : allTracks.filter(t => t.category === selectedCategory);

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

  // Shuffle next theme
  const handleShuffleNextTheme = () => {
    const currentIndex = allTracks.findIndex(p => p.videoId === currentTrack?.videoId);
    const nextIndex = (currentIndex + 1) % allTracks.length;
    const nextTrack = allTracks[nextIndex];
    onSelectTrack(nextTrack);
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
      title: customTitleInput.trim() || "사용자 등록 유튜브 스트림",
      channel: "내 커스텀 오디오",
      videoId: videoId,
      category: "custom",
      badge: "내 링크 🔗",
      badgeColor: "purple",
      desc: customUrlInput.trim(),
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };

    setCustomSavedTracks(prev => [newTrack, ...prev]);
    onSelectTrack(newTrack);
    setCustomUrlInput('');
    setCustomTitleInput('');
    setShowCustomInput(false);
  };

  const handleDeleteCustomTrack = (id, e) => {
    e.stopPropagation();
    setCustomSavedTracks(prev => prev.filter(t => t.id !== id));
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
              <span className="badge badge-purple">YouTube Audio Hub</span>
              {isMusicPlaying && <span className="status-dot cyan ml-1" title="음악 재생 중"></span>}
            </div>
            <p className="text-muted text-xs mt-1">
              원하는 유튜브 음악(Lofi, 신스웨이브, 피아노, 지브리, 432Hz) 및 맞춤 URL을 백그라운드로 연속 재생하며 몰입을 유지합니다.
            </p>
          </div>
        </div>
        <span className="badge badge-purple">+50 XP Deepwork Reward</span>
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
                <Music size={16} className="text-purple" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-highlight truncate">
                  {currentTrack?.title || "Lofi Girl - Beats to Relax/Study to"}
                </div>
                <span className="text-muted text-xs truncate block">{currentTrack?.channel}</span>
              </div>
            </div>

            <button 
              className={`btn btn-sm ${isMusicPlaying ? 'btn-primary' : 'btn-secondary'}`}
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
              <div>
                <h5 className="text-highlight">유튜브 배경음악 & 테마 라이브러리</h5>
                <span className="text-muted text-xs">총 {allTracks.length}개 큐레이션 트랙 지원</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleShuffleNextTheme}
                title="다음 테마 음악으로 새로고침 및 즉시 전환"
              >
                <RotateCw size={13} className="text-purple" />
                <span>테마 새로고침</span>
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setShowCustomInput(!showCustomInput)}
                title="내 유튜브 링크 직접 입력"
              >
                <Link size={13} />
                <span>{showCustomInput ? '닫기' : '내 유튜브 링크 추가'}</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="music-category-pills">
            {[
              { id: 'all', label: '전체' },
              { id: 'lofi', label: '☕ 로파이' },
              { id: 'cyberpunk', label: '⚡ 신스웨이브' },
              { id: 'piano', label: '🎹 피아노·지브리' },
              { id: 'ambient', label: '🌌 앰비언트·자연' },
              { id: 'jazz', label: '🎷 재즈' },
              { id: 'binaural', label: '🧠 뇌파·432Hz' },
              { id: 'custom', label: `🔗 내 링크 (${customSavedTracks.length})` }
            ].map(cat => (
              <button
                key={cat.id}
                className={`music-cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Custom YouTube URL Form */}
          {showCustomInput && (
            <form onSubmit={handleApplyCustomUrl} className="custom-youtube-form glass-card mb-3">
              <label className="text-xs font-semibold text-purple block mb-1">
                🔗 원하는 유튜브 영상 링크(URL) 또는 제목 등록:
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  className="input-text"
                  placeholder="음악 제목 (선택 사항, 예: 내가 좋아하는 재즈 플리)"
                  value={customTitleInput}
                  onChange={e => setCustomTitleInput(e.target.value)}
                />
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
                    <span>저장 & 재생</span>
                  </button>
                </div>
              </div>
              {customUrlError && (
                <span className="text-rose text-xs mt-1 block">{customUrlError}</span>
              )}
            </form>
          )}

          {/* Preset Tracks Grid */}
          <div className="youtube-presets-grid">
            {displayedTracks.map((preset) => {
              const isSelected = currentTrack?.videoId === preset.videoId;
              return (
                <div 
                  key={preset.id}
                  className={`youtube-preset-card glass-card-interactive ${isSelected ? 'active-track' : ''}`}
                  onClick={() => onSelectTrack(preset)}
                >
                  <div className="preset-card-top">
                    <span className={`badge badge-${preset.badgeColor || 'purple'} text-xs font-bold`}>
                      {preset.badge}
                    </span>
                    <div className="flex items-center gap-1">
                      {isSelected && (
                        <span className="badge badge-emerald text-xs">
                          {isMusicPlaying ? '▶ 재생 중' : '선택됨'}
                        </span>
                      )}
                      {preset.category === 'custom' && (
                        <button 
                          className="btn-icon-micro text-faint hover-rose ml-1"
                          onClick={(e) => handleDeleteCustomTrack(preset.id, e)}
                          title="내 링크 삭제"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
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
                    <span className="preset-action text-xs text-purple font-bold">
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
                {ambientRainActive ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <span>{ambientRainActive ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {ambientRainActive && (
              <div className="rain-volume-slider-row mt-2">
                <span className="text-xs text-muted">볼륨:</span>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.02"
                  value={ambientRainVol}
                  onChange={e => handleRainVolChange(parseFloat(e.target.value))}
                  className="volume-slider flex-1"
                />
                <span className="mono text-xs text-emerald">{Math.round(ambientRainVol * 200)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
