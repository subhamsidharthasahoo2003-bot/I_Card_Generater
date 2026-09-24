import QRCode from 'qrcode';

export interface QRCardPayload {
  id: string;
  name: string;
  issueDate: string;
  validUntil: string;
  type?: string;
  company?: string;
}

/**
 * Generates a data URL for a QR code representing the temporary employee card
 */
export async function generateCardQRCode(payload: QRCardPayload): Promise<string> {
  // Format as structured text or JSON
  const qrString = `ID:${payload.id}\nNAME:${payload.name}\nISSUE:${payload.issueDate}\nVALID_UNTIL:${payload.validUntil}\nSTATUS:TEMPORARY`;

  try {
    const dataUrl = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 180,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}
