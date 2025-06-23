
import { 
  ComponentConfig, 
  GeneratedComponent, 
  AccessibilityReport, 
  ResponsiveBreakpoints, 
  ComponentMetadata,
  FigmaNode,
  AccessibilityIssue
} from '../types/figma';
import { TemplateEngine } from './template-engine';
import { CodeGenerationError } from './errors';

export interface ComponentGenerator {
  generate(config: ComponentConfig): GeneratedComponent;
  canHandle(config: ComponentConfig): boolean;
  getEstimatedComplexity(config: ComponentConfig): 'simple' | 'medium' | 'complex';
}

export class ComponentGeneratorStrategy {
  private generators = new Map<string, ComponentGenerator>();
  private templateEngine: TemplateEngine;

  constructor() {
    this.templateEngine = new TemplateEngine();
    this.initializeGenerators();
  }

  generate(config: ComponentConfig): GeneratedComponent {
    const generator = this.findGenerator(config);
    
    if (!generator) {
      throw new CodeGenerationError(
        `No suitable generator found for component type: ${config.type}`,
        config.node?.id,
        config.type
      );
    }

    return generator.generate(config);
  }

  registerGenerator(type: string, generator: ComponentGenerator): void {
    this.generators.set(type, generator);
  }

  private findGenerator(config: ComponentConfig): ComponentGenerator | undefined {
    // First try exact type match
    const exactMatch = this.generators.get(config.type);
    if (exactMatch?.canHandle(config)) {
      return exactMatch;
    }

    // Then try to find any generator that can handle this config
    for (const generator of this.generators.values()) {
      if (generator.canHandle(config)) {
        return generator;
      }
    }

    // Fall back to default generator
    return this.generators.get('default');
  }

  private initializeGenerators(): void {
    this.generators.set('button', new ButtonGenerator(this.templateEngine));
    this.generators.set('card', new CardGenerator(this.templateEngine));
    this.generators.set('text', new TextGenerator(this.templateEngine));
    this.generators.set('layout', new LayoutGenerator(this.templateEngine));
    this.generators.set('image', new ImageGenerator(this.templateEngine));
    this.generators.set('icon', new IconGenerator(this.templateEngine));
    this.generators.set('default', new DefaultGenerator(this.templateEngine));
  }
}

abstract class BaseGenerator implements ComponentGenerator {
  constructor(protected templateEngine: TemplateEngine) {}

  abstract generate(config: ComponentConfig): GeneratedComponent;
  abstract canHandle(config: ComponentConfig): boolean;
  abstract getEstimatedComplexity(config: ComponentConfig): 'simple' | 'medium' | 'complex';

  protected generateMetadata(config: ComponentConfig, generationTime: number): ComponentMetadata {
    return {
      figmaNodeId: config.node?.id || `generated-${config.name}`,
      componentType: this.getComponentType(config),
      complexity: this.getEstimatedComplexity(config),
      estimatedAccuracy: this.calculateAccuracy(config),
      generationTime,
      dependencies: this.getDependencies(config),
      suggestedProps: this.generateSuggestedProps(config),
      warnings: this.generateWarnings(config)
    };
  }

  protected generateAccessibility(config: ComponentConfig): AccessibilityReport {
    const issues = this.analyzeAccessibilityIssues(config);
    const suggestions = this.getAccessibilitySuggestions(config);
    const score = this.calculateAccessibilityScore(config, issues);

    return {
      score,
      issues,
      suggestions,
      wcagCompliance: score >= 90 ? 'AAA' : score >= 80 ? 'AA' : 'A'
    };
  }

  protected generateResponsive(config: ComponentConfig): ResponsiveBreakpoints {
    const componentName = config.name.toLowerCase();
    
    return {
      mobile: `/* Mobile styles for ${config.name} */
@media (max-width: 768px) {
  .${componentName} {
    font-size: 0.875rem;
    padding: 0.5rem;
  }
}`,
      tablet: `/* Tablet styles for ${config.name} */
@media (min-width: 769px) and (max-width: 1024px) {
  .${componentName} {
    font-size: 1rem;
    padding: 0.75rem;
  }
}`,
      desktop: `/* Desktop styles for ${config.name} */
@media (min-width: 1025px) {
  .${componentName} {
    font-size: 1.125rem;
    padding: 1rem;
  }
}`,
      hasResponsiveDesign: config.options.responsive
    };
  }

  private getComponentType(config: ComponentConfig): ComponentMetadata['componentType'] {
    const interactiveTypes = ['button', 'input', 'select', 'checkbox'];
    const layoutTypes = ['container', 'grid', 'flex', 'layout'];
    
    if (interactiveTypes.includes(config.type)) return 'interactive';
    if (layoutTypes.includes(config.type)) return 'layout';
    if (config.node?.children && config.node.children.length > 3) return 'complex';
    return 'simple';
  }

