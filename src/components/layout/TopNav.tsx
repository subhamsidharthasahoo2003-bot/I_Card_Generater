import React from 'react';
import { Menu, FileSpreadsheet, Download, Trash2, Printer, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { downloadSampleExcel } from '../../services/excelService';
import { Link } from 'react-router-dom';

interface TopNavProps {
  onToggleMobileMenu: () => void;
  onClearData: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onToggleMobileMenu,
  onClearData
}) => {
  const { employees, selectedIds } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between no-print">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-100">
            <Shield className="w-3.5 h-3.5" />
            <span>Temp ID System</span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">•</span>
          <span className="text-xs font-semibold text-slate-600">
            {employees.length > 0 ? (
              <>
                <strong className="text-slate-900">{employees.length}</strong> Employees Loaded (
                <strong className="text-indigo-600">{selectedIds.size}</strong> Selected)
              </>
            ) : (
              'No employees loaded'
            )}
          </span>
        </div>
      </div>

      {/* Top right quick shortcuts */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={downloadSampleExcel}
          title="Download Sample Excel Template"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Sample Excel</span>
        </button>

        {employees.length > 0 && (
          <Link
            to="/print"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print ({selectedIds.size})</span>
          </Link>
        )}

        <button
          type="button"
          onClick={onClearData}
          title="Clear Temporary Data"
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
