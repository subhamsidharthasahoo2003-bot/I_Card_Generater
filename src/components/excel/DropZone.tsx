import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, FolderArchive, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { downloadSampleExcel } from '../../services/excelService';
import { downloadSamplePhotoPack } from '../../services/photoService';

interface DropZoneProps {
  onExcelSelect: (file: File) => void;
  onZipSelect: (file: File) => void;
  onLoadSampleData?: () => void;
  isProcessing?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onExcelSelect,
  onZipSelect,
  onLoadSampleData,
  isProcessing = false
}) => {
  const [isExcelDragOver, setIsExcelDragOver] = useState(false);
  const [isZipDragOver, setIsZipDragOver] = useState(false);

  const excelInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const handleExcelDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsExcelDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        onExcelSelect(file);
      }
    }
  };

  const handleZipDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsZipDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        onZipSelect(file);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Sample Template Quick Download Strip */}
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-indigo-950">Quick Starter Kits</h4>
          <p className="text-xs text-indigo-700/80 mt-0.5">
            Download pre-formatted sample Excel & photo package to test, or load demo records directly
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {onLoadSampleData && (
            <button
              type="button"
              onClick={onLoadSampleData}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Load Demo Data (1-Click)</span>
            </button>
          )}
          <button
            type="button"
            onClick={downloadSampleExcel}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sample Excel (.xlsx)</span>
          </button>
          <button
            type="button"
            onClick={downloadSamplePhotoPack}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Sample Photos (.zip)</span>
          </button>
        </div>
      </div>

      {/* Two Upload Cards: Excel and Photos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Excel Upload Card */}
        <div
          onDragOver={e => {
            e.preventDefault();
            setIsExcelDragOver(true);
          }}
          onDragLeave={() => setIsExcelDragOver(false)}
          onDrop={handleExcelDrop}
          onClick={() => excelInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isExcelDragOver
              ? 'border-indigo-600 bg-indigo-50/60 scale-[1.01]'
              : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50/50 shadow-xs'
          }`}
        >
          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            onChange={e => {
              if (e.target.files && e.target.files.length > 0) {
                onExcelSelect(e.target.files[0]);
              }
            }}
          />
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Upload Employee Excel</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Drag and drop your <span className="font-semibold text-slate-700">.xlsx</span> or{' '}
            <span className="font-semibold text-slate-700">.xls</span> spreadsheet here, or click to browse
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-slate-500">
            <span className="text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-md">
              Google Drive Photo links supported
            </span>
            <span>•</span>
            <span>Up to 1,000 rows</span>
          </div>
        </div>

        {/* Photos ZIP Upload Card */}
        <div
          onDragOver={e => {
            e.preventDefault();
            setIsZipDragOver(true);
          }}
          onDragLeave={() => setIsZipDragOver(false)}
          onDrop={handleZipDrop}
          onClick={() => zipInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isZipDragOver
              ? 'border-emerald-600 bg-emerald-50/60 scale-[1.01]'
              : 'border-slate-300 hover:border-emerald-400 bg-white hover:bg-slate-50/50 shadow-xs'
          }`}
        >
          <input
            ref={zipInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={e => {
              if (e.target.files && e.target.files.length > 0) {
                onZipSelect(e.target.files[0]);
              }
            }}
          />
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3">
            <FolderArchive className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Upload Employee Photos (.zip)</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Drop a ZIP containing photos named by Employee ID (e.g.,{' '}
            <span className="font-semibold text-slate-700">EMP001.jpg</span>) for instant pairing
          </p>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-slate-400">
            <span>Auto-matches JPG, PNG, WEBP</span>
            <span>•</span>
            <span>Instant preview</span>
          </div>
        </div>
      </div>
    </div>
  );
};
