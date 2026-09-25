import React, { useState, useRef } from 'react';
import { Employee } from '../../types/employee';
import { CompanySettings } from '../../types/company';
import { Modal } from '../ui/Modal';
import { CardPreview } from '../id-card/CardPreview';
import { printSingleCard } from '../../services/cardExportService';
import {
  Printer,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Users
} from 'lucide-react';

interface PrintOneByOneModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  company: CompanySettings;
  onRecordPrint?: (count: number) => void;
}

export const PrintOneByOneModal: React.FC<PrintOneByOneModalProps> = ({
  isOpen,
  onClose,
  employees,
  company,
  onRecordPrint
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printedIds, setPrintedIds] = useState<Set<string>>(new Set());

  const currentEmployee = employees[currentIndex] || employees[0];

  if (!currentEmployee) return null;

  const handlePrintCurrent = async () => {
    setIsPrinting(true);
    try {
      // Find the card container from the CardPreview or trigger isolated print
      // We can create an element or trigger printSingleCard
      // We'll let CardPreview handle the display, or trigger via offscreen ref
      setPrintedIds(prev => new Set(prev).add(currentEmployee.id));
      if (onRecordPrint) onRecordPrint(1);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < employees.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const isPrinted = printedIds.has(currentEmployee.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Print Cards One by One"
      subtitle={`Card ${currentIndex + 1} of ${employees.length} • Single badge printer feed mode`}
      maxWidth="lg"
    >
      <div className="space-y-4 py-2">
        {/* Navigation & Stepper Header */}
        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer text-slate-700"
              title="Previous Employee"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Quick Selector Dropdown */}
            <select
              value={currentIndex}
              onChange={e => setCurrentIndex(Number(e.target.value))}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {employees.map((emp, idx) => (
                <option key={emp.id} value={idx}>
                  {idx + 1}. {emp.name} ({emp.id}) {printedIds.has(emp.id) ? '✓ Printed' : ''}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === employees.length - 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer text-slate-700"
              title="Next Employee"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isPrinted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Printed
              </span>
            )}
            <span className="text-xs font-mono text-slate-500">
              <strong className="text-indigo-600">{printedIds.size}</strong>/{employees.length} printed
            </span>
          </div>
        </div>

        {/* Live Card Preview with Built-in Print Single Card Action */}
        <div className="flex justify-center">
          <CardPreview employee={currentEmployee} company={company} showActions={true} />
        </div>

        {/* Footer Next & Previous Navigation Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-3 py-1.5 font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Card</span>
          </button>

          <span className="font-mono text-slate-400">
            Card {currentIndex + 1} of {employees.length}
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex === employees.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <span>Next Card</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
