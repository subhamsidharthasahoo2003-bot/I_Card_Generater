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
import { VerifyCard } from './pages/VerifyCard';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <Routes>
            {/* Standalone clean mobile verification page for Google Lens scanner */}
            <Route path="/verify" element={<VerifyCard />} />

            {/* Admin Backoffice Application Routes */}
            <Route
              path="/"
              element={
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              }
            />
            <Route
              path="/import"
              element={
                <AppLayout>
                  <ExcelImport />
                </AppLayout>
              }
            />
            <Route
              path="/employees"
              element={
                <AppLayout>
                  <Employees />
                </AppLayout>
              }
            />
            <Route
              path="/generator"
              element={
                <AppLayout>
                  <IDCardGenerator />
                </AppLayout>
              }
            />
            <Route
              path="/print"
              element={
                <AppLayout>
                  <PrintPreview />
                </AppLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <AppLayout>
                  <Settings />
                </AppLayout>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
