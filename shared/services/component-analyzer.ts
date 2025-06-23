import { FigmaNode, ComponentMetadata } from '../types/figma';
import { COMPONENT_TYPES, FIGMA_NODE_TYPES } from '../utils/constants';
import { PropDefinition } from '../types/generator';

export class ComponentAnalyzer {
  private node: FigmaNode;
  private startTime: number;

  constructor(node: FigmaNode) {
    this.node = node;
    this.startTime = Date.now();
  }

  analyze(): ComponentMetadata {
    try {
      const complexity = this.calculateComplexity();
      const estimatedAccuracy = this.estimateAccuracy();
      const dependencies = this.detectDependencies();
      const suggestedProps = this.generateSuggestedProps();
      const warnings = this.generateWarnings();
      const nodeCount = this.countNodes(this.node);
      const componentType = this.detectComponentType();
      const generationTime = Date.now() - this.startTime;

      return {
        complexity,
        estimatedAccuracy,
        dependencies,
        suggestedProps,
        warnings,
        generationTime,
        nodeCount,
        componentType
      };
    } catch (error) {
      console.warn(`Analysis failed for node ${this.node.name}:`, error);
      return {
        complexity: 'medium',
        estimatedAccuracy: 50,
        dependencies: [],
        suggestedProps: [],
        warnings: ['Analysis failed - using default metadata'],
        generationTime: Date.now() - this.startTime,
        nodeCount: 1,
        componentType: 'other'
      };
    }
  }

