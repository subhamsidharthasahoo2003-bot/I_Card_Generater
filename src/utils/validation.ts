import { ExcelValidationError } from '../types/employee';

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PHONE_CLEAN_REGEX = /[\s\-()]/g;

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return EMAIL_REGEX.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(PHONE_CLEAN_REGEX, '');
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Safely extracts a cell value by checking exact key, normalized key, and fallback value inspection
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function findRowValue(row: Record<string, any>, possibleKeys: string[]): string {
  if (!row) return '';

  // 1. Direct exact key match
  for (const k of possibleKeys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      return String(row[k]).trim();
    }
  }

  // 2. Normalized key match (case-insensitive, trimmed, stripped spaces and symbols)
  const rowKeys = Object.keys(row);
  for (const target of possibleKeys) {
    const normTarget = target.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const rk of rowKeys) {
      const normRk = rk.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normRk === normTarget && row[rk] !== undefined && row[rk] !== null) {
        const val = String(row[rk]).trim();
        if (val !== '') return val;
      }
    }
  }

  // 3. Substring key match (e.g. key containing "email" or "phone")
  for (const rk of rowKeys) {
    const lk = rk.toLowerCase().trim();
    for (const target of possibleKeys) {
      if (lk.includes(target.toLowerCase())) {
        if (row[rk] !== undefined && row[rk] !== null && String(row[rk]).trim() !== '') {
          return String(row[rk]).trim();
        }
      }
    }
  }

  // 4. Value-based fallback: if looking for an email, check if any cell value contains '@' and '.'!
  if (possibleKeys.some(k => k.toLowerCase().includes('email') || k.toLowerCase().includes('mail'))) {
    for (const rk of rowKeys) {
      const val = String(row[rk] || '').trim();
      if (val.includes('@') && val.includes('.') && !val.includes(' ')) {
        return val;
      }
    }
  }

  return '';
}

export function validateEmployeeRow(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: Record<string, any>,
  rowIndex: number,
  existingIds: Set<string>
): { isValid: boolean; errors: ExcelValidationError[] } {
  const errors: ExcelValidationError[] = [];

  const empId = findRowValue(row, ['Employee ID', 'EmployeeID', 'Emp ID', 'EmpID', 'ID', 'Ref', 'Reference']);
  const name = findRowValue(row, ['Name', 'Employee Name', 'Emp Name', 'Full Name']);
  const designation = findRowValue(row, ['Designation', 'Role', 'Position', 'Job Title']);
  const department = findRowValue(row, ['Department', 'Dept']);
  const phone = findRowValue(row, ['Phone', 'Mobile', 'Contact', 'Phone Number', 'Mobile Number']);
  const email = findRowValue(row, ['Email', 'Email ID', 'Email-ID', 'EmailId', 'Email Address', 'E-mail', 'Mail', 'Gmail']);

  // Required Field Checks
  if (!empId) {
    errors.push({
      row: rowIndex,
      employeeId: 'Unknown',
      field: 'Employee ID',
      message: 'Employee ID is required.'
    });
  } else if (existingIds.has(empId.toUpperCase())) {
    errors.push({
      row: rowIndex,
      employeeId: empId,
      field: 'Employee ID',
      message: `Duplicate Employee ID detected: "${empId}".`
    });
  }

  if (!name) {
    errors.push({
      row: rowIndex,
      employeeId: empId || 'Unknown',
      field: 'Name',
      message: 'Employee Name is required.'
    });
  }

  if (!designation) {
    errors.push({
      row: rowIndex,
      employeeId: empId || 'Unknown',
      field: 'Designation',
      message: 'Designation is required.'
    });
  }

  if (!department) {
    errors.push({
      row: rowIndex,
      employeeId: empId || 'Unknown',
      field: 'Department',
      message: 'Department is required.'
    });
  }

  // Format checks
  if (email && !isValidEmail(email)) {
    errors.push({
      row: rowIndex,
      employeeId: empId || 'Unknown',
      field: 'Email',
      message: `Invalid email address format: "${email}".`
    });
  }

  if (phone && !isValidPhone(phone)) {
    errors.push({
      row: rowIndex,
      employeeId: empId || 'Unknown',
      field: 'Phone',
      message: `Invalid phone number format: "${phone}". Expected 7-15 digits.`
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