  private calculateAccuracy(config: ComponentConfig): number {
    let accuracy = 85; // Base accuracy
    
    if (config.node) accuracy += 5; // Has Figma node
    if (config.options.typescript) accuracy += 3; // TypeScript support
    if (config.options.accessibility) accuracy += 5; // Accessibility features
    if (config.customCode) accuracy += 2; // Custom code integration
    
    return Math.min(100, accuracy);
  }

  private getDependencies(config: ComponentConfig): string[] {
    const deps = ['react'];
    
    if (config.options.typescript) deps.push('@types/react');
    if (config.options.styling === 'styled-components') deps.push('styled-components');
    if (config.type === 'image') deps.push('next/image');
    
    return deps;
  }

  private generateSuggestedProps(config: ComponentConfig): Array<{name: string, type: string, required: boolean}> {
    const props: Array<{name: string, type: string, required: boolean}> = [];
    
    props.push({ name: 'className', type: 'string', required: false });
    
    if (config.type === 'button') {
      props.push({ name: 'onClick', type: '() => void', required: false });
      props.push({ name: 'disabled', type: 'boolean', required: false });
    }
    
    return props;
  }

  private generateWarnings(config: ComponentConfig): string[] {
    const warnings: string[] = [];
    
    if (config.type === 'complex') {
      warnings.push('Complex component may require manual adjustments');
    }
    
    return warnings;
  }

  private analyzeAccessibilityIssues(config: ComponentConfig): AccessibilityIssue[] {
    // This would contain more sophisticated accessibility analysis
    return [];
  }

  private getAccessibilitySuggestions(config: ComponentConfig): string[] {
    const suggestions = ['Ensure proper color contrast', 'Add keyboard navigation support'];
    
    if (config.type === 'button') {
      suggestions.push('Use descriptive button text or aria-label');
    }
    
    if (config.type === 'image') {
      suggestions.push('Always provide meaningful alt text');
    }
    
    return suggestions;
  }

  private calculateAccessibilityScore(config: ComponentConfig, issues: AccessibilityIssue[]): number {
    let score = 95; // Base score
    score -= issues.length * 5; // Deduct for issues
    
    if (config.options.accessibility) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }
}

class ButtonGenerator extends BaseGenerator {
  canHandle(config: ComponentConfig): boolean {
    return config.type === 'button' || 
           config.name.toLowerCase().includes('button') ||
           config.name.toLowerCase().includes('btn');
  }

  getEstimatedComplexity(): 'simple' | 'medium' | 'complex' {
    return 'simple';
  }

  generate(config: ComponentConfig): GeneratedComponent {
    const startTime = Date.now();
    const jsx = this.templateEngine.generateComponent('button', config);
    const css = this.generateCSS(config);
    
    return {
      id: config.node?.id || `button-${Date.now()}`,
      name: config.name,
      jsx,
      css,
      accessibility: this.generateAccessibility(config),
      responsive: this.generateResponsive(config),
      metadata: this.generateMetadata(config, Date.now() - startTime)
    };
  }

  private generateCSS(config: ComponentConfig): string {
    const className = config.name.toLowerCase();
    const customCSS = config.customCode?.css || '';
    const advancedCSS = config.customCode?.cssAdvanced || '';
    
    return `/* ${config.name} Button Component */
.${className} {
  @apply inline-flex items-center justify-center rounded-md font-medium transition-colors;
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
  @apply disabled:pointer-events-none disabled:opacity-50;
}

.${className}--primary {
  @apply bg-primary text-primary-foreground hover:bg-primary/90;
}

.${className}--secondary {
  @apply bg-secondary text-secondary-foreground hover:bg-secondary/80;
}

${customCSS ? `/* Custom CSS */\n${customCSS}` : ''}
${advancedCSS ? `/* Advanced CSS */\n${advancedCSS}` : ''}`;
  }
}

class CardGenerator extends BaseGenerator {
  canHandle(config: ComponentConfig): boolean {
    return config.type === 'card' || 
           config.name.toLowerCase().includes('card');
  }

  getEstimatedComplexity(): 'simple' | 'medium' | 'complex' {
    return 'medium';
  }

  generate(config: ComponentConfig): GeneratedComponent {
    const startTime = Date.now();
    const jsx = this.templateEngine.generateComponent('card', config);
    const css = this.generateCSS(config);
    
    return {
      id: config.node?.id || `card-${Date.now()}`,
      name: config.name,
      jsx,
      css,
      accessibility: this.generateAccessibility(config),
      responsive: this.generateResponsive(config),
      metadata: this.generateMetadata(config, Date.now() - startTime)
    };
  }

  private generateCSS(config: ComponentConfig): string {
    const className = config.name.toLowerCase();
    
    return `/* ${config.name} Card Component */
.${className} {
  @apply rounded-lg border bg-card text-card-foreground shadow-sm;
}`;
  }
}

class TextGenerator extends BaseGenerator {
  canHandle(config: ComponentConfig): boolean {
    return config.type === 'text' || 
           config.name.toLowerCase().includes('text') ||
           config.name.toLowerCase().includes('heading') ||
           config.name.toLowerCase().includes('title');
  }

