export const DESIGN_TOKENS = {
  BREAKPOINTS: {
    mobile: 768,
    tablet: 1024,
    desktop: 1440,
    xl: 1920
  },
  SPACING: {
    unit: 4 // 1 = 4px in Tailwind
  },
  FONT_SIZES: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
    '8xl': 96,
    '9xl': 128
  },
  COLORS: {
    // Tailwind color palette mapping
    gray: {
      50: { r: 0.98, g: 0.98, b: 0.98 },
      100: { r: 0.96, g: 0.96, b: 0.97 },
      200: { r: 0.93, g: 0.94, b: 0.95 },
      300: { r: 0.83, g: 0.84, b: 0.86 },
      400: { r: 0.64, g: 0.65, b: 0.67 },
      500: { r: 0.42, g: 0.45, b: 0.48 },
      600: { r: 0.32, g: 0.35, b: 0.37 },
      700: { r: 0.25, g: 0.28, b: 0.31 },
      800: { r: 0.16, g: 0.18, b: 0.20 },
      900: { r: 0.09, g: 0.11, b: 0.13 }
    },
    blue: {
      50: { r: 0.94, g: 0.97, b: 1.00 },
      100: { r: 0.86, g: 0.93, b: 0.99 },
      200: { r: 0.73, g: 0.87, b: 0.98 },
      300: { r: 0.58, g: 0.79, b: 0.96 },
      400: { r: 0.38, g: 0.68, b: 0.93 },
      500: { r: 0.23, g: 0.58, b: 0.91 },
      600: { r: 0.15, g: 0.48, b: 0.82 },
      700: { r: 0.11, g: 0.40, b: 0.72 },
      800: { r: 0.12, g: 0.32, b: 0.61 },
      900: { r: 0.12, g: 0.27, b: 0.49 }
    },
    red: {
      50: { r: 0.99, g: 0.95, b: 0.95 },
      100: { r: 0.99, g: 0.89, b: 0.89 },
      200: { r: 0.98, g: 0.80, b: 0.80 },
      300: { r: 0.96, g: 0.66, b: 0.66 },
      400: { r: 0.94, g: 0.45, b: 0.45 },
      500: { r: 0.91, g: 0.27, b: 0.27 },
      600: { r: 0.82, g: 0.18, b: 0.18 },
      700: { r: 0.69, g: 0.15, b: 0.15 },
      800: { r: 0.58, g: 0.15, b: 0.15 },
      900: { r: 0.48, g: 0.16, b: 0.16 }
    },
    green: {
      50: { r: 0.94, g: 0.99, b: 0.95 },
      100: { r: 0.86, g: 0.99, b: 0.89 },
      200: { r: 0.73, g: 0.97, b: 0.79 },
      300: { r: 0.55, g: 0.93, b: 0.64 },
      400: { r: 0.31, g: 0.85, b: 0.42 },
      500: { r: 0.13, g: 0.73, b: 0.25 },
      600: { r: 0.09, g: 0.60, b: 0.19 },
      700: { r: 0.08, g: 0.47, b: 0.15 },
      800: { r: 0.11, g: 0.38, b: 0.15 },
      900: { r: 0.09, g: 0.31, b: 0.13 }
    },
    yellow: {
      50: { r: 0.99, g: 0.99, b: 0.94 },
      100: { r: 0.99, g: 0.98, b: 0.82 },
      200: { r: 0.99, g: 0.95, b: 0.63 },
      300: { r: 0.99, g: 0.91, b: 0.41 },
      400: { r: 0.98, g: 0.84, b: 0.20 },
      500: { r: 0.92, g: 0.76, b: 0.07 },
      600: { r: 0.79, g: 0.63, b: 0.03 },
      700: { r: 0.64, g: 0.46, b: 0.03 },
      800: { r: 0.53, g: 0.38, b: 0.06 },
      900: { r: 0.45, g: 0.32, b: 0.08 }
    }
  },
  BORDER_RADIUS: {
    none: 0,
    sm: 2,
    base: 4,
    md: 6,
    lg: 8,
    xl: 12,
    '2xl': 16,
    '3xl': 24,
    full: 9999
  }
} as const;

export const WCAG_CONTRAST_RATIOS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5
} as const;

export const HTML_SEMANTIC_TAGS = {
  heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  interactive: ['button', 'a', 'input', 'select', 'textarea'],
  media: ['img', 'video', 'audio', 'svg'],
  container: ['div', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside'],
  text: ['p', 'span', 'strong', 'em', 'small', 'mark', 'del', 'ins', 'sub', 'sup']
} as const;

export const COMPONENT_TYPES = {
  LAYOUT: 'layout',
  CONTENT: 'content',
  INTERACTIVE: 'interactive',
  DATA_DISPLAY: 'data-display',
  FEEDBACK: 'feedback',
  NAVIGATION: 'navigation',
  INPUT: 'input',
  MEDIA: 'media',
  OTHER: 'other'
} as const;

export const FIGMA_NODE_TYPES = {
  DOCUMENT: 'DOCUMENT',
  CANVAS: 'CANVAS',
  FRAME: 'FRAME',
  GROUP: 'GROUP',
  VECTOR: 'VECTOR',
  BOOLEAN_OPERATION: 'BOOLEAN_OPERATION',
  STAR: 'STAR',
  LINE: 'LINE',
  ELLIPSE: 'ELLIPSE',
  REGULAR_POLYGON: 'REGULAR_POLYGON',
  RECTANGLE: 'RECTANGLE',
  TEXT: 'TEXT',
  SLICE: 'SLICE',
  COMPONENT: 'COMPONENT',
  COMPONENT_SET: 'COMPONENT_SET',
  INSTANCE: 'INSTANCE'
} as const;
