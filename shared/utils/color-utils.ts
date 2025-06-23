import { FigmaColor } from '../types/figma';
import { DESIGN_TOKENS, WCAG_CONTRAST_RATIOS } from './constants';

export class ColorUtils {
  /**
   * Convert Figma color to CSS color string
   */
  static colorToCSS(color: FigmaColor, opacity?: number): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    const a = opacity !== undefined ? opacity : (color.a !== undefined ? color.a : 1);
    
    if (a < 1) {
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Convert Figma color to hex string
   */
  static colorToHex(color: FigmaColor): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Calculate relative luminance according to WCAG 2.1
   */
  static getRelativeLuminance(color: FigmaColor): number {
    const sRGB = [color.r, color.g, color.b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  }

  /**
   * Calculate contrast ratio between two colors according to WCAG 2.1
   */
  static getContrastRatio(color1: FigmaColor, color2: FigmaColor): number {
    const lum1 = this.getRelativeLuminance(color1);
    const lum2 = this.getRelativeLuminance(color2);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Check if contrast ratio meets WCAG standards
   */
  static meetsContrastStandards(ratio: number, isLargeText: boolean = false): {
    AA: boolean;
    AAA: boolean;
  } {
    const aaThreshold = isLargeText ? WCAG_CONTRAST_RATIOS.AA_LARGE : WCAG_CONTRAST_RATIOS.AA_NORMAL;
    const aaaThreshold = isLargeText ? WCAG_CONTRAST_RATIOS.AAA_LARGE : WCAG_CONTRAST_RATIOS.AAA_NORMAL;
    
    return {
      AA: ratio >= aaThreshold,
      AAA: ratio >= aaaThreshold
    };
  }

  /**
   * Find the closest Tailwind color to a given Figma color
   */
  static colorToTailwind(color: FigmaColor): string {
    let closestColor = 'gray-500';
    let closestDistance = Infinity;
    
    // Iterate through all Tailwind colors
    Object.entries(DESIGN_TOKENS.COLORS).forEach(([colorName, shades]) => {
      Object.entries(shades).forEach(([shade, rgb]) => {
        const distance = this.calculateColorDistance(color, rgb as FigmaColor);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestColor = `${colorName}-${shade}`;
        }
      });
    });
    
    return `bg-${closestColor}`;
  }

  /**
   * Calculate Euclidean distance between two colors
   */
  private static calculateColorDistance(color1: FigmaColor, color2: FigmaColor): number {
    const rDiff = color1.r - color2.r;
    const gDiff = color1.g - color2.g;
    const bDiff = color1.b - color2.b;
    
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
  }

  /**
   * Convert color to text color class for Tailwind
   */
  static colorToTextTailwind(color: FigmaColor): string {
    const bgClass = this.colorToTailwind(color);
    return bgClass.replace('bg-', 'text-');
  }

  /**
   * Generate gradient CSS from Figma gradient
   */
  static gradientToCSS(gradient: any): string {
    if (!gradient.gradientStops || gradient.gradientStops.length === 0) {
      return 'transparent';
    }

    const stops = gradient.gradientStops
      .map((stop: any) => {
        const color = this.colorToCSS(stop.color);
        const position = Math.round(stop.position * 100);
        return `${color} ${position}%`;
      })
      .join(', ');

    if (gradient.type === 'GRADIENT_LINEAR') {
      // Calculate angle from gradient handle positions
      let angle = 90; // Default to top-to-bottom
      if (gradient.gradientHandlePositions && gradient.gradientHandlePositions.length >= 2) {
        const start = gradient.gradientHandlePositions[0];
        const end = gradient.gradientHandlePositions[1];
        angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI) + 90;
      }
      return `linear-gradient(${angle}deg, ${stops})`;
    } else if (gradient.type === 'GRADIENT_RADIAL') {
      return `radial-gradient(circle, ${stops})`;
    }

    return `linear-gradient(to bottom, ${stops})`;
  }

  /**
   * Parse CSS color string to FigmaColor
   */
  static parseColor(cssColor: string): FigmaColor | null {
    // Handle hex colors
    if (cssColor.startsWith('#')) {
      const hex = cssColor.slice(1);
      if (hex.length === 3) {
        return {
          r: parseInt(hex[0] + hex[0], 16) / 255,
          g: parseInt(hex[1] + hex[1], 16) / 255,
          b: parseInt(hex[2] + hex[2], 16) / 255
        };
      } else if (hex.length === 6) {
        return {
          r: parseInt(hex.slice(0, 2), 16) / 255,
          g: parseInt(hex.slice(2, 4), 16) / 255,
          b: parseInt(hex.slice(4, 6), 16) / 255
        };
      }
    }

    // Handle rgb/rgba colors
    const rgbMatch = cssColor.match(/rgba?\(([^)]+)\)/);
    if (rgbMatch) {
      const values = rgbMatch[1].split(',').map(v => parseFloat(v.trim()));
      return {
        r: values[0] / 255,
        g: values[1] / 255,
        b: values[2] / 255,
        a: values[3] !== undefined ? values[3] : 1
      };
    }

    return null;
  }
}
