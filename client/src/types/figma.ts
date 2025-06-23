// Figma API Response Types
export interface FigmaApiResponse {
  document: FigmaNode;
  components: Record<string, FigmaComponent>;
  styles: Record<string, FigmaStyle>;
  schemaVersion: number;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  role: string;
  editorType: string;
  linkAccess: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: NodeType;
  children?: FigmaNode[];
  backgroundColor?: Color;
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  strokeAlign?: string;
  cornerRadius?: number;
  absoluteBoundingBox?: Rectangle;
  constraints?: LayoutConstraint;
  layoutAlign?: string;
  layoutGrow?: number;
  layoutSizingHorizontal?: string;
  layoutSizingVertical?: string;
  clipsContent?: boolean;
  background?: Paint[];
  layoutMode?: string;
  itemSpacing?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  layoutWrap?: string;
  strokeCap?: string;
  strokeJoin?: string;
  strokeDashes?: number[];
  opacity?: number;
  blendMode?: string;
  isMask?: boolean;
  effects?: Effect[];
  characters?: string;
  style?: TypeStyle;
  characterStyleOverrides?: number[];
  styleOverrideTable?: Record<string, TypeStyle>;
}

export type NodeType = 
  | 'DOCUMENT' 
  | 'CANVAS' 
  | 'FRAME' 
  | 'GROUP' 
  | 'VECTOR' 
  | 'BOOLEAN_OPERATION' 
  | 'STAR' 
  | 'LINE' 
  | 'ELLIPSE' 
  | 'REGULAR_POLYGON' 
  | 'RECTANGLE' 
  | 'TEXT' 
  | 'SLICE' 
  | 'COMPONENT' 
  | 'COMPONENT_SET' 
  | 'INSTANCE';

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Paint {
  type: string;
  visible?: boolean;
  opacity?: number;
  color?: Color;
  gradientHandlePositions?: Vector[];
  gradientStops?: ColorStop[];
  scaleMode?: string;
  imageTransform?: Transform;
  scalingFactor?: number;
  rotation?: number;
  imageRef?: string;
  filters?: ImageFilters;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutConstraint {
  vertical: string;
  horizontal: string;
}

export interface Effect {
  type: string;
  visible?: boolean;
  radius?: number;
  color?: Color;
  blendMode?: string;
  offset?: Vector;
  spread?: number;
  showShadowBehindNode?: boolean;
}

export interface TypeStyle {
  fontFamily: string;
  fontPostScriptName?: string;
  paragraphSpacing?: number;
  paragraphIndent?: number;
  listSpacing?: number;
  hangingPunctuation?: boolean;
  hangingList?: boolean;
  fontSize: number;
  textDecoration?: string;
  textCase?: string;
  lineHeightPx: number;
  lineHeightPercent?: number;
  lineHeightPercentFontSize?: number;
  lineHeightUnit: string;
  letterSpacing: number;
  fills: Paint[];
  hyperlink?: Hyperlink;
  opentypeFlags?: Record<string, number>;
}

export interface Vector {
  x: number;
  y: number;
}

export interface ColorStop {
  position: number;
  color: Color;
}

export interface Transform {
  m00: number;
  m01: number;
  m02: number;
  m10: number;
  m11: number;
  m12: number;
}

export interface ImageFilters {
  exposure?: number;
  contrast?: number;
  saturation?: number;
  temperature?: number;
  tint?: number;
  highlights?: number;
  shadows?: number;
}

export interface Hyperlink {
  type: string;
  url?: string;
  nodeID?: string;
}

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  componentSetId?: string;
  documentationLinks: DocumentationLink[];
}

export interface FigmaStyle {
  key: string;
  name: string;
  description: string;
  styleType: string;
}

export interface DocumentationLink {
  uri: string;
}

// Generated Component Types
export interface GeneratedComponent {
  id: string;
  name: string;
  jsx: string;
  css: string;
  tailwind?: string;
  typescript?: string;
  accessibility: AccessibilityReport;
  responsive: ResponsiveBreakpoints;
  metadata: ComponentMetadata;
}

export interface AccessibilityReport {
  score: number;
  issues: AccessibilityIssue[];
  suggestions: string[];
  wcagCompliance: 'AA' | 'A' | 'Non-compliant';
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  element: string;
  fix: string;
}

export interface ResponsiveBreakpoints {
  mobile: string;
  tablet: string;
  desktop: string;
  hasResponsiveDesign: boolean;
}

export interface ComponentMetadata {
  figmaNodeId: string;
  componentType: 'button' | 'card' | 'text' | 'input' | 'layout' | 'complex';
  complexity: 'simple' | 'medium' | 'complex';
  estimatedAccuracy: number;
  generationTime: number;
  dependencies: string[];
}

// Processing Pipeline Types
export interface ProcessingPhase {
  id: number;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  startTime?: number;
  endTime?: number;
  error?: string;
}

export interface GenerationConfig {
  framework: 'react' | 'vue' | 'html';
  styling: 'tailwind' | 'css-modules' | 'styled-components' | 'plain-css';
  typescript: boolean;
  accessibility: boolean;
  responsive: boolean;
  optimizeImages: boolean;
  generateStorybook: boolean;
}

export interface QualityReport {
  overallScore: number;
  visualAccuracy: number;
  codeQuality: number;
  accessibility: number;
  performance: number;
  recommendations: string[];
}