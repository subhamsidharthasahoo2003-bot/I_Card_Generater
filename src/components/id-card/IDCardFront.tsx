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
      className={`relative cr80-card bg-white rounded-lg shadow-sm border border-neutral-300 overflow-hidden flex flex-col justify-between select-none text-neutral-900 ${className}`}
      style={{
        width: '85.6mm',
        height: '53.98mm',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Black Header with Orange Accent Line */}
      <div className="bg-black text-white px-3 py-1 flex items-center justify-between border-b-2 border-orange-500">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt="Logo"
              className="w-4 h-4 object-contain rounded-xs"
            />
          ) : (
            <div className="w-4 h-4 bg-orange-600 rounded-xs flex items-center justify-center shrink-0">
              <Building2 className="w-2.5 h-2.5 text-white" />
            </div>
          )}
          <span className="font-extrabold text-[8px] tracking-wider uppercase truncate max-w-[170px] text-white">
            {company.name}
          </span>
        </div>
        <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded-xs bg-orange-500 text-black tracking-wider">
          TEMPORARY
        </span>
      </div>

      {/* Main Body: White Background with Bold Black and Orange Typography */}
      <div className="flex-1 px-3 py-1.5 flex gap-3 items-center bg-white">
        {/* Photo Section with Black border & Orange accent */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-[20.5mm] h-[24.5mm] rounded-md border-2 border-black overflow-hidden bg-neutral-100 flex items-center justify-center shadow-xs">
            {employee.photoUrl ? (
              <img
                src={employee.photoUrl}
                alt={employee.name}
                className="w-full h-full object-cover object-top"
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
            <span className="text-[7px] font-bold text-neutral-700 mt-0.5">
              Blood: <strong className="text-orange-600">{employee.bloodGroup}</strong>
            </span>
          )}
        </div>

        {/* Clean Details Section (No empid and department table) */}
        <div className="flex-1 flex flex-col justify-center min-w-0 pr-1">
          <h4 className="font-black text-[13px] text-black leading-tight tracking-tight truncate">
            {employee.name}
          </h4>
          <p className="text-[7px] font-extrabold text-orange-600 uppercase tracking-wide leading-tight truncate mt-0.5">
            {employee.designation}
          </p>

          <div className="mt-1.5 space-y-1">
            {/* DOB & Phone Info */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[7px]">
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
              <div className="flex items-center gap-1 text-[6.8px] font-medium text-neutral-800 truncate max-w-full" title={employee.email}>
                <Mail className="w-2.5 h-2.5 text-orange-600 shrink-0" />
                <span className="truncate font-sans font-medium">{employee.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="p-0.5 bg-white border border-neutral-300 rounded-sm shadow-2xs">
            {employee.qrCodeDataUrl ? (
              <img
                src={employee.qrCodeDataUrl}
                alt="QR Code"
                className="w-[14.5mm] h-[14.5mm] object-contain"
              />
            ) : (
              <div className="w-[14.5mm] h-[14.5mm] bg-neutral-100 flex items-center justify-center text-[6px] text-neutral-400 text-center font-mono">
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
      <div className="bg-orange-600 text-white px-3 py-0.5 flex items-center justify-between text-[7px] font-extrabold border-t border-orange-700">
        <span className="tracking-wider text-white">TEMPORARY EMPLOYEE ID CARD</span>
        <span className="font-mono text-black bg-white px-1 py-0.2 rounded-2xs text-[6.5px] font-bold">
          EXP: {formatDisplayDate(employee.validUntil)}
        </span>
      </div>
    </div>
  );
};
