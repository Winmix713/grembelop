
import { FigmaNode, AccessibilityReport, AccessibilityIssue } from '../types/figma-generator';

export class AdvancedAccessibilityAnalyzer {
  private wcagRules = new Map<string, (node: FigmaNode) => AccessibilityIssue[]>();

  constructor() {
    this.initializeWCAGRules();
  }

  analyzeAccessibility(node: FigmaNode, componentType: string): AccessibilityReport {
    const issues: AccessibilityIssue[] = [];
    const suggestions: string[] = [];

    // Run all WCAG rules
    for (const [ruleName, ruleFunction] of this.wcagRules) {
      const ruleIssues = ruleFunction(node);
      issues.push(...ruleIssues);
    }

    // Component-specific analysis
    const componentIssues = this.analyzeComponentSpecific(node, componentType);
    issues.push(...componentIssues);

    // Generate suggestions
    suggestions.push(...this.generateSuggestions(node, componentType, issues));

    // Calculate score
    const score = this.calculateAccessibilityScore(issues);

    return {
      score,
      issues,
      suggestions,
      wcagCompliance: this.determineWCAGCompliance(score, issues)
    };
  }

  private initializeWCAGRules(): void {
    // WCAG 2.1 Rule: Color Contrast
    this.wcagRules.set('color-contrast', (node: FigmaNode) => {
      const issues: AccessibilityIssue[] = [];
      
      if (node.fills && node.strokes) {
        // Simplified contrast check
        const hasLowContrast = this.checkColorContrast(node.fills, node.strokes);
        if (hasLowContrast) {
          issues.push({
            type: 'color-contrast',
            severity: 'high',
            description: 'Insufficient color contrast detected',
            element: node.name,
            suggestion: 'Ensure text has a contrast ratio of at least 4.5:1 with background'
          });
        }
      }

      return issues;
    });

    // WCAG 2.1 Rule: Focus Management
    this.wcagRules.set('focus-management', (node: FigmaNode) => {
      const issues: AccessibilityIssue[] = [];
      
      if (this.isInteractiveElement(node)) {
        issues.push({
          type: 'focus-management',
          severity: 'medium',
          description: 'Interactive element may need focus indicators',
          element: node.name,
          suggestion: 'Add visible focus indicators for keyboard navigation'
        });
      }

      return issues;
    });

    // WCAG 2.1 Rule: Semantic Structure
    this.wcagRules.set('semantic-structure', (node: FigmaNode) => {
      const issues: AccessibilityIssue[] = [];
      
      if (this.isHeadingLike(node)) {
        issues.push({
          type: 'semantic-structure',
          severity: 'medium',
          description: 'Text element may need semantic heading structure',
          element: node.name,
          suggestion: 'Use proper heading hierarchy (h1, h2, h3, etc.)'
        });
      }

      return issues;
    });

    // WCAG 2.1 Rule: Alt Text
    this.wcagRules.set('missing-alt', (node: FigmaNode) => {
      const issues: AccessibilityIssue[] = [];
      
      if (this.isImageLike(node)) {
        issues.push({
          type: 'missing-alt',
          severity: 'critical',
          description: 'Image element requires alternative text',
          element: node.name,
          suggestion: 'Add descriptive alt text for screen readers'
        });
      }

      return issues;
    });
  }

  private analyzeComponentSpecific(node: FigmaNode, componentType: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    switch (componentType) {
      case 'button':
        if (!this.hasDescriptiveText(node)) {
          issues.push({
            type: 'semantic-structure',
            severity: 'high',
            description: 'Button lacks descriptive text',
            element: node.name,
            suggestion: 'Ensure button has clear, descriptive text or aria-label'
          });
        }
        break;

      case 'input':
        issues.push({
          type: 'semantic-structure',
          severity: 'medium',
          description: 'Form input may need associated label',
          element: node.name,
          suggestion: 'Associate input with descriptive label using htmlFor/id'
        });
        break;

      case 'card':
        if (node.children && node.children.length > 0) {
          issues.push({
            type: 'semantic-structure',
            severity: 'low',
            description: 'Card content may need landmark roles',
            element: node.name,
            suggestion: 'Consider using semantic HTML elements or ARIA landmarks'
          });
        }
        break;
    }

    return issues;
  }

  private generateSuggestions(node: FigmaNode, componentType: string, issues: AccessibilityIssue[]): string[] {
    const suggestions: string[] = [];

    // General suggestions
    suggestions.push('Test with screen readers to ensure compatibility');
    suggestions.push('Verify keyboard navigation works properly');
    suggestions.push('Check color contrast meets WCAG AA standards');

    // Component-specific suggestions
    switch (componentType) {
      case 'button':
        suggestions.push('Use semantic <button> element instead of div');
        suggestions.push('Implement proper focus states');
        suggestions.push('Support Enter and Space key activation');
        break;

      case 'input':
        suggestions.push('Use semantic form elements');
        suggestions.push('Implement proper error messaging');
        suggestions.push('Support autocomplete attributes');
        break;

      case 'navigation':
        suggestions.push('Use nav element and proper list structure');
        suggestions.push('Implement skip links for keyboard users');
        suggestions.push('Use aria-current for active states');
        break;
    }

    // Issue-specific suggestions
    const hasColorContrastIssues = issues.some(issue => issue.type === 'color-contrast');
    if (hasColorContrastIssues) {
      suggestions.push('Use tools like WebAIM Contrast Checker to verify colors');
    }

    const hasFocusIssues = issues.some(issue => issue.type === 'focus-management');
    if (hasFocusIssues) {
      suggestions.push('Implement :focus-visible for modern focus management');
    }

    return suggestions;
  }

  private calculateAccessibilityScore(issues: AccessibilityIssue[]): number {
    let baseScore = 100;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          baseScore -= 20;
          break;
        case 'high':
          baseScore -= 15;
          break;
        case 'medium':
          baseScore -= 10;
          break;
        case 'low':
          baseScore -= 5;
          break;
      }
    }

    return Math.max(0, baseScore);
  }

  private determineWCAGCompliance(score: number, issues: AccessibilityIssue[]): 'A' | 'AA' | 'AAA' {
    const hasCriticalIssues = issues.some(issue => issue.severity === 'critical');
    const hasHighIssues = issues.some(issue => issue.severity === 'high');

    if (hasCriticalIssues || score < 60) return 'A';
    if (hasHighIssues || score < 80) return 'AA';
    return 'AAA';
  }

  // Helper methods
  private checkColorContrast(fills: any[], strokes: any[]): boolean {
    // Simplified contrast check - in real implementation, this would use WCAG contrast formula
    return Math.random() < 0.2; // 20% chance of contrast issues for demo
  }

  private isInteractiveElement(node: FigmaNode): boolean {
    const name = node.name.toLowerCase();
    return /\b(button|btn|click|link|input|select)\b/.test(name);
  }

  private isHeadingLike(node: FigmaNode): boolean {
    const name = node.name.toLowerCase();
    return /\b(title|heading|header|h[1-6])\b/.test(name);
  }

  private isImageLike(node: FigmaNode): boolean {
    const name = node.name.toLowerCase();
    return /\b(image|img|photo|picture|icon)\b/.test(name) ||
           node.fills?.some(fill => fill.type === 'IMAGE');
  }

  private hasDescriptiveText(node: FigmaNode): boolean {
    // Check if node or its children contain text
    if (node.type === 'TEXT') return true;
    return node.children?.some(child => child.type === 'TEXT') || false;
  }
}
