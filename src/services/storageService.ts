import { CompanySettings, DEFAULT_COMPANY_SETTINGS } from '../types/company';

const COMPANY_SETTINGS_KEY = 'temp_id_card_company_settings';

export function loadCompanySettings(): CompanySettings {
  try {
    const raw = localStorage.getItem(COMPANY_SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to load company settings from storage:', err);
  }
  return DEFAULT_COMPANY_SETTINGS;
}

export function saveCompanySettings(settings: CompanySettings): void {
  try {
    localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save company settings to storage:', err);
  }
}

/**
 * Clear temporary cache if any (we intentionally do not store employee data permanently)
 */
export function clearTemporaryStorage(): void {
  // Session storage cleanup if any was used
  sessionStorage.clear();
}
