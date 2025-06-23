import { FigmaNode, AccessibilityReport, AccessibilityIssue } from '../types/figma';
import { ColorUtils } from '../utils/color-utils';
import { WCAG_CONTRAST_RATIOS, HTML_SEMANTIC_TAGS } from '../utils/constants';

export class AccessibilityAnalyzer {
  private node: FigmaNode;
  private options: { checkContrast: boolean; checkSemantics: boolean };

  constructor(node: FigmaNode, options = { checkContrast: true, checkSemantics: true }) {
    this.node = node;
    this.options = options;
  }

  analyze(): AccessibilityReport {
    const issues: AccessibilityIssue[] = [];
    const suggestions: string[] = [];
    let score = 100;

    try {
      // Check contrast ratios
      if (this.options.checkContrast) {
        const contrastIssues = this.checkContrastRatios();
        issues.push(...contrastIssues.issues);
        score -= contrastIssues.scoreReduction;
      }

      // Check semantic structure
      if (this.options.checkSemantics) {
        const semanticIssues = this.checkSemanticStructure();
        issues.push(...semanticIssues.issues);
        suggestions.push(...semanticIssues.suggestions);
        score -= semanticIssues.scoreReduction;
      }

      // Check interactive elements
      const interactiveIssues = this.checkInteractiveElements();
      issues.push(...interactiveIssues.issues);
      suggestions.push(...interactiveIssues.suggestions);
      score -= interactiveIssues.scoreReduction;

      // Check images
      const imageIssues = this.checkImages();
      issues.push(...imageIssues.issues);
      suggestions.push(...imageIssues.suggestions);
      score -= imageIssues.scoreReduction;

      // Add general suggestions
      suggestions.push(
        'Ensure keyboard navigation is supported for all interactive elements',
        'Test with screen readers and keyboard-only navigation',
        'Verify focus indicators are visible and clear',
        'Consider users with motion sensitivity - provide reduced motion options'
      );

      const finalScore = Math.max(0, score);
      const wcagCompliance = this.determineWCAGCompliance(finalScore, issues);

      return {
        score: finalScore,
        issues,
        suggestions,
        wcagCompliance,
        contrastRatios: this.calculateContrastRatios()
      };
    } catch (error) {
      return {
        score: 0,
        issues: [{
          type: 'error',
          message: 'Failed to analyze accessibility',
          element: this.node.name,
          fix: 'Check if the component structure is valid',
          wcagCriterion: 'General'
        }],
        suggestions: ['Review component structure and try again'],
        wcagCompliance: 'Non-compliant'
      };
    }
  }

  private checkContrastRatios(): { issues: AccessibilityIssue[], scoreReduction: number } {
    const issues: AccessibilityIssue[] = [];
    let scoreReduction = 0;

    const checkNode = (node: FigmaNode) => {
      if (node.type === 'TEXT' && node.style) {
        const textColor = this.getTextColor(node);
        const backgroundColor = this.getBackgroundColor(node);

        if (textColor && backgroundColor) {
          const contrastRatio = ColorUtils.getContrastRatio(textColor, backgroundColor);
          const isLargeText = this.isLargeText(node);
          const standards = ColorUtils.meetsContrastStandards(contrastRatio, isLargeText);

          if (!standards.AA) {
            const severity = contrastRatio < 3 ? 'error' : 'warning';
            issues.push({
              type: severity,
              message: `Text contrast ratio ${contrastRatio.toFixed(2)}:1 does not meet WCAG AA standards (${isLargeText ? '3.0' : '4.5'}:1 required)`,
              element: node.name,
              fix: 'Increase contrast between text and background colors',
              wcagCriterion: '1.4.3 Contrast (Minimum)'
            });
            scoreReduction += severity === 'error' ? 15 : 10;
          } else if (!standards.AAA) {
            issues.push({
              type: 'info',
              message: `Text contrast ratio ${contrastRatio.toFixed(2)}:1 meets AA but not AAA standards`,
              element: node.name,
              fix: 'Consider increasing contrast for better accessibility',
              wcagCriterion: '1.4.6 Contrast (Enhanced)'
            });
            scoreReduction += 2;
          }
        }
      }

      node.children?.forEach(child => checkNode(child));
    };

    checkNode(this.node);
    return { issues, scoreReduction };
  }

