import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/ui/Toast';
import { AppLayout } from './components/layout/AppLayout';

import { Dashboard } from './pages/Dashboard';
import { ExcelImport } from './pages/ExcelImport';
import { Employees } from './pages/Employees';
import { IDCardGenerator } from './pages/IDCardGenerator';
import { PrintPreview } from './pages/PrintPreview';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/import" element={<ExcelImport />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/generator" element={<IDCardGenerator />} />
              <Route path="/print" element={<PrintPreview />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
