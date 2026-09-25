import React from 'react';
import { PrintLayoutMode, PrintDensity } from '../../types/idCard';
import {
  Printer,
  FileDown,
  Trash2,
  Download,
  Layers,
  Sparkles,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';

interface PrintControlsProps {
  layoutMode: PrintLayoutMode;
  onChangeLayoutMode: (mode: PrintLayoutMode) => void;
  density: PrintDensity;
  onChangeDensity: (density: PrintDensity) => void;
  onPrintSelected: () => void;
  onPrintAll: () => void;
  onPrintOneByOne: () => void;
  onDownloadPDF: () => void;
  onDownloadOneByOne: () => void;
  onClearData: () => void;
  selectedCount: number;
  totalCount: number;
  isGeneratingPDF?: boolean;
}

export const PrintControls: React.FC<PrintControlsProps> = ({
  layoutMode,
  onChangeLayoutMode,
  density,
  onChangeDensity,
  onPrintSelected,
  onPrintAll,
  onPrintOneByOne,
  onDownloadPDF,
  onDownloadOneByOne,
  onClearData,
  selectedCount,
  totalCount,
  isGeneratingPDF = false
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 no-print print-controls space-y-3">
      {/* Top Toolbar Row: Layout & Density Selectors */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Card Side Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 hidden sm:inline">
              Sides:
            </span>
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

          {/* Sheet Density Toggle: 8 Cards Grid vs 1 Card per Page */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 hidden sm:inline">
              Layout:
            </span>
            <button
              type="button"
              onClick={() => onChangeDensity('grid')}
              title="8 cards per A4 page in 2x4 grid"
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                density === 'grid'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              8 Cards / Sheet (Grid)
            </button>
            <button
              type="button"
              onClick={() => onChangeDensity('single')}
              title="1 card per sheet (One by One layout for printing/PDF)"
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                density === 'single'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>1 Card / Page (One by One)</span>
              <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-md text-[9px] font-extrabold uppercase">
                1 by 1
              </span>
            </button>
          </div>
        </div>

        {/* Selection stats pill */}
        <div className="text-xs text-slate-600 font-medium px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>
            Target: <strong className="text-slate-900 font-bold">{selectedCount}</strong> selected (of {totalCount})
          </span>
        </div>
      </div>

      {/* Bottom Toolbar Row: Action Buttons */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-1">
        {/* Left quick helper text */}
        <div className="text-xs text-slate-500 hidden md:flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            {density === 'single'
              ? 'Single Card Mode: Each badge is rendered on its own separate page.'
              : 'Grid Mode: 8 badges formatted per A4 page.'}
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
          {/* Download One by One (Individual files) */}
          <button
            type="button"
            onClick={onDownloadOneByOne}
            disabled={selectedCount === 0 || isGeneratingPDF}
            title="Download each employee ID card as a separate file one by one"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download 1-by-1 ({selectedCount})</span>
          </button>

          {/* Download PDF (A4 Sheet according to current density) */}
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
                <span>Download PDF {density === 'single' ? '(1-by-1 Pages)' : ''}</span>
              </>
            )}
          </button>

          {/* Print One by One (Card-by-card stepper dialog) */}
          <button
            type="button"
            onClick={onPrintOneByOne}
            disabled={selectedCount === 0 || isGeneratingPDF}
            title="Step through each employee badge and print one at a time"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600" />
            <span>Print 1-by-1 Mode</span>
          </button>

          {/* MAIN ACTION: Print Selected (prints 1-card-per-page or 8-grid based on density) */}
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
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
