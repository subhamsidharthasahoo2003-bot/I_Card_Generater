import React from 'react';
import { Employee } from '../../types/employee';
import { CompanySettings } from '../../types/company';
import { formatDisplayDate } from '../../utils/dateUtils';
import { ShieldAlert, Globe, Mail, Phone, MapPin } from 'lucide-react';

interface IDCardBackProps {
  employee: Employee;
  company: CompanySettings;
  className?: string;
  isPrintMode?: boolean;
}

export const IDCardBack: React.FC<IDCardBackProps> = ({
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
      {/* Black Magnetic Stripe Bar with Orange Sub-Stripe */}
      <div
        className="h-[6.5mm] shrink-0 w-full flex items-center justify-between px-3 text-white"
        style={{ backgroundColor: '#000000', borderBottom: '2px solid #ea580c' }}
      >
        <span className="font-mono text-[6.8px] text-neutral-300 tracking-widest font-semibold">
          SECURITY ACCESS • TEMPORARY PASS
        </span>
        <span className="font-mono text-[6.2px] text-neutral-400 tracking-wider">
          ENCODED CHIP
        </span>
      </div>

      {/* Main Body: White with Black Typography & Orange Highlights */}
      <div className="flex-1 px-3 py-1 flex flex-col justify-between text-[6.8px] bg-white overflow-hidden">
        {/* Company & Contact Section */}
        <div className="border-b border-neutral-200 pb-0.5">
          <p className="font-black text-[8.5px] text-black tracking-tight leading-tight truncate">
            {company.name}
          </p>
          <p className="text-[6.2px] text-neutral-700 leading-tight mt-0.5 flex items-center gap-1">
            <MapPin className="w-2 h-2 text-orange-600 shrink-0" />
            <span className="truncate">{company.address}</span>
          </p>
          <div className="flex items-center gap-2.5 text-[5.8px] text-neutral-600 mt-0.5 font-medium truncate">
            <span className="flex items-center gap-0.5">
              <Phone className="w-1.5 h-1.5 text-orange-600 shrink-0" /> {company.phone}
            </span>
            <span className="flex items-center gap-0.5">
              <Mail className="w-1.5 h-1.5 text-orange-600 shrink-0" /> {company.email}
            </span>
            <span className="flex items-center gap-0.5">
              <Globe className="w-1.5 h-1.5 text-orange-600 shrink-0" /> {company.website}
            </span>
          </div>
        </div>

        {/* Validity & Signature */}
        <div className="grid grid-cols-2 gap-2 my-0.5 items-center">
          <div className="space-y-0.5 text-[6.5px]">
            <div className="flex justify-between border-b border-neutral-100 py-0.5">
              <span className="text-neutral-500 font-medium">Issue Date:</span>
              <span className="font-bold text-black">
                {formatDisplayDate(employee.issueDate)}
              </span>
            </div>
            <div className="flex justify-between border-b border-neutral-100 py-0.5">
              <span className="text-neutral-500 font-medium">Valid Until:</span>
              <span className="font-extrabold text-orange-600">
                {formatDisplayDate(employee.validUntil)}
              </span>
            </div>
          </div>

          {/* Signature Box */}
          <div className="flex flex-col items-center justify-end border border-dashed border-neutral-400 rounded-xs p-0.5 bg-neutral-50">
            {company.authorizedSignatureUrl ? (
              <img
                src={company.authorizedSignatureUrl}
                alt="Signature"
                className="h-[5.5mm] object-contain"
              />
            ) : (
              <div className="h-[5.5mm] flex items-center font-serif italic text-[7.5px] text-black font-black">
                Auth. Signatory
              </div>
            )}
            <div className="w-full border-t border-orange-500 text-center mt-0.5">
              <span className="text-[5px] text-neutral-600 block leading-tight font-bold truncate">
                {company.signerTitle || 'Authorized Signature'}
              </span>
            </div>
          </div>
        </div>

        {/* Return Notice in Orange/Black/White */}
        <div className="bg-orange-50 border border-orange-300 rounded-xs p-0.5 px-1.5 flex items-center gap-1">
          <ShieldAlert className="w-2.5 h-2.5 text-orange-600 shrink-0" />
          <p className="text-[5.5px] text-black font-medium leading-tight truncate">
            {company.disclaimerText || 'If found, please return this card to the company security desk.'}
          </p>
        </div>
      </div>

      {/* Bottom Bar: Black with White & Orange text */}
      <div className="h-[5mm] shrink-0 bg-black px-3 flex items-center justify-between text-[6px] text-white font-bold border-t border-orange-500">
        <span className="text-neutral-300">NON-TRANSFERABLE • RETURN UPON EXPIRY</span>
        <span className="font-mono text-orange-400 font-extrabold">REF: {employee.id}</span>
      </div>
    </div>
  );
};
