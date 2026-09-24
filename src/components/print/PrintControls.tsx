import React from 'react';
import { PrintLayoutMode } from '../../types/idCard';
import {
  Printer,
  FileDown,
  Trash2,
  Eye,
  Layers,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface PrintControlsProps {
  layoutMode: PrintLayoutMode;
  onChangeLayoutMode: (mode: PrintLayoutMode) => void;
  onPrintSelected: () => void;
  onPrintAll: () => void;
  onDownloadPDF: () => void;
  onClearData: () => void;
  onTogglePreviewZoom?: () => void;
  selectedCount: number;
  totalCount: number;
  isGeneratingPDF?: boolean;
}

export const PrintControls: React.FC<PrintControlsProps> = ({
  layoutMode,
  onChangeLayoutMode,
  onPrintSelected,
  onPrintAll,
  onDownloadPDF,
  onClearData,
  selectedCount,
  totalCount,
  isGeneratingPDF = false
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 no-print print-controls">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left Side: Layout side switcher and counts */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Card Side Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => onChangeLayoutMode('both')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                layoutMode === 'both'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Front & Back Paired
            </button>
            <button
              type="button"
              onClick={() => onChangeLayoutMode('front-only')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                layoutMode === 'front-only'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Front Only
            </button>
            <button
              type="button"
              onClick={() => onChangeLayoutMode('back-only')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                layoutMode === 'back-only'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Back Only
            </button>
          </div>

          {/* Selection indicator pill */}
          <div className="text-xs text-slate-500 font-medium px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              Target: <strong className="text-slate-800">{selectedCount}</strong> selected (of {totalCount})
            </span>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
          {/* Print All Button */}
          <button
            type="button"
            onClick={onPrintAll}
            disabled={totalCount === 0 || isGeneratingPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print All ({totalCount})</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={onDownloadPDF}
            disabled={selectedCount === 0 || isGeneratingPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Exporting PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-indigo-600" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          {/* MAIN ACTION: Print Selected */}
          <button
            type="button"
            onClick={onPrintSelected}
            disabled={selectedCount === 0 || isGeneratingPDF}
            className="flex items-center gap-2 px-5 py-2 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:shadow-none cursor-pointer"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Print Selected ({selectedCount})</span>
          </button>

          {/* Clear Temporary Data Button */}
          <button
            type="button"
            onClick={onClearData}
            title="Clear all temporary employee records & generated cards"
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-200 rounded-xl transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Temporary Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
