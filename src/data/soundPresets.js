// Curated YouTube Music & Deepwork Audio Presets for L&M OS

export const YOUTUBE_PRESETS = [
  {
    id: "lofi-girl",
    title: "Lofi Girl - Beats to Relax / Study to (24/7 Radio)",
    channel: "Lofi Girl (Official)",
    videoId: "jfKfPfyJRdk",
    category: "lofi",
    badge: "가장 인기 🔥",
    badgeColor: "emerald",
    desc: "가장 대중적이고 차분한 칠아웃 딥워크 로파이 힙합 비트",
    thumbnail: "https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg"
  },
  {
    id: "synthwave-coding",
    title: "Cyberpunk Synthwave & Retro Gaming Coding Beats",
    channel: "Lofi Geek / Synthwave Hub",
    videoId: "4xDzrJKXOOY",
    category: "cyberpunk",
    badge: "Cyber Tech ⚡",
    badgeColor: "cyan",
    desc: "엔지니어링, 코딩, 주식 매크로 분석을 위한 레트로 신스웨이브",
    thumbnail: "https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg"
  },
  {
    id: "rain-cafe-piano",
    title: "Cozy Rainy Cafe & Soft Piano Instrumental BGM",
    channel: "Cafe Music BGM channel",
    videoId: "1fueZCTYkpA",
    category: "piano",
    badge: "Acoustic Calm ☕",
    badgeColor: "amber",
    desc: "따뜻한 커피숍 빗소리와 차분한 어쿠스틱 피아노 연주",
    thumbnail: "https://img.youtube.com/vi/1fueZCTYkpA/hqdefault.jpg"
  },
  {
    id: "space-ambient",
    title: "Space Ambient - Deep Alpha Wave Cosmic Focus",
    channel: "Space Ambient",
    videoId: "WPni755-Krg",
    category: "ambient",
    badge: "Deep Alpha 🌌",
    badgeColor: "purple",
    desc: "우주적 잔향과 깊은 사색을 유도하는 앰비언트 플로우 사운드",
    thumbnail: "https://img.youtube.com/vi/WPni755-Krg/hqdefault.jpg"
  }
];

export function extractYouTubeVideoId(urlOrId) {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If it's already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex to match youtu.be, youtube.com/watch?v=, youtube.com/embed/, youtube.com/live/
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}
