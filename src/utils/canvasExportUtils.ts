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
 * Converts a single oklch(...) color string into standard #hex or rgba(...)
 */
function singleOklchToRgb(oklchColor: string): string {
  const ctx = getColorConverterCtx();
  if (!ctx) return oklchColor;
  try {
    ctx.fillStyle = '#000000';
    ctx.fillStyle = oklchColor;
    return ctx.fillStyle; // Browser converts to #hex or rgba(...)!
  } catch {
    return oklchColor;
  }
}

/**
 * Replaces all occurrences of oklch(...) inside any CSS string
 * (colors, borders, box-shadows, gradients, filters, etc.) with rgb/rgba/#hex.
 */
export function sanitizeOklchInString(cssValue: string): string {
  if (!cssValue || typeof cssValue !== 'string' || !cssValue.includes('oklch')) {
    return cssValue;
  }
  return cssValue.replace(/oklch\([^)]+\)/g, match => singleOklchToRgb(match));
}

/**
 * Patches window.getComputedStyle so html2canvas NEVER encounters any oklch() color functions.
 * All properties (colors, borders, box-shadows, etc.) are converted to standard sRGB on the fly.
 */
export function patchWindowGetComputedStyle(win: Window): () => void {
  const orig = win.getComputedStyle;
  win.getComputedStyle = function (el: Element, pseudo?: string | null) {
    const style = orig.call(this, el, pseudo);
    return new Proxy(style, {
      get(target, prop) {
        if (prop === 'getPropertyValue') {
          return (p: string) => {
            const v = target.getPropertyValue(p);
            return typeof v === 'string' && v.includes('oklch') ? sanitizeOklchInString(v) : v;
          };
        }
        const val = target[prop as keyof CSSStyleDeclaration];
        if (typeof val === 'string' && val.includes('oklch')) {
          return sanitizeOklchInString(val);
        }
        // Bind functions like item(), getPropertyPriority(), etc.
        if (typeof val === 'function') {
          return (val as Function).bind(target);
        }
        return val;
      }
    });
  };
  return () => {
    win.getComputedStyle = orig;
  };
}

/**
 * Sanitizes a cloned DOM document before html2canvas parses styles:
 * 1. Patches the cloned window's getComputedStyle
 * 2. Removes external stylesheet <link> tags to prevent 404 network aborts
 * 3. Sanitizes all inline <style> tags
 */
export function sanitizeClonedDocument(clonedDoc: Document): void {
  // 1. Patch the cloned iframe's window getComputedStyle
  if (clonedDoc.defaultView) {
    patchWindowGetComputedStyle(clonedDoc.defaultView);
  }

  // 2. Remove all <link rel="stylesheet"> tags to prevent 404 network errors in iframe
  const linkTags = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
  linkTags.forEach(link => link.remove());

  // 3. Sanitize any inline <style> blocks containing oklch
  const styleTags = clonedDoc.querySelectorAll('style');
  styleTags.forEach(style => {
    if (style.textContent && style.textContent.includes('oklch')) {
      style.textContent = sanitizeOklchInString(style.textContent);
    }
  });

  // 4. Fallback: also sanitize inline style attributes directly on cloned elements
  const allElements = clonedDoc.querySelectorAll('*');
  allElements.forEach(el => {
    if (!(el instanceof HTMLElement || el instanceof SVGElement)) return;
    try {
      const styleAttr = el.getAttribute('style');
      if (styleAttr && styleAttr.includes('oklch')) {
        el.setAttribute('style', sanitizeOklchInString(styleAttr));
      }
    } catch {
      // ignore
    }
  });
}

/**
 * Robust wrapper around html2canvas that guarantees:
 * - Zero "unsupported color function oklch" crashes
 * - Safe rendering without iframe stylesheet 404 aborts
 * - Dimension bounds checking
 */
export async function renderElementToCanvas(
  element: HTMLElement,
  customScale: number = 3
): Promise<HTMLCanvasElement> {
  const rect = element.getBoundingClientRect();
  const width = Math.max(rect.width, element.offsetWidth, 323);
  const height = Math.max(rect.height, element.offsetHeight, 204);

  // Patch main window getComputedStyle during html2canvas execution as well
  const restoreMainWindow = patchWindowGetComputedStyle(window);

  try {
    return await html2canvas(element, {
      scale: customScale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      width,
      height,
      imageTimeout: 3000,
      backgroundColor: '#ffffff',
      onclone: clonedDoc => {
        sanitizeClonedDocument(clonedDoc);
      }
    });
  } finally {
    restoreMainWindow();
  }
}
