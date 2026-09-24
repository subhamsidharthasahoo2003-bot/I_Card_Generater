import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DropZone } from '../components/excel/DropZone';
import { ValidationErrorsModal } from '../components/excel/ValidationErrorsModal';
import { EmployeeTable } from '../components/employees/EmployeeTable';
import { PhotoUploadModal } from '../components/employees/PhotoUploadModal';
import { CardPreview } from '../components/id-card/CardPreview';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { parseExcelFile } from '../services/excelService';
import { extractPhotosFromZip, createSyntheticPortraitDataUrl } from '../services/photoService';
import { SAMPLE_EMPLOYEES_DATA } from '../data/sampleEmployees';
import { Employee, ExcelValidationError } from '../types/employee';
import {
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  FolderArchive,
  ArrowRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExcelImport: React.FC = () => {
  const {
    employees,
    setEmployees,
    applyPhotoMap,
    updateEmployeePhoto,
    companySettings,
    selectedIds
  } = useApp();
  const { showToast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ExcelValidationError[]>([]);
  const [isErrorsModalOpen, setIsErrorsModalOpen] = useState(false);
  const [lastImportStats, setLastImportStats] = useState<{
    total: number;
    valid: number;
    duplicates: number;
  } | null>(null);

  // Modals
  const [activeEmployeeForCard, setActiveEmployeeForCard] = useState<Employee | null>(null);
  const [activeEmployeeForPhoto, setActiveEmployeeForPhoto] = useState<Employee | null>(null);

  // Handle Excel upload
  const handleExcelUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const result = await parseExcelFile(file);
      setEmployees(result.employees);
      setValidationErrors(result.errors);
      setLastImportStats({
        total: result.totalRows,
        valid: result.validRows,
        duplicates: result.duplicateCount
      });

      if (result.errors.length > 0) {
        showToast(
          'warning',
          'Imported with Warnings',
          `Parsed ${result.validRows} valid rows, but found ${result.errors.length} issues.`
        );
      } else {
        showToast(
          'success',
          'Excel Parsed Successfully',
          `Imported ${result.employees.length} employee records ready for cards.`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse Excel file.';
      showToast('error', 'Import Error', msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Photo ZIP upload
  const handleZipUpload = async (file: File) => {
    if (employees.length === 0) {
      showToast(
        'warning',
        'Upload Excel First',
        'Please import the employee Excel spreadsheet before matching photos.'
      );
      return;
    }

    setIsProcessing(true);
    try {
      const { totalPhotos, photos } = await extractPhotosFromZip(file);
      const { matched: mappedCount } = applyPhotoMap(photos);

      showToast(
        'success',
        'Photos Matched Successfully',
        `Matched ${mappedCount} employee photos out of ${totalPhotos} files in the ZIP.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to read ZIP archive.';
      showToast('error', 'Photo ZIP Error', msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick 1-click demo dataset loader
  const handleLoadDemoData = () => {
    const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#4f46e5'];
    const today = new Date().toISOString().slice(0, 10);
    // default 7 days validity
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const validUntil = d.toISOString().slice(0, 10);

    const demoEmployees: Employee[] = SAMPLE_EMPLOYEES_DATA.map((raw, idx) => {
      const color = colors[idx % colors.length];
      const photoUrl = createSyntheticPortraitDataUrl(raw.Name, raw['Employee ID'], color);

      return {
        id: raw['Employee ID'],
        name: raw.Name,
        designation: raw.Designation,
        department: raw.Department,
        phone: raw.Phone,
        email: raw.Email,
        joiningDate: raw['Joining Date'],
        dob: raw.DOB,
        bloodGroup: raw['Blood Group'],
        address: raw.Address,
        photoFileName: raw.Photo,
        photoUrl: photoUrl,
        issueDate: today,
        validUntil: validUntil,
        status: 'Ready'
      };
    });

    setEmployees(demoEmployees);
    setValidationErrors([]);
    setLastImportStats({
      total: demoEmployees.length,
      valid: demoEmployees.length,
      duplicates: 0
    });

    showToast('success', 'Demo Dataset Loaded', `Loaded 6 sample employees (EMP001-EMP006) with portraits.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Import Temporary Employee Data
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Upload your Excel roster (.xlsx / .xls) and employee photos (.zip) to generate credentials.
          </p>
        </div>

        {employees.length > 0 && (
          <div className="flex items-center gap-2">
            <Link
              to="/generator"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <span>Configure Validity & Cards</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Drop Zone Component */}
      <DropZone
        onExcelSelect={handleExcelUpload}
        onZipSelect={handleZipUpload}
        onLoadSampleData={handleLoadDemoData}
        isProcessing={isProcessing}
      />

      {/* Validation Summary Banner if errors exist */}
      {validationErrors.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                {validationErrors.length} Data Validation Warnings Detected
              </h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Some rows had formatting issues or duplicate IDs. Click to view detailed report.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsErrorsModalOpen(true)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Review Issues
          </button>
        </div>
      )}

      {/* Import Stats Banner if loaded */}
      {lastImportStats && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold">
              Import Summary: {lastImportStats.valid} valid rows ready of {lastImportStats.total} total rows parsed.
            </span>
          </div>
          {lastImportStats.duplicates > 0 && (
            <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              {lastImportStats.duplicates} duplicates flagged
            </span>
          )}
        </div>
      )}

      {/* Employee Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Imported Employees</h3>
            <p className="text-xs text-slate-500">
              Verify records, link missing photos, and select badges for generation
            </p>
          </div>
        </div>

        <EmployeeTable
          onViewCard={emp => setActiveEmployeeForCard(emp)}
          onReplacePhoto={emp => setActiveEmployeeForPhoto(emp)}
        />
      </div>

      {/* Card Preview Modal */}
      {activeEmployeeForCard && (
        <Modal
          isOpen={!!activeEmployeeForCard}
          onClose={() => setActiveEmployeeForCard(null)}
          title={`Temporary Card: ${activeEmployeeForCard.name}`}
          subtitle={`ID: ${activeEmployeeForCard.id} • ${activeEmployeeForCard.designation}`}
          maxWidth="lg"
        >
          <div className="py-2">
            <CardPreview employee={activeEmployeeForCard} company={companySettings} />
          </div>
        </Modal>
      )}

      {/* Single Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={!!activeEmployeeForPhoto}
        onClose={() => setActiveEmployeeForPhoto(null)}
        employee={activeEmployeeForPhoto}
        onSavePhoto={(empId, photoUrl) => {
          updateEmployeePhoto(empId, photoUrl);
          showToast('success', 'Photo Updated', `Photo assigned to ${empId}.`);
        }}
      />

      {/* Validation Errors Modal */}
      <ValidationErrorsModal
        isOpen={isErrorsModalOpen}
        onClose={() => setIsErrorsModalOpen(false)}
        errors={validationErrors}
      />
    </div>
  );
};
