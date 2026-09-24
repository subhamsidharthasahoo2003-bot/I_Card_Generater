import React, { useState, useMemo } from 'react';
import { Employee } from '../../types/employee';
import { useApp } from '../../context/AppContext';
import { formatDisplayDate } from '../../utils/dateUtils';
import {
  Search,
  Filter,
  Eye,
  Camera,
  CreditCard,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  UserX,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmployeeTableProps {
  onViewCard: (employee: Employee) => void;
  onReplacePhoto: (employee: Employee) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  onViewCard,
  onReplacePhoto
}) => {
  const { employees, selectedIds, toggleSelectEmployee, toggleSelectAll } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState<string>('all');

  // Extract unique designations for filter dropdown
  const designations = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(emp => {
      if (emp.designation) set.add(emp.designation);
    });
    return Array.from(set).sort();
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        emp.name.toLowerCase().includes(q) ||
        emp.id.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q) ||
        emp.phone.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q);

      const matchesDesignation =
        selectedDesignation === 'all' || emp.designation === selectedDesignation;

      return matchesSearch && matchesDesignation;
    });
  }, [employees, searchQuery, selectedDesignation]);

  const allFilteredSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every(emp => selectedIds.has(emp.id));

  const handleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      filteredEmployees.forEach(emp => {
        if (selectedIds.has(emp.id)) {
          toggleSelectEmployee(emp.id);
        }
      });
    } else {
      filteredEmployees.forEach(emp => {
        if (!selectedIds.has(emp.id)) {
          toggleSelectEmployee(emp.id);
        }
      });
    }
  };

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileSpreadsheet className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Employee Records Loaded</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
          Import an Excel file containing employee information to begin generating temporary ID badges.
        </p>
        <div className="mt-6">
          <Link
            to="/import"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
          >
            Go to Excel Import
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Controls: Search, Dept Filter, Selection Stats */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, name, role..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Designation Filter */}
          <div className="relative w-full sm:w-56">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedDesignation}
              onChange={e => setSelectedDesignation(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">All Designations ({designations.length})</option>
              {designations.map(desig => (
                <option key={desig} value={desig}>
                  {desig}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selection Status Badge & Generator Link */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="text-xs text-slate-600 font-medium">
            <span className="font-bold text-indigo-700">{selectedIds.size}</span> of{' '}
            <span className="font-bold text-slate-900">{employees.length}</span> selected
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleSelectAll()}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              {selectedIds.size === employees.length ? 'Deselect All' : 'Select All'}
            </button>
            <Link
              to="/generator"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Generate Cards</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={handleSelectAllFiltered}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                />
              </th>
              <th className="py-3 px-3">Photo</th>
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3">Designation</th>
              <th className="py-3 px-3">Phone</th>
              <th className="py-3 px-3">Issue Date</th>
              <th className="py-3 px-3">Valid Until</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredEmployees.map(emp => {
              const isSelected = selectedIds.has(emp.id);

              return (
                <tr
                  key={emp.id}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    isSelected ? 'bg-indigo-50/30' : ''
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectEmployee(emp.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                    />
                  </td>

                  {/* Photo Thumbnail */}
                  <td className="py-2.5 px-3">
                    <div className="relative group w-9 h-11 rounded-md overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      {emp.photoUrl ? (
                        <img
                          src={emp.photoUrl}
                          alt={emp.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const src = target.src;
                            if (src.includes('drive.google.com/thumbnail')) {
                              const match = src.match(/id=([a-zA-Z0-9_-]+)/);
                              if (match && match[1]) {
                                target.src = `https://lh3.googleusercontent.com/d/${match[1]}`;
                                return;
                              }
                            }
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.table-fallback')) {
                              const fb = document.createElement('div');
                              fb.className = 'table-fallback text-[10px] font-bold text-slate-500 uppercase';
                              fb.textContent = emp.name.slice(0, 2);
                              parent.appendChild(fb);
                            }
                          }}
                        />
                      ) : (
                        <UserX className="w-4 h-4 text-slate-400" />
                      )}
                      <button
                        type="button"
                        onClick={() => onReplacePhoto(emp)}
                        title="Upload/Replace Photo"
                        className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Name & DOB */}
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-800">{emp.name}</div>
                    {emp.dob && (
                      <div className="text-[10px] text-slate-500 font-medium font-mono mt-0.5">
                        DOB: {formatDisplayDate(emp.dob)}
                      </div>
                    )}
                  </td>

                  {/* Designation */}
                  <td className="py-2.5 px-3 text-slate-600 font-medium">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold text-[11px]">
                      {emp.designation}
                    </span>
                  </td>

                  {/* Contact: Phone & Email */}
                  <td className="py-2.5 px-3">
                    <div className="font-mono text-slate-700 text-xs font-semibold">{emp.phone || '—'}</div>
                    {emp.email && (
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px] mt-0.5">
                        {emp.email}
                      </div>
                    )}
                  </td>

                  {/* Issue Date */}
                  <td className="py-2.5 px-3 text-slate-600">
                    {formatDisplayDate(emp.issueDate)}
                  </td>

                  {/* Valid Until */}
                  <td className="py-2.5 px-3 font-bold text-rose-600">
                    {formatDisplayDate(emp.validUntil)}
                  </td>

                  {/* Status Badge */}
                  <td className="py-2.5 px-3">
                    {emp.photoUrl ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Photo Missing
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewCard(emp)}
                        title="Print / Download Single Card"
                        className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onViewCard(emp)}
                        title="Quick Preview Card"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onReplacePhoto(emp)}
                        title="Change Photo"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <Link
                        to="/generator"
                        onClick={() => {
                          if (!selectedIds.has(emp.id)) {
                            toggleSelectEmployee(emp.id);
                          }
                        }}
                        title="Generate Card"
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {filteredEmployees.length} of {employees.length} employees
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Photos Linked: {employees.filter(e => !!e.photoUrl).length}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            Missing Photos: {employees.filter(e => !e.photoUrl).length}
          </span>
        </div>
      </div>
    </div>
  );
};
