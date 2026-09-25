import React from 'react';
import { Employee } from '../../types/employee';
import { Modal } from '../ui/Modal';
import {
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image,
  Info,
  Layers,
  StopCircle
} from 'lucide-react';

interface DownloadOneByOneModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIndex: number;
  totalCount: number;
  currentEmployee: Employee | null;
  status: 'idle' | 'downloading' | 'completed' | 'cancelled' | 'error';
  format: 'pdf' | 'png';
  onChangeFormat: (format: 'pdf' | 'png') => void;
  onStart: () => void;
  onCancel: () => void;
  errorMsg?: string;
}

export const DownloadOneByOneModal: React.FC<DownloadOneByOneModalProps> = ({
  isOpen,
  onClose,
  currentIndex,
  totalCount,
  currentEmployee,
  status,
  format,
  onChangeFormat,
  onStart,
  onCancel,
  errorMsg
}) => {
  const percent = totalCount > 0 ? Math.round((currentIndex / totalCount) * 100) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={status === 'downloading' ? onCancel : onClose}
      title="Download ID Cards One by One"
      subtitle="Export separate, individual ID card files for each selected employee"
      maxWidth="md"
    >
      <div className="space-y-5 py-2">
        {status === 'idle' && (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-start gap-3">
              <Download className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-950 space-y-1">
                <p className="font-bold">Sequential Individual Card Downloads</p>
                <p className="text-indigo-800/80 leading-relaxed">
                  Instead of one combined sheet, each employee will receive their own separate file
                  downloaded one after another directly to your browser’s Downloads folder.
                </p>
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Choose Download File Format:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onChangeFormat('pdf')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    format === 'pdf'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileText
                      className={`w-4 h-4 ${format === 'pdf' ? 'text-indigo-600' : 'text-slate-500'}`}
                    />
                    <span
                      className={`text-xs font-extrabold ${format === 'pdf' ? 'text-indigo-900' : 'text-slate-800'}`}
                    >
                      CR80 PDF Card
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Standard credit-card size (85.6 × 53.98mm) ready for card printers.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeFormat('png')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    format === 'png'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Image
                      className={`w-4 h-4 ${format === 'png' ? 'text-indigo-600' : 'text-slate-500'}`}
                    />
                    <span
                      className={`text-xs font-extrabold ${format === 'png' ? 'text-indigo-900' : 'text-slate-800'}`}
                    >
                      PNG High-Res
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Crisp 300 DPI image files for digital distribution & photo printing.
                  </p>
                </button>
              </div>
            </div>

            {/* Browser Permission Tip */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Browser Note:</strong> When prompted, click{' '}
                <strong className="underline">"Allow multiple downloads"</strong> so all{' '}
                <strong>{totalCount}</strong> cards can be saved automatically.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onStart}
                disabled={totalCount === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Start Downloading ({totalCount} Cards)</span>
              </button>
            </div>
          </div>
        )}

        {status === 'downloading' && (
          <div className="space-y-5 text-center py-4">
            {/* Progress Percentage */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-16 h-16 flex items-center justify-center mb-3">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <span className="absolute text-xs font-black text-indigo-700 font-mono">
                  {percent}%
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Downloading Card {currentIndex + 1} of {totalCount}
              </h4>
              {currentEmployee && (
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  <strong className="text-slate-900">{currentEmployee.name}</strong> ({currentEmployee.id})
                </p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* Current card miniature pill */}
            {currentEmployee && (
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>Generating & saving {format.toUpperCase()}...</span>
              </div>
            )}

            {/* Cancel Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
              >
                <StopCircle className="w-3.5 h-3.5" />
                <span>Stop Downloading</span>
              </button>
            </div>
          </div>
        )}

        {status === 'completed' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">
                All Cards Downloaded One by One!
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Successfully generated and downloaded{' '}
                <strong className="text-slate-800">{totalCount}</strong> separate{' '}
                {format.toUpperCase()} card files into your Downloads directory.
              </p>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {status === 'cancelled' && (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Download Process Stopped</h4>
              <p className="text-xs text-slate-500 mt-1">
                Downloaded {currentIndex} of {totalCount} cards before cancelling.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">Export Encountered an Issue</h4>
              <p className="text-xs text-rose-600 mt-1">{errorMsg || 'Failed to complete export.'}</p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
