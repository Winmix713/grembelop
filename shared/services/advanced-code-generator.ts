import { 
  FigmaNode, 
  FigmaApiResponse, 
  GeneratedComponent, 
  GenerationConfig, 
  ComponentMetadata, 
  AccessibilityReport, 
  ResponsiveBreakpoints,
  AccessibilityIssue
} from '../types/figma';

interface ComponentAnalysis {
  type: 'button' | 'card' | 'text' | 'input' | 'layout' | 'complex';
  complexity: 'simple' | 'medium' | 'complex';
  hasInteractivity: boolean;
  hasVariants: boolean;
  childComponents: ComponentAnalysis[];
}

interface StyleProperties {
  width?: string;
  height?: string;
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  margin?: string;
  padding?: string;
  borderRadius?: string;
  border?: string;
  boxShadow?: string;
  display?: string;
  flexDirection?: string;
  alignItems?: string;
  justifyContent?: string;
  gap?: string;
  position?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  zIndex?: string;
  opacity?: string;
  transform?: string;
  transition?: string;
}

export class AdvancedCodeGenerator {
  private config: GenerationConfig;
  private dependencies: Set<string> = new Set();

  constructor(config: GenerationConfig) {
    this.config = config;
  }

  async generateComponent(
    figmaData: FigmaApiResponse,
    nodeId?: string,
    customCode?: {
      jsx?: string;
      css?: string;
      cssAdvanced?: string;
      imports?: string;
      utilities?: string;
    }
  ): Promise<GeneratedComponent> {
    const startTime = Date.now();

    // Find the target node or use document root
    const targetNode = nodeId 
      ? this.findNodeById(figmaData.document, nodeId)
      : figmaData.document.children?.[0]; // Use first canvas

    if (!targetNode) {
      throw new Error('Target node not found');
    }

    // Analyze component structure
    const analysis = this.analyzeComponent(targetNode);

    // Generate component name
    const componentName = this.generateComponentName(targetNode.name);

    // Generate styles
    const styles = this.generateStyles(targetNode);

    // Generate base JSX/HTML
    let jsx = await this.generateJSX(targetNode, analysis);
    let css = this.generateCSS(targetNode, styles);
    const tailwind = this.config.styling === 'tailwind' ? this.generateTailwind(targetNode, styles) : undefined;
    let typescript = this.config.typescript ? this.generateTypeScript(analysis) : undefined;

    // Integrate custom code if provided
    if (customCode) {
      jsx = this.integrateCustomJSX(jsx, customCode.jsx, customCode.imports);
      css = this.integrateCustomCSS(css, customCode.css, customCode.cssAdvanced);
      if (typescript && customCode.utilities) {
        typescript = this.integrateCustomUtilities(typescript, customCode.utilities);
      }
    }

    // Generate accessibility report
    const accessibility = this.generateAccessibilityReport(targetNode, jsx);

    // Generate responsive breakpoints
    const responsive = this.generateResponsiveBreakpoints(targetNode, styles);

    // Create metadata with proper defaults
    const metadata: ComponentMetadata = {
      figmaNodeId: targetNode.id,
      componentType: analysis.type,
      complexity: analysis.complexity,
      estimatedAccuracy: this.calculateAccuracy(analysis),
      generationTime: Date.now() - startTime,
      dependencies: Array.from(this.dependencies),
      suggestedProps: this.generateSuggestedProps(analysis),
      warnings: this.generateWarnings(analysis, customCode)
    };

    return {
      id: `component_${Date.now()}`,
      name: componentName,
      jsx,
      css,
      tailwind,
      typescript,
      accessibility,
      responsive,
      metadata
    };
  }

  private findNodeById(node: FigmaNode, id: string): FigmaNode | null {
    if (node.id === id) return node;

    if (node.children) {
      for (const child of node.children) {
        const found = this.findNodeById(child, id);
        if (found) return found;
      }
    }

    return null;
  }

