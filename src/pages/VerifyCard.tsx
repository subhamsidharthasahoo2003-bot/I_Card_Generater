import React, { useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { decodeVerificationData } from '../services/qrService';
import { Employee } from '../types/employee';
import { IDCardFront } from '../components/id-card/IDCardFront';
import { IDCardBack } from '../components/id-card/IDCardBack';
import { formatDisplayDate } from '../utils/dateUtils';
import { downloadCardImage, downloadSingleCardPDF, printSingleCard } from '../services/cardExportService';
import {
  ShieldCheck,
  AlertTriangle,
  Download,
  Printer,
  FileText,
  User,
  Smartphone,
  ArrowLeft
} from 'lucide-react';

export const VerifyCard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { employees, companySettings } = useApp();

  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const empIdParam = searchParams.get('id') || '';
  const dataParam = searchParams.get('data') || '';

  // 1. Try finding in loaded employees
  const foundEmp = employees.find(e => e.id.toUpperCase() === empIdParam.toUpperCase());

  // 2. Try decoding from QR encoded data parameter
  const decoded = dataParam ? decodeVerificationData(dataParam) : null;

  // Build employee object from available sources
  const employee: Employee | null = foundEmp || (decoded ? {
    id: decoded.id || empIdParam || 'UNKNOWN',
    name: decoded.name || 'Employee',
    designation: decoded.designation || 'Staff',
    department: decoded.department || 'Operations',
    phone: decoded.phone,
    email: decoded.email,
    dob: decoded.dob,
    bloodGroup: decoded.bloodGroup,
    joiningDate: decoded.issueDate || new Date().toISOString().slice(0, 10),
    issueDate: decoded.issueDate || new Date().toISOString().slice(0, 10),
    validUntil: decoded.validUntil || new Date().toISOString().slice(0, 10),
    photoFileName: `${decoded.id}.jpg`,
    status: 'Ready'
  } : null);

  // Check validity / expiration
  const isExpired = (() => {
    if (!employee?.validUntil) return false;
    const parts = formatDisplayDate(employee.validUntil).split('-');
    if (parts.length === 3) {
      const expDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]), 23, 59, 59);
      return expDate.getTime() < Date.now();
    }
    return false;
  })();

  const handleDownloadFront = async () => {
    if (!frontRef.current || !employee) return;
    setIsExporting(true);
    setExportMessage('Generating front card image...');
    try {
      await downloadCardImage(frontRef.current, `${employee.id}_Front_Card.png`);
    } finally {
      setIsExporting(false);
      setExportMessage('');
    }
  };

  const handleDownloadBack = async () => {
    if (!backRef.current || !employee) return;
    setIsExporting(true);
    setExportMessage('Generating back card image...');
    try {
      await downloadCardImage(backRef.current, `${employee.id}_Back_Card.png`);
    } finally {
      setIsExporting(false);
      setExportMessage('');
    }
  };

  const handleDownloadPDF = async () => {
    if (!frontRef.current || !employee) return;
    setIsExporting(true);
    setExportMessage('Generating printable PDF card...');
    try {
      await downloadSingleCardPDF(frontRef.current, backRef.current, `${employee.id}_ID_Card.pdf`);
    } finally {
      setIsExporting(false);
      setExportMessage('');
    }
  };

  const handlePrint = async () => {
    if (!frontRef.current) return;
    setIsExporting(true);
    setExportMessage('Preparing print dialog...');
    try {
      await printSingleCard(frontRef.current, backRef.current);
    } finally {
      setIsExporting(false);
      setExportMessage('');
    }
  };

  if (!employee) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Credential Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">
            No valid verification data or employee ID was provided in this QR code scan.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
            >
              Go to Home Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 py-6 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-5">
        
        {/* Top Bar / Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              T
            </div>
            <div>
              <h1 className="text-xs font-black tracking-tight text-slate-900 uppercase">
                {companySettings.name}
              </h1>
              <span className="text-[10px] text-slate-500 font-mono">Digital Credential Verification</span>
            </div>
          </div>

          <Link
            to="/"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/80 border border-slate-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Verification Status Banner */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between shadow-xs ${
            isExpired
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs ${
                isExpired ? 'bg-rose-600' : 'bg-emerald-600'
              }`}
            >
              {isExpired ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide uppercase">
                  {isExpired ? 'Access Expired' : 'Official Credential Verified'}
                </span>
                <span className="inline-block w-2 h-2 rounded-full animate-pulse bg-current" />
              </div>
              <p className="text-[11px] opacity-80 mt-0.5">
                {isExpired
                  ? `Expired on ${formatDisplayDate(employee.validUntil)}`
                  : `Valid until ${formatDisplayDate(employee.validUntil)}`}
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
              isExpired ? 'bg-rose-200 text-rose-900' : 'bg-emerald-200 text-emerald-900'
            }`}
          >
            {isExpired ? 'INVALID' : 'ACTIVE'}
          </span>
        </div>

        {/* Card View Switcher */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">{employee.name}</h2>
              <p className="text-xs text-slate-500 font-mono">
                ID: {employee.id} • {employee.designation}
              </p>
            </div>

            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveSide('front')}
                className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                  activeSide === 'front'
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Front
              </button>
              <button
                type="button"
                onClick={() => setActiveSide('back')}
                className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                  activeSide === 'back'
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Back
              </button>
            </div>
          </div>

          {/* Interactive Card Presentation */}
          <div className="flex justify-center py-2 overflow-x-auto">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-inner flex items-center justify-center">
              {activeSide === 'front' ? (
                <div ref={frontRef}>
                  <IDCardFront employee={employee} company={companySettings} className="shadow-md" />
                </div>
              ) : (
                <div ref={backRef}>
                  <IDCardBack employee={employee} company={companySettings} className="shadow-md" />
                </div>
              )}
            </div>
          </div>

          {/* Hidden containers to ensure both sides are rendered and capturable at any time */}
          <div className="sr-only" aria-hidden="true">
            {activeSide === 'back' && (
              <div ref={frontRef}>
                <IDCardFront employee={employee} company={companySettings} />
              </div>
            )}
            {activeSide === 'front' && (
              <div ref={backRef}>
                <IDCardBack employee={employee} company={companySettings} />
              </div>
            )}
          </div>

          {/* Download Action Buttons */}
          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-orange-600" />
              <span>Download & Save ID Card to Phone</span>
            </div>

            {exportMessage && (
              <p className="text-xs text-indigo-600 font-semibold animate-pulse text-center">
                {exportMessage}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadFront}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Front (PNG)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadBack}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Back (PNG)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer sm:col-span-2"
              >
                <FileText className="w-4 h-4" />
                <span>Download Printable PDF (Both Sides)</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer sm:col-span-2"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print ID Card</span>
              </button>
            </div>
          </div>
        </div>

        {/* Employee Verified Details Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <User className="w-3.5 h-3.5 text-orange-600" />
            <span>Badge Credentials Summary</span>
          </h3>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">EMPLOYEE ID</span>
              <span className="font-mono font-bold text-slate-800 text-xs">{employee.id}</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">DEPARTMENT</span>
              <span className="font-semibold text-slate-800 text-xs truncate block">{employee.department}</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">DATE OF BIRTH</span>
              <span className="font-mono font-bold text-slate-800 text-xs">
                {employee.dob ? formatDisplayDate(employee.dob) : 'N/A'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">BLOOD GROUP</span>
              <span className="font-bold text-orange-600 text-xs">{employee.bloodGroup || 'N/A'}</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">ISSUE DATE</span>
              <span className="font-mono text-slate-700 text-xs">{formatDisplayDate(employee.issueDate)}</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">EXPIRY DATE</span>
              <span className="font-mono font-bold text-slate-900 text-xs">{formatDisplayDate(employee.validUntil)}</span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Footer */}
        <div className="text-center text-[10px] text-slate-400 max-w-sm mx-auto leading-relaxed">
          {companySettings.disclaimerText ||
            'This card is strictly temporary and remains the property of the company. Scan verified by Google Lens.'}
        </div>
      </div>
    </div>
  );
};
