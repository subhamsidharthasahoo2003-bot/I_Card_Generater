import React from 'react';
import { ValidityPreset } from '../../types/idCard';
import { useApp } from '../../context/AppContext';
import { formatDisplayDate, getTodayDateString } from '../../utils/dateUtils';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

export const ValidityPicker: React.FC = () => {
  const { validityConfig, updateValidityPreset } = useApp();

  const presets: { id: ValidityPreset; label: string; desc: string }[] = [
    { id: 'today', label: 'Today Only', desc: 'Expires end of current day' },
    { id: '1day', label: '1 Day', desc: 'Valid for 24 hours (tomorrow)' },
    { id: '7days', label: '7 Days', desc: 'Standard 1-week temp badge' },
    { id: 'custom', label: 'Custom Date', desc: 'Set a specific expiry date' }
  ];

  const handlePresetSelect = (preset: ValidityPreset) => {
    updateValidityPreset(preset, validityConfig.customDate);
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateValidityPreset('custom', val);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Card Validity Period</h4>
            <p className="text-xs text-slate-500">
              Applies temporary expiration date across all cards
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block font-medium">Issue Date</span>
          <span className="text-xs font-bold text-slate-800">
            {formatDisplayDate(validityConfig.issueDate || getTodayDateString())}
          </span>
        </div>
      </div>

      {/* Preset Radio Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {presets.map(item => {
          const isSelected = validityConfig.preset === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handlePresetSelect(item.id)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-600/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold ${
                    isSelected ? 'text-indigo-900' : 'text-slate-800'
                  }`}
                >
                  {item.label}
                </span>
                {isSelected && <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block leading-tight">
                {item.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom Date Input */}
      {validityConfig.preset === 'custom' && (
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 shrink-0">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Select Expiry Date:</span>
          </div>
          <input
            type="date"
            min={getTodayDateString()}
            value={validityConfig.customDate || ''}
            onChange={handleCustomDateChange}
            className="w-full sm:w-auto px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Active Calculated Expiration Banner */}
      <div className="mt-4 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
        <span className="text-amber-900 font-medium">Calculated "Valid Until" Date:</span>
        <span className="font-mono font-bold text-amber-950 bg-amber-200/80 px-2 py-0.5 rounded">
          {formatDisplayDate(validityConfig.customDate)}
        </span>
      </div>
    </div>
  );
};