  private analyzeComponent(node: FigmaNode): ComponentAnalysis {
    const type = this.determineComponentType(node);
    const complexity = this.determineComplexity(node);
    const hasInteractivity = this.hasInteractiveElements(node);
    const hasVariants = this.hasComponentVariants(node);

    const childComponents: ComponentAnalysis[] = [];
    if (node.children) {
      for (const child of node.children) {
        childComponents.push(this.analyzeComponent(child));
      }
    }

    return {
      type,
      complexity,
      hasInteractivity,
      hasVariants,
      childComponents
    };
  }

  private determineComponentType(node: FigmaNode): ComponentAnalysis['type'] {
    const name = node.name.toLowerCase();

    if (name.includes('button') || name.includes('btn')) return 'button';
    if (name.includes('card') || name.includes('panel')) return 'card';
    if (name.includes('input') || name.includes('field') || name.includes('form')) return 'input';
    if (node.type === 'TEXT') return 'text';
    if (node.children && node.children.length > 3) return 'layout';

    return 'complex';
  }

  private determineComplexity(node: FigmaNode): ComponentAnalysis['complexity'] {
    const childCount = node.children?.length || 0;
    const hasEffects = (node.effects?.length || 0) > 0;
    const hasConstraints = node.constraints !== undefined;

    if (childCount === 0 && !hasEffects) return 'simple';
    if (childCount <= 3 && !hasEffects) return 'medium';

    return 'complex';
  }

  private hasInteractiveElements(node: FigmaNode): boolean {
    const name = node.name.toLowerCase();
    const interactiveTypes = ['button', 'input', 'select', 'checkbox', 'radio', 'toggle'];

    if (interactiveTypes.some(type => name.includes(type))) return true;

    if (node.children) {
      return node.children.some(child => this.hasInteractiveElements(child));
    }

    return false;
  }

  private hasComponentVariants(node: FigmaNode): boolean {
    return node.type === 'COMPONENT_SET' || node.type === 'INSTANCE';
  }

  private generateComponentName(figmaName: string): string {
    // Convert Figma name to valid component name
    return figmaName
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
      .replace(/^\d/, 'Component$&'); // Prefix with Component if starts with number
  }

