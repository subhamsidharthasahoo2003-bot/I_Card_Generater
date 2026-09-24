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
 * Convert Excel serial date number (e.g. 38606 -> 11-09-2005)
 */
export function excelSerialToDate(serial: number): string | null {
  if (isNaN(serial) || serial <= 0 || serial > 100000) return null;
  // Excel base date: Dec 30 1899 (accounting for the Lotus 1-2-3 / Excel 1900 leap-year bug)
  const utcDays = Math.round(serial - 25569);
  const date = new Date(utcDays * 86400 * 1000);
  if (isNaN(date.getTime())) return null;

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
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

  let year = new Date().getFullYear();
  let month = new Date().getMonth();
  let day = new Date().getDate();

  if (issueDateStr) {
    const formatted = formatDisplayDate(issueDateStr);
    const parts = formatted.split('-');
    if (parts.length === 3 && parts[2].length === 4) {
      // DD-MM-YYYY
      day = Number(parts[0]);
      month = Number(parts[1]) - 1;
      year = Number(parts[2]);
    } else if (parts.length === 3 && parts[0].length === 4) {
      // YYYY-MM-DD
      year = Number(parts[0]);
      month = Number(parts[1]) - 1;
      day = Number(parts[2]);
    }
  }

  const baseDate = new Date(year, month, day);

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
 * Format any date format (YYYY-MM-DD, DD/MM/YYYY, Excel serial 38606, Date object) to DD-MM-YYYY
 */
export function formatDisplayDate(dateStr?: string | number | Date): string {
  if (!dateStr && dateStr !== 0) return 'N/A';

  if (dateStr instanceof Date) {
    if (isNaN(dateStr.getTime())) return 'N/A';
    const day = String(dateStr.getDate()).padStart(2, '0');
    const month = String(dateStr.getMonth() + 1).padStart(2, '0');
    const year = dateStr.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const str = String(dateStr).trim();
  if (!str) return 'N/A';

  // Check if it's an Excel numeric serial number (e.g. 38606 or "38606")
  const num = Number(str);
  if (!isNaN(num) && /^\d{4,6}(\.\d+)?$/.test(str) && num >= 1000 && num <= 99999) {
    const formatted = excelSerialToDate(num);
    if (formatted) return formatted;
  }

  // Handle ISO strings with T (e.g. 2026-09-24T00:00:00.000Z)
  const cleanStr = str.includes('T') ? str.split('T')[0] : str;

  // Standardize slashes to hyphens
  const normalizedStr = cleanStr.replace(/\//g, '-');

  if (normalizedStr.includes('-')) {
    const parts = normalizedStr.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD -> DD-MM-YYYY
        const day = parts[2].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        return `${day}-${month}-${parts[0]}`;
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        return `${day}-${month}-${parts[2]}`;
      }
    }
  }

  return str;
}

/**
 * Check if a date string is valid and not in the past relative to issueDate
 */
export function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}
