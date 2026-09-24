import * as XLSX from 'xlsx';
import { Employee, ExcelImportResult, ExcelValidationError } from '../types/employee';
import { validateEmployeeRow, findRowValue } from '../utils/validation';
import { getTodayDateString, calculateValidUntil } from '../utils/dateUtils';
import { SAMPLE_EMPLOYEES_DATA } from '../data/sampleEmployees';
import { isRemotePhotoUrl, formatGoogleDriveImageUrl } from './photoService';

/**
 * Parse an Excel file (.xlsx or .xls) and validate rows
 */
export async function parseExcelFile(file: File): Promise<ExcelImportResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });

  if (workbook.SheetNames.length === 0) {
    throw new Error('The uploaded Excel workbook contains no sheets.');
  }

  // Find the sheet that contains the most rows (in case Sheet1 is blank and Sheet2 has data)
  let worksheet = workbook.Sheets[workbook.SheetNames[0]];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rawRows: Record<string, any>[] = [];

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
    if (rows.length > rawRows.length) {
      rawRows = rows;
      worksheet = ws;
    }
  }

  if (rawRows.length === 0) {
    throw new Error('The uploaded Excel workbook contains no data rows.');
  }

  const existingIds = new Set<string>();
  const allErrors: ExcelValidationError[] = [];
  const employees: Employee[] = [];
  let duplicateCount = 0;
  const today = getTodayDateString();
  const defaultValidUntil = calculateValidUntil(today, '7days');

  rawRows.forEach((row, index) => {
    const rowNumber = index + 2; // +1 for 0-index, +1 for header row
    const empId = findRowValue(row, ['Employee ID', 'EmployeeID', 'Emp ID', 'EmpID', 'ID', 'Ref', 'Reference']) || `TEMP_${index + 1}`;
    const normalizedEmpId = empId.toUpperCase();

    // Check for duplicate in file
    const isDuplicate = existingIds.has(normalizedEmpId);
    if (isDuplicate) {
      duplicateCount++;
    }

    const { isValid, errors } = validateEmployeeRow(row, rowNumber, existingIds);

    if (empId) {
      existingIds.add(normalizedEmpId);
    }

    allErrors.push(...errors);

    let photoVal = findRowValue(row, ['Photo', 'Photo Name', 'Image', 'Drive Link', 'Photo URL', 'Photo Link', 'Picture', 'Avatar']);
    // Fallback: check if any cell in this row has a drive.google.com link
    if (!photoVal) {
      for (const val of Object.values(row)) {
        const strVal = String(val || '').trim();
        if (strVal.includes('drive.google.com') || (strVal.startsWith('http') && (strVal.includes('jpg') || strVal.includes('png') || strVal.includes('image')))) {
          photoVal = strVal;
          break;
        }
      }
    }

    const isDriveOrWebPhoto = isRemotePhotoUrl(photoVal);
    const resolvedPhotoUrl = isDriveOrWebPhoto ? formatGoogleDriveImageUrl(photoVal) : undefined;

    const dobVal = findRowValue(row, ['DOB', 'Date of Birth', 'Birth Date', 'BirthDate', 'D.O.B']);
    const emailVal = findRowValue(row, ['Email', 'Email ID', 'Email-ID', 'EmailId', 'Email Address', 'E-mail', 'Mail', 'Gmail']);
    const phoneVal = findRowValue(row, ['Phone', 'Mobile', 'Contact', 'Phone Number', 'Mobile Number']);
    const nameVal = findRowValue(row, ['Name', 'Employee Name', 'Emp Name', 'Full Name']);
    const designationVal = findRowValue(row, ['Designation', 'Role', 'Position', 'Job Title']);
    const departmentVal = findRowValue(row, ['Department', 'Dept']);
    const joiningDateVal = findRowValue(row, ['Joining Date', 'JoiningDate', 'Date of Joining']);
    const bloodGroupVal = findRowValue(row, ['Blood Group', 'BloodGroup', 'Blood', 'BG']);
    const addressVal = findRowValue(row, ['Address', 'Location', 'City']);

    const employee: Employee = {
      id: empId,
      name: nameVal,
      designation: designationVal,
      department: departmentVal,
      phone: phoneVal,
      email: emailVal,
      joiningDate: joiningDateVal || today,
      dob: dobVal || undefined,
      bloodGroup: bloodGroupVal,
      address: addressVal,
      photoFileName: isDriveOrWebPhoto ? 'Drive Photo' : (photoVal || `${empId}.jpg`),
      photoUrl: resolvedPhotoUrl,
      issueDate: today,
      validUntil: defaultValidUntil,
      status: !isValid ? 'Invalid' : (resolvedPhotoUrl ? 'Ready' : 'Missing Photo'),
      validationErrors: errors.map(e => e.message)
    };

    employees.push(employee);
  });

  return {
    employees,
    errors: allErrors,
    totalRows: rawRows.length,
    validRows: employees.filter(e => e.status !== 'Invalid').length,
    duplicateCount
  };
}

/**
 * Generate and trigger download of the sample Excel file
 */
export function downloadSampleExcel(): void {
  const worksheet = XLSX.utils.json_to_sheet(SAMPLE_EMPLOYEES_DATA);
  
  // Set nice column widths
  worksheet['!cols'] = [
    { wch: 14 }, // Employee ID
    { wch: 18 }, // Name
    { wch: 22 }, // Designation
    { wch: 18 }, // Department
    { wch: 15 }, // Phone
    { wch: 25 }, // Email
    { wch: 14 }, // Joining Date
    { wch: 14 }, // DOB
    { wch: 12 }, // Blood Group
    { wch: 24 }, // Address
    { wch: 15 }, // Photo
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

  XLSX.writeFile(workbook, 'sample_temporary_employees.xlsx');
}
