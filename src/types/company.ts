export interface CompanySettings {
  name: string;
  tagline: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  authorizedSignatureUrl: string;
  signerTitle: string;
  disclaimerText: string;
  primaryColor: string; // hex or tailwind identifier
  accentColor: string;
  cardTheme: 'corporate-indigo' | 'slate-executive' | 'emerald-tech' | 'crimson-security' | 'amber-industrial';
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  name: "NEXUS INNOVATIONS LTD.",
  tagline: "Global Technology & Consulting",
  logoUrl: "",
  address: "Tower 4, Silicon Boulevard, Info City, Bhubaneswar 751024",
  phone: "+91 (674) 662-8900",
  email: "hr-security@nexusinnovations.com",
  website: "www.nexusinnovations.com",
  authorizedSignatureUrl: "",
  signerTitle: "Head of HR & Admin",
  disclaimerText: "This card is strictly temporary and remains property of the company. If found, please return to the Security Desk immediately.",
  primaryColor: "#000000",
  accentColor: "#ea580c",
  cardTheme: 'amber-industrial'
};
