import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Captures an HTML card element and triggers a crisp PNG download
 */
export async function downloadCardImage(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 3, // 300 DPI high resolution
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });

  const dataUrl = canvas.toDataURL('image/png', 1.0);
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
  const cardWidthMm = 85.6;
  const cardHeightMm = 53.98;

  // Initialize PDF in landscape matching card orientation
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [cardWidthMm, cardHeightMm]
  });

  // 1. Capture and add Front Face
  const frontCanvas = await html2canvas(frontEl, {
    scale: 3,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });
  const frontImg = frontCanvas.toDataURL('image/jpeg', 0.98);
  pdf.addImage(frontImg, 'JPEG', 0, 0, cardWidthMm, cardHeightMm, undefined, 'FAST');

  // 2. Capture and add Back Face if available
  if (backEl) {
    const backCanvas = await html2canvas(backEl, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    const backImg = backCanvas.toDataURL('image/jpeg', 0.98);
    pdf.addPage([cardWidthMm, cardHeightMm], 'landscape');
    pdf.addImage(backImg, 'JPEG', 0, 0, cardWidthMm, cardHeightMm, undefined, 'FAST');
  }

  const finalName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  pdf.save(finalName);
}

/**
 * Prints a single employee's ID card cleanly in an isolated printable window/iframe
 */
export async function printSingleCard(frontEl: HTMLElement, backEl?: HTMLElement | null): Promise<void> {
  // Render high-res images of both sides
  const frontCanvas = await html2canvas(frontEl, {
    scale: 3,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });
  const frontImg = frontCanvas.toDataURL('image/png', 1.0);

  let backImg = '';
  if (backEl) {
    const backCanvas = await html2canvas(backEl, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    backImg = backCanvas.toDataURL('image/png', 1.0);
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

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print ID Card</title>
        <style>
          @page {
            size: auto;
            margin: 10mm;
          }
          body {
            margin: 0;
            padding: 10mm;
            font-family: sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12mm;
          }
          .card-container {
            width: 85.6mm;
            height: 53.98mm;
            border: 1px dashed #cbd5e1;
            box-sizing: border-box;
            page-break-inside: avoid;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
          @media print {
            .card-container {
              border: 0.5pt solid #e2e8f0;
            }
          }
        </style>
      </head>
      <body>
        <div class="card-container">
          <img src="${frontImg}" alt="ID Card Front" />
        </div>
        ${
          backImg
            ? `<div class="card-container">
                 <img src="${backImg}" alt="ID Card Back" />
               </div>`
            : ''
        }
      </body>
    </html>
  `);
  doc.close();

  // Wait for images to load in iframe then trigger print
  setTimeout(() => {
    printIframe.contentWindow?.focus();
    printIframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(printIframe);
    }, 1000);
  }, 350);
}
