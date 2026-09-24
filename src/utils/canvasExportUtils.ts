import html2canvas from 'html2canvas';

// Reusable hidden canvas context for converting modern CSS colors (oklch, lab) to standard sRGB / hex
let colorConverterCtx: CanvasRenderingContext2D | null = null;

function getColorConverterCtx(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!colorConverterCtx) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    colorConverterCtx = canvas.getContext('2d');
  }
  return colorConverterCtx;
}

/**
 * Converts any CSS color string (such as Tailwind v4's oklch(...) or lab(...))
 * into standard hex or rgba(...) that html2canvas can parse without errors.
 */
export function convertCssColorToRgb(colorStr: string): string {
  if (!colorStr || typeof colorStr !== 'string' || !colorStr.includes('oklch')) {
    return colorStr;
  }
  const ctx = getColorConverterCtx();
  if (!ctx) return colorStr;
  try {
    ctx.fillStyle = '#000000';
    ctx.fillStyle = colorStr;
    return ctx.fillStyle; // Browser converts to #hex or rgba(...)!
  } catch {
    return colorStr;
  }
}

/**
 * Sanitizes a cloned DOM document before html2canvas parses styles:
 * 1. Converts all oklch() color functions to rgb/hex on all elements
 * 2. Sanitizes oklch() in all <style> tags
 * 3. Removes external stylesheet <link> tags to prevent 404 network aborts
 * 4. Proxies any remaining Google Drive images with CORS support
 */
export function sanitizeClonedDocument(clonedDoc: Document): void {
  // 1. Remove all <link rel="stylesheet"> tags to prevent 404 network errors in iframe
  const linkTags = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
  linkTags.forEach(link => link.remove());

  // 2. Sanitize any inline <style> blocks containing oklch
  const styleTags = clonedDoc.querySelectorAll('style');
  styleTags.forEach(style => {
    if (style.textContent && style.textContent.includes('oklch')) {
      style.textContent = style.textContent.replace(/oklch\([^)]+\)/g, match =>
        convertCssColorToRgb(match)
      );
    }
  });

  // 3. Convert computed oklch colors on every DOM element
  const colorProps = [
    'color',
    'backgroundColor',
    'borderColor',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
    'outlineColor',
    'fill',
    'stroke'
  ];

  const allElements = clonedDoc.querySelectorAll('*');
  allElements.forEach(el => {
    if (!(el instanceof HTMLElement || el instanceof SVGElement)) return;

    try {
      const computed = window.getComputedStyle(el);

      // Check standard color properties
      for (const prop of colorProps) {
        // @ts-ignore
        const val = computed[prop];
        if (val && typeof val === 'string' && val.includes('oklch')) {
          // @ts-ignore
          el.style[prop] = convertCssColorToRgb(val);
        }
      }

      // Convert shadow colors
      if (computed.boxShadow && computed.boxShadow.includes('oklch')) {
        el.style.boxShadow = computed.boxShadow.replace(/oklch\([^)]+\)/g, m =>
          convertCssColorToRgb(m)
        );
      }
      if (computed.textShadow && computed.textShadow.includes('oklch')) {
        el.style.textShadow = computed.textShadow.replace(/oklch\([^)]+\)/g, m =>
          convertCssColorToRgb(m)
        );
      }
    } catch {
      // Ignore cross-origin frame styles if any
    }
  });

  // 4. Ensure any Google Drive images use the CORS proxy so they don't get blocked
  const imgs = clonedDoc.querySelectorAll('img');
  imgs.forEach(img => {
    const src = img.getAttribute('src') || '';
    if (src.includes('drive.google.com') && !src.includes('wsrv.nl')) {
      img.src = `https://wsrv.nl/?url=${encodeURIComponent(src)}`;
    }
  });
}

/**
 * Robust wrapper around html2canvas that handles:
 * - Tailwind v4 oklch() color conversions
 * - Google Drive CORS image proxying
 * - Dimension bounds checking
 */
export async function renderElementToCanvas(
  element: HTMLElement,
  customScale: number = 3
): Promise<HTMLCanvasElement> {
  const rect = element.getBoundingClientRect();
  const width = Math.max(rect.width, element.offsetWidth, 323);
  const height = Math.max(rect.height, element.offsetHeight, 204);

  return await html2canvas(element, {
    scale: customScale,
    useCORS: true,
    allowTaint: false,
    logging: false,
    width,
    height,
    imageTimeout: 6000,
    backgroundColor: '#ffffff',
    onclone: clonedDoc => {
      sanitizeClonedDocument(clonedDoc);
    }
  });
}
