import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  CreditCard,
  Printer,
  Settings,
  Trash2,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  onClearData: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onClearData,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const { employees, selectedIds } = useApp();

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      to: '/import',
      label: 'Excel Import',
      icon: <FileSpreadsheet className="w-4 h-4" />
    },
    {
      to: '/employees',
      label: 'Employees',
      icon: <Users className="w-4 h-4" />,
      badge: employees.length > 0 ? employees.length : undefined
    },
    {
      to: '/generator',
      label: 'ID Card Generator',
      icon: <CreditCard className="w-4 h-4" />
    },
    {
      to: '/print',
      label: 'Print Preview',
      icon: <Printer className="w-4 h-4" />,
      badge: selectedIds.size > 0 ? selectedIds.size : undefined,
      badgeColor: 'bg-indigo-100 text-indigo-700'
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ease-in-out no-print sidebar ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Logo / App Title */}
        <div>
          <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight leading-tight">
                TempID <span className="text-indigo-400">Pro</span>
              </h1>
              <span className="text-[10px] font-semibold text-slate-400 block tracking-wider uppercase">
                Temporary Badge Suite
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Session Box with Clear Temporary Data */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
              <span>Session Memory:</span>
              <span className="text-emerald-400 font-bold">Active</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400 leading-tight">
              Temporary employee data is never saved to a permanent database.
            </div>
          </div>

          <button
            type="button"
            onClick={onClearData}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-white hover:bg-red-600/90 border border-red-500/30 hover:border-red-600 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Temporary Data</span>
          </button>
        </div>
      </aside>
    </>
  );
};
