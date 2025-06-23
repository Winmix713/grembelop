import { FigmaNode, FigmaPaint, FigmaEffect } from '../types/figma';
import { CSSStyles, CodeGenerationOptions } from '../types/generator';
import { ColorUtils } from '../utils/color-utils';
import { DESIGN_TOKENS } from '../utils/constants';

export class StyleGenerator {
  private options: CodeGenerationOptions;

  constructor(options: CodeGenerationOptions) {
    this.options = options;
  }

  generateStyles(node: FigmaNode): CSSStyles {
    try {
      const styles: CSSStyles = {};

      // Layout and positioning
      this.addLayoutStyles(node, styles);
      
      // Typography
      this.addTypographyStyles(node, styles);
      
      // Colors and fills
      this.addColorStyles(node, styles);
      
      // Borders and radius
      this.addBorderStyles(node, styles);
      
      // Effects (shadows, blur)
      this.addEffectStyles(node, styles);
      
      // Spacing
      this.addSpacingStyles(node, styles);

      return styles;
    } catch (error) {
      console.warn(`Failed to generate styles for node ${node.name}:`, error);
      return {};
    }
  }

  generateTailwindClasses(node: FigmaNode): string {
    try {
      const classes: string[] = [];

      // Layout
      this.addTailwindLayoutClasses(node, classes);
      
      // Typography
      this.addTailwindTypographyClasses(node, classes);
      
      // Colors
      this.addTailwindColorClasses(node, classes);
      
      // Spacing
      this.addTailwindSpacingClasses(node, classes);
      
      // Borders
      this.addTailwindBorderClasses(node, classes);
      
      // Effects
      this.addTailwindEffectClasses(node, classes);

      return classes.join(' ');
    } catch (error) {
      console.warn(`Failed to generate Tailwind classes for node ${node.name}:`, error);
      return '';
    }
  }

  generateResponsiveCSS(node: FigmaNode, breakpoints: Record<string, number>): string {
    try {
      const baseStyles = this.generateStyles(node);
      const cssRules: string[] = [];

      // Base styles
      const baseCSS = this.stylesToCSS(baseStyles);
      if (baseCSS) {
        cssRules.push(baseCSS);
      }

      // Responsive styles
      Object.entries(breakpoints).forEach(([name, width]) => {
        const responsiveStyles = this.generateResponsiveStylesForBreakpoint(node, name, width);
        if (Object.keys(responsiveStyles).length > 0) {
          const responsiveCSS = this.stylesToCSS(responsiveStyles);
          if (responsiveCSS) {
            cssRules.push(`@media (min-width: ${width}px) {\n  ${responsiveCSS}\n}`);
          }
        }
      });

      return cssRules.join('\n\n');
    } catch (error) {
      console.warn(`Failed to generate responsive CSS for node ${node.name}:`, error);
      return '';
    }
  }

  private addLayoutStyles(node: FigmaNode, styles: CSSStyles): void {
    // Size
    if (node.absoluteBoundingBox) {
      const { width, height } = node.absoluteBoundingBox;
      styles.width = `${width}px`;
      styles.height = `${height}px`;
    }

    // Flexbox layout
    if (node.layoutMode) {
      styles.display = 'flex';
      styles.flexDirection = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';
      
      // Alignment
      if (node.primaryAxisAlignItems) {
        const alignMap = {
          'MIN': 'flex-start',
          'CENTER': 'center',
          'MAX': 'flex-end',
          'SPACE_BETWEEN': 'space-between'
        };
        styles.justifyContent = alignMap[node.primaryAxisAlignItems] || 'flex-start';
      }

      if (node.counterAxisAlignItems) {
        const alignMap = {
          'MIN': 'flex-start',
          'CENTER': 'center',
          'MAX': 'flex-end',
          'BASELINE': 'baseline'
        };
        styles.alignItems = alignMap[node.counterAxisAlignItems] || 'flex-start';
      }

      // Gap
      if (node.itemSpacing) {
        styles.gap = `${node.itemSpacing}px`;
      }
    }

    // Clipping
    if (node.clipsContent) {
      styles.overflow = 'hidden';
    }
  }

