import React from 'react';
import { Employee } from '../../types/employee';
import { CompanySettings } from '../../types/company';
import { PrintLayoutMode } from '../../types/idCard';
import { IDCardFront } from '../id-card/IDCardFront';
import { IDCardBack } from '../id-card/IDCardBack';

interface A4PrintSheetProps {
  employees: Employee[];
  company: CompanySettings;
  layoutMode: PrintLayoutMode;
  cardContainerRefs?: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

export const A4PrintSheet: React.FC<A4PrintSheetProps> = ({
  employees,
  company,
  layoutMode,
  cardContainerRefs
}) => {
  // Build card items based on layout mode
  // Each card item is either a front, back, or pair
  const cardItems: { employee: Employee; side: 'front' | 'back' }[] = [];

  employees.forEach(emp => {
    if (layoutMode === 'both') {
      cardItems.push({ employee: emp, side: 'front' });
      cardItems.push({ employee: emp, side: 'back' });
    } else if (layoutMode === 'front-only') {
      cardItems.push({ employee: emp, side: 'front' });
    } else if (layoutMode === 'back-only') {
      cardItems.push({ employee: emp, side: 'back' });
    }
  });

  // Chunk into 8 cards per A4 page (2 columns x 4 rows)
  const CARDS_PER_PAGE = 8;
  const pages: { employee: Employee; side: 'front' | 'back' }[][] = [];
  for (let i = 0; i < cardItems.length; i += CARDS_PER_PAGE) {
    pages.push(cardItems.slice(i, i + CARDS_PER_PAGE));
  }

  if (pages.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        No cards selected for print layout.
      </div>
    );
  }

  let globalCardIndex = 0;

  return (
    <div className="flex flex-col items-center gap-8 print:gap-0 print:m-0">
      {pages.map((pageCards, pageIdx) => (
        <div
          key={pageIdx}
          className="a4-sheet bg-white shadow-xl print:shadow-none border border-slate-200 print:border-none print:m-0 rounded-xs print:rounded-none relative flex flex-col justify-between overflow-hidden page-break-after"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '12mm 10mm',
            boxSizing: 'border-box'
          }}
        >
          {/* Print Sheet Header Header (Visible on screen and subtle on paper) */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 text-[8px] text-slate-400 font-mono">
            <span>
              {company.name} • TEMPORARY ID CARDS • A4 SHEET {pageIdx + 1} OF {pages.length}
            </span>
            <span className="no-print text-indigo-600 font-bold">
              CR80 Standard (85.6mm × 53.98mm)
            </span>
            <span>DATE: {new Date().toLocaleDateString()}</span>
          </div>

          {/* Cards Grid: 2 columns x 4 rows */}
          <div
            className="grid grid-cols-2 justify-center items-center content-start gap-x-[12mm] gap-y-[7mm]"
            style={{ width: '100%' }}
          >
            {pageCards.map((item, idx) => {
              const currentGlobalIdx = globalCardIndex++;
              return (
                <div
                  key={`${item.employee.id}-${item.side}-${idx}`}
                  ref={el => {
                    if (cardContainerRefs && cardContainerRefs.current) {
                      cardContainerRefs.current[currentGlobalIdx] = el;
                    }
                  }}
                  className="relative flex justify-center items-center p-0.5"
                  style={{
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid'
                  }}
                >
                  {/* Card Element */}
                  {item.side === 'front' ? (
                    <IDCardFront
                      employee={item.employee}
                      company={company}
                      isPrintMode={true}
                    />
                  ) : (
                    <IDCardBack
                      employee={item.employee}
                      company={company}
                      isPrintMode={true}
                    />
                  )}

                  {/* Corner Cut Guides (Thin marks for cutting along the lines) */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-slate-300 pointer-events-none" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-slate-300 pointer-events-none" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-slate-300 pointer-events-none" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-slate-300 pointer-events-none" />
                </div>
              );
            })}
          </div>

          {/* Sheet Footer Notes */}
          <div className="pt-2 mt-auto border-t border-slate-200 flex items-center justify-between text-[7px] text-slate-400 font-mono">
            <span>PRINT AT 100% SCALE (DO NOT FIT TO PAGE) • CUT ALONG GUIDES</span>
            <span>SECURE TEMPORARY CREDENTIALS</span>
          </div>
        </div>
      ))}
    </div>
  );
};
