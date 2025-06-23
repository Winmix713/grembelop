
import { GeneratedComponent, ComponentConfig } from '../types/figma-generator';
import { ComponentGeneratorStrategy } from '../generators/component-generator-strategy';
import { ComponentCache } from './cache';
import { AdvancedAccessibilityAnalyzer } from './accessibility-analyzer';
import { FigmaNode } from '../types/figma-generator';

export class UtilityGenerator {
  constructor(
    private strategy: ComponentGeneratorStrategy,
    private cache: ComponentCache,
    private accessibilityAnalyzer: AdvancedAccessibilityAnalyzer
  ) {}

  generateAdvancedUtilityComponents(options: any, customCode: any): GeneratedComponent[] {
    const components: GeneratedComponent[] = [];
    
    // Advanced utility components with better detection and features
    const utilitySpecs = [
      { name: 'SmartButton', type: 'button', priority: 'high' },
      { name: 'AccessibleCard', type: 'card', priority: 'high' },
      { name: 'ResponsiveContainer', type: 'layout', priority: 'medium' },
      { name: 'SemanticText', type: 'text', priority: 'medium' },
      { name: 'OptimizedImage', type: 'image', priority: 'medium' },
      { name: 'AccessibleIcon', type: 'icon', priority: 'low' }
    ];

    utilitySpecs.forEach(spec => {
      console.log(`Generating advanced utility component: ${spec.name}`);
      const utilityComponent = this.generateAdvancedUtilityComponent(spec.name, spec.type, options, customCode);
      components.push(utilityComponent);
    });

    return components;
  }

  private generateAdvancedUtilityComponent(name: string, type: string, options: any, customCode: any): GeneratedComponent {
    const cacheKey = this.cache.generateKey(`advanced-utility-${name}`, { 
      type, 
      options,
      version: '2.0' // Version for advanced features
    });
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log(`Using cached advanced component: ${name}`);
      return cached;
    }

    const config: ComponentConfig = {
      name,
      type,
      options: { ...options, customCode },
      customCode
    };

    // Generate with strategy pattern
    const component = this.strategy.generate(config);
    
    // Enhance with advanced accessibility analysis
    component.accessibility = this.accessibilityAnalyzer.analyzeAccessibility(
      { id: `utility-${name}`, name, type: 'FRAME' } as FigmaNode,
      type
    );
    
    // Cache the result
    this.cache.set(cacheKey, component);
    
    return component;
  }
}
