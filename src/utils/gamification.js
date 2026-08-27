// Gamification, XP, Leveling & Tier Logic for L&M OS
import confetti from 'canvas-confetti';

export const TIERS = [
  { minLevel: 1, maxLevel: 10, name: "Novice Protocol", color: "#94a3b8", badge: "BRONZE" },
  { minLevel: 11, maxLevel: 25, name: "Cyber Operator", color: "#00f0ff", badge: "CYBER" },
  { minLevel: 26, maxLevel: 50, name: "Cyber Alpha", color: "#8b5cf6", badge: "ALPHA" },
  { minLevel: 51, maxLevel: 80, name: "Macro Titan", color: "#f59e0b", badge: "TITAN" },
  { minLevel: 81, maxLevel: 999, name: "Sovereign Being", color: "#10b981", badge: "SOVEREIGN" }
];

export function getTierForLevel(level) {
  return TIERS.find(t => level >= t.minLevel && level <= t.maxLevel) || TIERS[0];
}

export function calculateLevelFromXP(totalXP) {
  // Safe parsing to prevent infinite while loop on NaN/undefined
  const safeXP = Math.max(0, Number(totalXP) || 0);
  let level = 1;
  let accumulated = 0;

  while (level < 1000) {
    const xpNeededForNext = level * 250;
    if (accumulated + xpNeededForNext > safeXP) {
      const currentLevelXP = safeXP - accumulated;
      const progressPercent = Math.min(100, Math.round((currentLevelXP / xpNeededForNext) * 100));
      return {
        level,
        currentLevelXP,
        xpNeededForNext,
        progressPercent,
        tier: getTierForLevel(level)
      };
    }
    accumulated += xpNeededForNext;
    level++;
  }

  return {
    level: 1000,
    currentLevelXP: 0,
    xpNeededForNext: 250000,
    progressPercent: 100,
    tier: getTierForLevel(1000)
  };
}

// Trigger celebratory neon confetti
export function fireLevelUpConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#10b981', '#8b5cf6', '#f59e0b']
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#00f0ff', '#38bdf8', '#818cf8']
      });
      confetti({
        particleCount: 50,
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
