import React, { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: ReactNode;
  trend?: string;
  colorVariant?: 'indigo' | 'emerald' | 'amber' | 'blue';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  colorVariant = 'indigo'
}) => {
  const colorStyles = {
    indigo: {
      bg: 'bg-indigo-50/70 text-indigo-600',
      border: 'border-indigo-100',
      glow: 'group-hover:border-indigo-300'
    },
    emerald: {
      bg: 'bg-emerald-50/70 text-emerald-600',
      border: 'border-emerald-100',
      glow: 'group-hover:border-emerald-300'
    },
    amber: {
      bg: 'bg-amber-50/70 text-amber-600',
      border: 'border-amber-100',
      glow: 'group-hover:border-amber-300'
    },
    blue: {
      bg: 'bg-blue-50/70 text-blue-600',
      border: 'border-blue-100',
      glow: 'group-hover:border-blue-300'
    }
  }[colorVariant];

  return (
    <div
      className={`group relative bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden ${colorStyles.glow}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${colorStyles.bg} transition-transform group-hover:scale-110`}>
          {icon}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">{subtitle}</span>
        {trend && (
          <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-[10px]">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
