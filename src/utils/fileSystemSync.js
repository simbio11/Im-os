// Obsidian Direct File System Access & Sync Helper for L&M OS

/**
 * Directly writes markdown content to the user's local Obsidian Vault via Web File System Access API
 * @param {string} content - Markdown text content
 * @param {string} suggestedName - Default filename (e.g. '2026-08-27.md' or 'Calendar_Schedule.md')
 * @returns {Promise<{success: boolean, fileName?: string, error?: string}>}
 */
export async function saveDirectlyToObsidian(content, suggestedName = 'Daily_Schedule.md') {
  // Check if File System Access API is supported (Chrome, Edge, Opera, Desktop modern browsers)
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: suggestedName,
        types: [
          {
            description: 'Obsidian Markdown Note (*.md)',
            accept: {
              'text/markdown': ['.md'],
              'text/plain': ['.txt']
            }
          }
        ]
      });

      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();

      return {
        success: true,
        fileName: handle.name
      };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, aborted: true };
      }
      console.warn("File System Access API error, fallback to download:", err);
      // Fallback to direct download
      downloadMarkdown(suggestedName, content);
      return { success: true, fileName: suggestedName, isFallback: true };
    }
  } else {
    // Fallback for browsers that don't support showSaveFilePicker
    downloadMarkdown(suggestedName, content);
    return { success: true, fileName: suggestedName, isFallback: true };
  }
}

/**
 * Standard browser download fallback
 */
export function downloadMarkdown(filename, content) {
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

/**
 * Opens a note in Obsidian app via obsidian:// URI scheme
 */
export function openNoteInObsidianApp(vaultName = 'Simbio', fileName = '') {
  try {
    const cleanFileName = fileName.replace(/\.md$/, '');
    const uri = `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(cleanFileName)}`;
    window.location.href = uri;
  } catch (e) {
    console.warn("Could not trigger obsidian URI:", e);
  }
}

/**
 * Generates an Obsidian Dedicated Calendar Schedule Markdown Note
 */
export function generateObsidianCalendarNote(events = [], selectedDate = new Date().toISOString().split('T')[0]) {
  const dateEvents = events.filter(e => e.date === selectedDate);
  const completedEvents = dateEvents.filter(e => e.completed).length;

  let md = `---
title: "Obsidian Calendar Schedule - ${selectedDate}"
date: ${selectedDate}
type: calendar-schedule
tags: [schedule, calendar, obsidian-sync, timeblock]
total_events: ${dateEvents.length}
completed_events: ${completedEvents}
---

# 📅 Obsidian 캘린더 타임블록 스케줄 (${selectedDate})

> **동기화 시각**: \`${new Date().toLocaleString('ko-KR')}\` (L&M OS Web Sync)
> **달성률**: \`${completedEvents}/${dateEvents.length} 완료 (${dateEvents.length ? Math.round((completedEvents / dateEvents.length) * 100) : 0}%)\`

---

## ⚡ 오늘의 타임라인 (Obsidian Tasks 호환)

`;

  if (dateEvents.length === 0) {
    md += `*이 날짜에 등록된 일정이 없습니다.*\n\n`;
  } else {
    // Sort by start time
    const sorted = [...dateEvents].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    sorted.forEach(evt => {
      const timeStr = `${evt.startTime || '00:00'} ~ ${evt.endTime || '23:59'}`;
      const categoryTag = `#category/${evt.category || 'general'}`;
      const locationStr = evt.location ? `📍 ${evt.location}` : '';
      
      md += `- [${evt.completed ? 'x' : ' '}] **${timeStr}** | [${(evt.category || '일정').toUpperCase()}] **${evt.title}** ${locationStr} ${categoryTag}\n`;
      if (evt.notes) {
        md += `  - 💡 *메모*: ${evt.notes}\n`;
      }
    });
  }

  md += `\n---

## 📊 Dataview 캘린더 테이블 뷰

| 시간 | 카테고리 | 일정 제목 | 장소 | 완료 상태 |
| :--- | :--- | :--- | :--- | :---: |
`;

  if (dateEvents.length > 0) {
    dateEvents.forEach(evt => {
      md += `| ${evt.startTime} ~ ${evt.endTime} | \`${evt.category}\` | **${evt.title}** | ${evt.location || '-'} | ${evt.completed ? '✅ 완료' : '⏳ 진행중'} |\n`;
    });
  } else {
    md += `| - | - | 등록된 일정 없음 | - | - |\n`;
  }

  md += `\n---

## 🗓️ 전체 등록 일정 요약 (총 ${events.length}개)
`;

  const upcomingEvents = events.filter(e => e.date >= selectedDate).slice(0, 10);
  upcomingEvents.forEach(evt => {
    md += `- **${evt.date} (${evt.startTime})**: ${evt.title} [${evt.category}] ${evt.completed ? '✓' : ''}\n`;
  });

  md += `\n\n---\n*Created by L&M OS Executive Calendar Engine*\n`;

  return md;
}