  getEstimatedComplexity(): 'simple' | 'medium' | 'complex' {
    return 'simple';
  }

  generate(config: ComponentConfig): GeneratedComponent {
    const startTime = Date.now();
    const jsx = this.templateEngine.generateComponent('text', config);
    const css = this.generateCSS(config);
    
    return {
      id: config.node?.id || `text-${Date.now()}`,
      name: config.name,
      jsx,
      css,
      accessibility: this.generateAccessibility(config),
      responsive: this.generateResponsive(config),
      metadata: this.generateMetadata(config, Date.now() - startTime)
    };
  }

  private generateCSS(config: ComponentConfig): string {
    const className = config.name.toLowerCase();
    
    return `/* ${config.name} Text Component */
.${className} {
  @apply leading-7;
}`;
  }
}

class LayoutGenerator extends BaseGenerator {
  canHandle(config: ComponentConfig): boolean {
    return config.type === 'layout' || 
           config.name.toLowerCase().includes('container') ||
           config.name.toLowerCase().includes('wrapper') ||
           config.name.toLowerCase().includes('layout');
  }

  getEstimatedComplexity(): 'simple' | 'medium' | 'complex' {
    return 'medium';
  }

  generate(config: ComponentConfig): GeneratedComponent {
    const startTime = Date.now();
    const jsx = this.templateEngine.generateComponent('layout', config);
    const css = this.generateCSS(config);
    
    return {
      id: config.node?.id || `layout-${Date.now()}`,
      name: config.name,
      jsx,
      css,
      accessibility: this.generateAccessibility(config),
      responsive: this.generateResponsive(config),
      metadata: this.generateMetadata(config, Date.now() - startTime)
    };
  }

  private generateCSS(config: ComponentConfig): string {
    const className = config.name.toLowerCase();
    
    return `/* ${config.name} Layout Component */
.${className} {
  @apply mx-auto px-4;
}`;
  }
}

class ImageGenerator extends BaseGenerator {
  canHandle(config: ComponentConfig): boolean {
    return config.type === 'image' || 
           config.name.toLowerCase().includes('image') ||
           config.name.toLowerCase().includes('img') ||
           config.name.toLowerCase().includes('picture');
  }

  getEstimatedComplexity(): 'simple' | 'medium' | 'complex' {
    return 'complex';
  }

  generate(config: ComponentConfig): GeneratedComponent {
    const startTime = Date.now();
    const jsx = this.templateEngine.generateComponent('image', config);
    const css = this.generateCSS(config);
    
    return {
      id: config.node?.id || `image-${Date.now()}`,
      name: config.name,
      jsx,
      css,
      accessibility: this.generateAccessibility(config),
      responsive: this.generateResponsive(config),
      metadata: this.generateMetadata(config, Date.now() - startTime)
    };
  }

  private generateCSS(config: ComponentConfig): string {
    const className = config.name.toLowerCase();
    
    return `/* ${config.name} Image Component */
.${className} {
  @apply relative overflow-hidden rounded-lg;
}`;
  }
}

class IconGenerator extends BaseGenerator {
  canHandle(config: ComponentConfig): boolean {
    return config.type === 'icon' || 
           config.name.toLowerCase().includes('icon');
  }

  getEstimatedComplexity(): 'simple' | 'medium' | 'complex' {
    return 'simple';
  }

  generate(config: ComponentConfig): GeneratedComponent {
    const startTime = Date.now();
    const jsx = this.templateEngine.generateComponent('icon', config);
    const css = this.generateCSS(config);
    
    return {
      id: config.node?.id || `icon-${Date.now()}`,
      name: config.name,
      jsx,
      css,
      accessibility: this.generateAccessibility(config),
      responsive: this.generateResponsive(config),
      metadata: this.generateMetadata(config, Date.now() - startTime)
    };
  }

  private generateCSS(config: ComponentConfig): string {
    const className = config.name.toLowerCase();
    
    return `/* ${config.name} Icon Component */
.${className} {
  @apply inline-flex items-center justify-center;
}`;
  }
}

class DefaultGenerator extends BaseGenerator {
  canHandle(): boolean {
    return true; // Can handle any component as fallback
  }

  getEstimatedComplexity(): 'simple' | 'medium' | 'complex' {
    return 'medium';
  }

  generate(config: ComponentConfig): GeneratedComponent {
    const startTime = Date.now();
    const jsx = this.templateEngine.generateComponent('default', config);
    const css = this.generateCSS(config);
    
    return {
      id: config.node?.id || `component-${Date.now()}`,
      name: config.name,
      jsx,
      css,
      accessibility: this.generateAccessibility(config),
      responsive: this.generateResponsive(config),
      metadata: this.generateMetadata(config, Date.now() - startTime)
    };
  }

  private generateCSS(config: ComponentConfig): string {
    const className = config.name.toLowerCase();
    
    return `/* ${config.name} Component */
.${className} {
  @apply block;
}`;
  }
}