  private addTypographyStyles(node: FigmaNode, styles: CSSStyles): void {
    if (node.type === 'TEXT' && node.style) {
      const textStyle = node.style;
      
      styles.fontFamily = `"${textStyle.fontFamily}", sans-serif`;
      styles.fontSize = `${textStyle.fontSize}px`;
      styles.fontWeight = textStyle.fontWeight;
      styles.lineHeight = `${textStyle.lineHeightPx}px`;
      styles.letterSpacing = `${textStyle.letterSpacing}px`;
      
      // Text alignment
      if (textStyle.textAlignHorizontal) {
        const alignMap = {
          'LEFT': 'left',
          'CENTER': 'center',
          'RIGHT': 'right',
          'JUSTIFIED': 'justify'
        };
        styles.textAlign = alignMap[textStyle.textAlignHorizontal];
      }
    }
  }

  private addColorStyles(node: FigmaNode, styles: CSSStyles): void {
    // Background color
    if (node.backgroundColor) {
      styles.backgroundColor = ColorUtils.colorToCSS(node.backgroundColor);
    }

    // Fills
    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.visible !== false) {
        if (fill.type === 'SOLID' && fill.color) {
          styles.backgroundColor = ColorUtils.colorToCSS(fill.color, fill.opacity);
        } else if (fill.type.startsWith('GRADIENT')) {
          styles.background = ColorUtils.gradientToCSS(fill);
        }
      }
    }

    // Text color
    if (node.type === 'TEXT' && node.style?.fills?.[0]?.color) {
      styles.color = ColorUtils.colorToCSS(node.style.fills[0].color, node.style.fills[0].opacity);
    }

    // Opacity
    if (node.opacity !== undefined && node.opacity !== 1) {
      styles.opacity = node.opacity;
    }
  }

  private addBorderStyles(node: FigmaNode, styles: CSSStyles): void {
    // Border radius
    if (node.cornerRadius) {
      styles.borderRadius = `${node.cornerRadius}px`;
    }

    // Strokes (borders)
    if (node.strokes && node.strokes.length > 0 && node.strokeWeight) {
      const stroke = node.strokes[0];
      if (stroke.visible !== false && stroke.color) {
        const color = ColorUtils.colorToCSS(stroke.color, stroke.opacity);
        styles.border = `${node.strokeWeight}px solid ${color}`;
      }
    }
  }

  private addEffectStyles(node: FigmaNode, styles: CSSStyles): void {
    if (node.effects && node.effects.length > 0) {
      const shadows = node.effects
        .filter(effect => effect.type === 'DROP_SHADOW' && effect.visible !== false)
        .map(effect => this.effectToCSS(effect));
      
      if (shadows.length > 0) {
        styles.boxShadow = shadows.join(', ');
      }
    }
  }

  private addSpacingStyles(node: FigmaNode, styles: CSSStyles): void {
    // Padding
    if (node.paddingLeft || node.paddingRight || node.paddingTop || node.paddingBottom) {
      const top = node.paddingTop || 0;
      const right = node.paddingRight || 0;
      const bottom = node.paddingBottom || 0;
      const left = node.paddingLeft || 0;
      
      if (top === right && right === bottom && bottom === left) {
        styles.padding = `${top}px`;
      } else if (top === bottom && left === right) {
        styles.padding = `${top}px ${right}px`;
      } else {
        styles.padding = `${top}px ${right}px ${bottom}px ${left}px`;
      }
    }
  }

  private addTailwindLayoutClasses(node: FigmaNode, classes: string[]): void {
    // Layout mode
    if (node.layoutMode === 'HORIZONTAL') {
      classes.push('flex', 'flex-row');
    } else if (node.layoutMode === 'VERTICAL') {
      classes.push('flex', 'flex-col');
    }

    // Alignment
    if (node.primaryAxisAlignItems) {
      const justifyMap = {
        'MIN': 'justify-start',
        'CENTER': 'justify-center',
        'MAX': 'justify-end',
        'SPACE_BETWEEN': 'justify-between'
      };
      const justifyClass = justifyMap[node.primaryAxisAlignItems];
      if (justifyClass) classes.push(justifyClass);
    }

    if (node.counterAxisAlignItems) {
      const alignMap = {
        'MIN': 'items-start',
        'CENTER': 'items-center',
        'MAX': 'items-end',
        'BASELINE': 'items-baseline'
      };
      const alignClass = alignMap[node.counterAxisAlignItems];
      if (alignClass) classes.push(alignClass);
    }

    // Size
    if (node.absoluteBoundingBox) {
      const { width, height } = node.absoluteBoundingBox;
      classes.push(`w-[${width}px]`, `h-[${height}px]`);
    }

    // Overflow
    if (node.clipsContent) {
      classes.push('overflow-hidden');
    }
  }

  private addTailwindTypographyClasses(node: FigmaNode, classes: string[]): void {
    if (node.type === 'TEXT' && node.style) {
      // Font size
      const fontSize = this.fontSizeToTailwind(node.style.fontSize);
      if (fontSize) classes.push(fontSize);

      // Font weight
      const fontWeight = this.fontWeightToTailwind(node.style.fontWeight);
      if (fontWeight) classes.push(fontWeight);

      // Text alignment
      if (node.style.textAlignHorizontal) {
        const alignMap = {
          'LEFT': 'text-left',
          'CENTER': 'text-center',
          'RIGHT': 'text-right',
          'JUSTIFIED': 'text-justify'
        };
        const alignClass = alignMap[node.style.textAlignHorizontal];
        if (alignClass) classes.push(alignClass);
      }
    }
  }

  private addTailwindColorClasses(node: FigmaNode, classes: string[]): void {
    // Background color
    if (node.backgroundColor) {
      const bgClass = ColorUtils.colorToTailwind(node.backgroundColor);
      if (bgClass) classes.push(bgClass);
    }

    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.visible !== false && fill.type === 'SOLID' && fill.color) {
        const bgClass = ColorUtils.colorToTailwind(fill.color);
        if (bgClass) classes.push(bgClass);
      }
    }

    // Text color
    if (node.type === 'TEXT' && node.style?.fills?.[0]?.color) {
      const textClass = ColorUtils.colorToTextTailwind(node.style.fills[0].color);
      if (textClass) classes.push(textClass);
    }
  }

  private addTailwindSpacingClasses(node: FigmaNode, classes: string[]): void {
    // Gap
    if (node.itemSpacing) {
      const gap = this.pxToTailwindSpacing(node.itemSpacing);
      if (gap) classes.push(`gap-${gap}`);
    }

    // Padding
    if (node.paddingLeft) {
      const pl = this.pxToTailwindSpacing(node.paddingLeft);
      if (pl) classes.push(`pl-${pl}`);
    }
    if (node.paddingRight) {
      const pr = this.pxToTailwindSpacing(node.paddingRight);
      if (pr) classes.push(`pr-${pr}`);
    }
    if (node.paddingTop) {
      const pt = this.pxToTailwindSpacing(node.paddingTop);
      if (pt) classes.push(`pt-${pt}`);
    }
    if (node.paddingBottom) {
      const pb = this.pxToTailwindSpacing(node.paddingBottom);
      if (pb) classes.push(`pb-${pb}`);
    }
  }

  private addTailwindBorderClasses(node: FigmaNode, classes: string[]): void {
    // Border radius
    if (node.cornerRadius) {
      const radius = this.borderRadiusToTailwind(node.cornerRadius);
      if (radius) classes.push(radius);
    }

    // Border
    if (node.strokes && node.strokes.length > 0 && node.strokeWeight) {
      const stroke = node.strokes[0];
      if (stroke.visible !== false && stroke.color) {
        classes.push('border');
        const borderColor = ColorUtils.colorToTailwind(stroke.color).replace('bg-', 'border-');
        if (borderColor) classes.push(borderColor);
      }
    }
  }

  private addTailwindEffectClasses(node: FigmaNode, classes: string[]): void {
    if (node.effects && node.effects.length > 0) {
      const hasShadow = node.effects.some(effect => 
        effect.type === 'DROP_SHADOW' && effect.visible !== false
      );
      
      if (hasShadow) {
        classes.push('shadow-lg'); // Simplified shadow class
      }
    }
  }

  private fontSizeToTailwind(fontSize: number): string {
    const sizes = Object.entries(DESIGN_TOKENS.FONT_SIZES);
    let closest = sizes[0];
    let closestDiff = Math.abs(fontSize - closest[1]);

    for (const [name, size] of sizes) {
      const diff = Math.abs(fontSize - size);
      if (diff < closestDiff) {
        closest = [name, size];
        closestDiff = diff;
      }
    }

    return `text-${closest[0]}`;
  }

  private fontWeightToTailwind(fontWeight: number): string {
    if (fontWeight <= 200) return 'font-extralight';
    if (fontWeight <= 300) return 'font-light';
    if (fontWeight <= 400) return 'font-normal';
    if (fontWeight <= 500) return 'font-medium';
    if (fontWeight <= 600) return 'font-semibold';
    if (fontWeight <= 700) return 'font-bold';
    if (fontWeight <= 800) return 'font-extrabold';
    return 'font-black';
  }

  private pxToTailwindSpacing(pixels: number): string {
    const rem = pixels / 16; // Convert to rem (assuming 16px base)
    
    if (rem <= 0.125) return '0.5'; // 2px
    if (rem <= 0.25) return '1';    // 4px
    if (rem <= 0.375) return '1.5'; // 6px
    if (rem <= 0.5) return '2';     // 8px
    if (rem <= 0.625) return '2.5'; // 10px
    if (rem <= 0.75) return '3';    // 12px
    if (rem <= 1) return '4';       // 16px
    if (rem <= 1.25) return '5';    // 20px
    if (rem <= 1.5) return '6';     // 24px
    if (rem <= 2) return '8';       // 32px
    if (rem <= 2.5) return '10';    // 40px
    if (rem <= 3) return '12';      // 48px
    if (rem <= 4) return '16';      // 64px
    if (rem <= 5) return '20';      // 80px
    if (rem <= 6) return '24';      // 96px
    
    return `[${pixels}px]`; // Arbitrary value for larger sizes
  }

  private borderRadiusToTailwind(radius: number): string {
    const radiusMap = Object.entries(DESIGN_TOKENS.BORDER_RADIUS);
    let closest = radiusMap[0];
    let closestDiff = Math.abs(radius - closest[1]);

    for (const [name, value] of radiusMap) {
      const diff = Math.abs(radius - value);
      if (diff < closestDiff) {
        closest = [name, value];
        closestDiff = diff;
      }
    }

    return closest[0] === 'base' ? 'rounded' : `rounded-${closest[0]}`;
  }

  private effectToCSS(effect: FigmaEffect): string {
    if (effect.type === 'DROP_SHADOW') {
      const x = effect.offset?.x || 0;
      const y = effect.offset?.y || 0;
      const blur = effect.radius || 0;
      const spread = effect.spread || 0;
      const color = effect.color ? ColorUtils.colorToCSS(effect.color) : 'rgba(0, 0, 0, 0.1)';
      
      return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
    }
    
    return '';
  }

  private stylesToCSS(styles: CSSStyles): string {
    return Object.entries(styles)
      .map(([prop, value]) => `  ${this.camelToKebab(prop)}: ${value};`)
      .join('\n');
  }

  private camelToKebab(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  private generateResponsiveStylesForBreakpoint(
    node: FigmaNode, 
    breakpointName: string, 
    width: number
  ): CSSStyles {
    // This would contain logic to generate responsive styles
    // For now, return empty object as this would be complex to implement fully
    return {};
  }
}
