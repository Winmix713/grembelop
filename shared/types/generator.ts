export interface CodeGenerationOptions {
  framework: 'react' | 'vue' | 'html';
  styling: 'tailwind' | 'css-modules' | 'styled-components' | 'plain-css';
  typescript: boolean;
  accessibility: boolean;
  responsive: boolean;
  optimizeImages: boolean;
  includeComments: boolean;
  generateTests: boolean;
  customBreakpoints?: Record<string, number>;
}

export interface CustomCodeInputs {
  jsx: string;
  css: string;
  cssAdvanced: string;
  imports?: string;
  utilities?: string;
}

export interface GenerationResult {
  components: any[];
  totalTime: number;
  errors: string[];
  warnings: string[];
  summary: {
    componentCount: number;
    averageComplexity: string;
    averageAccuracy: number;
    totalNodes: number;
  };
}

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface CSSStyles {
  width?: string;
  height?: string;
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  lineHeight?: string;
  letterSpacing?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  border?: string;
  borderRadius?: string;
  boxShadow?: string;
  opacity?: number;
  display?: string;
  flexDirection?: string;
  alignItems?: string;
  justifyContent?: string;
  gap?: string;
  position?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
  overflow?: string;
  textAlign?: string;
  background?: string;
  [key: string]: any;
}
