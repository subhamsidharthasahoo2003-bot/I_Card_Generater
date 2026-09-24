import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Employee } from '../types/employee';
import { CompanySettings, DEFAULT_COMPANY_SETTINGS } from '../types/company';
import { ValidityConfig, ValidityPreset } from '../types/idCard';
import { getTodayDateString, calculateValidUntil } from '../utils/dateUtils';
import { loadCompanySettings, saveCompanySettings, clearTemporaryStorage } from '../services/storageService';
import { generateCardQRCode } from '../services/qrService';

interface AppContextType {
  employees: Employee[];
  selectedIds: Set<string>;
  validityConfig: ValidityConfig;
  companySettings: CompanySettings;
  cardsPrintedCount: number;
  isGeneratingQRs: boolean;
  
  // Actions
  setEmployees: (employees: Employee[]) => void;
  updateEmployeePhoto: (id: string, photoUrl: string) => void;
  applyPhotoMap: (photoMap: Map<string, string>) => { matched: number; total: number };
  toggleSelectEmployee: (id: string) => void;
  toggleSelectAll: (select?: boolean) => void;
  setValidityConfig: (config: ValidityConfig) => void;
  updateValidityPreset: (preset: ValidityPreset, customDate?: string) => void;
  updateSingleEmployeeValidity: (id: string, validUntil: string) => void;
  ensureQRCodesGenerated: (force?: boolean) => Promise<void>;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
  recordPrintJob: (count: number) => void;
  clearTemporaryData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployeesState] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [companySettings, setCompanySettingsState] = useState<CompanySettings>(() => loadCompanySettings());
  const [cardsPrintedCount, setCardsPrintedCount] = useState<number>(0);
  const [isGeneratingQRs, setIsGeneratingQRs] = useState<boolean>(false);

  const today = getTodayDateString();
  const [validityConfig, setValidityConfigState] = useState<ValidityConfig>({
    preset: '7days',
    issueDate: today,
    customDate: calculateValidUntil(today, '7days')
  });

  // Save company settings when updated
  const updateCompanySettings = (partial: Partial<CompanySettings>) => {
    setCompanySettingsState(prev => {
      const updated = { ...prev, ...partial };
      saveCompanySettings(updated);
      return updated;
    });
  };

  const setEmployees = useCallback((newEmployees: Employee[]) => {
    setEmployeesState(newEmployees);
    // Automatically select all valid employees by default
    const validIds = newEmployees.filter(e => e.status !== 'Invalid').map(e => e.id);
    setSelectedIds(new Set(validIds));
  }, []);

  const updateEmployeePhoto = useCallback((id: string, photoUrl: string) => {
    setEmployeesState(prev =>
      prev.map(emp => {
        if (emp.id === id) {
          return {
            ...emp,
            photoUrl,
            status: 'Ready'
          };
        }
        return emp;
      })
    );
  }, []);

  const applyPhotoMap = useCallback((photoMap: Map<string, string>) => {
    let matched = 0;
    setEmployeesState(prev =>
      prev.map(emp => {
        const empIdUpper = emp.id.trim().toUpperCase();
        // Look up by Employee ID or fileName base
        let matchedPhoto = photoMap.get(empIdUpper);
        if (!matchedPhoto && emp.photoFileName) {
          const fileBase = emp.photoFileName.substring(0, emp.photoFileName.lastIndexOf('.')).toUpperCase();
          matchedPhoto = photoMap.get(fileBase);
        }

        if (matchedPhoto) {
          matched++;
          return {
            ...emp,
            photoUrl: matchedPhoto,
            status: 'Ready'
          };
        }
        return emp;
      })
    );

    return { matched, total: photoMap.size };
  }, []);

  const toggleSelectEmployee = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((select?: boolean) => {
    if (select === undefined) {
      setSelectedIds(prev => {
        if (prev.size === employees.length) {
          return new Set();
        } else {
          return new Set(employees.map(e => e.id));
        }
      });
    } else if (select) {
      setSelectedIds(new Set(employees.map(e => e.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [employees]);

  const setValidityConfig = useCallback((config: ValidityConfig) => {
    setValidityConfigState(config);
  }, []);

  const updateValidityPreset = useCallback((preset: ValidityPreset, customDate?: string) => {
    const todayStr = getTodayDateString();
    const newValidUntil = calculateValidUntil(todayStr, preset, customDate);

    setValidityConfigState({
      preset,
      issueDate: todayStr,
      customDate: customDate || newValidUntil
    });

    // Update all employees
    setEmployeesState(prev =>
      prev.map(emp => ({
        ...emp,
        issueDate: todayStr,
        validUntil: newValidUntil,
        // Reset QR code so it regenerates with the new validity dates
        qrCodeDataUrl: undefined
      }))
    );
  }, []);

  const updateSingleEmployeeValidity = useCallback((id: string, validUntil: string) => {
    setEmployeesState(prev =>
      prev.map(emp => {
        if (emp.id === id) {
          return {
            ...emp,
            validUntil,
            qrCodeDataUrl: undefined
          };
        }
        return emp;
      })
    );
  }, []);

  // Ensure QR Codes are generated for employees
  const ensureQRCodesGenerated = useCallback(async (force: boolean = false) => {
    const needsQR = force || employees.some(e => !e.qrCodeDataUrl);
    if (!needsQR) return;

    setIsGeneratingQRs(true);
    try {
      const updatedEmployees = await Promise.all(
        employees.map(async emp => {
          if (!force && emp.qrCodeDataUrl) return emp;
          const qrUrl = await generateCardQRCode({
            id: emp.id,
            name: emp.name,
            designation: emp.designation,
            department: emp.department,
            phone: emp.phone,
            email: emp.email,
            dob: emp.dob,
            bloodGroup: emp.bloodGroup,
            issueDate: emp.issueDate,
            validUntil: emp.validUntil,
            company: companySettings.name,
            baseUrl: companySettings.verificationBaseUrl
          });
          return {
            ...emp,
            qrCodeDataUrl: qrUrl
          };
        })
      );
      setEmployeesState(updatedEmployees);
    } catch (err) {
      console.error('Error generating QR codes:', err);
    } finally {
      setIsGeneratingQRs(false);
    }
  }, [employees, companySettings.name, companySettings.verificationBaseUrl]);

  const recordPrintJob = useCallback((count: number) => {
    setCardsPrintedCount(prev => prev + count);
  }, []);

  // Fully clear all temporary data
  const clearTemporaryData = useCallback(() => {
    setEmployeesState([]);
    setSelectedIds(new Set());
    setCardsPrintedCount(0);
    clearTemporaryStorage();
    const todayStr = getTodayDateString();
    setValidityConfigState({
      preset: '7days',
      issueDate: todayStr,
      customDate: calculateValidUntil(todayStr, '7days')
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        employees,
        selectedIds,
        validityConfig,
        companySettings,
        cardsPrintedCount,
        isGeneratingQRs,
        setEmployees,
        updateEmployeePhoto,
        applyPhotoMap,
        toggleSelectEmployee,
        toggleSelectAll,
        setValidityConfig,
        updateValidityPreset,
        updateSingleEmployeeValidity,
        ensureQRCodesGenerated,
        updateCompanySettings,
        recordPrintJob,
        clearTemporaryData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
