export interface Employee {
  id: string; // Employee ID e.g. EMP001
  name: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  joiningDate?: string;
  dob?: string;
  bloodGroup?: string;
  address?: string;
  photoFileName?: string; // e.g. EMP001.jpg
  photoUrl?: string; // base64 or blob URL
  issueDate: string; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  status: 'Ready' | 'Missing Photo' | 'Invalid';
  validationErrors?: string[];
  qrCodeDataUrl?: string;
}

export interface ExcelValidationError {
  row: number;
  employeeId?: string;
  field: string;
  message: string;
}

export interface ExcelImportResult {
  employees: Employee[];
  errors: ExcelValidationError[];
  totalRows: number;
  validRows: number;
  duplicateCount: number;
}