  private checkSemanticStructure(): { 
    issues: AccessibilityIssue[], 
    suggestions: string[], 
    scoreReduction: number 
  } {
    const issues: AccessibilityIssue[] = [];
    const suggestions: string[] = [];
    let scoreReduction = 0;

    // Check for proper heading hierarchy
    const headings = this.findHeadings(this.node);
    if (headings.length > 0) {
      const headingLevels = headings.map(h => this.inferHeadingLevel(h));
      const hasProperHierarchy = this.validateHeadingHierarchy(headingLevels);
      
      if (!hasProperHierarchy) {
        issues.push({
          type: 'warning',
          message: 'Heading hierarchy may not be logical',
          element: 'Multiple headings',
          fix: 'Ensure headings follow a logical order (h1, h2, h3, etc.)',
          wcagCriterion: '1.3.1 Info and Relationships'
        });
        scoreReduction += 8;
      }

      suggestions.push('Review heading hierarchy for logical structure');
    }

    // Check for lists that should be semantic lists
    const potentialLists = this.findPotentialLists(this.node);
    if (potentialLists.length > 0) {
      suggestions.push('Consider using semantic list elements (ul, ol, li) for list-like content');
    }

    return { issues, suggestions, scoreReduction };
  }

  private checkInteractiveElements(): { 
    issues: AccessibilityIssue[], 
    suggestions: string[], 
    scoreReduction: number 
  } {
    const issues: AccessibilityIssue[] = [];
    const suggestions: string[] = [];
    let scoreReduction = 0;

    const interactiveElements = this.findInteractiveElements(this.node);
    
    interactiveElements.forEach(element => {
      // Check for appropriate interactive element types
      if (this.shouldBeButton(element)) {
        suggestions.push(`Consider using a <button> element for "${element.name}"`);
      } else if (this.shouldBeLink(element)) {
        suggestions.push(`Consider using an <a> element for "${element.name}"`);
      }

      // Check touch target size
      if (element.absoluteBoundingBox) {
        const { width, height } = element.absoluteBoundingBox;
        const minSize = 44; // 44x44 pixels minimum touch target
        
        if (width < minSize || height < minSize) {
          issues.push({
            type: 'warning',
            message: `Touch target "${element.name}" is smaller than recommended (${width}x${height}px)`,
            element: element.name,
            fix: 'Increase touch target size to at least 44x44 pixels',
            wcagCriterion: '2.5.5 Target Size'
          });
          scoreReduction += 5;
        }
      }
    });

    if (interactiveElements.length > 0) {
      suggestions.push(
        'Ensure all interactive elements are keyboard accessible',
        'Provide clear focus indicators',
        'Add appropriate ARIA labels where needed'
      );
    }

    return { issues, suggestions, scoreReduction };
  }

  private checkImages(): { 
    issues: AccessibilityIssue[], 
    suggestions: string[], 
    scoreReduction: number 
  } {
    const issues: AccessibilityIssue[] = [];
    const suggestions: string[] = [];
    let scoreReduction = 0;

    const images = this.findImages(this.node);
    
    images.forEach(image => {
      // All images need alt text consideration
      issues.push({
        type: 'warning',
        message: `Image "${image.name}" needs alt text`,
        element: image.name,
        fix: 'Add descriptive alt text or mark as decorative if appropriate',
        wcagCriterion: '1.1.1 Non-text Content'
      });
      scoreReduction += 5;
    });

    if (images.length > 0) {
      suggestions.push(
        'Provide descriptive alt text for informative images',
        'Use empty alt="" for decorative images',
        'Consider using figure and figcaption for complex images'
      );
    }

    return { issues, suggestions, scoreReduction };
  }

  private getTextColor(node: FigmaNode): any {
    if (node.type === 'TEXT' && node.style?.fills?.[0]?.color) {
      return node.style.fills[0].color;
    }
    return null;
  }

  private getBackgroundColor(node: FigmaNode): any {
    // Try to find background color from the node or its ancestors
    let currentNode: FigmaNode | undefined = node;
    
    while (currentNode) {
      if (currentNode.backgroundColor) {
        return currentNode.backgroundColor;
      }
      if (currentNode.fills?.[0]?.color) {
        return currentNode.fills[0].color;
      }
      // Move up to parent (this would need to be implemented with parent tracking)
      break;
    }

    // Default to white background
    return { r: 1, g: 1, b: 1, a: 1 };
  }

  private isLargeText(node: FigmaNode): boolean {
    if (!node.style?.fontSize) return false;
    
    const fontSize = node.style.fontSize;
    const fontWeight = node.style.fontWeight || 400;
    
    // WCAG considers text "large" if it's 18pt+ or 14pt+ and bold
    return fontSize >= 24 || (fontSize >= 19 && fontWeight >= 700);
  }

  private findHeadings(node: FigmaNode): FigmaNode[] {
    const headings: FigmaNode[] = [];
    
    const search = (currentNode: FigmaNode) => {
      if (this.isHeading(currentNode)) {
        headings.push(currentNode);
      }
      currentNode.children?.forEach(child => search(child));
    };
    
    search(node);
    return headings;
  }

