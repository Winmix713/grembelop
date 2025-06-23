
import { FigmaNode, ComponentConfig } from '../types/figma-generator';

export interface DetectionResult {
  type: string;
  confidence: number;
  reasoning: string[];
  suggestedName: string;
}

export class IntelligentComponentDetector {
  private patterns = new Map<string, RegExp[]>();
  private semanticRules = new Map<string, (node: FigmaNode) => number>();

  constructor() {
    this.initializePatterns();
    this.initializeSemanticRules();
  }

  detectComponentType(node: FigmaNode): DetectionResult {
    const patternResults = this.analyzePatterns(node);
    const semanticResults = this.analyzeSemantics(node);
    const structuralResults = this.analyzeStructure(node);

    // Combine all analysis results
    const combinedResults = this.combineResults(
      patternResults,
      semanticResults,
      structuralResults
    );

    return this.selectBestMatch(combinedResults, node);
  }

  private initializePatterns(): void {
    this.patterns.set('button', [
      /\b(button|btn|click|action)\b/i,
      /\b(submit|cancel|confirm|save)\b/i,
      /\b(primary|secondary|cta)\b/i
    ]);

    this.patterns.set('card', [
      /\b(card|panel|tile|item)\b/i,
      /\b(content|article|post)\b/i,
      /\b(product|feature|service)\b/i
    ]);

    this.patterns.set('input', [
      /\b(input|field|form|text)\b/i,
      /\b(email|password|search|name)\b/i,
      /\b(placeholder|label|value)\b/i
    ]);

    this.patterns.set('navigation', [
      /\b(nav|menu|header|navigation)\b/i,
      /\b(link|item|tab|breadcrumb)\b/i,
      /\b(dropdown|sidebar|topbar)\b/i
    ]);

    this.patterns.set('media', [
      /\b(image|img|photo|picture)\b/i,
      /\b(video|audio|media|gallery)\b/i,
      /\b(avatar|icon|logo|thumbnail)\b/i
    ]);
  }

  private initializeSemanticRules(): void {
    this.semanticRules.set('button', (node: FigmaNode) => {
      let score = 0;
      if (node.type === 'FRAME' && node.children?.length === 1) score += 0.3;
      if (node.fills?.some(fill => fill.type === 'SOLID')) score += 0.2;
      if (node.effects?.some(effect => effect.type === 'DROP_SHADOW')) score += 0.1;
      if (node.strokes?.length) score += 0.1;
      return Math.min(score, 1);
    });

    this.semanticRules.set('input', (node: FigmaNode) => {
      let score = 0;
      if (node.type === 'FRAME') score += 0.2;
      if (node.strokes?.length) score += 0.3;
      if (node.fills?.some(fill => fill.type === 'SOLID' && this.isLightColor(fill))) score += 0.2;
      return Math.min(score, 1);
    });

    this.semanticRules.set('card', (node: FigmaNode) => {
      let score = 0;
      if (node.children && node.children.length >= 2) score += 0.4;
      if (node.effects?.some(effect => effect.type === 'DROP_SHADOW')) score += 0.2;
      if (node.fills?.some(fill => fill.type === 'SOLID')) score += 0.1;
      return Math.min(score, 1);
    });
  }

  private analyzePatterns(node: FigmaNode): Map<string, number> {
    const results = new Map<string, number>();
    const nodeName = node.name.toLowerCase();

    for (const [type, patterns] of this.patterns) {
      let score = 0;
      for (const pattern of patterns) {
        if (pattern.test(nodeName)) {
          score += 0.3;
        }
      }
      results.set(type, Math.min(score, 1));
    }

    return results;
  }

  private analyzeSemantics(node: FigmaNode): Map<string, number> {
    const results = new Map<string, number>();

    for (const [type, rule] of this.semanticRules) {
      results.set(type, rule(node));
    }

    return results;
  }

  private analyzeStructure(node: FigmaNode): Map<string, number> {
    const results = new Map<string, number>();

    // Analyze based on node structure
    if (node.children?.length === 0) {
      results.set('text', 0.8);
      results.set('image', 0.6);
    } else if (node.children?.length === 1) {
      results.set('button', 0.7);
      results.set('icon', 0.5);
    } else if (node.children && node.children.length > 3) {
      results.set('card', 0.8);
      results.set('navigation', 0.6);
    }

    return results;
  }

  private combineResults(
    patterns: Map<string, number>,
    semantics: Map<string, number>,
    structure: Map<string, number>
  ): Map<string, number> {
    const combined = new Map<string, number>();
    const allTypes = new Set([
      ...patterns.keys(),
      ...semantics.keys(),
      ...structure.keys()
    ]);

    for (const type of allTypes) {
      const patternScore = patterns.get(type) || 0;
      const semanticScore = semantics.get(type) || 0;
      const structuralScore = structure.get(type) || 0;

      // Weighted combination
      const combinedScore = (
        patternScore * 0.4 +
        semanticScore * 0.3 +
        structuralScore * 0.3
      );

      combined.set(type, combinedScore);
    }

    return combined;
  }

  private selectBestMatch(results: Map<string, number>, node: FigmaNode): DetectionResult {
    let bestType = 'default';
    let bestScore = 0;
    const reasoning: string[] = [];

    for (const [type, score] of results) {
      if (score > bestScore) {
        bestScore = score;
        bestType = type;
      }
    }

    // Generate reasoning
    if (bestScore > 0.7) {
      reasoning.push(`High confidence match (${Math.round(bestScore * 100)}%)`);
    } else if (bestScore > 0.4) {
      reasoning.push(`Moderate confidence match (${Math.round(bestScore * 100)}%)`);
    } else {
      reasoning.push(`Low confidence, using default component`);
    }

    // Add specific reasoning based on detection
    if (results.get(bestType)) {
      reasoning.push(`Detected as ${bestType} based on naming patterns and structure`);
    }

    return {
      type: bestType,
      confidence: bestScore,
      reasoning,
      suggestedName: this.generateSuggestedName(node, bestType)
    };
  }

  private generateSuggestedName(node: FigmaNode, type: string): string {
    const baseName = node.name
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, 'Component$&')
      .replace(/^./, str => str.toUpperCase()) || 'Component';

    // Add type suffix if not already present
    if (!baseName.toLowerCase().includes(type.toLowerCase())) {
      return `${baseName}${type.charAt(0).toUpperCase() + type.slice(1)}`;
    }

    return baseName;
  }

  private isLightColor(fill: any): boolean {
    // Simple heuristic for light color detection
    if (fill.color) {
      const { r, g, b } = fill.color;
      const brightness = (r + g + b) / 3;
      return brightness > 0.7;
    }
    return false;
  }
}
