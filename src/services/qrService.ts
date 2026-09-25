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
  address?: string;
  joiningDate?: string;
  photoUrl?: string;
  type?: string;
  company?: string;
  baseUrl?: string;
}

/**
 * Builds the verification and download URL for an employee card.
 * Encodes all card attributes and photo references so any smartphone scanning with Google Lens
 * verifies all employee data and downloads the card without requiring a backend database.
 */
export function buildVerificationUrl(payload: QRCardPayload): string {
  let origin = '';
  if (payload.baseUrl && payload.baseUrl.trim()) {
    origin = payload.baseUrl.trim().replace(/\/+$/, '');
  } else if (typeof window !== 'undefined' && window.location && window.location.origin) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      origin = 'https://i-card-generater.vercel.app';
    } else {
      origin = window.location.origin;
    }
  } else {
    origin = 'https://i-card-generater.vercel.app';
  }

  // Create compact data payload containing all employee attributes
  const compactData: Record<string, string> = {
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
    c: payload.company || '',
    jd: payload.joiningDate || '',
    addr: payload.address || ''
  };

  // If photo is Google Drive, extract ID to keep QR code lightweight and high density
  if (payload.photoUrl) {
    const driveMatch =
      payload.photoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
      payload.photoUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      compactData.ph = driveMatch[1];
    } else if (payload.photoUrl.startsWith('http://') || payload.photoUrl.startsWith('https://')) {
      compactData.ph = payload.photoUrl;
    }
  }

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
    let photoUrl = '';
    if (obj.ph) {
      if (obj.ph.startsWith('http://') || obj.ph.startsWith('https://')) {
        photoUrl = obj.ph;
      } else {
        photoUrl = `https://lh3.googleusercontent.com/d/${obj.ph}`;
      }
    }
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
      company: obj.c,
      joiningDate: obj.jd,
      address: obj.addr,
      photoUrl
    };
  } catch {
    try {
      const obj = JSON.parse(decodeURIComponent(dataParam));
      let photoUrl = '';
      if (obj.ph) {
        if (obj.ph.startsWith('http://') || obj.ph.startsWith('https://')) {
          photoUrl = obj.ph;
        } else {
          photoUrl = `https://lh3.googleusercontent.com/d/${obj.ph}`;
        }
      }
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
        company: obj.c,
        joiningDate: obj.jd,
        address: obj.addr,
        photoUrl
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
