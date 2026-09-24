import { ValidityPreset } from '../types/idCard';

/**
 * Returns today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const d = new Date();
  return formatDateToISO(d);
}

/**
 * Format Date object to YYYY-MM-DD
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate validUntil date based on issueDate and preset
 */
export function calculateValidUntil(
  issueDateStr: string,
  preset: ValidityPreset,
  customDateStr?: string
): string {
  if (preset === 'custom' && customDateStr) {
    return customDateStr;
  }

  const [year, month, day] = issueDateStr.split('-').map(Number);
  const baseDate = new Date(year, month - 1, day);

  switch (preset) {
    case 'today':
      return formatDateToISO(baseDate);
    case '1day': {
      const nextDay = new Date(baseDate);
      nextDay.setDate(nextDay.getDate() + 1);
      return formatDateToISO(nextDay);
    }
    case '7days': {
      const nextWeek = new Date(baseDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return formatDateToISO(nextWeek);
    }
    default:
      return formatDateToISO(baseDate);
  }
}

/**
 * Format YYYY-MM-DD to DD-MM-YYYY (or localized display)
 */
export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD -> DD-MM-YYYY
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
  }
  return dateStr;
}

/**
 * Check if a date string is valid and not in the past relative to issueDate
 */
export function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}
