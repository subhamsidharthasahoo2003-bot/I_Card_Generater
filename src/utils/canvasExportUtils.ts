import html2canvas from 'html2canvas';

/**
 * Pure mathematical conversion of OKLCH to sRGB.
 * Independent of browser canvas context or version differences.
 */
function oklabToRgb(L: number, a: number, b: number, alpha: number = 1): string {
  // 1. Oklab to LMS
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // 2. LMS to Linear sRGB
  const rLinear = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLinear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLinear = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  // 3. Gamma transfer function
  const toSrgb = (c: number): number => {
    const abs = Math.abs(c);
    const sign = c < 0 ? -1 : 1;
    const val = abs <= 0.0031308 ? 12.92 * abs : 1.055 * Math.pow(abs, 1 / 2.4) - 0.055;
    return sign * val;
  };

  const r = Math.min(255, Math.max(0, Math.round(toSrgb(rLinear) * 255)));
  const g = Math.min(255, Math.max(0, Math.round(toSrgb(gLinear) * 255)));
  const bVal = Math.min(255, Math.max(0, Math.round(toSrgb(bLinear) * 255)));

  if (alpha < 0.999) {
    const safeA = Math.max(0, Math.min(1, Number(alpha.toFixed(3))));
    return `rgba(${r}, ${g}, ${bVal}, ${safeA})`;
  }
  return `rgb(${r}, ${g}, ${bVal})`;
}

function parseAndConvertOklch(str: string): string {
  try {
    const inner = str.replace(/^oklch\(/i, '').replace(/\)$/, '').trim();
    const parts = inner.split('/');
    const colorParts = parts[0].trim().split(/[\s,]+/);

    let l = 0;
    if (colorParts[0].endsWith('%')) {
      l = parseFloat(colorParts[0]) / 100;
    } else {
      l = parseFloat(colorParts[0]) || 0;
    }

    let c = 0;
    if (colorParts[1]) {
      if (colorParts[1].endsWith('%')) {
        c = (parseFloat(colorParts[1]) / 100) * 0.4;
      } else {
        c = parseFloat(colorParts[1]) || 0;
      }
    }

    let h = 0;
    if (colorParts[2]) {
      const hStr = colorParts[2].toLowerCase();
      if (hStr === 'none') {
        h = 0;
      } else if (hStr.endsWith('deg')) {
        h = parseFloat(hStr);
      } else if (hStr.endsWith('rad')) {
        h = parseFloat(hStr) * (180 / Math.PI);
      } else if (hStr.endsWith('turn')) {
        h = parseFloat(hStr) * 360;
      } else {
        h = parseFloat(hStr) || 0;
      }
    }

    let alpha = 1;
    if (parts[1]) {
      const aStr = parts[1].trim();
      if (aStr.endsWith('%')) {
        alpha = parseFloat(aStr) / 100;
      } else if (aStr !== 'none') {
        alpha = parseFloat(aStr);
      }
    }

    const hRad = (h * Math.PI) / 180;
    const a = c * Math.cos(hRad);
    const b = c * Math.sin(hRad);

    return oklabToRgb(l, a, b, isNaN(alpha) ? 1 : alpha);
  } catch {
    return 'rgb(0, 0, 0)';
  }
}

function parseAndConvertOklab(str: string): string {
  try {
    const inner = str.replace(/^oklab\(/i, '').replace(/\)$/, '').trim();
    const parts = inner.split('/');
    const colorParts = parts[0].trim().split(/[\s,]+/);

    let l = 0;
    if (colorParts[0].endsWith('%')) {
      l = parseFloat(colorParts[0]) / 100;
    } else {
      l = parseFloat(colorParts[0]) || 0;
    }

    const a = parseFloat(colorParts[1]) || 0;
    const b = parseFloat(colorParts[2]) || 0;

    let alpha = 1;
    if (parts[1]) {
      const aStr = parts[1].trim();
      if (aStr.endsWith('%')) {
        alpha = parseFloat(aStr) / 100;
      } else if (aStr !== 'none') {
        alpha = parseFloat(aStr);
      }
    }

    return oklabToRgb(l, a, b, isNaN(alpha) ? 1 : alpha);
  } catch {
    return 'rgb(0, 0, 0)';
  }
}

