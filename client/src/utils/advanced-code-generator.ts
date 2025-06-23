
import { 
  FigmaApiResponse, 
  GeneratedComponent, 
  CodeGenerationOptions, 
  CustomCodeInputs,
  FigmaNode,
  ComponentConfig
} from '../types/figma-generator';
import { ComponentGeneratorStrategy } from '../generators/component-generator-strategy';
import { ComponentCache } from './cache';
import { GenerationConfig } from './validation';
import { CodeGenerationError, ValidationError } from './errors';
import { IntelligentComponentDetector } from './intelligent-detector';
import { AdvancedAccessibilityAnalyzer } from './accessibility-analyzer';
import { MultiFrameworkGenerator } from './multi-framework-generator';
import { ComponentDetector } from './component-detector';
import { ComponentExtractor } from './component-extractor';
import { UtilityGenerator } from './utility-generator';
import { NodeFinder } from './node-finder';
import { ComponentNameSanitizer } from './component-name-sanitizer';

export class AdvancedCodeGenerator {
  private figmaData: FigmaApiResponse;
  private options: CodeGenerationOptions;
  private customCode: CustomCodeInputs = { jsx: '', css: '', cssAdvanced: '' };
  private strategy: ComponentGeneratorStrategy;
  private cache: ComponentCache;
  private detector: IntelligentComponentDetector;
  private accessibilityAnalyzer: AdvancedAccessibilityAnalyzer;
  private multiFrameworkGenerator: MultiFrameworkGenerator;
  private componentDetector: ComponentDetector;
  private componentExtractor: ComponentExtractor;
  private utilityGenerator: UtilityGenerator;
  private nodeFinder: NodeFinder;

  constructor(figmaData: FigmaApiResponse, options: CodeGenerationOptions) {
    // Validate inputs
    const figmaValidation = GenerationConfig.validateFigmaData(figmaData);
    if (!figmaValidation.isValid) {
      throw new ValidationError(`Invalid Figma data: ${figmaValidation.errors.join(', ')}`);
    }

    const optionsValidation = GenerationConfig.validate(options);
    if (!optionsValidation.isValid) {
      throw new ValidationError(`Invalid options: ${optionsValidation.errors.join(', ')}`);
    }

    this.figmaData = figmaData;
    this.options = options;
    this.strategy = new ComponentGeneratorStrategy();
    this.cache = new ComponentCache();
    this.detector = new IntelligentComponentDetector();
    this.accessibilityAnalyzer = new AdvancedAccessibilityAnalyzer();
    this.multiFrameworkGenerator = new MultiFrameworkGenerator();
    this.componentDetector = new ComponentDetector();
    this.componentExtractor = new ComponentExtractor(this.detector, this.accessibilityAnalyzer);
    this.utilityGenerator = new UtilityGenerator(this.strategy, this.cache, this.accessibilityAnalyzer);
    this.nodeFinder = new NodeFinder(figmaData);

    console.log('AdvancedCodeGenerator initialized with advanced features');
    console.log('Options validation warnings:', optionsValidation.warnings);
  }

  setCustomCode(customCode: CustomCodeInputs): void {
    this.customCode = customCode;
    console.log('Custom code updated');
  }

  // Enhanced component generation with intelligent detection
  generateComponents(): GeneratedComponent[] {
    console.log('Starting intelligent component generation...');
    const startTime = Date.now();
    
    try {
      const components: GeneratedComponent[] = [];
      
      // Generate components from Figma components with intelligent detection
      if (this.figmaData.components) {
        Object.entries(this.figmaData.components).forEach(([key, component]) => {
          const node = this.nodeFinder.findNodeById(component.key);
          if (node) {
            console.log(`Analyzing component: ${component.name}`);
            const detection = this.detector.detectComponentType(node);
            console.log(`Detection result:`, detection);
            
            const generatedComponent = this.generateSingleComponent(
              node, 
              detection.suggestedName, 
              detection.type
            );
            
            // Enhanced accessibility analysis
            generatedComponent.accessibility = this.accessibilityAnalyzer.analyzeAccessibility(
              node, 
              detection.type
            );
            
            components.push(generatedComponent);
          }
        });
      }

      // If no components found, extract with intelligent detection
      if (components.length === 0) {
        console.log('No Figma components found, extracting with intelligent detection...');
        const extractedComponents = this.componentExtractor.extractComponentsWithIntelligence(this.figmaData.document);
        components.push(...extractedComponents);
      }

      // Generate utility components with advanced features
      const utilityComponents = this.utilityGenerator.generateAdvancedUtilityComponents(this.options, this.customCode);
      components.push(...utilityComponents);

      console.log(`Generated ${components.length} components with advanced features in ${Date.now() - startTime}ms`);
      console.log('Cache stats:', this.cache.getStats());
      
      return components;
    } catch (error) {
      console.error('Advanced component generation failed:', error);
      throw new CodeGenerationError(
        'Failed to generate components with advanced features',
        undefined,
        undefined,
        error as Error
      );
    }
  }

  // Multi-framework generation
  generateForFramework(framework: string): GeneratedComponent[] {
    console.log(`Generating components for framework: ${framework}`);
    const components = this.generateComponents();
    
    return components.map(component => {
      const config: ComponentConfig = {
        name: component.name,
        type: component.metadata.componentType,
        options: { ...this.options, framework: framework as any },
        customCode: this.customCode
      };
      
      return this.multiFrameworkGenerator.generateForFramework(framework, config);
    });
  }

  // Enhanced single component generation
  private generateSingleComponent(node: FigmaNode, componentName: string, detectedType?: string): GeneratedComponent {
    const cacheKey = this.cache.generateKey(node.id, { 
      name: componentName, 
      type: detectedType,
      options: this.options,
      version: '2.0'
    });
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log(`Using cached component: ${componentName}`);
      return cached;
    }

    const sanitizedName = ComponentNameSanitizer.sanitize(componentName);
    const finalType = detectedType || this.componentDetector.detectComponentType(node);
    
    const config: ComponentConfig = {
      name: sanitizedName,
      type: finalType,
      node,
      options: { ...this.options, customCode: this.customCode },
      customCode: this.customCode
    };

    const component = this.strategy.generate(config);
    
    // Cache the result
    this.cache.set(cacheKey, component);
    
    return component;
  }

  // Performance and analytics methods
  getCacheStats() {
    return this.cache.getStats();
  }

  clearCache(): void {
    this.cache.clear();
    console.log('Advanced cache cleared');
  }

  getAdvancedGenerationReport() {
    return {
      figmaNodes: this.nodeFinder.countNodes(this.figmaData.document),
      components: this.figmaData.components ? Object.keys(this.figmaData.components).length : 0,
      options: this.options,
      cacheStats: this.cache.getStats(),
      features: {
        intelligentDetection: true,
        accessibilityAnalysis: true,
        multiFrameworkSupport: true,
        realTimePreview: true,
        customCodeIntegration: true
      }
    };
  }
}
