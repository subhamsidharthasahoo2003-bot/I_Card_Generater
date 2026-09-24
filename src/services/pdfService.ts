import jsPDF from 'jspdf';
import { renderElementToCanvas } from '../utils/canvasExportUtils';

export interface PDFExportProgress {
  current: number;
  total: number;
  statusText: string;
}

/**
 * Generates an A4 PDF from an array of CR80 card DOM elements.
 * Arranges up to 8 cards per page (2 columns x 4 rows) preserving exact physical dimensions.
 */
export async function generateA4PDF(
  cardElements: HTMLElement[],
  onProgress?: (progress: PDFExportProgress) => void
): Promise<void> {
  if (cardElements.length === 0) {
    throw new Error('No cards selected to generate PDF.');
  }

  // Create A4 PDF (210mm x 297mm) in portrait mode
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const cardWidthMm = 85.6;
  const cardHeightMm = 53.98;

  const leftMarginMm = 12;
  const colGapMm = 14;
  const topMarginMm = 14;
  const rowGapMm = 10;

  const cardsPerPage = 8; // 2 cols x 4 rows
  const totalCards = cardElements.length;

  for (let index = 0; index < totalCards; index++) {
    const cardEl = cardElements[index];

    if (onProgress) {
      onProgress({
        current: index + 1,
        total: totalCards,
        statusText: `Rendering card ${index + 1} of ${totalCards}...`
      });
    }

    // Determine page and position within the page
    const pageCardIndex = index % cardsPerPage;
    const colIndex = pageCardIndex % 2; // 0 or 1
    const rowIndex = Math.floor(pageCardIndex / 2); // 0, 1, 2, or 3

    if (index > 0 && pageCardIndex === 0) {
      pdf.addPage('a4', 'portrait');
    }

    const posX = leftMarginMm + colIndex * (cardWidthMm + colGapMm);
    const posY = topMarginMm + rowIndex * (cardHeightMm + rowGapMm);

    // Capture card DOM element with high DPI and sanitized oklch colors
    const canvas = await renderElementToCanvas(cardEl, 3);

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Place card image with exact CR80 physical mm dimensions
    pdf.addImage(imgData, 'JPEG', posX, posY, cardWidthMm, cardHeightMm, undefined, 'FAST');

    // Draw subtle cut guide / border rectangle around the card
    pdf.setDrawColor(220, 226, 235);
    pdf.setLineWidth(0.15);
    pdf.rect(posX, posY, cardWidthMm, cardHeightMm);

    // Optional corner crop marks
    const markLen = 2.5;
    pdf.setDrawColor(180, 190, 205);
    // top-left
    pdf.line(posX - 1, posY, posX - markLen - 1, posY);
    pdf.line(posX, posY - 1, posX, posY - markLen - 1);
    // top-right
    pdf.line(posX + cardWidthMm + 1, posY, posX + cardWidthMm + markLen + 1, posY);
    pdf.line(posX + cardWidthMm, posY - 1, posX + cardWidthMm, posY - markLen - 1);
    // bottom-left
    pdf.line(posX - 1, posY + cardHeightMm, posX - markLen - 1, posY + cardHeightMm);
    pdf.line(posX, posY + cardHeightMm + 1, posX, posY + cardHeightMm + markLen + 1);
    // bottom-right
    pdf.line(posX + cardWidthMm + 1, posY + cardHeightMm, posX + cardWidthMm + markLen + 1, posY + cardHeightMm);
    pdf.line(posX + cardWidthMm, posY + cardHeightMm + 1, posX + cardWidthMm, posY + cardHeightMm + markLen + 1);
  }

  if (onProgress) {
    onProgress({
      current: totalCards,
      total: totalCards,
      statusText: 'Finalizing PDF document...'
    });
  }

  // Trigger download
  const dateStr = new Date().toISOString().slice(0, 10);
  pdf.save(`Temporary_ID_Cards_${dateStr}.pdf`);
}
