import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  CreditCard,
  Printer,
  Trash2,
  ArrowRight
} from 'lucide-react';

interface QuickActionsProps {
  onClearData: () => void;
  hasEmployees: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onClearData,
  hasEmployees
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
          <p className="text-xs text-slate-500">
            Speed up your temporary badge issuance pipeline
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Import Excel */}
        <Link
          to="/import"
          className="group p-4 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/30 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-900">
              Import Excel
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Upload .xlsx or .xls employee rosters
            </p>
          </div>
        </Link>

        {/* Generate ID Cards */}
        <Link
          to="/generator"
          className={`group p-4 rounded-xl border transition-all flex flex-col justify-between ${
            hasEmployees
              ? 'border-slate-200 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30'
              : 'border-slate-200 opacity-60 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-900">
              Generate ID Cards
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Apply validity duration & QR codes
            </p>
          </div>
        </Link>

        {/* Print Cards */}
        <Link
          to="/print"
          className={`group p-4 rounded-xl border transition-all flex flex-col justify-between ${
            hasEmployees
              ? 'border-slate-200 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30'
              : 'border-slate-200 opacity-60 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-900">
              Print Cards
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              A4 multi-card sheet & PDF export
            </p>
          </div>
        </Link>

        {/* Clear Temporary Data */}
        <button
          type="button"
          onClick={onClearData}
          className="group p-4 rounded-xl border border-slate-200 hover:border-red-400 bg-slate-50/50 hover:bg-red-50/30 transition-all flex flex-col justify-between text-left cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-red-100 text-red-700 rounded-xl group-hover:scale-105 transition-transform">
              <Trash2 className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-red-900">
              Clear Temporary Data
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Flush session data & reset workflow
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