  private calculateComplexity(): 'low' | 'medium' | 'high' {
    let score = 0;

    // Node count complexity
    const nodeCount = this.countNodes(this.node);
    if (nodeCount > 20) score += 3;
    else if (nodeCount > 10) score += 2;
    else if (nodeCount > 5) score += 1;

    // Layout complexity
    if (this.hasComplexLayout(this.node)) score += 2;
    
    // Interactive elements
    const interactiveCount = this.countInteractiveElements(this.node);
    if (interactiveCount > 3) score += 2;
    else if (interactiveCount > 1) score += 1;

    // Effects and styling
    if (this.hasComplexEffects(this.node)) score += 2;
    
    // Nesting depth
    const depth = this.calculateNestingDepth(this.node);
    if (depth > 5) score += 2;
    else if (depth > 3) score += 1;

    // Text styling variations
    const textVariations = this.countTextStyleVariations(this.node);
    if (textVariations > 5) score += 1;

    if (score >= 6) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  private estimateAccuracy(): number {
    let accuracy = 85; // Base accuracy
    
    // Reduce accuracy for complex layouts
    if (this.hasComplexLayout(this.node)) accuracy -= 10;
    
    // Reduce accuracy for custom effects
    if (this.hasComplexEffects(this.node)) accuracy -= 5;
    
    // Reduce accuracy for deep nesting
    const depth = this.calculateNestingDepth(this.node);
    if (depth > 5) accuracy -= 10;
    else if (depth > 3) accuracy -= 5;
    
    // Reduce accuracy for mixed content types
    const contentTypes = this.getContentTypes(this.node);
    if (contentTypes.length > 3) accuracy -= 5;
    
    // Increase accuracy for simple layouts
    if (this.node.layoutMode && this.countNodes(this.node) < 5) {
      accuracy += 5;
    }
    
    // Increase accuracy for standard component patterns
    if (this.isStandardComponentPattern()) {
      accuracy += 10;
    }

    return Math.max(20, Math.min(95, accuracy));
  }

  private detectDependencies(): string[] {
    const dependencies: Set<string> = new Set();

    // Check for icons
    if (this.hasIcons(this.node)) {
      dependencies.add('lucide-react');
    }

    // Check for complex layouts
    if (this.hasComplexLayout(this.node)) {
      dependencies.add('@radix-ui/react-slot');
    }

    // Check for form elements
    if (this.hasFormElements(this.node)) {
      dependencies.add('react-hook-form');
      dependencies.add('@hookform/resolvers');
    }

    // Check for animations
    if (this.hasAnimations(this.node)) {
      dependencies.add('framer-motion');
    }

    // Check for data visualization
    if (this.hasDataVisualization(this.node)) {
      dependencies.add('recharts');
    }

    return Array.from(dependencies);
  }

  private generateSuggestedProps(): PropDefinition[] {
    const props: PropDefinition[] = [];

    // Always include className prop
    props.push({
      name: 'className',
      type: 'string',
      required: false,
      description: 'Additional CSS classes'
    });

    // Text content props
    const textNodes = this.findTextNodes(this.node);
    textNodes.forEach(textNode => {
      const propName = this.generatePropName(textNode.name);
      if (!props.some(p => p.name === propName)) {
        props.push({
          name: propName,
          type: 'string',
          required: false,
          defaultValue: textNode.characters,
          description: `Text content for ${textNode.name}`
        });
      }
    });

    // Interactive element props
    if (this.hasInteractiveElements(this.node)) {
      props.push({
        name: 'onClick',
        type: '() => void',
        required: false,
        description: 'Click handler'
      });
    }

    // Image props
    const imageNodes = this.findImageNodes(this.node);
    if (imageNodes.length > 0) {
      props.push({
        name: 'src',
        type: 'string',
        required: true,
        description: 'Image source URL'
      });
      props.push({
        name: 'alt',
        type: 'string',
        required: true,
        description: 'Image alt text for accessibility'
      });
    }

    // Conditional rendering props
    if (this.shouldHaveConditionalProps()) {
      props.push({
        name: 'visible',
        type: 'boolean',
        required: false,
        defaultValue: true,
        description: 'Whether the component should be visible'
      });
    }

    // Data props for dynamic content
    if (this.appearsToBeDataDriven()) {
      props.push({
        name: 'data',
        type: 'any',
        required: false,
        description: 'Data to populate the component'
      });
    }

    return props;
  }

  private generateWarnings(): string[] {
    const warnings: string[] = [];

    // Complex layout warning
    if (this.hasComplexLayout(this.node)) {
      warnings.push('Complex layout detected - manual adjustments may be needed');
    }

    // Deep nesting warning
    const depth = this.calculateNestingDepth(this.node);
    if (depth > 5) {
      warnings.push('Deep nesting detected - consider simplifying the structure');
    }

    // Missing semantic elements
    if (this.shouldUseSemanticElements()) {
      warnings.push('Consider using semantic HTML elements for better accessibility');
    }

    // Large component warning
    const nodeCount = this.countNodes(this.node);
    if (nodeCount > 25) {
      warnings.push('Large component detected - consider breaking into smaller components');
    }

    // Custom effects warning
    if (this.hasComplexEffects(this.node)) {
      warnings.push('Complex effects detected - CSS may need manual refinement');
    }

    // Text overflow warning
    if (this.hasTextOverflowRisk(this.node)) {
      warnings.push('Text content may overflow on smaller screens');
    }

    // Accessibility warnings
    if (this.hasAccessibilityIssues()) {
      warnings.push('Potential accessibility issues detected - review ARIA labels and keyboard navigation');
    }

    return warnings;
  }

  private detectComponentType(): ComponentMetadata['componentType'] {
    const name = this.node.name.toLowerCase();
    
    // Layout components
    if (name.includes('layout') || name.includes('container') || name.includes('wrapper')) {
      return COMPONENT_TYPES.LAYOUT;
    }
    
    // Navigation components
    if (name.includes('nav') || name.includes('menu') || name.includes('breadcrumb') || name.includes('tab')) {
      return COMPONENT_TYPES.NAVIGATION;
    }
    
    // Interactive components
    if (name.includes('button') || name.includes('link') || name.includes('dropdown') || name.includes('modal')) {
      return COMPONENT_TYPES.INTERACTIVE;
    }
    
    // Input components
    if (name.includes('input') || name.includes('form') || name.includes('field') || name.includes('checkbox')) {
      return COMPONENT_TYPES.INPUT;
    }
    
    // Data display components
    if (name.includes('table') || name.includes('list') || name.includes('card') || name.includes('chart')) {
      return COMPONENT_TYPES.DATA_DISPLAY;
    }
    
    // Feedback components
    if (name.includes('alert') || name.includes('toast') || name.includes('notification') || name.includes('loading')) {
      return COMPONENT_TYPES.FEEDBACK;
    }
    
    // Media components
    if (name.includes('image') || name.includes('video') || name.includes('avatar') || name.includes('icon')) {
      return COMPONENT_TYPES.MEDIA;
    }
    
    // Content components (default for text-heavy components)
    if (this.isContentHeavy()) {
      return COMPONENT_TYPES.CONTENT;
    }
    
    return COMPONENT_TYPES.OTHER;
  }

  // Helper methods
  private countNodes(node: FigmaNode): number {
    let count = 1;
    node.children?.forEach(child => {
      count += this.countNodes(child);
    });
    return count;
  }

  private hasComplexLayout(node: FigmaNode): boolean {
    const hasAutoLayout = node.layoutMode !== undefined;
    const hasConstraints = node.constraints !== undefined;
    const hasComplexAlignment = node.primaryAxisAlignItems === 'SPACE_BETWEEN' || 
                               node.counterAxisAlignItems === 'BASELINE';
    
    return hasAutoLayout && (hasConstraints || hasComplexAlignment);
  }

  private countInteractiveElements(node: FigmaNode): number {
    let count = 0;
    
    const checkNode = (currentNode: FigmaNode) => {
      if (this.isInteractiveElement(currentNode)) {
        count++;
      }
      currentNode.children?.forEach(child => checkNode(child));
    };
    
    checkNode(node);
    return count;
  }

  private isInteractiveElement(node: FigmaNode): boolean {
    const name = node.name.toLowerCase();
    const interactiveKeywords = ['button', 'link', 'input', 'select', 'checkbox', 'radio', 'switch', 'tab'];
    
    return interactiveKeywords.some(keyword => name.includes(keyword));
  }

  private hasComplexEffects(node: FigmaNode): boolean {
    if (node.effects && node.effects.length > 1) return true;
    if (node.effects?.some(effect => effect.type === 'LAYER_BLUR' || effect.type === 'BACKGROUND_BLUR')) return true;
    
    // Check children
    return node.children?.some(child => this.hasComplexEffects(child)) || false;
  }

  private calculateNestingDepth(node: FigmaNode, currentDepth: number = 0): number {
    if (!node.children || node.children.length === 0) {
      return currentDepth;
    }
    
    let maxDepth = currentDepth;
    node.children.forEach(child => {
      const childDepth = this.calculateNestingDepth(child, currentDepth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    });
    
    return maxDepth;
  }

  private countTextStyleVariations(node: FigmaNode): number {
    const styles = new Set<string>();
    
    const collectStyles = (currentNode: FigmaNode) => {
      if (currentNode.type === 'TEXT' && currentNode.style) {
        const styleKey = `${currentNode.style.fontSize}-${currentNode.style.fontWeight}-${currentNode.style.fontFamily}`;
        styles.add(styleKey);
      }
      currentNode.children?.forEach(child => collectStyles(child));
    };
    
    collectStyles(node);
    return styles.size;
  }

  private getContentTypes(node: FigmaNode): string[] {
    const types = new Set<string>();
    
    const collectTypes = (currentNode: FigmaNode) => {
      types.add(currentNode.type);
      currentNode.children?.forEach(child => collectTypes(child));
    };
    
    collectTypes(node);
    return Array.from(types);
  }

  private isStandardComponentPattern(): boolean {
    const name = this.node.name.toLowerCase();
    const standardPatterns = ['button', 'card', 'input', 'modal', 'dropdown', 'tab', 'accordion'];
    
    return standardPatterns.some(pattern => name.includes(pattern));
  }

  private hasIcons(node: FigmaNode): boolean {
    const checkNode = (currentNode: FigmaNode): boolean => {
      if (currentNode.name.toLowerCase().includes('icon')) return true;
      if (currentNode.type === 'VECTOR' && currentNode.absoluteBoundingBox) {
        const { width, height } = currentNode.absoluteBoundingBox;
        if (width <= 32 && height <= 32) return true; // Likely an icon
      }
      return currentNode.children?.some(child => checkNode(child)) || false;
    };
    
    return checkNode(node);
  }

  private hasFormElements(node: FigmaNode): boolean {
    const formKeywords = ['input', 'select', 'textarea', 'checkbox', 'radio', 'form'];
    const name = node.name.toLowerCase();
    
    return formKeywords.some(keyword => name.includes(keyword));
  }

  private hasAnimations(node: FigmaNode): boolean {
    // This would check for animation properties if they were available in the Figma data
    // For now, we'll use heuristics based on component names
    const animationKeywords = ['animate', 'motion', 'transition', 'fade', 'slide'];
    const name = node.name.toLowerCase();
    
    return animationKeywords.some(keyword => name.includes(keyword));
  }

  private hasDataVisualization(node: FigmaNode): boolean {
    const chartKeywords = ['chart', 'graph', 'plot', 'visualization', 'dashboard'];
    const name = node.name.toLowerCase();
    
    return chartKeywords.some(keyword => name.includes(keyword));
  }

  private findTextNodes(node: FigmaNode): FigmaNode[] {
    const textNodes: FigmaNode[] = [];
    
    const search = (currentNode: FigmaNode) => {
      if (currentNode.type === 'TEXT') {
        textNodes.push(currentNode);
      }
      currentNode.children?.forEach(child => search(child));
    };
    
    search(node);
    return textNodes;
  }

  private generatePropName(nodeName: string): string {
    // Convert node name to camelCase prop name
    return nodeName
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .trim()
      .split(' ')
      .map((word, index) => 
        index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('')
      .replace(/^./, match => match.toLowerCase());
  }

  private hasInteractiveElements(node: FigmaNode): boolean {
    return this.countInteractiveElements(node) > 0;
  }

  private findImageNodes(node: FigmaNode): FigmaNode[] {
    const imageNodes: FigmaNode[] = [];
    
    const search = (currentNode: FigmaNode) => {
      if (this.isImageNode(currentNode)) {
        imageNodes.push(currentNode);
      }
      currentNode.children?.forEach(child => search(child));
    };
    
    search(node);
    return imageNodes;
  }

  private isImageNode(node: FigmaNode): boolean {
    const imageTypes = ['RECTANGLE', 'ELLIPSE', 'VECTOR'];
    if (!imageTypes.includes(node.type)) return false;
    
    const name = node.name.toLowerCase();
    const imageKeywords = ['image', 'img', 'photo', 'picture', 'avatar'];
    
    return imageKeywords.some(keyword => name.includes(keyword)) ||
           (node.fills?.[0]?.type === 'IMAGE');
  }

  private shouldHaveConditionalProps(): boolean {
    // Heuristic: components with states or variants should have conditional props
    const name = this.node.name.toLowerCase();
    const conditionalKeywords = ['state', 'variant', 'active', 'disabled', 'hidden'];
    
    return conditionalKeywords.some(keyword => name.includes(keyword));
  }

  private appearsToBeDataDriven(): boolean {
    const name = this.node.name.toLowerCase();
    const dataKeywords = ['list', 'table', 'grid', 'item', 'row', 'cell'];
    
    return dataKeywords.some(keyword => name.includes(keyword));
  }

  private shouldUseSemanticElements(): boolean {
    const name = this.node.name.toLowerCase();
    const semanticKeywords = ['header', 'footer', 'nav', 'main', 'section', 'article', 'aside'];
    
    return semanticKeywords.some(keyword => name.includes(keyword));
  }

  private hasTextOverflowRisk(node: FigmaNode): boolean {
    const textNodes = this.findTextNodes(node);
    
    return textNodes.some(textNode => {
      if (!textNode.characters || !textNode.absoluteBoundingBox) return false;
      
      const textLength = textNode.characters.length;
      const boxWidth = textNode.absoluteBoundingBox.width;
      
      // Rough heuristic: if text is long and box is narrow, there's overflow risk
      return textLength > 20 && boxWidth < 150;
    });
  }

  private hasAccessibilityIssues(): boolean {
    // Basic accessibility checks
    const hasImages = this.findImageNodes(this.node).length > 0;
    const hasInteractive = this.hasInteractiveElements(this.node);
    const hasComplexStructure = this.calculateNestingDepth(this.node) > 4;
    
    return hasImages || hasInteractive || hasComplexStructure;
  }

  private isContentHeavy(): boolean {
    const textNodes = this.findTextNodes(this.node);
    const totalTextLength = textNodes.reduce((sum, node) => 
      sum + (node.characters?.length || 0), 0
    );
    
    return textNodes.length > 3 || totalTextLength > 100;
  }
}
