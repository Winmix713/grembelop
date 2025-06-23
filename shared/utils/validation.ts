
import { CodeGenerationOptions, FigmaApiResponse, ValidationResult } from '../types/figma-generator';
import { ValidationError } from './errors';

export class GenerationConfig {
  static validate(options: CodeGenerationOptions): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Framework validation
    if (!['react', 'vue', 'angular'].includes(options.framework)) {
      errors.push(`Invalid framework: ${options.framework}. Supported: react, vue, angular`);
    }

    // Styling validation
    if (!['tailwind', 'css-modules', 'styled-components', 'plain-css'].includes(options.styling)) {
      errors.push(`Invalid styling option: ${options.styling}`);
    }

    // Framework-specific validations
    if (options.framework === 'vue' && options.styling === 'styled-components') {
      warnings.push('Styled-components with Vue may have limited support');
    }

    if (options.typescript && options.framework === 'vue') {
      warnings.push('TypeScript with Vue requires additional setup');
    }

    // Custom code validation
    if (options.customCode) {
      if (options.customCode.jsx && !this.isValidJSX(options.customCode.jsx)) {
        errors.push('Invalid JSX in custom code');
      }
      
      if (options.customCode.css && !this.isValidCSS(options.customCode.css)) {
        errors.push('Invalid CSS in custom code');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateFigmaData(data: FigmaApiResponse): ValidationResult {
    const errors: string[] = [];

    if (!data) {
      errors.push('Figma data is required');
      return { isValid: false, errors };
    }

    if (!data.document) {
      errors.push('Figma document is missing');
    }

    if (!data.document?.id) {
      errors.push('Figma document must have an ID');
    }

    if (!data.document?.name) {
      errors.push('Figma document must have a name');
    }

    // Check for empty document
    if (data.document && (!data.document.children || data.document.children.length === 0)) {
      errors.push('Figma document appears to be empty');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private static isValidJSX(jsx: string): boolean {
    try {
      // Basic JSX validation - check for balanced tags
      const openTags = jsx.match(/<[^/][^>]*>/g) || [];
      const closeTags = jsx.match(/<\/[^>]+>/g) || [];
      const selfClosingTags = jsx.match(/<[^>]*\/>/g) || [];
      
      return openTags.length === closeTags.length + selfClosingTags.length;
    } catch {
      return false;
    }
  }

  private static isValidCSS(css: string): boolean {
    try {
      // Basic CSS validation - check for balanced braces
      const openBraces = (css.match(/\{/g) || []).length;
      const closeBraces = (css.match(/\}/g) || []).length;
      
      return openBraces === closeBraces;
    } catch {
      return false;
    }
  }
}
