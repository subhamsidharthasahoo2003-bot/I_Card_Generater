import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PrintControls } from '../components/print/PrintControls';
import { A4PrintSheet } from '../components/print/A4PrintSheet';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DownloadOneByOneModal } from '../components/print/DownloadOneByOneModal';
import { PrintOneByOneModal } from '../components/print/PrintOneByOneModal';
import { IDCardFront } from '../components/id-card/IDCardFront';
import { IDCardBack } from '../components/id-card/IDCardBack';
import { useToast } from '../components/ui/Toast';
import { PrintLayoutMode, PrintDensity } from '../types/idCard';
import { Employee } from '../types/employee';
import { generateA4PDF } from '../services/pdfService';
import { downloadSingleCardPDF, downloadCardImage } from '../services/cardExportService';
import { convertImageSrcToBase64 } from '../services/photoService';
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
  const [density, setDensity] = useState<PrintDensity>('grid');
  const [printScope, setPrintScope] = useState<'selected' | 'all'>('selected');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Dedicated offscreen single-card exporter state & refs
  const [exportingEmployee, setExportingEmployee] = useState<Employee | null>(null);
  const exportFrontRef = useRef<HTMLDivElement>(null);
  const exportBackRef = useRef<HTMLDivElement>(null);

  // One by one modals & progress state
  const [isDownloadOneByOneOpen, setIsDownloadOneByOneOpen] = useState(false);
  const [isPrintOneByOneOpen, setIsPrintOneByOneOpen] = useState(false);
  const [oneByOneStatus, setOneByOneStatus] = useState<
    'idle' | 'downloading' | 'completed' | 'cancelled' | 'error'
  >('idle');
  const [oneByOneIndex, setOneByOneIndex] = useState(0);
  const [oneByOneFormat, setOneByOneFormat] = useState<'pdf' | 'png'>('pdf');
  const [oneByOneError, setOneByOneError] = useState('');
  const cancelDownloadRef = useRef(false);

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

  // PDF Generation via jsPDF (respects current density: grid or single)
  const handleDownloadPDF = async () => {
    const validCardEls = cardContainerRefs.current.filter(
      (el): el is HTMLDivElement => el !== null
    );

    if (validCardEls.length === 0) {
      showToast('error', 'Export Failed', 'No rendered cards found for PDF export.');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      showToast(
        'info',
        'Generating PDF',
        density === 'single'
          ? 'Compiling 1-card-per-page A4 PDF...'
          : 'Compiling high-resolution A4 printable PDF...'
      );
      await generateA4PDF(validCardEls, {
        density,
        onProgress: (p) => {
          // progress tracking
        }
      });
      recordPrintJob(activeEmployees.length);
      showToast('success', 'PDF Downloaded', 'Your printable A4 ID cards PDF is ready.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate PDF';
      showToast('error', 'PDF Error', msg);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Sequential individual downloads one by one
  const handleOpenDownloadOneByOne = () => {
    if (activeEmployees.length === 0) {
      showToast('error', 'No Selection', 'Please select at least one employee card to download.');
      return;
    }
    setOneByOneStatus('idle');
    setOneByOneIndex(0);
    setOneByOneError('');
    setIsDownloadOneByOneOpen(true);
  };

  const handleStartDownloadOneByOne = async () => {
    cancelDownloadRef.current = false;
    setOneByOneStatus('downloading');
    setOneByOneIndex(0);

    try {
      for (let i = 0; i < activeEmployees.length; i++) {
        if (cancelDownloadRef.current) {
          setOneByOneStatus('cancelled');
          setExportingEmployee(null);
          return;
        }

        const emp = activeEmployees[i];
        setOneByOneIndex(i);

        // Pre-convert employee photo to Base64 to eliminate CORS/blank image issues in html2canvas
        let base64Photo = emp.photoUrl;
        if (emp.photoUrl) {
          try {
            base64Photo = await convertImageSrcToBase64(emp.photoUrl);
          } catch {
            // keep original
          }
        }

        const readyEmp = { ...emp, photoUrl: base64Photo };
        setExportingEmployee(readyEmp);

        // Wait for React to mount in the dedicated offscreen stage
        await new Promise(res => setTimeout(res, 130));

        const frontEl = exportFrontRef.current;
        const backEl = exportBackRef.current;

        const safeName = emp.name.replace(/[^a-zA-Z0-9_-]/g, '_');

        if (oneByOneFormat === 'pdf') {
          if (frontEl) {
            await downloadSingleCardPDF(
              frontEl,
              layoutMode === 'both' ? backEl : null,
              `${emp.id}_${safeName}_ID_Card.pdf`
            );
          }
        } else {
          // PNG image download
          if (layoutMode === 'both' || layoutMode === 'front-only') {
            if (frontEl) {
              await downloadCardImage(frontEl, `${emp.id}_${safeName}_Front.png`);
            }
          }
          if (layoutMode === 'both' || layoutMode === 'back-only') {
            if (backEl) {
              await downloadCardImage(backEl, `${emp.id}_${safeName}_Back.png`);
            }
          }
        }

        recordPrintJob(1);

        // Brief delay between downloads so the browser doesn't throttle multiple downloads
        await new Promise(res => setTimeout(res, 400));
      }

      setExportingEmployee(null);
      setOneByOneStatus('completed');
      showToast(
        'success',
        'Download Complete',
        `All ${activeEmployees.length} ID cards were downloaded one by one.`
      );
    } catch (err: unknown) {
      console.error('Download one by one error:', err);
      const msg = err instanceof Error ? err.message : 'Sequential download failed';
      setOneByOneError(msg);
      setOneByOneStatus('error');
      setExportingEmployee(null);
      showToast('error', 'Download Error', msg);
    }
  };

  const handleCancelDownloadOneByOne = () => {
    cancelDownloadRef.current = true;
    setOneByOneStatus('cancelled');
    setExportingEmployee(null);
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
        density={density}
        onChangeDensity={setDensity}
        onPrintSelected={() => handleTriggerPrint('selected')}
        onPrintAll={() => handleTriggerPrint('all')}
        onPrintOneByOne={() => setIsPrintOneByOneOpen(true)}
        onDownloadPDF={handleDownloadPDF}
        onDownloadOneByOne={handleOpenDownloadOneByOne}
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
            {density === 'single' && (
              <span className="ml-1 text-indigo-700 font-bold">
                (Single Card mode active: 1 badge per page)
              </span>
            )}
          </span>
        </div>
      </div>

      {/* A4 Printable Sheet Component */}
      <div className="print:m-0">
        <A4PrintSheet
          employees={activeEmployees}
          company={companySettings}
          layoutMode={layoutMode}
          density={density}
          cardContainerRefs={cardContainerRefs}
        />
      </div>

      {/* Dedicated Offscreen Export Container for 100% Crisp, Full-Fidelity Single Card Exports */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          pointerEvents: 'none',
          zIndex: -9999,
          opacity: 1
        }}
        aria-hidden="true"
      >
        {exportingEmployee && (
          <div style={{ width: '85.6mm', height: '53.98mm' }}>
            <div ref={exportFrontRef} style={{ width: '85.6mm', height: '53.98mm' }}>
              <IDCardFront employee={exportingEmployee} company={companySettings} isPrintMode={true} />
            </div>
            <div ref={exportBackRef} style={{ width: '85.6mm', height: '53.98mm' }}>
              <IDCardBack employee={exportingEmployee} company={companySettings} isPrintMode={true} />
            </div>
          </div>
        )}
      </div>

      {/* Download One by One Modal */}
      <DownloadOneByOneModal
        isOpen={isDownloadOneByOneOpen}
        onClose={() => setIsDownloadOneByOneOpen(false)}
        currentIndex={oneByOneIndex}
        totalCount={activeEmployees.length}
        currentEmployee={activeEmployees[oneByOneIndex] || null}
        status={oneByOneStatus}
        format={oneByOneFormat}
        onChangeFormat={setOneByOneFormat}
        onStart={handleStartDownloadOneByOne}
        onCancel={handleCancelDownloadOneByOne}
        errorMsg={oneByOneError}
      />

      {/* Print One by One Modal */}
      {isPrintOneByOneOpen && (
        <PrintOneByOneModal
          isOpen={isPrintOneByOneOpen}
          onClose={() => setIsPrintOneByOneOpen(false)}
          employees={activeEmployees}
          company={companySettings}
          onRecordPrint={count => recordPrintJob(count)}
        />
      )}

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
