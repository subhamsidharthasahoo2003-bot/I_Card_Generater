import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ValidityPicker } from '../components/id-card/ValidityPicker';
import { CardPreview } from '../components/id-card/CardPreview';
import { useToast } from '../components/ui/Toast';
import { formatDisplayDate } from '../utils/dateUtils';
import {
  CreditCard,
  QrCode,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const IDCardGenerator: React.FC = () => {
  const {
    employees,
    selectedIds,
    companySettings,
    validityConfig,
    ensureQRCodesGenerated,
    isGeneratingQRs
  } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [previewIndex, setPreviewIndex] = useState(0);

  // Selected employees list
  const selectedEmployees = employees.filter(e => selectedIds.has(e.id));
  const activeEmployee = selectedEmployees[previewIndex] || employees[0] || null;

  // Auto-generate QR codes when entering this page
  useEffect(() => {
    if (employees.length > 0) {
      ensureQRCodesGenerated();
    }
  }, [employees.length, ensureQRCodesGenerated]);

  const handleProceedToPrint = async () => {
    await ensureQRCodesGenerated();
    showToast('success', 'Credentials Prepared', 'Temporary ID cards and QR codes generated.');
    navigate('/print');
  };

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileSpreadsheet className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Employees Loaded Yet</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
          Please upload your employee spreadsheet before configuring temporary ID cards.
        </p>
        <div className="mt-6">
          <Link
            to="/import"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
          >
            Import Excel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Temporary ID Card Generator
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Configure access validity, verify CR80 double-sided card layouts, and generate QR verification codes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleProceedToPrint}
          disabled={isGeneratingQRs}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>
            {isGeneratingQRs ? 'Generating QR Codes...' : `Proceed to Print Preview (${selectedIds.size})`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Validity Selector & Card Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <ValidityPicker />

          {/* QR Code & Security Specs Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">QR Code Security Encoding</h4>
                <p className="text-xs text-slate-500">
                  Each badge embeds an encrypted verification QR code
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Data Encoded:</span>
                <span className="font-mono font-bold text-slate-800">
                  Employee ID • Name • Issue • Valid Until
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Error Correction:</span>
                <span className="font-semibold text-slate-700">Level M (Standard High Density)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Generation Status:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Auto-updated on validity change
                </span>
              </div>
            </div>
          </div>

          {/* Batch Generation Summary Card */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-bold">Ready to Print Batch</h4>
              <p className="text-xs text-slate-300">
                <strong className="text-amber-400">{selectedIds.size}</strong> cards selected •{' '}
                <strong className="text-amber-400">CR80</strong> standard dimensions
              </p>
            </div>
            <button
              type="button"
              onClick={handleProceedToPrint}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Open Print Sheet
            </button>
          </div>
        </div>

        {/* Right Column: Live 3D Card Preview & Switcher (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900">Live Card Inspection</h4>

            {/* Employee Preview Selector */}
            {selectedEmployees.length > 1 && (
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setPreviewIndex(prev =>
                      prev > 0 ? prev - 1 : selectedEmployees.length - 1
                    )
                  }
                  className="px-2 py-0.5 border border-slate-200 rounded hover:bg-slate-100 text-slate-600 font-bold"
                >
                  ‹
                </button>
                <span className="text-slate-500 px-1 font-mono text-[11px]">
                  {previewIndex + 1} / {selectedEmployees.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewIndex(prev =>
                      prev < selectedEmployees.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="px-2 py-0.5 border border-slate-200 rounded hover:bg-slate-100 text-slate-600 font-bold"
                >
                  ›
                </button>
              </div>
            )}
          </div>

          {activeEmployee ? (
            <div className="w-full flex flex-col items-center">
              <CardPreview employee={activeEmployee} company={companySettings} />

              <div className="w-full mt-4 pt-3 border-t border-slate-100 text-center">
                <p className="text-xs font-bold text-slate-800">
                  {activeEmployee.name} ({activeEmployee.id})
                </p>
                <p className="text-[11px] text-slate-500">
                  {activeEmployee.designation} • {activeEmployee.department}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No employee selected for preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
