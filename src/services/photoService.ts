import JSZip from 'jszip';
import { SAMPLE_EMPLOYEES_DATA } from '../data/sampleEmployees';

export interface PhotoMatchResult {
  matchedCount: number;
  totalPhotos: number;
  photos: Map<string, string>; // EmployeeID (uppercase) -> DataURL
}

/**
 * Extracts photos from a ZIP archive and maps them to Employee IDs
 */
export async function extractPhotosFromZip(file: File): Promise<PhotoMatchResult> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);
  const photos = new Map<string, string>();
  let totalPhotos = 0;

  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.svg'];

  for (const [filename, fileEntry] of Object.entries(loadedZip.files)) {
    if (fileEntry.dir) continue;

    // Check extension
    const lowerFilename = filename.toLowerCase();
    const hasValidExt = validExtensions.some(ext => lowerFilename.endsWith(ext));
    if (!hasValidExt) continue;

    // Extract base name without path and extension
    // e.g. "photos/subfolder/EMP001.jpg" -> "EMP001"
    const simpleName = filename.split('/').pop()?.split('\\').pop() || '';
    const baseName = simpleName.substring(0, simpleName.lastIndexOf('.')).trim().toUpperCase();

    if (!baseName) continue;

    totalPhotos++;
    const base64Data = await fileEntry.async('base64');
    const mimeType = lowerFilename.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    photos.set(baseName, dataUrl);
  }

  return {
    matchedCount: photos.size,
    totalPhotos,
    photos
  };
}

/**
 * Extracts Google Drive file ID from various sharing formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  const openIdMatch = trimmed.match(/open\?id=([a-zA-Z0-9_-]+)/);
  if (openIdMatch && openIdMatch[1]) return openIdMatch[1];

  return null;
}

/**
 * Checks if a string is a Google Drive link or web image URL
 */
export function isRemotePhotoUrl(str: string): boolean {
  if (!str) return false;
  const s = str.trim().toLowerCase();
  return (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.includes('drive.google.com') ||
    s.includes('googleusercontent.com')
  );
}

/**
 * Converts a Google Drive link to a direct high-resolution image URL
 */
export function formatGoogleDriveImageUrl(url: string): string {
  if (!url) return '';
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    // High-resolution direct thumbnail stream from Google Drive CDN
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  return url.trim();
}

/**
 * Converts a single Image file to a Base64 Data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Generates an ID badge portrait image as Base64 DataURL on Canvas
 */
export function createSyntheticPortraitDataUrl(name: string, id: string, color: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 360);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, '#0f172a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 300, 360);

  // Subtle grid/pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 300; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 360);
    ctx.stroke();
  }

  // Avatar silhouette / circle
  ctx.beginPath();
  ctx.arc(150, 140, 65, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Head / Face
  ctx.beginPath();
  ctx.arc(150, 125, 32, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Shoulders
  ctx.beginPath();
  ctx.arc(150, 205, 50, Math.PI, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Name text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(name, 150, 260);

  // ID Badge tag
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`ID: ${id}`, 150, 290);

  // Watermark tag
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '12px sans-serif';
  ctx.fillText('TEMP ACCESS BADGE', 150, 325);

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Generates an ID badge portrait image on Canvas for sample employees
 */
function createSyntheticPortrait(name: string, id: string, color: string): Promise<Blob> {

  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 360;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 360);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 360);

    // Subtle grid/pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 300; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 360);
      ctx.stroke();
    }

    // Avatar silhouette / circle
    ctx.beginPath();
    ctx.arc(150, 140, 65, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Head / Face
    ctx.beginPath();
    ctx.arc(150, 125, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Shoulders
    ctx.beginPath();
    ctx.arc(150, 205, 50, Math.PI, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Name text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, 150, 260);

    // ID Badge tag
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`ID: ${id}`, 150, 290);

    // Watermark tag
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '12px sans-serif';
    ctx.fillText('TEMP ACCESS BADGE', 150, 325);

    canvas.toBlob(blob => {
      resolve(blob || new Blob());
    }, 'image/jpeg', 0.92);
  });
}

/**
 * Creates and downloads a sample photo ZIP archive for EMP001-EMP006
 */
export async function downloadSamplePhotoPack(): Promise<void> {
  const zip = new JSZip();
  const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#4f46e5'];

  for (let i = 0; i < SAMPLE_EMPLOYEES_DATA.length; i++) {
    const emp = SAMPLE_EMPLOYEES_DATA[i];
    const color = colors[i % colors.length];
    const blob = await createSyntheticPortrait(emp.Name, emp['Employee ID'], color);
    zip.file(emp.Photo, blob);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'sample_employee_photos.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