/**
 * Replaces all occurrences of oklch(...) and oklab(...) in any CSS string
 * with exact, standard rgb(...) or rgba(...).
 */
export function sanitizeOklchInString(cssValue: string): string {
  if (!cssValue || typeof cssValue !== 'string') {
    return cssValue;
  }
  let result = cssValue;
  if (result.includes('oklch')) {
    result = result.replace(/oklch\([^)]+\)/gi, match => parseAndConvertOklch(match));
  }
  if (result.includes('oklab')) {
    result = result.replace(/oklab\([^)]+\)/gi, match => parseAndConvertOklab(match));
  }
  return result;
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
            return typeof v === 'string' && (v.includes('oklch') || v.includes('oklab'))
              ? sanitizeOklchInString(v)
              : v;
          };
        }
        if (prop === 'cssText') {
          const v = target.cssText;
          return typeof v === 'string' && (v.includes('oklch') || v.includes('oklab'))
            ? sanitizeOklchInString(v)
            : v;
        }
        const val = target[prop as keyof CSSStyleDeclaration];
        if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
          return sanitizeOklchInString(val);
        }
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
 * Collects all rules from parent document stylesheets and sanitizes them
 */
function getSanitizedGlobalCss(): string {
  let cssText = '';
  if (typeof document === 'undefined') return '';
  try {
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) return;
        for (let i = 0; i < rules.length; i++) {
          cssText += rules[i].cssText + '\n';
        }
      } catch {
        // Cross-origin stylesheet access might fail silently
      }
    });
  } catch {
    // ignore
  }
  return sanitizeOklchInString(cssText);
}

/**
 * Sanitizes a cloned DOM document before html2canvas parses styles:
 * 1. Patches the cloned iframe's window getComputedStyle
 * 2. Replaces external stylesheets with pre-sanitized inlined CSS rules
 * 3. Sanitizes all inline <style> tags and element style attributes
 */
export function sanitizeClonedDocument(clonedDoc: Document): void {
  // 1. Patch the cloned iframe's window getComputedStyle
  if (clonedDoc.defaultView) {
    patchWindowGetComputedStyle(clonedDoc.defaultView);
  }

  // 2. Extract and inject sanitized CSS into iframe, remove remote link tags
  try {
    const globalCss = getSanitizedGlobalCss();
    if (globalCss) {
      const safeStyle = clonedDoc.createElement('style');
      safeStyle.setAttribute('type', 'text/css');
      safeStyle.textContent = globalCss;
      clonedDoc.head.appendChild(safeStyle);
    }
  } catch {
    // ignore
  }

  const linkTags = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
  linkTags.forEach(link => link.remove());

  // 3. Sanitize any inline <style> blocks
  const styleTags = clonedDoc.querySelectorAll('style');
  styleTags.forEach(style => {
    if (style.textContent && (style.textContent.includes('oklch') || style.textContent.includes('oklab'))) {
      style.textContent = sanitizeOklchInString(style.textContent);
    }
  });

  // 4. Sanitize inline style attributes on all cloned elements
  const allElements = clonedDoc.querySelectorAll('*');
  allElements.forEach(el => {
    if (!(el instanceof HTMLElement || el instanceof SVGElement)) return;
    try {
      const styleAttr = el.getAttribute('style');
      if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('oklab'))) {
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
      imageTimeout: 4000,
      backgroundColor: '#ffffff',
      onclone: clonedDoc => {
        sanitizeClonedDocument(clonedDoc);
      }
    });
  } finally {
    restoreMainWindow();
  }
}

