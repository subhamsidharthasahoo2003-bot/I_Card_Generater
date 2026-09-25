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
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Building2,
  MapPin,
  Check,
  Copy,
  Clock,
  HeartPulse,
  Briefcase,
  ExternalLink
} from 'lucide-react';

export const VerifyCard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { employees, companySettings } = useApp();

  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [copied, setCopied] = useState(false);

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
    phone: decoded.phone || '',
    email: decoded.email || '',
    dob: decoded.dob,
    bloodGroup: decoded.bloodGroup,
    address: decoded.address,
    joiningDate: decoded.joiningDate || decoded.issueDate || new Date().toISOString().slice(0, 10),
    issueDate: decoded.issueDate || new Date().toISOString().slice(0, 10),
    validUntil: decoded.validUntil || new Date().toISOString().slice(0, 10),
    photoFileName: `${decoded.id || 'TEMP'}.jpg`,
    photoUrl: decoded.photoUrl,
    status: 'Ready'
  } : null);

  const activeCompany = {
    ...companySettings,
    name: decoded?.company || companySettings.name,
    address: decoded?.address || companySettings.address
  };

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

  const handleCopyAllData = () => {
    if (!employee) return;
    const fullText = [
      `--- EMPLOYEE CREDENTIAL VERIFICATION ---`,
      `Employee ID: ${employee.id}`,
      `Full Name: ${employee.name}`,
      `Designation: ${employee.designation}`,
      `Department: ${employee.department}`,
      `Date of Birth: ${employee.dob ? formatDisplayDate(employee.dob) : 'N/A'}`,
      `Blood Group: ${employee.bloodGroup || 'N/A'}`,
      `Phone: ${employee.phone || 'N/A'}`,
      `Email: ${employee.email || 'N/A'}`,
      `Date of Joining: ${formatDisplayDate(employee.joiningDate)}`,
      `Issue Date: ${formatDisplayDate(employee.issueDate)}`,
      `Valid Until: ${formatDisplayDate(employee.validUntil)}`,
      `Company: ${activeCompany.name}`,
      `Status: ${isExpired ? 'EXPIRED' : 'ACTIVE / VERIFIED'}`
    ].join('\n');

    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownloadFront = async () => {
    if (!frontRef.current || !employee) return;
    setIsExporting(true);
    setExportMessage('Generating front card image...');
    try {
      await downloadCardImage(frontRef.current, `${employee.id}_Front_Card.png`);
      setExportMessage('Front card downloaded successfully!');
      setTimeout(() => setExportMessage(''), 2500);
    } catch (err: unknown) {
      console.error('Front download error:', err);
      const msg = err instanceof Error ? err.message : 'Download failed';
      setExportMessage(`Error: ${msg}`);
      setTimeout(() => setExportMessage(''), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadBack = async () => {
    if (!backRef.current || !employee) return;
    setIsExporting(true);
    setExportMessage('Generating back card image...');
    try {
      await downloadCardImage(backRef.current, `${employee.id}_Back_Card.png`);
      setExportMessage('Back card downloaded successfully!');
      setTimeout(() => setExportMessage(''), 2500);
    } catch (err: unknown) {
      console.error('Back download error:', err);
      const msg = err instanceof Error ? err.message : 'Download failed';
      setExportMessage(`Error: ${msg}`);
      setTimeout(() => setExportMessage(''), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!frontRef.current || !employee) return;
    setIsExporting(true);
    setExportMessage('Generating printable PDF card...');
    try {
      await downloadSingleCardPDF(frontRef.current, backRef.current, `${employee.id}_ID_Card.pdf`);
      setExportMessage('PDF card downloaded successfully!');
      setTimeout(() => setExportMessage(''), 2500);
    } catch (err: unknown) {
      console.error('PDF error:', err);
      const msg = err instanceof Error ? err.message : 'PDF export failed';
      setExportMessage(`Error: ${msg}`);
      setTimeout(() => setExportMessage(''), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = async () => {
    if (!frontRef.current) return;
    setIsExporting(true);
    setExportMessage('Preparing print dialog...');
    try {
      await printSingleCard(frontRef.current, backRef.current);
      setExportMessage('');
    } catch (err: unknown) {
      console.error('Print error:', err);
      const msg = err instanceof Error ? err.message : 'Print failed';
      setExportMessage(`Error: ${msg}`);
      setTimeout(() => setExportMessage(''), 4000);
    } finally {
      setIsExporting(false);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 py-6 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-4">
        
        {/* Top Header: Company Identity & Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-900 uppercase">
                {activeCompany.name}
              </h1>
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                <span>Google Lens Verified Scanner</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold">Live System</span>
              </span>
            </div>
          </div>

          <Link
            to="/"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/90 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
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
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs ${
                isExpired ? 'bg-rose-600' : 'bg-emerald-600'
              }`}
            >
              {isExpired ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide uppercase">
                  {isExpired ? 'Access Expired' : 'Official Credential Verified'}
                </span>
                <span className="inline-block w-2 h-2 rounded-full animate-pulse bg-current" />
              </div>
              <p className="text-[11px] opacity-90 mt-0.5">
                {isExpired
                  ? `Access expired on ${formatDisplayDate(employee.validUntil)}`
                  : `Authenticated by digital security seal. Valid through ${formatDisplayDate(employee.validUntil)}`}
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shrink-0 ${
              isExpired ? 'bg-rose-200 text-rose-900' : 'bg-emerald-200 text-emerald-900'
            }`}
          >
            {isExpired ? 'INVALID' : 'ACTIVE'}
          </span>
        </div>

        {/* Primary Profile Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Photo Avatar */}
            <div className="w-20 h-24 rounded-xl border-2 border-black overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center shadow-xs">
              {employee.photoUrl ? (
                <img
                  src={employee.photoUrl}
                  alt={employee.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const src = target.src;
                    if (src.includes('lh3.googleusercontent.com/d/')) {
                      const match = src.match(/\/d\/([a-zA-Z0-9_-]+)/);
                      if (match && match[1]) {
                        target.src = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
                        return;
                      }
                    } else if (src.includes('drive.google.com/thumbnail')) {
                      const match = src.match(/id=([a-zA-Z0-9_-]+)/);
                      if (match && match[1]) {
                        target.src = `https://lh3.googleusercontent.com/d/${match[1]}`;
                        return;
                      }
                    }
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.emp-avatar-fb')) {
                      const fb = document.createElement('div');
                      fb.className = 'emp-avatar-fb text-sm font-black text-slate-500 uppercase';
                      fb.textContent = employee.name.slice(0, 2);
                      parent.appendChild(fb);
                    }
                  }}
                />
              ) : (
                <User className="w-8 h-8 text-slate-400" />
              )}
            </div>

            {/* Core Info & Action Buttons */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                    {employee.name}
                  </h2>
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mt-0.5">
                    {employee.designation} • <span className="text-slate-600">{employee.department}</span>
                  </p>
                </div>

                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg self-center sm:self-auto">
                  ID: {employee.id}
                </span>
              </div>

              {/* Direct Quick Actions: Call & Email */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3 pt-3 border-t border-slate-100">
                {employee.phone && (
                  <a
                    href={`tel:${employee.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-orange-600" />
                    <span>Call: {employee.phone}</span>
                  </a>
                )}

                {employee.email && (
                  <a
                    href={`mailto:${employee.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-orange-600" />
                    <span className="truncate max-w-[200px]">{employee.email}</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleCopyAllData}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-orange-600" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy All Data'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Employee Verified Data Grid (Every Field) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-orange-600" />
              <span>Full Employee Credentials Record</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">CR80 Identity Standard</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {/* Employee ID */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">EMPLOYEE ID</span>
              <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{employee.id}</span>
            </div>

            {/* Full Name */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">FULL NAME</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block truncate">{employee.name}</span>
            </div>

            {/* Designation */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">DESIGNATION / ROLE</span>
              <span className="font-bold text-orange-600 text-xs mt-0.5 block truncate">{employee.designation}</span>
            </div>

            {/* Department */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">DEPARTMENT</span>
              <span className="font-semibold text-slate-800 text-xs mt-0.5 block truncate">{employee.department}</span>
            </div>

            {/* Date of Birth */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">DATE OF BIRTH (DOB)</span>
              <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">
                {employee.dob ? formatDisplayDate(employee.dob) : 'Not Specified'}
              </span>
            </div>

            {/* Blood Group */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">BLOOD GROUP</span>
              <span className="font-bold text-orange-600 text-xs mt-0.5 inline-flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                <span>{employee.bloodGroup || 'Not Specified'}</span>
              </span>
            </div>

            {/* Phone */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">PHONE / MOBILE</span>
              <span className="font-mono font-semibold text-slate-800 text-xs mt-0.5 block">
                {employee.phone ? (
                  <a href={`tel:${employee.phone}`} className="hover:underline text-indigo-600">
                    {employee.phone}
                  </a>
                ) : (
                  'Not Specified'
                )}
              </span>
            </div>

            {/* Email */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">EMAIL ADDRESS</span>
              <span className="font-sans font-semibold text-slate-800 text-xs mt-0.5 block truncate">
                {employee.email ? (
                  <a href={`mailto:${employee.email}`} className="hover:underline text-indigo-600">
                    {employee.email}
                  </a>
                ) : (
                  'Not Specified'
                )}
              </span>
            </div>

            {/* Date of Joining */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">JOINING DATE</span>
              <span className="font-mono font-semibold text-slate-800 text-xs mt-0.5 block">
                {formatDisplayDate(employee.joiningDate)}
              </span>
            </div>

            {/* Issue Date */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">CARD ISSUE DATE</span>
              <span className="font-mono font-semibold text-slate-800 text-xs mt-0.5 block">
                {formatDisplayDate(employee.issueDate)}
              </span>
            </div>

            {/* Expiry Date */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">VALID UNTIL / EXPIRY</span>
              <span className="font-mono font-black text-rose-600 text-xs mt-0.5 block">
                {formatDisplayDate(employee.validUntil)}
              </span>
            </div>

            {/* Company Name */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">ORGANIZATION</span>
              <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">
                {activeCompany.name}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Digital ID Card with Downloads */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-orange-600" />
                <span>Digital ID Badge Card</span>
              </h3>
              <p className="text-[11px] text-slate-500">Official CR80 Card (85.60 × 53.98 mm)</p>
            </div>

            {/* Front / Back Toggle Buttons */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveSide('front')}
                className={`px-3 py-1 font-semibold rounded-lg transition-all cursor-pointer ${
                  activeSide === 'front'
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Front Face
              </button>
              <button
                type="button"
                onClick={() => setActiveSide('back')}
                className={`px-3 py-1 font-semibold rounded-lg transition-all cursor-pointer ${
                  activeSide === 'back'
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Back Face
              </button>
            </div>
          </div>

          {/* Interactive Card Presentation */}
          <div className="flex justify-center py-2 overflow-x-auto">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center">
              {activeSide === 'front' ? (
                <IDCardFront employee={employee} company={activeCompany} className="shadow-md" />
              ) : (
                <IDCardBack employee={employee} company={activeCompany} className="shadow-md" />
              )}
            </div>
          </div>

          {/* Offscreen fixed containers for export capture */}
          <div
            style={{
              position: 'fixed',
              left: '-9999px',
              top: 0,
              pointerEvents: 'none',
              zIndex: -9999,
              opacity: 1
            }}
            aria-hidden="true"
          >
            <div ref={frontRef} style={{ width: '85.6mm', height: '53.98mm' }}>
              <IDCardFront employee={employee} company={activeCompany} />
            </div>
            <div ref={backRef} style={{ width: '85.6mm', height: '53.98mm' }}>
              <IDCardBack employee={employee} company={activeCompany} />
            </div>
          </div>

          {/* Download Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-orange-600" />
              <span>Download & Print Official ID Card</span>
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
                <span>Front Face (PNG)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadBack}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Back Face (PNG)</span>
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

        {/* Legal Disclaimer Footer */}
        <div className="text-center text-[10px] text-slate-400 max-w-sm mx-auto leading-relaxed pt-2">
          {activeCompany.disclaimerText ||
            'This card is strictly temporary and remains the property of the company. Scan verified by Google Lens.'}
        </div>
      </div>
    </div>
  );
};