  private isHeading(node: FigmaNode): boolean {
    if (node.type !== 'TEXT') return false;
    
    const name = node.name.toLowerCase();
    const hasHeadingKeyword = ['title', 'heading', 'header', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
      .some(keyword => name.includes(keyword));
    
    // Check if it's likely a heading based on font size
    const isLargeText = node.style?.fontSize && node.style.fontSize > 20;
    const isBold = node.style?.fontWeight && node.style.fontWeight >= 600;
    
    return hasHeadingKeyword || (isLargeText && isBold);
  }

  private inferHeadingLevel(node: FigmaNode): number {
    const name = node.name.toLowerCase();
    const fontSize = node.style?.fontSize || 16;
    
    // Try to infer from name
    for (let i = 1; i <= 6; i++) {
      if (name.includes(`h${i}`)) return i;
    }
    
    // Infer from font size (this is approximate)
    if (fontSize >= 32) return 1;
    if (fontSize >= 24) return 2;
    if (fontSize >= 20) return 3;
    if (fontSize >= 18) return 4;
    if (fontSize >= 16) return 5;
    return 6;
  }

  private validateHeadingHierarchy(levels: number[]): boolean {
    if (levels.length <= 1) return true;
    
    // Check if levels are in a reasonable order
    for (let i = 1; i < levels.length; i++) {
      const diff = levels[i] - levels[i - 1];
      if (diff > 1) return false; // Skipping levels
    }
    
    return true;
  }

  private findPotentialLists(node: FigmaNode): FigmaNode[] {
    const lists: FigmaNode[] = [];
    // Implementation would identify nodes that look like lists
    // This is a simplified version
    return lists;
  }

  private findInteractiveElements(node: FigmaNode): FigmaNode[] {
    const interactive: FigmaNode[] = [];
    
    const search = (currentNode: FigmaNode) => {
      if (this.isInteractiveElement(currentNode)) {
        interactive.push(currentNode);
      }
      currentNode.children?.forEach(child => search(child));
    };
    
    search(node);
    return interactive;
  }

  private isInteractiveElement(node: FigmaNode): boolean {
    const name = node.name.toLowerCase();
    const interactiveKeywords = ['button', 'link', 'input', 'select', 'checkbox', 'radio', 'switch', 'tab'];
    
    return interactiveKeywords.some(keyword => name.includes(keyword));
  }

  private shouldBeButton(node: FigmaNode): boolean {
    const name = node.name.toLowerCase();
    return name.includes('button') || name.includes('btn') || name.includes('submit');
  }

  private shouldBeLink(node: FigmaNode): boolean {
    const name = node.name.toLowerCase();
    return name.includes('link') || name.includes('anchor') || name.includes('href');
  }

  private findImages(node: FigmaNode): FigmaNode[] {
    const images: FigmaNode[] = [];
    
    const search = (currentNode: FigmaNode) => {
      if (this.isImage(currentNode)) {
        images.push(currentNode);
      }
      currentNode.children?.forEach(child => search(child));
    };
    
    search(node);
    return images;
  }

  private isImage(node: FigmaNode): boolean {
    const imageTypes = ['RECTANGLE', 'ELLIPSE', 'VECTOR'];
    if (!imageTypes.includes(node.type)) return false;
    
    const name = node.name.toLowerCase();
    const imageKeywords = ['image', 'img', 'photo', 'picture', 'icon', 'logo', 'avatar'];
    
    return imageKeywords.some(keyword => name.includes(keyword)) ||
           (node.fills?.[0]?.type === 'IMAGE');
  }

  private calculateContrastRatios(): Array<{ element: string; ratio: number; passes: boolean }> {
    const ratios: Array<{ element: string; ratio: number; passes: boolean }> = [];
    
    const checkNode = (node: FigmaNode) => {
      if (node.type === 'TEXT') {
        const textColor = this.getTextColor(node);
        const backgroundColor = this.getBackgroundColor(node);
        
        if (textColor && backgroundColor) {
          const ratio = ColorUtils.getContrastRatio(textColor, backgroundColor);
          const isLarge = this.isLargeText(node);
          const passes = ColorUtils.meetsContrastStandards(ratio, isLarge).AA;
          
          ratios.push({
            element: node.name,
            ratio: Number(ratio.toFixed(2)),
            passes
          });
        }
      }
      
      node.children?.forEach(child => checkNode(child));
    };
    
    checkNode(this.node);
    return ratios;
  }

  private determineWCAGCompliance(score: number, issues: AccessibilityIssue[]): 'AAA' | 'AA' | 'A' | 'Non-compliant' {
    const hasErrors = issues.some(issue => issue.type === 'error');
    
    if (hasErrors || score < 60) {
      return 'Non-compliant';
    } else if (score < 80) {
      return 'A';
    } else if (score < 95) {
      return 'AA';
    } else {
      return 'AAA';
    }
  }
}
