import React from 'react';
import { Employee } from '../../types/employee';
import { CompanySettings } from '../../types/company';
import { formatDisplayDate } from '../../utils/dateUtils';
import { Building2, UserX, Phone, Calendar, Mail } from 'lucide-react';

interface IDCardFrontProps {
  employee: Employee;
  company: CompanySettings;
  className?: string;
  isPrintMode?: boolean;
}

export const IDCardFront: React.FC<IDCardFrontProps> = ({
  employee,
  company,
  className = '',
  isPrintMode = false
}) => {
  return (
    <div
      className={`relative cr80-card bg-white rounded-lg border border-neutral-300 overflow-hidden flex flex-col justify-between select-none text-neutral-900 ${className}`}
      style={{
        width: '85.6mm',
        height: '53.98mm',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        borderColor: '#cbd5e1',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Top Black Header with Orange Accent Line */}
      <div
        className="h-[6.5mm] shrink-0 text-white px-3 flex items-center justify-between"
        style={{ backgroundColor: '#000000', borderBottom: '2px solid #ea580c' }}
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt="Logo"
              className="w-4 h-4 object-contain rounded-xs"
            />
          ) : (
            <div
              className="w-4 h-4 rounded-xs flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#ea580c' }}
            >
              <Building2 className="w-2.5 h-2.5 text-white" />
            </div>
          )}
          <span className="font-extrabold text-[8px] tracking-wider uppercase truncate max-w-[170px] text-white">
            {company.name}
          </span>
        </div>
        <span
          className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded-xs tracking-wider"
          style={{ backgroundColor: '#f97316', color: '#000000' }}
        >
          TEMPORARY
        </span>
      </div>

      {/* Main Body: White Background with Bold Black and Orange Typography */}
      <div className="flex-1 px-3 py-1 flex gap-2.5 items-center bg-white overflow-hidden">
        {/* Photo Section with Black border & Orange accent */}
        <div className="flex flex-col items-center shrink-0">
          <div
            className="w-[19.5mm] h-[23.5mm] rounded-md border-2 border-black overflow-hidden flex items-center justify-center"
            style={{
              backgroundColor: '#f8fafc',
              borderColor: '#000000',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)'
            }}
          >
            {employee.photoUrl ? (
              <img
                src={employee.photoUrl}
                alt={employee.name}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  const target = e.currentTarget;
                  const currentSrc = target.src;
                  if (currentSrc.includes('lh3.googleusercontent.com/d/')) {
                    const match = currentSrc.match(/\/d\/([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) {
                      target.src = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
                      return;
                    }
                  } else if (currentSrc.includes('drive.google.com/thumbnail')) {
                    const match = currentSrc.match(/id=([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) {
                      target.src = `https://lh3.googleusercontent.com/d/${match[1]}`;
                      return;
                    }
                  }
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.img-fallback')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'img-fallback flex flex-col items-center justify-center text-neutral-400 p-1 text-center w-full h-full';
                    fallback.innerHTML = `
                      <span class="text-[6.5px] font-bold text-neutral-500 uppercase tracking-tighter text-center leading-tight font-sans">
                        ${employee.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                      </span>
                      <span class="text-[5.5px] font-semibold text-orange-600 mt-0.5 leading-none">Photo Unavailable</span>
                    `;
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-neutral-400 p-1 text-center">
                <UserX className="w-5 h-5 text-neutral-400" />
                <span className="text-[6.5px] font-bold text-orange-600 mt-0.5 leading-none">
                  Photo Missing
                </span>
              </div>
            )}
          </div>
          {employee.bloodGroup && (
            <span className="text-[6.5px] font-bold text-neutral-700 mt-0.5 leading-none">
              Blood: <strong className="text-orange-600">{employee.bloodGroup}</strong>
            </span>
          )}
        </div>

        {/* Clean Details Section (No empid and department table) */}
        <div className="flex-1 flex flex-col justify-center min-w-0 pr-1 overflow-hidden">
          <h4 className="font-black text-[12px] text-black leading-tight tracking-tight truncate">
            {employee.name}
          </h4>
          <p className="text-[6.8px] font-extrabold text-orange-600 uppercase tracking-wide leading-tight truncate mt-0.5">
            {employee.designation}
          </p>

          <div className="mt-1 space-y-0.5">
            {/* DOB & Phone Info */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[6.8px]">
              {employee.dob && (
                <div className="flex items-center gap-1 text-neutral-800 font-medium">
                  <span className="text-orange-600 font-extrabold">DOB:</span>
                  <span className="font-mono font-bold text-black">{formatDisplayDate(employee.dob)}</span>
                </div>
              )}
              {employee.phone && (
                <div className="flex items-center gap-1 text-neutral-700 font-medium">
                  <Phone className="w-2 h-2 text-orange-600 shrink-0" />
                  <span className="font-mono">{employee.phone}</span>
                </div>
              )}
            </div>

            {/* Email Info */}
            {employee.email && (
              <div className="flex items-center gap-1 text-[6.5px] font-medium text-neutral-800 truncate max-w-full" title={employee.email}>
                <Mail className="w-2 h-2 text-orange-600 shrink-0" />
                <span className="truncate font-sans font-medium">{employee.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center shrink-0 ml-0.5">
          <div
            className="p-0.5 bg-white border border-neutral-300 rounded-xs"
            style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}
          >
            {employee.qrCodeDataUrl ? (
              <img
                src={employee.qrCodeDataUrl}
                alt="QR Code"
                className="w-[14mm] h-[14mm] object-contain"
              />
            ) : (
              <div className="w-[14mm] h-[14mm] bg-neutral-100 flex items-center justify-center text-[6px] text-neutral-400 text-center font-mono">
                QR CODE
              </div>
            )}
          </div>
          <span className="text-[5.5px] font-mono font-bold text-orange-600 mt-0.5 tracking-tighter">
            SCAN TO VERIFY
          </span>
        </div>
      </div>

      {/* Footer Banner: Solid Corporate Orange with Black & White text */}
      <div
        className="h-[5.5mm] shrink-0 text-white px-3 flex items-center justify-between text-[6.8px] font-extrabold"
        style={{ backgroundColor: '#ea580c', borderTop: '1px solid #c2410c' }}
      >
        <span className="tracking-wider text-white">TEMPORARY EMPLOYEE ID CARD</span>
        <span
          className="font-mono px-1 py-0.2 rounded-2xs text-[6.2px] font-bold"
          style={{ backgroundColor: '#ffffff', color: '#000000' }}
        >
          EXP: {formatDisplayDate(employee.validUntil)}
        </span>
      </div>
    </div>
  );
};

