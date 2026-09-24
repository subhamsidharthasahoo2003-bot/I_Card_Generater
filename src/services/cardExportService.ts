import jsPDF from 'jspdf';
import { renderElementToCanvas } from '../utils/canvasExportUtils';

/**
 * Captures an HTML card element and triggers a crisp PNG download
 */
export async function downloadCardImage(element: HTMLElement, filename: string): Promise<void> {
  if (!element) {
    throw new Error('Card element not found for export.');
  }

  const canvas = await renderElementToCanvas(element, 3);
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  if (!dataUrl || dataUrl === 'data:,' || dataUrl.length < 50) {
    throw new Error('Failed to generate image data from card.');
  }

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads a single employee's ID Card as a CR80 size (85.6 x 53.98 mm) PDF
 * Page 1: Front Face
 * Page 2: Back Face (if provided)
 */
export async function downloadSingleCardPDF(
  frontEl: HTMLElement,
  backEl?: HTMLElement | null,
  filename: string = 'Employee_ID_Card.pdf'
): Promise<void> {
  if (!frontEl) {
    throw new Error('Front card element not found.');
  }

  const cardWidthMm = 85.6;
  const cardHeightMm = 53.98;

  // Initialize PDF in landscape matching card orientation
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [cardWidthMm, cardHeightMm]
  });

  // 1. Capture and add Front Face
  const frontCanvas = await renderElementToCanvas(frontEl, 3);
  const frontImg = frontCanvas.toDataURL('image/jpeg', 0.98);
  pdf.addImage(frontImg, 'JPEG', 0, 0, cardWidthMm, cardHeightMm, undefined, 'FAST');

  // 2. Capture and add Back Face if available
  if (backEl) {
    const backCanvas = await renderElementToCanvas(backEl, 3);
    const backImg = backCanvas.toDataURL('image/jpeg', 0.98);
    pdf.addPage([cardWidthMm, cardHeightMm], 'landscape');
    pdf.addImage(backImg, 'JPEG', 0, 0, cardWidthMm, cardHeightMm, undefined, 'FAST');
  }

  const finalName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  pdf.save(finalName);
}

/**
 * Prints a single employee's ID card cleanly in an isolated printable window/iframe.
 * Uses direct vector DOM cloning with embedded stylesheets for maximum crispness,
 * zero canvas CORS restrictions, and instant print preview loading.
 */
export async function printSingleCard(frontEl: HTMLElement, backEl?: HTMLElement | null): Promise<void> {
  if (!frontEl) {
    throw new Error('Front card element not found.');
  }

  // Clone front and back elements
  const frontClone = frontEl.cloneNode(true) as HTMLElement;
  let backClone: HTMLElement | null = null;
  if (backEl) {
    backClone = backEl.cloneNode(true) as HTMLElement;
  }

  // Normalize transforms
  frontClone.style.transform = 'none';
  frontClone.style.margin = '0 auto';
  frontClone.style.boxShadow = 'none';
  if (backClone) {
    backClone.style.transform = 'none';
    backClone.style.margin = '0 auto';
    backClone.style.boxShadow = 'none';
  }

  // Create isolated print iframe
  const printIframe = document.createElement('iframe');
  printIframe.style.position = 'fixed';
  printIframe.style.right = '0';
  printIframe.style.bottom = '0';
  printIframe.style.width = '0';
  printIframe.style.height = '0';
  printIframe.style.border = '0';

  document.body.appendChild(printIframe);

  const doc = printIframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Copy stylesheets and style tags
  const currentStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(el => el.outerHTML)
    .join('\n');

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print ID Card</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
        ${currentStyles}
        <style>
          @page {
            size: auto;
            margin: 8mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 8mm;
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            background: #ffffff !important;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10mm;
          }
          .print-card-slot {
            width: 85.6mm;
            height: 53.98mm;
            box-sizing: border-box;
            page-break-inside: avoid;
            break-inside: avoid;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          @media print {
            body {
              padding: 0;
            }
            .print-card-slot {
              page-break-inside: avoid;
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-card-slot" id="print-front-slot"></div>
        ${backClone ? '<div class="print-card-slot" id="print-back-slot"></div>' : ''}
      </body>
    </html>
  `);
  doc.close();

  const frontSlot = doc.getElementById('print-front-slot');
  if (frontSlot) frontSlot.appendChild(frontClone);

  if (backClone) {
    const backSlot = doc.getElementById('print-back-slot');
    if (backSlot) backSlot.appendChild(backClone);
  }

  // Wait for all images in the print iframe to resolve
  const images = Array.from(doc.images);
  await Promise.all(
    images.map(
      img =>
        new Promise(resolve => {
          if (img.complete) {
            resolve(true);
          } else {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            setTimeout(() => resolve(false), 2000);
          }
        })
    )
  );

  setTimeout(() => {
    try {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        try {
          if (document.body.contains(printIframe)) {
            document.body.removeChild(printIframe);
          }
        } catch {
          // ignore
        }
      }, 3000);
    }
  }, 250);
}
