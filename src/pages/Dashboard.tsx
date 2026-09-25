import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/dashboard/MetricCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { CardPreview } from '../components/id-card/CardPreview';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { formatDisplayDate } from '../utils/dateUtils';
import { Employee } from '../types/employee';
import {
  Users,
  CheckSquare,
  CreditCard,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
  UserCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { handleCardImageError } from '../services/photoService';

export const Dashboard: React.FC = () => {
  const {
    employees,
    selectedIds,
    cardsPrintedCount,
    companySettings,
    clearTemporaryData
  } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [previewEmployee, setPreviewEmployee] = useState<Employee | null>(null);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  const readyCardsCount = employees.filter(e => !!e.photoUrl).length;

  const handleConfirmClear = () => {
    clearTemporaryData();
    showToast('info', 'Data Cleared', 'All temporary employee records have been removed.');
    navigate('/import');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>CR80 Compliant Temporary Credential Generator</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Temporary Employee ID Card System
          </h2>
          <p className="text-slate-300 text-xs md:text-sm mt-2 leading-relaxed">
            Quickly bulk-issue temporary photo ID cards for contractors, interns, and visitors.
            Import via Excel, link photos, configure validity duration, and print on A4 paper.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/import"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <span>Start Excel Import</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            {employees.length > 0 && (
              <Link
                to="/print"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Go to Print ({selectedIds.size})</span>
              </Link>
            )}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Employees Loaded"
          value={employees.length}
          subtitle={employees.length > 0 ? "From current session" : "No file imported yet"}
          icon={<Users className="w-6 h-6" />}
          colorVariant="indigo"
        />
        <MetricCard
          title="Selected Employees"
          value={selectedIds.size}
          subtitle={`Ready for batch processing`}
          icon={<CheckSquare className="w-6 h-6" />}
          colorVariant="blue"
        />
        <MetricCard
          title="Cards Ready"
          value={readyCardsCount}
          subtitle={`${employees.length - readyCardsCount} missing photo`}
          icon={<CreditCard className="w-6 h-6" />}
          colorVariant="emerald"
        />
        <MetricCard
          title="Cards Printed"
          value={cardsPrintedCount}
          subtitle="During active session"
          icon={<Printer className="w-6 h-6" />}
          colorVariant="amber"
        />
      </div>

      {/* Quick Actions Component */}
      <QuickActions
        onClearData={() => setIsConfirmClearOpen(true)}
        hasEmployees={employees.length > 0}
      />

      {/* Workflow Step Guide */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">Badge Generation Workflow</h3>
        <p className="text-xs text-slate-500 mb-6">
          Follow these sequential steps to issue professional temporary identification
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Upload Excel</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Drop your .xlsx spreadsheet with ID, Name, Department, Contact info.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Pair Photos</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Upload a ZIP archive with images named by Employee ID (e.g. EMP001.jpg).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Set Validity</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Choose temporary validity (Today, 1 Day, 7 Days, or Custom Date).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
              4
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Print or Export</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Preview exact A4 layout and print directly or download high-res PDF.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Employees Preview (if loaded) */}
      {employees.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Imported Employees Snapshot</h3>
              <p className="text-xs text-slate-500">
                Previewing top records from current temporary batch
              </p>
            </div>
            <Link
              to="/employees"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All ({employees.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.slice(0, 3).map(emp => (
              <div
                key={emp.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50/50 transition-all flex items-center gap-3.5"
              >
                <div className="w-12 h-14 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-300 flex items-center justify-center">
                  {emp.photoUrl ? (
                    <img
                      src={emp.photoUrl}
                      alt={emp.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        handleCardImageError(e.currentTarget, emp.name, 'avatar');
                      }}
                    />
                  ) : (
                    <Users className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                      {emp.id}
                    </span>
                    <span className="text-[10px] font-semibold text-rose-600">
                      Exp: {formatDisplayDate(emp.validUntil)}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                    {emp.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">{emp.designation}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewEmployee(emp)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  title="Preview Card"
                >
                  <CreditCard className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card Preview Modal */}
      {previewEmployee && (
        <Modal
          isOpen={!!previewEmployee}
          onClose={() => setPreviewEmployee(null)}
          title={`Temporary Card: ${previewEmployee.name}`}
          subtitle={`Employee ID: ${previewEmployee.id} • ${previewEmployee.department}`}
          maxWidth="lg"
        >
          <div className="py-2">
            <CardPreview employee={previewEmployee} company={companySettings} />
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={handleConfirmClear}
        title="Clear Temporary Data"
        message="Are you sure you want to clear all temporary employee data and generated ID cards?"
        confirmLabel="Clear All Data"
        cancelLabel="Cancel"
      />
    </div>
  );
};