  private generateStyles(node: FigmaNode): StyleProperties {
    const styles: StyleProperties = {};

    // Dimensions
    if (node.absoluteBoundingBox) {
      styles.width = `${node.absoluteBoundingBox.width}px`;
      styles.height = `${node.absoluteBoundingBox.height}px`;
    }

    // Background
    if (node.backgroundColor) {
      const { r, g, b, a = 1 } = node.backgroundColor;
      styles.backgroundColor = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
    }

    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.color) {
        const { r, g, b, a = 1 } = fill.color;
        styles.backgroundColor = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
      }
    }

    // Border radius
    if (node.cornerRadius) {
      styles.borderRadius = `${node.cornerRadius}px`;
    }

    // Typography
    if (node.style) {
      styles.fontFamily = node.style.fontFamily;
      styles.fontSize = `${node.style.fontSize}px`;
      styles.fontWeight = 'normal'; // Default weight, can be enhanced based on font family analysis
      styles.lineHeight = `${node.style.lineHeightPx}px`;
      styles.letterSpacing = `${node.style.letterSpacing}px`;

      if (node.style.fills && node.style.fills.length > 0) {
        const fill = node.style.fills[0];
        if (fill.color) {
          const { r, g, b, a = 1 } = fill.color;
          styles.color = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
        }
      }
    }

    // Layout
    if (node.layoutMode) {
      styles.display = 'flex';
      styles.flexDirection = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';

      if (node.itemSpacing) {
        styles.gap = `${node.itemSpacing}px`;
      }
    }

    // Padding
    if (node.paddingLeft || node.paddingRight || node.paddingTop || node.paddingBottom) {
      const top = node.paddingTop || 0;
      const right = node.paddingRight || 0;
      const bottom = node.paddingBottom || 0;
      const left = node.paddingLeft || 0;

      if (top === right && right === bottom && bottom === left) {
        styles.padding = `${top}px`;
      } else {
        styles.padding = `${top}px ${right}px ${bottom}px ${left}px`;
      }
    }

    // Effects (shadows)
    if (node.effects && node.effects.length > 0) {
      const shadows = node.effects
        .filter(effect => effect.type === 'DROP_SHADOW' && effect.visible !== false)
        .map(effect => {
          const offsetX = effect.offset?.x || 0;
          const offsetY = effect.offset?.y || 0;
          const radius = effect.radius || 0;
          const spread = effect.spread || 0;

          if (effect.color) {
            const { r, g, b, a = 1 } = effect.color;
            const color = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
            return `${offsetX}px ${offsetY}px ${radius}px ${spread}px ${color}`;
          }

          return `${offsetX}px ${offsetY}px ${radius}px ${spread}px rgba(0, 0, 0, 0.1)`;
        });

      if (shadows.length > 0) {
        styles.boxShadow = shadows.join(', ');
      }
    }

    return styles;
  }

  private async generateJSX(node: FigmaNode, analysis: ComponentAnalysis): Promise<string> {
    const componentName = this.generateComponentName(node.name);

    if (this.config.framework === 'react') {
      return this.generateReactJSX(node, analysis, componentName);
    } else if (this.config.framework === 'vue') {
      return this.generateVueTemplate(node, analysis, componentName);
    } else {
      return this.generateHTML(node, analysis, componentName);
    }
  }

  private generateReactJSX(node: FigmaNode, analysis: ComponentAnalysis, componentName: string): string {
    const props = this.generateReactProps(analysis);
    const className = this.config.styling === 'tailwind' ? this.generateTailwindClasses(node) : 'component-styles';

    let jsx = '';

    if (this.config.typescript) {
      jsx += `interface ${componentName}Props {\n${props.join('\n')}\n}\n\n`;
    }

    jsx += `${this.config.typescript ? 'const' : 'function'} ${componentName}${this.config.typescript ? ': React.FC<' + componentName + 'Props>' : ''} = (${this.config.typescript ? '{ ...props }' : 'props'}) => {\n`;
    jsx += `  return (\n`;
    jsx += `    ${this.generateReactElement(node, className, 4)}\n`;
    jsx += `  );\n`;
    jsx += `};\n\n`;
    jsx += `export default ${componentName};`;

    // Add dependencies
    this.dependencies.add('react');
    if (this.config.typescript) {
      this.dependencies.add('@types/react');
    }

    return jsx;
  }

  private generateReactElement(node: FigmaNode, className: string, indent: number): string {
    const indentStr = ' '.repeat(indent);
    const tag = this.getHTMLTag(node);

    let element = `${indentStr}<${tag}`;

    if (className) {
      element += ` className="${className}"`;
    }

    // Add accessibility attributes
    if (node.name.toLowerCase().includes('button')) {
      element += ` role="button" tabIndex={0}`;
    }

    if (node.type === 'TEXT' && node.characters) {
      element += `>${node.characters}</${tag}>`;
    } else if (node.children && node.children.length > 0) {
      element += `>\n`;

      for (const child of node.children) {
        element += this.generateReactElement(child, '', indent + 2) + '\n';
      }

      element += `${indentStr}</${tag}>`;
    } else {
      element += ` />`;
    }

    return element;
  }

  private generateVueTemplate(node: FigmaNode, analysis: ComponentAnalysis, componentName: string): string {
    const template = this.generateVueElement(node, '', 2);

    return `<template>\n${template}\n</template>\n\n<script>\nexport default {\n  name: '${componentName}',\n  props: {\n    // Add props here\n  }\n};\n</script>\n\n<style scoped>\n/* Component styles */\n</style>`;
  }

  private generateVueElement(node: FigmaNode, className: string, indent: number): string {
    const indentStr = ' '.repeat(indent);
    const tag = this.getHTMLTag(node);

    let element = `${indentStr}<${tag}`;

    if (className) {
      element += ` class="${className}"`;
    }

    if (node.type === 'TEXT' && node.characters) {
      element += `>${node.characters}</${tag}>`;
    } else if (node.children && node.children.length > 0) {
      element += `>\n`;

      for (const child of node.children) {
        element += this.generateVueElement(child, '', indent + 2) + '\n';
      }

      element += `${indentStr}</${tag}>`;
    } else {
      element += ` />`;
    }

    return element;
  }

  private generateHTML(node: FigmaNode, analysis: ComponentAnalysis, componentName: string): string {
    const element = this.generateHTMLElement(node, 'component-styles', 0);

    return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${componentName}</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n${element}\n</body>\n</html>`;
  }

  private generateHTMLElement(node: FigmaNode, className: string, indent: number): string {
    const indentStr = ' '.repeat(indent);
    const tag = this.getHTMLTag(node);

    let element = `${indentStr}<${tag}`;

    if (className) {
      element += ` class="${className}"`;
    }

    if (node.type === 'TEXT' && node.characters) {
      element += `>${node.characters}</${tag}>`;
    } else if (node.children && node.children.length > 0) {
      element += `>\n`;

      for (const child of node.children) {
        element += this.generateHTMLElement(child, '', indent + 2) + '\n';
      }

      element += `${indentStr}</${tag}>`;
    } else {
      element += ` />`;
    }

    return element;
  }

  private getHTMLTag(node: FigmaNode): string {
    const name = node.name.toLowerCase();

    if (name.includes('button')) return 'button';
    if (name.includes('input')) return 'input';
    if (name.includes('header')) return 'header';
    if (name.includes('footer')) return 'footer';
    if (name.includes('nav')) return 'nav';
    if (node.type === 'TEXT') return 'span';
    if (node.layoutMode) return 'div';

    return 'div';
  }

  private generateReactProps(analysis: ComponentAnalysis): string[] {
    const props: string[] = [];

    if (analysis.hasInteractivity) {
      props.push('  onClick?: () => void;');
    }

    if (analysis.type === 'button') {
      props.push('  disabled?: boolean;');
      props.push('  variant?: "primary" | "secondary" | "outline";');
    }

    if (analysis.type === 'input') {
      props.push('  value?: string;');
      props.push('  onChange?: (value: string) => void;');
      props.push('  placeholder?: string;');
    }

    props.push('  className?: string;');

    return props;
  }

  private generateCSS(node: FigmaNode, styles: StyleProperties): string {
    let css = '.component-styles {\n';

    for (const [property, value] of Object.entries(styles)) {
      if (value) {
        const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
        css += `  ${cssProperty}: ${value};\n`;
      }
    }

    css += '}\n';

    // Add responsive styles
    css += '\n@media (max-width: 768px) {\n';
    css += '  .component-styles {\n';
    css += '    /* Mobile styles */\n';
    css += '  }\n';
    css += '}\n';

    return css;
  }

  private generateTailwind(node: FigmaNode, styles: StyleProperties): string {
    return this.generateTailwindClasses(node);
  }

  private generateTailwindClasses(node: FigmaNode): string {
    const classes: string[] = [];

    // Layout
    if (node.layoutMode) {
      classes.push('flex');
      classes.push(node.layoutMode === 'HORIZONTAL' ? 'flex-row' : 'flex-col');

      if (node.itemSpacing) {
        const spacing = this.convertToTailwindSpacing(node.itemSpacing);
        classes.push(`gap-${spacing}`);
      }
    }

    // Padding
    if (node.paddingLeft || node.paddingRight || node.paddingTop || node.paddingBottom) {
      const padding = Math.max(
        node.paddingLeft || 0,
        node.paddingRight || 0,
        node.paddingTop || 0,
        node.paddingBottom || 0
      );
      const spacing = this.convertToTailwindSpacing(padding);
      classes.push(`p-${spacing}`);
    }

    // Border radius
    if (node.cornerRadius) {
      const radius = this.convertToTailwindRadius(node.cornerRadius);
      classes.push(`rounded-${radius}`);
    }

    // Background color
    if (node.backgroundColor || (node.fills && node.fills.length > 0)) {
      classes.push('bg-gray-100'); // Default, should be calculated from actual color
    }

    // Typography
    if (node.type === 'TEXT') {
      classes.push('text-base', 'font-normal');
    }

    // Interactive elements
    if (node.name.toLowerCase().includes('button')) {
      classes.push('cursor-pointer', 'hover:opacity-80', 'transition-opacity');
    }

    return classes.join(' ');
  }

  private convertToTailwindSpacing(pixels: number): string {
    // Convert pixels to Tailwind spacing scale
    if (pixels <= 4) return '1';
    if (pixels <= 8) return '2';
    if (pixels <= 12) return '3';
    if (pixels <= 16) return '4';
    if (pixels <= 20) return '5';
    if (pixels <= 24) return '6';
    if (pixels <= 32) return '8';
    if (pixels <= 40) return '10';
    if (pixels <= 48) return '12';
    return '16';
  }

  private convertToTailwindRadius(pixels: number): string {
    if (pixels <= 2) return 'sm';
    if (pixels <= 4) return '';
    if (pixels <= 6) return 'md';
    if (pixels <= 8) return 'lg';
    if (pixels <= 12) return 'xl';
    if (pixels <= 16) return '2xl';
    return '3xl';
  }

  private generateTypeScript(analysis: ComponentAnalysis): string {
    let typescript = '// Type definitions\n\n';

    typescript += 'export interface ComponentProps {\n';
    typescript += '  className?: string;\n';

    if (analysis.hasInteractivity) {
      typescript += '  onClick?: () => void;\n';
    }

    if (analysis.type === 'button') {
      typescript += '  disabled?: boolean;\n';
      typescript += '  variant?: "primary" | "secondary" | "outline";\n';
    }

    typescript += '}\n\n';

    typescript += 'export interface ComponentState {\n';
    typescript += '  // Add state types here\n';
    typescript += '}\n';

    return typescript;
  }

  private generateAccessibilityReport(node: FigmaNode, jsx: string): AccessibilityReport {
    const issues: AccessibilityIssue[] = [];
    const suggestions: string[] = [];

    // Check for missing alt text on images
    if (node.type === 'RECTANGLE' && node.fills && node.fills.some(fill => fill.imageRef)) {
      issues.push({
        type: 'error',
        message: 'Image missing alt text',
        element: 'img',
        fix: 'Add alt attribute with descriptive text'
      });
    }

    // Check for button accessibility
    if (node.name.toLowerCase().includes('button')) {
      if (!jsx.includes('aria-label') && !jsx.includes('aria-labelledby')) {
        issues.push({
          type: 'warning',
          message: 'Button missing accessible label',
          element: 'button',
          fix: 'Add aria-label or aria-labelledby attribute'
        });
      }
    }

    // Check for text contrast
    if (node.type === 'TEXT' && node.style) {
      suggestions.push('Verify text contrast meets WCAG AA standards (4.5:1 ratio)');
    }

    // Check for focus management
    if (node.name.toLowerCase().includes('input')) {
      suggestions.push('Ensure proper focus management and keyboard navigation');
    }

    // Calculate accessibility score
    const errorCount = issues.filter(issue => issue.type === 'error').length;
    const warningCount = issues.filter(issue => issue.type === 'warning').length;

    let score = 100;
    score -= errorCount * 20;
    score -= warningCount * 10;
    score = Math.max(0, score);

    // Determine WCAG compliance
    let wcagCompliance: 'AA' | 'A' | 'Non-compliant' = 'AA';
    if (errorCount > 0) {
      wcagCompliance = 'Non-compliant';
    } else if (warningCount > 2) {
      wcagCompliance = 'A';
    }

    return {
      score,
      issues,
      suggestions,
      wcagCompliance
    };
  }

  private generateResponsiveBreakpoints(node: FigmaNode, styles: StyleProperties): ResponsiveBreakpoints {
    const baseWidth = node.absoluteBoundingBox?.width || 320;

    // Generate responsive CSS
    const mobile = this.generateResponsiveCSS(styles, 'mobile');
    const tablet = this.generateResponsiveCSS(styles, 'tablet');
    const desktop = this.generateResponsiveCSS(styles, 'desktop');

    return {
      mobile,
      tablet,
      desktop,
      hasResponsiveDesign: baseWidth > 768
    };
  }

  private generateResponsiveCSS(styles: StyleProperties, breakpoint: 'mobile' | 'tablet' | 'desktop'): string {
    const responsiveStyles = { ...styles };

    // Adjust styles based on breakpoint
    if (breakpoint === 'mobile') {
      if (responsiveStyles.fontSize) {
        const fontSize = parseInt(responsiveStyles.fontSize);
        responsiveStyles.fontSize = `${Math.max(14, fontSize * 0.8)}px`;
      }
      if (responsiveStyles.padding) {
        responsiveStyles.padding = '8px';
      }
    }

    let css = '';
    for (const [property, value] of Object.entries(responsiveStyles)) {
      if (value) {
        const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
        css += `  ${cssProperty}: ${value};\n`;
      }
    }

    return css;
  }

  private calculateAccuracy(analysis: ComponentAnalysis): number {
    let accuracy = 85; // Base accuracy

    // Adjust based on complexity
    if (analysis.complexity === 'simple') accuracy += 10;
    if (analysis.complexity === 'complex') accuracy -= 15;

    // Adjust based on component type
    if (analysis.type === 'text') accuracy += 5;
    if (analysis.type === 'complex') accuracy -= 10;

    // Adjust based on features
    if (analysis.hasInteractivity) accuracy -= 5;
    if (analysis.hasVariants) accuracy -= 10;

    return Math.max(60, Math.min(95, accuracy));
  }

  private integrateCustomJSX(baseJSX: string, customJSX?: string, customImports?: string): string {
    if (!customJSX && !customImports) return baseJSX;

    let integratedJSX = baseJSX;

    // Add custom imports at the top
    if (customImports) {
      const importSection = customImports.trim() + '\n';
      if (integratedJSX.includes('import React')) {
        integratedJSX = integratedJSX.replace(/import React[^;]*;\n/, `import React from 'react';\n${importSection}`);
      } else {
        integratedJSX = importSection + integratedJSX;
      }
    }

    // Integrate custom JSX logic
    if (customJSX) {
      // Find the component function and add custom logic
      const functionMatch = integratedJSX.match(/(const \w+ = \([^)]*\) => \{)/);
      if (functionMatch) {
        const customLogic = `\n  // Custom logic\n${customJSX.split('\n').map(line => `  ${line}`).join('\n')}\n`;
        integratedJSX = integratedJSX.replace(functionMatch[1], functionMatch[1] + customLogic);
      }
    }

    return integratedJSX;
  }

  private integrateCustomCSS(baseCSS: string, customCSS?: string, customAdvanced?: string): string {
    if (!customCSS && !customAdvanced) return baseCSS;

    let integratedCSS = baseCSS;

    // Add custom CSS
    if (customCSS) {
      integratedCSS += '\n\n/* Custom CSS */\n' + customCSS;
    }

    // Add advanced CSS features
    if (customAdvanced) {
      integratedCSS += '\n\n/* Advanced CSS Features */\n' + customAdvanced;
    }

    return integratedCSS;
  }

  private integrateCustomUtilities(baseTypeScript: string, customUtilities: string): string {
    return baseTypeScript + '\n\n// Custom Utilities\n' + customUtilities;
  }

  private generateSuggestedProps(analysis: ComponentAnalysis): Array<{name: string, type: string, required: boolean}> {
    const props: Array<{name: string, type: string, required: boolean}> = [];

    props.push({ name: 'className', type: 'string', required: false });

    if (analysis.hasInteractivity) {
      props.push({ name: 'onClick', type: '() => void', required: false });
    }

    if (analysis.type === 'button') {
      props.push({ name: 'disabled', type: 'boolean', required: false });
      props.push({ name: 'variant', type: '"primary" | "secondary" | "outline"', required: false });
    }

    if (analysis.type === 'input') {
      props.push({ name: 'value', type: 'string', required: false });
      props.push({ name: 'onChange', type: '(value: string) => void', required: false });
      props.push({ name: 'placeholder', type: 'string', required: false });
    }

    return props;
  }

  private generateWarnings(analysis: ComponentAnalysis, customCode?: any): string[] {
    const warnings: string[] = [];

    if (analysis.complexity === 'complex') {
      warnings.push('Complex component may require manual adjustments');
    }

    if (analysis.hasVariants) {
      warnings.push('Component variants detected - verify all states are handled');
    }

    if (customCode?.jsx && !customCode?.css) {
      warnings.push('Custom JSX provided without corresponding CSS - styles may be incomplete');
    }

    return warnings;
  }
}