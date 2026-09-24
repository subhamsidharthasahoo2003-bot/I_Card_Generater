import React from 'react';
import { Modal } from '../ui/Modal';
import { ExcelValidationError } from '../../types/employee';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface ValidationErrorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: ExcelValidationError[];
}

export const ValidationErrorsModal: React.FC<ValidationErrorsModalProps> = ({
  isOpen,
  onClose,
  errors
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Excel Validation Issues"
      subtitle={`${errors.length} issue${errors.length === 1 ? '' : 's'} detected in spreadsheet data`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Rows with critical errors may have missing required columns or duplicate Employee IDs.
            Valid rows have been imported and are available for card generation.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Excel Row</th>
                <th className="py-2.5 px-3">Employee ID</th>
                <th className="py-2.5 px-3">Field</th>
                <th className="py-2.5 px-3">Error Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {errors.map((err, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 font-mono text-slate-500">Row {err.row}</td>
                  <td className="py-2 px-3 font-mono font-bold text-slate-800">
                    {err.employeeId || 'N/A'}
                  </td>
                  <td className="py-2 px-3 text-slate-700 font-semibold">{err.field}</td>
                  <td className="py-2 px-3 text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{err.message}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close & Review
          </button>
        </div>
      </div>
    </Modal>
  );
};
