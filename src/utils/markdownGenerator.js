// Obsidian Daily Note (YYYY-MM-DD.md) Markdown Generator & Vault Sync Helper

export function generateObsidianDailyNote({
  date = new Date().toISOString().split('T')[0],
  userProfile,
  routines = [],
  dietLogs = [],
  runningLogs = [],
  expenses = [],
  calendarEvents = [],
  amBriefing,
  pmBriefing,
  pubmedCuration
}) {
  const completedCount = routines.filter(r => r.completed).length;
  const totalRoutines = routines.length;
  const totalDietKcal = dietLogs.reduce((acc, curr) => acc + (curr.kcal || 0), 0);
  const totalCarbs = dietLogs.reduce((acc, curr) => acc + (curr.carbs || 0), 0).toFixed(1);
  const totalProtein = dietLogs.reduce((acc, curr) => acc + (curr.protein || 0), 0).toFixed(1);
  const totalFat = dietLogs.reduce((acc, curr) => acc + (curr.fat || 0), 0).toFixed(1);

  const totalVariableExpense = expenses.filter(e => !e.isFixed).reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const availableSurplus = (userProfile.monthlyIncome || 0) - (userProfile.fixedCosts || 0) - totalVariableExpense;

  const todayRun = runningLogs.find(r => r.date === date);
  const todayCalendarEvents = calendarEvents.filter(e => e.date === date);

  let md = `---
title: "Daily Protocol & Market Briefing - ${date}"
date: ${date}
type: daily-protocol
tags: [protocol, daily-note, macro-briefing, health, finance, schedule]
tier: "${userProfile?.tier || 'Cyber Alpha'}"
level: ${userProfile?.level || 14}
routines_completed: "${completedCount}/${totalRoutines}"
schedules_count: ${todayCalendarEvents.length}
investment_surplus: ${availableSurplus}
---

# 🌌 L&M OS Executive Daily Protocol (${date})

> **"지속 가능한 일상의 루틴이 비대칭적 금융 자유와 압도적 생산성을 만든다."**
> **Current Tier**: \`${userProfile?.tier || 'Cyber Alpha'}\` (Lv.${userProfile?.level || 14}, Streak: ${userProfile?.streak || 12}일 연속)

---

## 1. 📅 오늘의 캘린더 일정 & 타임블록 (Calendar Schedules)
`;

  if (todayCalendarEvents.length > 0) {
    todayCalendarEvents.forEach(evt => {
      md += `- [${evt.completed ? 'x' : ' '}] **${evt.startTime} ~ ${evt.endTime}** | [${evt.category.toUpperCase()}] **${evt.title}** ${evt.location ? `(@ ${evt.location})` : ''}\n`;
      if (evt.notes) {
        md += `  - 💡 *메모*: ${evt.notes}\n`;
      }
    });
  } else {
    md += `*오늘 등록된 캘린더 일정이 없습니다.*\n`;
  }

  md += `\n---

## 2. 📋 데일리 루틴 체크리스트 (Routines & Protocols)
`;

  routines.forEach(r => {
    md += `- [${r.completed ? 'x' : ' '}] **${r.time}** | ${r.title} (+${r.xp} XP)\n`;
  });

  md += `\n---

## 3. 🏃 러닝 & 피트니스 트래커 (Running & Protocol)
`;

  if (todayRun) {
    md += `- **거리**: \`${todayRun.distance} km\` | **소요 시간**: \`${todayRun.durationMinutes}분\` | **페이스**: \`${todayRun.pace} /km\`\n`;
    md += `- **컨디션 점수**: \`${todayRun.conditionScore}/5\` | **피로도**: \`${todayRun.fatigueScore}/5\` | **평균 심박수**: \`${todayRun.heartRateAvg || 145} bpm\`\n`;
    md += `- **러닝 메모**: ${todayRun.notes}\n`;
  } else {
    md += `*오늘 등록된 러닝 기록이 없습니다.*\n`;
  }

  md += `\n---

## 4. 🥗 식단 & 영양 분석 (Diet & Nutrition Macros)
- **총 섭취 칼로리**: \`${totalDietKcal} kcal\`
- **탄단지 비율**: 탄수화물 \`${totalCarbs}g\` | 단백질 \`${totalProtein}g\` | 지방 \`${totalFat}g\`

### 세부 식단 기록
`;

  dietLogs.forEach(d => {
    md += `- **[${d.mealType} ${d.time || ''}]**: ${d.rawText} ➔ \`${d.kcal} kcal\` (C:${d.carbs}g / P:${d.protein}g / F:${d.fat}g)\n`;
  });

  md += `\n---

## 5. 💳 지출 관리 & 가계부 (Smart Expense & Investment Surplus)
- **당월 총 소득**: \`${(userProfile?.monthlyIncome || 0).toLocaleString()}원\`
- **고정 지출 합계**: \`${(userProfile?.fixedCosts || 0).toLocaleString()}원\`
- **누적 변동 지출**: \`${totalVariableExpense.toLocaleString()}원\`
- 🎯 **이번 달 투자 가용 잉여금**: **\`${availableSurplus.toLocaleString()}원\`** (목표 대비 달성률: ${Math.round((availableSurplus / (userProfile?.monthlyInvestmentTarget || 3000000)) * 100)}%)

### 변동 지출 내역
`;

  expenses.forEach(e => {
    md += `- **${e.date}** | [${e.category}] **${e.merchant}**: \`${e.amount.toLocaleString()}원\` (${e.paymentMethod})\n`;
  });

  md += `\n---

## 6. 📈 장전 AM 마켓 브리핑 & 매크로 인텔리전스
> **헤드라인**: ${amBriefing?.headline || '글로벌 지수 및 반도체 섹터 모멘텀 점검'}

### 핵심 브리핑 요약
`;

  (amBriefing?.summaryPoints || []).forEach(p => {
    md += `- ${p}\n`;
  });

  md += `\n---

## 7. 🌙 장후 PM 오선 브리핑 & 텔레그램 요약
${pmBriefing?.marketSummary || ''}

### 주요 텔레그램 채널 요약
`;

  (pmBriefing?.telegramSummaries || []).forEach(t => {
    md += `#### ${t.channel} (${t.time})\n${t.summary}\n\n`;
  });

  if (pubmedCuration) {
    md += `---

## 8. 🧬 PubMed 데일리 의학 논문 큐레이션
- **논문명**: [${pubmedCuration.title}](${pubmedCuration.link})
- **키워드**: \`${pubmedCuration.keyword}\` | **학술지**: \`${pubmedCuration.journal}\` (${pubmedCuration.pmid})
`;
    pubmedCuration.koreanSummary.forEach(k => {
      md += `- ${k}\n`;
    });
  }

  md += `\n\n---\n*Generated automatically by L&M OS on ${new Date().toLocaleString('ko-KR')}*\n`;

  return md;
}

// Download markdown file directly to client
export function downloadMarkdownFile(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
