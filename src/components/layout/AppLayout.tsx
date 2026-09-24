import React, { useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useApp } from '../../context/AppContext';
import { useToast } from '../ui/Toast';
import { useNavigate } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { clearTemporaryData } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  const handleConfirmClear = () => {
    clearTemporaryData();
    showToast('info', 'Temporary Data Cleared', 'All imported employee data and cards have been reset.');
    navigate('/import');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        onClearData={() => setIsConfirmClearOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
          onClearData={() => setIsConfirmClearOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Confirmation Dialog for Clear Temporary Data */}
      <ConfirmDialog
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={handleConfirmClear}
        title="Clear Temporary Data"
        message="Are you sure you want to clear all temporary employee data and generated ID cards? This will reset all current session data and return you to Excel Import."
        confirmLabel="Clear All Data"
        cancelLabel="Keep Working"
        isDestructive={true}
      />
    </div>
  );
};
