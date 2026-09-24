import QRCode from 'qrcode';

export interface QRCardPayload {
  id: string;
  name: string;
  issueDate: string;
  validUntil: string;
  designation?: string;
  department?: string;
  phone?: string;
  email?: string;
  dob?: string;
  bloodGroup?: string;
  type?: string;
  company?: string;
  baseUrl?: string;
}

/**
 * Builds the verification and download URL for an employee card.
 * Encodes card attributes so any smartphone scanning with Google Lens
 * can verify access and download the card without requiring a backend database.
 */
export function buildVerificationUrl(payload: QRCardPayload): string {
  let origin = '';
  if (payload.baseUrl && payload.baseUrl.trim()) {
    origin = payload.baseUrl.trim().replace(/\/+$/, '');
  } else if (typeof window !== 'undefined' && window.location && window.location.origin) {
    origin = window.location.origin;
  } else {
    origin = 'https://trackepay.com';
  }

  // Create lightweight compact data payload
  const compactData = {
    id: payload.id,
    n: payload.name,
    d: payload.designation || '',
    dp: payload.department || '',
    p: payload.phone || '',
    e: payload.email || '',
    dob: payload.dob || '',
    bg: payload.bloodGroup || '',
    iss: payload.issueDate,
    exp: payload.validUntil,
    c: payload.company || ''
  };

  let encoded = '';
  try {
    encoded = btoa(encodeURIComponent(JSON.stringify(compactData)));
  } catch {
    encoded = encodeURIComponent(JSON.stringify(compactData));
  }

  return `${origin}/verify?id=${encodeURIComponent(payload.id)}&data=${encodeURIComponent(encoded)}`;
}

/**
 * Decodes the verification payload from the URL parameter
 */
export function decodeVerificationData(dataParam: string): Partial<QRCardPayload> | null {
  if (!dataParam) return null;
  try {
    const jsonStr = decodeURIComponent(atob(dataParam));
    const obj = JSON.parse(jsonStr);
    return {
      id: obj.id,
      name: obj.n,
      designation: obj.d,
      department: obj.dp,
      phone: obj.p,
      email: obj.e,
      dob: obj.dob,
      bloodGroup: obj.bg,
      issueDate: obj.iss,
      validUntil: obj.exp,
      company: obj.c
    };
  } catch {
    try {
      const obj = JSON.parse(decodeURIComponent(dataParam));
      return {
        id: obj.id,
        name: obj.n,
        designation: obj.d,
        department: obj.dp,
        phone: obj.p,
        email: obj.e,
        dob: obj.dob,
        bloodGroup: obj.bg,
        issueDate: obj.iss,
        validUntil: obj.exp,
        company: obj.c
      };
    } catch (e) {
      console.error('Error decoding verification data:', e);
      return null;
    }
  }
}

/**
 * Generates a data URL for a QR code representing the temporary employee card.
 * Encodes a real Web URL so scanning with Google Lens or smartphone cameras
 * automatically opens the employee's verification & ID card download page!
 */
export async function generateCardQRCode(payload: QRCardPayload): Promise<string> {
  const verifyUrl = buildVerificationUrl(payload);

  try {
    const dataUrl = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}
