import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PrintControls } from '../components/print/PrintControls';
import { A4PrintSheet } from '../components/print/A4PrintSheet';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { PrintLayoutMode } from '../types/idCard';
import { generateA4PDF } from '../services/pdfService';
import { useNavigate, Link } from 'react-router-dom';
import { Printer, FileSpreadsheet, Eye, Info, CheckCircle2 } from 'lucide-react';

export const PrintPreview: React.FC = () => {
  const {
    employees,
    selectedIds,
    toggleSelectAll,
    companySettings,
    recordPrintJob,
    clearTemporaryData,
    ensureQRCodesGenerated
  } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [layoutMode, setLayoutMode] = useState<PrintLayoutMode>('both');
  const [printScope, setPrintScope] = useState<'selected' | 'all'>('selected');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  const cardContainerRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Automatically ensure QR codes are prepared
  useEffect(() => {
    ensureQRCodesGenerated();
  }, [ensureQRCodesGenerated]);

  // Determine which employees to display on the sheet
  const activeEmployees =
    printScope === 'all'
      ? employees
      : employees.filter(e => selectedIds.has(e.id));

  // Native Print Dialog trigger
  const handleTriggerPrint = (scope: 'selected' | 'all') => {
    setPrintScope(scope);
    recordPrintJob(scope === 'all' ? employees.length : selectedIds.size);

    setTimeout(() => {
      window.print();
    }, 150);
  };

  // PDF Generation via jsPDF
  const handleDownloadPDF = async () => {
    // Filter actual valid DOM elements
    const validCardEls = cardContainerRefs.current.filter(
      (el): el is HTMLDivElement => el !== null
    );

    if (validCardEls.length === 0) {
      showToast('error', 'Export Failed', 'No rendered cards found for PDF export.');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      showToast('info', 'Generating PDF', 'Compiling high-resolution A4 printable PDF...');
      await generateA4PDF(validCardEls);
      recordPrintJob(activeEmployees.length);
      showToast('success', 'PDF Downloaded', 'Your printable A4 ID cards PDF is ready.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate PDF';
      showToast('error', 'PDF Error', msg);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleConfirmClear = () => {
    clearTemporaryData();
    showToast('info', 'Data Cleared', 'All temporary employee records have been removed.');
    navigate('/import');
  };

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileSpreadsheet className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Employee Badges to Print</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
          Import your employee Excel spreadsheet to preview and print credentials on A4 paper.
        </p>
        <div className="mt-6">
          <Link
            to="/import"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
          >
            Go to Excel Import
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Print Preview & A4 Layout
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Standard CR80 dimensions (85.6mm × 53.98mm) fitted cleanly onto A4 sheets.
          </p>
        </div>

        {/* Scope selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setPrintScope('selected')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
              printScope === 'selected'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Selected Only ({selectedIds.size})
          </button>
          <button
            type="button"
            onClick={() => setPrintScope('all')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
              printScope === 'all'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Employees ({employees.length})
          </button>
        </div>
      </div>

      {/* Print Controls Toolbar */}
      <PrintControls
        layoutMode={layoutMode}
        onChangeLayoutMode={setLayoutMode}
        onPrintSelected={() => handleTriggerPrint('selected')}
        onPrintAll={() => handleTriggerPrint('all')}
        onDownloadPDF={handleDownloadPDF}
        onClearData={() => setIsConfirmClearOpen(true)}
        selectedCount={selectedIds.size}
        totalCount={employees.length}
        isGeneratingPDF={isGeneratingPDF}
      />

      {/* Helpful Tip for Browser Print */}
      <div className="no-print p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Printing Tip:</strong> In your browser print dialog, set{' '}
            <strong className="underline">Scale: 100%</strong> (or "Actual size") and enable{' '}
            <strong className="underline">"Background graphics"</strong> for accurate colors and physical dimensions.
          </span>
        </div>
      </div>

      {/* A4 Printable Sheet Component */}
      <div className="print:m-0">
        <A4PrintSheet
          employees={activeEmployees}
          company={companySettings}
          layoutMode={layoutMode}
          cardContainerRefs={cardContainerRefs}
        />
      </div>

      {/* Clear Temporary Data Confirmation Modal */}
      <ConfirmDialog
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={handleConfirmClear}
        title="Clear Temporary Data"
        message="Are you sure you want to clear all temporary employee data and generated ID cards? This will reset all current session data and return you to Excel Import."
        confirmLabel="Clear All Data"
        cancelLabel="Cancel"
        isDestructive={true}
      />
    </div>
  );
};
