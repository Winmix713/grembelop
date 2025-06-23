
import { ComponentConfig } from '../types/figma-generator';
import { TemplateError } from './errors';

export interface ComponentTemplate {
  render(config: ComponentConfig): string;
  validate?(config: ComponentConfig): boolean;
}

export class TemplateEngine {
  private templates = new Map<string, ComponentTemplate>();
  private defaultTemplate: ComponentTemplate;

  constructor() {
    this.defaultTemplate = new DefaultTemplate();
    this.initializeBuiltInTemplates();
  }

  registerTemplate(type: string, template: ComponentTemplate): void {
    this.templates.set(type, template);
  }

  generateComponent(type: string, config: ComponentConfig): string {
    try {
      const template = this.templates.get(type) || this.defaultTemplate;
      
      // Validate config if template supports it
      if (template.validate && !template.validate(config)) {
        throw new TemplateError(`Invalid configuration for template: ${type}`, type);
      }
      
      return template.render(config);
    } catch (error) {
      throw new TemplateError(
        `Failed to generate component with template: ${type}`,
        type
      );
    }
  }

  hasTemplate(type: string): boolean {
    return this.templates.has(type);
  }

  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys());
  }

  private initializeBuiltInTemplates(): void {
    this.templates.set('button', new ButtonTemplate());
    this.templates.set('card', new CardTemplate());
    this.templates.set('text', new TextTemplate());
    this.templates.set('layout', new LayoutTemplate());
    this.templates.set('image', new ImageTemplate());
    this.templates.set('icon', new IconTemplate());
  }
}

class DefaultTemplate implements ComponentTemplate {
  render(config: ComponentConfig): string {
    const componentName = this.sanitizeComponentName(config.name);
    
    return `import React from 'react';

${config.options.typescript ? `interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
}

` : ''}export const ${componentName}${config.options.typescript ? `: React.FC<${componentName}Props>` : ''} = ({ className, children, ...props }) => {
  return (
    <div className={\`${componentName.toLowerCase()} \${className || ''}\`} {...props}>
      {children}
    </div>
  );
};

export default ${componentName};`;
  }

  private sanitizeComponentName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, 'Component$&')
      .replace(/^./, str => str.toUpperCase()) || 'Component';
  }
}

class ButtonTemplate implements ComponentTemplate {
  render(config: ComponentConfig): string {
    const componentName = this.sanitizeComponentName(config.name);
    const customJSX = config.customCode?.jsx ? `
  // === CUSTOM JSX CODE ===
  ${config.customCode.jsx}
  // === END CUSTOM JSX CODE ===
` : '';

    const propsInterface = config.options.typescript ? `interface ${componentName}Props {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

` : '';

    return `import React from 'react';

${propsInterface}export const ${componentName}${config.options.typescript ? `: React.FC<${componentName}Props>` : ''} = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  onClick, 
  className, 
  ...props 
}) => {${customJSX}
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  };
  
  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-11 px-8 text-lg"
  };

  return (
    <button
      className={\`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]} \${className || ''}\`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default ${componentName};`;
  }

  private sanitizeComponentName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, 'Component$&')
      .replace(/^./, str => str.toUpperCase()) || 'Component';
  }
}

class CardTemplate implements ComponentTemplate {
  render(config: ComponentConfig): string {
    const componentName = this.sanitizeComponentName(config.name);

    const propsInterface = config.options.typescript ? `interface ${componentName}Props {
  children: React.ReactNode;
  className?: string;
}

` : '';

    return `import React from 'react';

${propsInterface}export const ${componentName}${config.options.typescript ? `: React.FC<${componentName}Props>` : ''} = ({ children, className, ...props }) => {
  return (
    <div
      className={\`rounded-lg border bg-card text-card-foreground shadow-sm \${className || ''}\`}
      {...props}
    >
      {children}
    </div>
  );
};

export default ${componentName};`;
  }

  private sanitizeComponentName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, 'Component$&')
      .replace(/^./, str => str.toUpperCase()) || 'Component';
  }
}

class TextTemplate implements ComponentTemplate {
  render(config: ComponentConfig): string {
    const componentName = this.sanitizeComponentName(config.name);

    const propsInterface = config.options.typescript ? `interface ${componentName}Props {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'muted';
  className?: string;
}

` : '';

    return `import React from 'react';

${propsInterface}export const ${componentName}${config.options.typescript ? `: React.FC<${componentName}Props>` : ''} = ({ children, variant = 'body', className, ...props }) => {
  const variantClasses = {
    h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
    h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
    h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
    h4: "scroll-m-20 text-xl font-semibold tracking-tight",
    body: "leading-7",
    small: "text-sm font-medium leading-none",
    muted: "text-sm text-muted-foreground"
  };

  const Component = variant.startsWith('h') ? variant : 'p';

  return React.createElement(
    Component,
    {
      className: \`\${variantClasses[variant]} \${className || ''}\`,
      ...props
    },
    children
  );
};

export default ${componentName};`;
  }

  private sanitizeComponentName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, 'Component$&')
      .replace(/^./, str => str.toUpperCase()) || 'Component';
  }
}

class LayoutTemplate implements ComponentTemplate {
  render(config: ComponentConfig): string {
    const componentName = this.sanitizeComponentName(config.name);

    const propsInterface = config.options.typescript ? `interface ${componentName}Props {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

` : '';

    return `import React from 'react';

${propsInterface}export const ${componentName}${config.options.typescript ? `: React.FC<${componentName}Props>` : ''} = ({ children, maxWidth = 'lg', className, ...props }) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    '2xl': "max-w-2xl",
    full: "max-w-full"
  };

  return (
    <div
      className={\`mx-auto px-4 \${maxWidthClasses[maxWidth]} \${className || ''}\`}
      {...props}
    >
      {children}
    </div>
  );
};

export default ${componentName};`;
  }

  private sanitizeComponentName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, 'Component$&')
      .replace(/^./, str => str.toUpperCase()) || 'Component';
  }
}

class ImageTemplate implements ComponentTemplate {
  render(config: ComponentConfig): string {
    const componentName = this.sanitizeComponentName(config.name);

    const propsInterface = config.options.typescript ? `interface ${componentName}Props {
  src: string;
  alt: string;
  className?: string;
}

` : '';

    return `import React from 'react';

${propsInterface}export const ${componentName}${config.options.typescript ? `: React.FC<${componentName}Props>` : ''} = ({ src, alt, className, ...props }) => {
  return (
    <div className={\`relative overflow-hidden rounded-lg \${className || ''}\`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform hover:scale-105"
        {...props}
      />
    </div>
  );
};

export default ${componentName};`;
  }

  private sanitizeComponentName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, 'Component$&')
      .replace(/^./, str => str.toUpperCase()) || 'Component';
  }
}

class IconTemplate implements ComponentTemplate {
  render(config: ComponentConfig): string {
    const componentName = this.sanitizeComponentName(config.name);

    const propsInterface = config.options.typescript ? `interface ${componentName}Props {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

` : '';

    return `import React from 'react';

${propsInterface}export const ${componentName}${config.options.typescript ? `: React.FC<${componentName}Props>` : ''} = ({ children, size = 'md', className, ...props }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <span
      className={\`inline-flex items-center justify-center \${sizeClasses[size]} \${className || ''}\`}
      {...props}
    >
      {children}
    </span>
  );
};

export default ${componentName};`;
  }

  private sanitizeComponentName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, 'Component$&')
      .replace(/^./, str => str.toUpperCase()) || 'Component';
  }
}
