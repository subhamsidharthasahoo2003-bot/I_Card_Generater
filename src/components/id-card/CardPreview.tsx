import React, { useState, useRef } from 'react';
import { Employee } from '../../types/employee';
import { CompanySettings } from '../../types/company';
import { IDCardFront } from './IDCardFront';
import { IDCardBack } from './IDCardBack';
import { downloadCardImage, downloadSingleCardPDF, printSingleCard } from '../../services/cardExportService';
import { buildVerificationUrl } from '../../services/qrService';
import {
  RotateCw,
  Printer,
  Download,
  FileText,
  ShieldCheck,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface CardPreviewProps {
  employee: Employee;
  company: CompanySettings;
  showActions?: boolean;
}

export const CardPreview: React.FC<CardPreviewProps> = ({
  employee,
  company,
  showActions = true
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');
  const [isExporting, setIsExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState('');

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
    setViewSide(prev => (prev === 'front' ? 'back' : 'front'));
  };

  const handleSelectSide = (side: 'front' | 'back') => {
    setViewSide(side);
    setIsFlipped(side === 'back');
  };

  const handleDownloadFront = async () => {
    if (!frontRef.current) return;
    setIsExporting(true);
    setExportMsg('Downloading front image...');
    try {
      await downloadCardImage(frontRef.current, `${employee.id}_Front.png`);
    } finally {
      setIsExporting(false);
      setExportMsg('');
    }
  };

  const handleDownloadBack = async () => {
    if (!backRef.current) return;
    setIsExporting(true);
    setExportMsg('Downloading back image...');
    try {
      await downloadCardImage(backRef.current, `${employee.id}_Back.png`);
    } finally {
      setIsExporting(false);
      setExportMsg('');
    }
  };

  const handleDownloadPDF = async () => {
    if (!frontRef.current) return;
    setIsExporting(true);
    setExportMsg('Generating CR80 PDF...');
    try {
      await downloadSingleCardPDF(frontRef.current, backRef.current, `${employee.id}_ID_Card.pdf`);
    } finally {
      setIsExporting(false);
      setExportMsg('');
    }
  };

  const handlePrintCard = async () => {
    if (!frontRef.current) return;
    setIsExporting(true);
    setExportMsg('Preparing print dialog...');
    try {
      await printSingleCard(frontRef.current, backRef.current);
    } finally {
      setIsExporting(false);
      setExportMsg('');
    }
  };

  const verifyUrl = buildVerificationUrl({
    id: employee.id,
    name: employee.name,
    designation: employee.designation,
    department: employee.department,
    phone: employee.phone,
    email: employee.email,
    dob: employee.dob,
    bloodGroup: employee.bloodGroup,
    issueDate: employee.issueDate,
    validUntil: employee.validUntil,
    company: company.name,
    baseUrl: company.verificationBaseUrl
  });

  return (
    <div className="flex flex-col items-center w-full max-w-[420px] mx-auto">
      {/* Side Switch & 3D Flip */}
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

      {/* Hidden flat elements for high-DPI capture without 3D rotation issues */}
      <div className="sr-only" aria-hidden="true">
        <div ref={frontRef}>
          <IDCardFront employee={employee} company={company} />
        </div>
        <div ref={backRef}>
          <IDCardBack employee={employee} company={company} />
        </div>
      </div>

      {/* Specs Badge */}
      <div className="mt-3 flex items-center justify-between w-full max-w-[360px] text-xs text-slate-500">
        <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          CR80 Standard (85.60 × 53.98 mm)
        </span>
        <a
          href={verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open public employee scan link"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <span>Preview QR Link</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Single Card Action Bar */}
      {showActions && (
        <div className="w-full mt-4 pt-4 border-t border-slate-200 space-y-2.5">
          {exportMsg && (
            <div className="text-center text-xs font-semibold text-indigo-600 flex items-center justify-center gap-1.5 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{exportMsg}</span>
            </div>
          )}

          {/* Primary Action: Print Single Card */}
          <button
            type="button"
            onClick={handlePrintCard}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-orange-500/25 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Single ID Card</span>
          </button>

          {/* Secondary Actions: Individual Downloads */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleDownloadFront}
              disabled={isExporting}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Download Front Face as high-res PNG"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Front (PNG)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadBack}
              disabled={isExporting}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Download Back Face as high-res PNG"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Back (PNG)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Download Single CR80 PDF (Both Sides)"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>PDF Card</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
