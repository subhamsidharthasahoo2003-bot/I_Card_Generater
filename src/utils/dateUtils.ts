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
 * Convert 2-digit year (e.g. "91", "04") to 4-digit year (e.g. "1991", "2004")
 */
export function expandTwoDigitYear(yyStr: string): string {
  const yy = parseInt(yyStr, 10);
  if (isNaN(yy)) return yyStr;
  // Pivot around 50:
  // 00..50 -> 2000..2050 (e.g. 04 -> 2004, 26 -> 2026)
  // 51..99 -> 1951..1999 (e.g. 91 -> 1991, 75 -> 1975, 98 -> 1998)
  const fullYear = yy <= 50 ? 2000 + yy : 1900 + yy;
  return String(fullYear);
}

/**
 * Format any date format (YYYY-MM-DD, DD/MM/YYYY, MM/DD/YY, M/D/YY, Excel serial 38606, Date object) to DD-MM-YYYY with full 4-digit year
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

  // Split by common date delimiters: hyphen, slash, dot
  const parts = cleanStr.split(/[-/.]/);

  if (parts.length === 3) {
    const p0 = parts[0].trim();
    const p1 = parts[1].trim();
    const p2 = parts[2].trim();

    const n0 = parseInt(p0, 10);
    const n1 = parseInt(p1, 10);
    const n2 = parseInt(p2, 10);

    if (!isNaN(n0) && !isNaN(n1) && !isNaN(n2)) {
      let day = '';
      let month = '';
      let year = '';

      if (p0.length === 4) {
        // YYYY-MM-DD or YYYY/MM/DD
        year = p0;
        month = String(n1).padStart(2, '0');
        day = String(n2).padStart(2, '0');
      } else {
        // Year is at the end (parts[2])
        if (p2.length === 4) {
          year = p2;
        } else if (p2.length <= 2) {
          year = expandTwoDigitYear(p2);
        } else {
          year = p2;
        }

        // Determine which of p0 and p1 is day and which is month
        if (n1 > 12 && n0 <= 12) {
          // MM/DD/YYYY or M/D/YY (e.g., 2/14/91 -> Feb 14 1991, 12/17/04 -> Dec 17 2004)
          month = String(n0).padStart(2, '0');
          day = String(n1).padStart(2, '0');
        } else if (n0 > 12 && n1 <= 12) {
          // DD/MM/YYYY or D/M/YY (e.g., 14/02/91, 24-10-2026)
          day = String(n0).padStart(2, '0');
          month = String(n1).padStart(2, '0');
        } else {
          // Both <= 12 (e.g., 05/06/1998, 05-06-2001)
          // Default to DD-MM-YYYY (standard Indian / UK format)
          day = String(n0).padStart(2, '0');
          month = String(n1).padStart(2, '0');
        }
      }

      if (day && month && year) {
        return `${day}-${month}-${year}`;
      }
    }
  }

  // Fallback: try JS Date parser
  const parsed = new Date(cleanStr);
  if (!isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}-${month}-${year}`;
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
