export type ValidityPreset = 'today' | '1day' | '7days' | 'custom';

export interface ValidityConfig {
  preset: ValidityPreset;
  customDate?: string; // YYYY-MM-DD
  issueDate: string; // YYYY-MM-DD
}

export type PrintLayoutMode = 'both' | 'front-only' | 'back-only';

export interface IDCardGenerationOptions {
  includeQR: boolean;
  highContrast: boolean;
  showEmergencyContact: boolean;
  showBloodGroup: boolean;
}
