// Gamification, XP, Leveling & 3-Year Exponential Tier Logic for L&M OS
import confetti from 'canvas-confetti';

export const TIERS = [
  { 
    minLevel: 1, 
    maxLevel: 10, 
    name: "입만 산 애송이", 
    color: "#94a3b8", 
    badge: "애송이",
    tagline: "말만 번지르르하고 계획만 세우는 단계 (초기 루틴 습관화 필요)",
    requiredDays: "Day 1 ~ 14"
  },
  { 
    minLevel: 11, 
    maxLevel: 30, 
    name: "쓸만한 애송이", 
    color: "#38bdf8", 
    badge: "실행자",
    tagline: "이제 핑계 대지 않고 매일 정해진 프로토콜을 수행하기 시작한 상태",
    requiredDays: "1개월 ~ 3개월차"
  },
  { 
    minLevel: 31, 
    maxLevel: 60, 
    name: "쫌 치는 지식인", 
    color: "#a855f7", 
    badge: "지식인",
    tagline: "딥워크 몰입과 매크로 인사이트가 축적되어 실질적 성과를 내는 경지",
    requiredDays: "3개월 ~ 1년차"
  },
  { 
    minLevel: 61, 
    maxLevel: 90, 
    name: "상위 1% 포식자", 
    color: "#f59e0b", 
    badge: "포식자",
    tagline: "지식, 체력, 자본의 복리 엔진이 본격 가동되어 시장을 주도하는 위치",
    requiredDays: "1년 ~ 2.5년차"
  },
  { 
    minLevel: 91, 
    maxLevel: 100, 
    name: "자본주의 괴물", 
    color: "#10b981", 
    badge: "괴물",
    tagline: "3년(1,000일+)간의 극한 규율로 완성된 압도적 생태계 최상위 포식자",
    requiredDays: "3년차 이상 (도달 완료)"
  }
];

export function getTierForLevel(level) {
  return TIERS.find(t => level >= t.minLevel && level <= t.maxLevel) || TIERS[TIERS.length - 1];
}

// 3-Year Exponential Curve Function (Approx. 200,000+ Total XP needed for Lv 91+ '자본주의 괴물')
export function getXPNeededForLevel(level) {
  // Base 120 + exponential growth power 1.62
  return Math.round(120 + Math.pow(level, 1.62) * 22);
}

export function calculateLevelFromXP(totalXP) {
  const safeXP = Math.max(0, Number(totalXP) || 0);
  let level = 1;
  let accumulated = 0;

  while (level < 100) {
    const xpNeededForNext = getXPNeededForLevel(level);
    if (accumulated + xpNeededForNext > safeXP) {
      const currentLevelXP = safeXP - accumulated;
      const progressPercent = Math.min(100, Math.round((currentLevelXP / xpNeededForNext) * 100));
      return {
        level,
        currentLevelXP,
        xpNeededForNext,
        progressPercent,
        tier: getTierForLevel(level),
        totalAccumulatedXP: safeXP
      };
    }
    accumulated += xpNeededForNext;
    level++;
  }

  // Max Level 100 (자본주의 괴물 MAX)
  return {
    level: 100,
    currentLevelXP: 0,
    xpNeededForNext: getXPNeededForLevel(100),
    progressPercent: 100,
    tier: getTierForLevel(100),
    totalAccumulatedXP: safeXP
  };
}

// Trigger celebratory neon confetti
export function fireLevelUpConfetti() {
  try {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#10b981', '#f59e0b', '#38bdf8']
    });

    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#a855f7', '#c084fc', '#818cf8']
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10b981', '#34d399', '#f59e0b']
      });
    }, 200);
  } catch (e) {
    console.warn("Confetti effect failed:", e);
  }
}
