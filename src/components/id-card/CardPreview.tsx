import React, { useState } from 'react';
import { Employee } from '../../types/employee';
import { CompanySettings } from '../../types/company';
import { IDCardFront } from './IDCardFront';
import { IDCardBack } from './IDCardBack';
import { RotateCw, Maximize2, ShieldCheck } from 'lucide-react';

interface CardPreviewProps {
  employee: Employee;
  company: CompanySettings;
}

export const CardPreview: React.FC<CardPreviewProps> = ({ employee, company }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
    setViewSide(prev => (prev === 'front' ? 'back' : 'front'));
  };

  const handleSelectSide = (side: 'front' | 'back') => {
    setViewSide(side);
    setIsFlipped(side === 'back');
  };

  return (
    <div className="flex flex-col items-center">
      {/* Side Switch & Controls */}
      <div className="flex items-center justify-between w-full max-w-[360px] mb-3">
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => handleSelectSide('front')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              viewSide === 'front'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Front Face
          </button>
          <button
            type="button"
            onClick={() => handleSelectSide('back')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              viewSide === 'back'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Back Face
          </button>
        </div>

        <button
          type="button"
          onClick={handleFlip}
          className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5 text-orange-600" />
          <span>Flip 3D</span>
        </button>
      </div>

      {/* 3D Card Stage */}
      <div className="cr80-preview-container p-4 bg-gradient-to-b from-slate-100 to-slate-200/80 rounded-2xl border border-slate-300/80 shadow-inner flex items-center justify-center">
        <div
          className={`card-flipper relative ${isFlipped ? 'flipped' : ''}`}
          style={{ width: '85.6mm', height: '53.98mm' }}
        >
          {/* Front Face */}
          <div className="card-face absolute inset-0">
            <IDCardFront employee={employee} company={company} className="shadow-lg" />
          </div>

          {/* Back Face */}
          <div className="card-face card-back-face absolute inset-0">
            <IDCardBack employee={employee} company={company} className="shadow-lg" />
          </div>
        </div>
      </div>

      {/* Specs Badge */}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          CR80 Standard (85.60 × 53.98 mm)
        </span>
        <span className="text-[11px] text-slate-400">Ratio 1.586 : 1</span>
      </div>
    </div>
  );
};
