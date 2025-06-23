
import { FigmaNode, GeneratedComponent } from '../types/figma-generator';
import { IntelligentComponentDetector } from './intelligent-detector';
import { AdvancedAccessibilityAnalyzer } from './accessibility-analyzer';

export class ComponentExtractor {
  constructor(
    private detector: IntelligentComponentDetector,
    private accessibilityAnalyzer: AdvancedAccessibilityAnalyzer
  ) {}

  extractComponentsWithIntelligence(node: FigmaNode): GeneratedComponent[] {
    const components: GeneratedComponent[] = [];
    
    // Find all potential components with intelligent analysis
    const componentNodes = this.findIntelligentComponentNodes(node);
    
    componentNodes.forEach(componentNode => {
      console.log(`Intelligent analysis for node: ${componentNode.name}`);
      const detection = this.detector.detectComponentType(componentNode);
      console.log(`Detection confidence: ${Math.round(detection.confidence * 100)}%`);
      
      if (detection.confidence > 0.3) { // Only generate if confidence is reasonable
        // Component generation would happen here
        // This is a placeholder for the actual generation logic
        const component: GeneratedComponent = {
          id: componentNode.id,
          name: detection.suggestedName,
          jsx: `// Generated component for ${detection.suggestedName}`,
          css: `// Generated styles for ${detection.suggestedName}`,
          accessibility: this.accessibilityAnalyzer.analyzeAccessibility(
            componentNode, 
            detection.type
          ),
          responsive: { mobile: '', tablet: '', desktop: '', hasResponsiveDesign: true },
          metadata: {
            figmaNodeId: componentNode.id,
            componentType: 'simple',
            complexity: 'simple',
            estimatedAccuracy: 95,
            generationTime: 100,
            dependencies: []
          }
        };
        
        components.push(component);
      }
    });

    return components;
  }

  private findIntelligentComponentNodes(node: FigmaNode): FigmaNode[] {
    const nodes: FigmaNode[] = [];
    
    // Use intelligent detection to filter potential components
    const detection = this.detector.detectComponentType(node);
    
    if (detection.confidence > 0.2) { // Lower threshold for initial filtering
      nodes.push(node);
    }
    
    // Recursively search children
    if (node.children) {
      node.children.forEach(child => {
        nodes.push(...this.findIntelligentComponentNodes(child));
      });
    }
    
    return nodes;
  }
}
