
export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  constraints?: any;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FigmaApiResponse {
  document: FigmaNode;
  components?: Record<string, { key: string; name: string }>;
  styles?: Record<string, any>;
}

export interface GeneratedComponent {
  id: string;
  name: string;
  jsx: string;
  css: string;
  typescript?: string;
  accessibility: AccessibilityReport;
  responsive: ResponsiveBreakpoints;
  metadata: ComponentMetadata;
}

export interface ComponentMetadata {
  figmaNodeId: string;
  componentType: 'simple' | 'complex' | 'layout' | 'interactive';
  complexity: 'simple' | 'medium' | 'complex';
  estimatedAccuracy: number;
  generationTime: number;
  dependencies: string[];
}

export interface AccessibilityReport {
  score: number;
  issues: AccessibilityIssue[];
  suggestions: string[];
  wcagCompliance: 'A' | 'AA' | 'AAA';
}

export interface AccessibilityIssue {
  type: 'color-contrast' | 'missing-alt' | 'focus-management' | 'semantic-structure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  element?: string;
  suggestion: string;
}

export interface ResponsiveBreakpoints {
  mobile: string;
  tablet: string;
  desktop: string;
  hasResponsiveDesign: boolean;
}

export interface CodeGenerationOptions {
  framework: 'react' | 'vue' | 'angular';
  styling: 'tailwind' | 'css-modules' | 'styled-components' | 'plain-css';
  typescript: boolean;
  accessibility: boolean;
  responsive: boolean;
  optimizeImages: boolean;
  customCode?: CustomCodeInputs;
}

export interface CustomCodeInputs {
  jsx: string;
  css: string;
  cssAdvanced: string;
}

export interface ComponentConfig {
  name: string;
  type: string;
  node?: FigmaNode;
  options: CodeGenerationOptions;
  customCode?: CustomCodeInputs;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface CacheEntry {
  key: string;
  component: GeneratedComponent;
  timestamp: number;
  expiresAt: number;
}
