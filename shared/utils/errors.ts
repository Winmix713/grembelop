
export class CodeGenerationError extends Error {
  constructor(
    message: string,
    public readonly nodeId?: string,
    public readonly componentType?: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'CodeGenerationError';
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CodeGenerationError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      nodeId: this.nodeId,
      componentType: this.componentType,
      stack: this.stack
    };
  }
}

export class ValidationError extends CodeGenerationError {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class TemplateError extends CodeGenerationError {
  constructor(message: string, public readonly templateName?: string) {
    super(message);
    this.name = 'TemplateError';
  }
}

export class AccessibilityError extends CodeGenerationError {
  constructor(message: string, public readonly wcagLevel?: string) {
    super(message);
    this.name = 'AccessibilityError';
  }
}
