import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmployeeTable } from '../components/employees/EmployeeTable';
import { PhotoUploadModal } from '../components/employees/PhotoUploadModal';
import { CardPreview } from '../components/id-card/CardPreview';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { Employee } from '../types/employee';
import { Users, CreditCard, Printer, Plus, FolderArchive } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Employees: React.FC = () => {
  const { employees, selectedIds, companySettings, updateEmployeePhoto } = useApp();
  const { showToast } = useToast();

  const [activeEmployeeForCard, setActiveEmployeeForCard] = useState<Employee | null>(null);
  const [activeEmployeeForPhoto, setActiveEmployeeForPhoto] = useState<Employee | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Employee Directory & Credentials
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Manage loaded temporary employees, inspect credential status, and trigger generation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/import"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Import More</span>
          </Link>
          {employees.length > 0 && (
            <Link
              to="/generator"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Generate ({selectedIds.size}) Cards</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Table */}
      <EmployeeTable
        onViewCard={emp => setActiveEmployeeForCard(emp)}
        onReplacePhoto={emp => setActiveEmployeeForPhoto(emp)}
      />

      {/* Card Preview Modal */}
      {activeEmployeeForCard && (
        <Modal
          isOpen={!!activeEmployeeForCard}
          onClose={() => setActiveEmployeeForCard(null)}
          title={`Temporary ID Badge: ${activeEmployeeForCard.name}`}
          subtitle={`Employee ID: ${activeEmployeeForCard.id} • ${activeEmployeeForCard.department}`}
          maxWidth="lg"
        >
          <div className="py-2">
            <CardPreview employee={activeEmployeeForCard} company={companySettings} />
          </div>
        </Modal>
      )}

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={!!activeEmployeeForPhoto}
        onClose={() => setActiveEmployeeForPhoto(null)}
        employee={activeEmployeeForPhoto}
        onSavePhoto={(empId, photoUrl) => {
          updateEmployeePhoto(empId, photoUrl);
          showToast('success', 'Photo Updated', `Photo assigned to ${empId}.`);
        }}
      />
    </div>
  );
};
