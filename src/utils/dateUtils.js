// L&M OS Unified Dynamic Date & Time Utilities

/**
 * Returns today's date string in local timezone format (YYYY-MM-DD)
 */
export function getTodayDateStr() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a YYYY-MM-DD date string into a friendly Korean representation
 * e.g. "2026년 8월 28일 (금)"
 */
export function formatKoreanDate(dateStr, withWeekday = true) {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    const dateObj = new Date(year, month - 1, day);
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[dateObj.getDay()];
    
    if (withWeekday) {
      return `${year}년 ${month}월 ${day}일 (${weekday})`;
    }
    return `${year}년 ${month}월 ${day}일`;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Returns a short Korean date string e.g. "8/28 (금)"
 */
export function formatShortKoreanDate(dateStr) {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    const dateObj = new Date(year, month - 1, day);
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[dateObj.getDay()];
    
    return `${month}/${day} (${weekday})`;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Checks if a given date string is today
 */
export function isDateToday(dateStr) {
  return dateStr === getTodayDateStr();
}

/**
 * Calculates date with relative offset from a base date string
 * offsetDays: +1 (tomorrow), -1 (yesterday), etc.
 */
export function getRelativeDateStr(offsetDays = 0, baseDateStr = null) {
  const base = baseDateStr ? new Date(baseDateStr) : new Date();
  base.setDate(base.getDate() + offsetDays);
  
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, '0');
  const day = String(base.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats minutes into HH:MM
 */
export function minutesToTimeStr(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Parses HH:MM into total minutes from midnight
 */
export function timeStrToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(n => parseInt(n, 10) || 0);
  return h * 60 + m;
}
