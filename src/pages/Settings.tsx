import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { fileToDataUrl } from '../services/photoService';
import { DEFAULT_COMPANY_SETTINGS } from '../types/company';
import {
  Building2,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  FileSignature,
  Palette,
  Shield
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { companySettings, updateCompanySettings } = useApp();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({ ...companySettings });
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const dataUrl = await fileToDataUrl(file);
      setFormData(prev => ({ ...prev, logoUrl: dataUrl }));
      showToast('info', 'Logo Loaded', 'Company logo loaded into preview.');
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const dataUrl = await fileToDataUrl(file);
      setFormData(prev => ({ ...prev, authorizedSignatureUrl: dataUrl }));
      showToast('info', 'Signature Loaded', 'Signatory signature loaded.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(formData);
    showToast('success', 'Settings Saved', 'Company profile and card templates updated.');
  };

  const handleReset = () => {
    setFormData({ ...DEFAULT_COMPANY_SETTINGS });
    updateCompanySettings(DEFAULT_COMPANY_SETTINGS);
    showToast('info', 'Settings Reset', 'Restored default organization configuration.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Organization & Card Settings
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Customize company identity, authorized signatures, and card back disclaimer notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Identity Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Company Information</h3>
              <p className="text-xs text-slate-500">Appears on the top header of all cards</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tagline / Industry
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Corporate Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Security Desk Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                HR / Security Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Website
              </label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Logo Upload Box */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Company Logo
              </label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <div className="flex items-center gap-3">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Logo"
                    className="w-10 h-10 object-contain p-1 border border-slate-200 rounded-lg bg-slate-50"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                >
                  Upload Logo
                </button>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, logoUrl: '' }))}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Authorization & Security Signatures */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Signatory & Card Back Notice</h3>
              <p className="text-xs text-slate-500">
                Printed on the back face of every temporary employee card
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Authorized Signatory Title
              </label>
              <input
                type="text"
                name="signerTitle"
                value={formData.signerTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Signature Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Signatory Signature Stamp
              </label>
              <input
                ref={signatureInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSignatureUpload}
              />
              <div className="flex items-center gap-3">
                {formData.authorizedSignatureUrl ? (
                  <img
                    src={formData.authorizedSignatureUrl}
                    alt="Signature"
                    className="h-10 w-24 object-contain p-1 border border-slate-200 rounded-lg bg-white"
                  />
                ) : (
                  <div className="h-10 w-24 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs italic font-serif">
                    Signatory
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => signatureInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                >
                  Upload Signature
                </button>
                {formData.authorizedSignatureUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, authorizedSignatureUrl: '' }))}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Return Notice & Disclaimer
              </label>
              <textarea
                name="disclaimerText"
                rows={2}
                value={formData.disclaimerText}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Default: "This card is strictly temporary and remains property of the company. If found, please return to the Security Desk immediately."
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
