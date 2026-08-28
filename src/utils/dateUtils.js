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

/**
 * Korean Public Holidays Definition (Solar & Key Multi-year Lunar/Substitute)
 */
export const KOREAN_HOLIDAYS_MAP = {
  // Annual fixed solar holidays
  '01-01': '신정',
  '03-01': '삼일절',
  '05-05': '어린이날',
  '06-06': '현충일',
  '08-15': '광복절',
  '10-03': '개천절',
  '10-09': '한글날',
  '12-25': '성탄절',

  // 2024 Holidays
  '2024-02-09': '설날',
  '2024-02-10': '설날',
  '2024-02-11': '설날',
  '2024-02-12': '대체공휴일',
  '2024-04-10': '국회의원선거',
  '2024-05-06': '대체공휴일',
  '2024-05-15': '부처님오신날',
  '2024-09-16': '추석',
  '2024-09-17': '추석',
  '2024-09-18': '추석',

  // 2025 Holidays
  '2025-01-28': '설날',
  '2025-01-29': '설날',
  '2025-01-30': '설날',
  '2025-03-03': '대체공휴일',
  '2025-05-05': '어린이날/부처님오신날',
  '2025-05-06': '대체공휴일',
  '2025-10-05': '추석',
  '2025-10-06': '추석',
  '2025-10-07': '추석',
  '2025-10-08': '대체공휴일',

  // 2026 Holidays
  '2026-02-16': '설날',
  '2026-02-17': '설날',
  '2026-02-18': '설날',
  '2026-05-24': '부처님오신날',
  '2026-05-25': '대체공휴일',
  '2026-09-24': '추석',
  '2026-09-25': '추석',
  '2026-09-26': '추석',
  '2026-09-28': '대체공휴일'
};

/**
 * Returns holiday info for a date (YYYY-MM-DD)
 */
export function getHolidayInfo(dateStr) {
  if (!dateStr) return { isHoliday: false, name: '' };
  
  // Check exact YYYY-MM-DD
  if (KOREAN_HOLIDAYS_MAP[dateStr]) {
    return { isHoliday: true, name: KOREAN_HOLIDAYS_MAP[dateStr] };
  }
  
  // Check MM-DD
  const mmdd = dateStr.slice(5);
  if (KOREAN_HOLIDAYS_MAP[mmdd]) {
    return { isHoliday: true, name: KOREAN_HOLIDAYS_MAP[mmdd] };
  }

  return { isHoliday: false, name: '' };
}

/**
 * Checks if a date is a Sunday, Saturday, or Public Holiday (Red Day)
 */
export function isRedDay(dateStr) {
  if (!dateStr) return false;
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return false;
    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const day = dateObj.getDay();
    // 0 = Sunday, 6 = Saturday
    if (day === 0 || day === 6) return true;
    return getHolidayInfo(dateStr).isHoliday;
  } catch (e) {
    return false;
  }
}

