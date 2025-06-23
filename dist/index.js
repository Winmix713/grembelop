// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users = /* @__PURE__ */ new Map();
  projects = /* @__PURE__ */ new Map();
  components = /* @__PURE__ */ new Map();
  currentUserId = 1;
  currentProjectId = 1;
  currentComponentId = 1;
  constructor() {
    this.createUser({
      username: "demo",
      password: "demo123"
    });
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = {
      ...insertUser,
      id
    };
    this.users.set(id, user);
    return user;
  }
  // Project methods
  async createGenerationProject(project) {
    const id = this.currentProjectId++;
    const now = /* @__PURE__ */ new Date();
    const newProject = {
      ...project,
      id,
      results: project.results || null,
      createdAt: now,
      updatedAt: now
    };
    this.projects.set(id, newProject);
    return newProject;
  }
  async getGenerationProject(id) {
    return this.projects.get(id);
  }
  async getAllGenerationProjects() {
    return Array.from(this.projects.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
  async updateGenerationProject(id, updates) {
    const existing = this.projects.get(id);
    if (!existing) return void 0;
    const updated = {
      ...existing,
      ...updates,
      id: existing.id,
      // Ensure ID doesn't change
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.projects.set(id, updated);
    return updated;
  }
  async deleteGenerationProject(id) {
    const components = Array.from(this.components.values()).filter((comp) => comp.projectId === id);
    for (const component of components) {
      this.components.delete(component.id);
    }
    this.projects.delete(id);
  }
  // Component methods
  async createGeneratedComponent(component) {
    const id = this.currentComponentId++;
    const now = /* @__PURE__ */ new Date();
    const newComponent = {
      ...component,
      id,
      createdAt: now
    };
    this.components.set(id, newComponent);
    return newComponent;
  }
  async getGeneratedComponent(id) {
    return this.components.get(id);
  }
  async getGeneratedComponentsByProject(projectId) {
    return Array.from(this.components.values()).filter((comp) => comp.projectId === projectId).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  async deleteGeneratedComponent(id) {
    this.components.delete(id);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var generationProjects = pgTable("generation_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  figmaData: jsonb("figma_data").notNull(),
  options: jsonb("options").notNull(),
  results: jsonb("results"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var generatedComponents = pgTable("generated_components", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => generationProjects.id).notNull(),
  name: text("name").notNull(),
  jsx: text("jsx").notNull(),
  css: text("css").notNull(),
  typescript: text("typescript"),
  vue: text("vue"),
  html: text("html"),
  metadata: jsonb("metadata").notNull(),
  accessibilityReport: jsonb("accessibility_report").notNull(),
  responsiveBreakpoints: jsonb("responsive_breakpoints").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertGenerationProjectSchema = createInsertSchema(generationProjects).pick({
  name: true,
  figmaData: true,
  options: true,
  userId: true
});
var insertGeneratedComponentSchema = createInsertSchema(generatedComponents).pick({
  projectId: true,
  name: true,
  jsx: true,
  css: true,
  typescript: true,
  vue: true,
  html: true,
  metadata: true,
  accessibilityReport: true,
  responsiveBreakpoints: true
});
var selectUserSchema = createSelectSchema(users);
var selectGenerationProjectSchema = createSelectSchema(generationProjects);
var selectGeneratedComponentSchema = createSelectSchema(generatedComponents);
var codeGenerationRequestSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  figmaData: z.object({
    document: z.any(),
    components: z.any().optional(),
    styles: z.any().optional(),
    name: z.string().optional()
  }),
  options: z.object({
    framework: z.enum(["react", "vue", "html"]),
    styling: z.enum(["tailwind", "css-modules", "styled-components", "plain-css"]),
    typescript: z.boolean(),
    accessibility: z.boolean(),
    responsive: z.boolean(),
    optimizeImages: z.boolean(),
    includeComments: z.boolean(),
    generateTests: z.boolean(),
    customBreakpoints: z.record(z.number()).optional()
  }),
  customCode: z.object({
    jsx: z.string().optional(),
    css: z.string().optional(),
    cssAdvanced: z.string().optional(),
    imports: z.string().optional(),
    utilities: z.string().optional()
  }).optional()
});
var generationResultSchema = z.object({
  id: z.number(),
  components: z.array(z.any()),
  totalTime: z.number(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  summary: z.object({
    componentCount: z.number(),
    averageComplexity: z.string(),
    averageAccuracy: z.number(),
    totalNodes: z.number()
  })
});

// shared/services/advanced-code-generator.ts
var AdvancedCodeGenerator = class {
  figmaData;
  options;
  customCode = { jsx: "", css: "", cssAdvanced: "" };
  constructor(figmaData, options) {
    this.figmaData = figmaData;
    this.options = options;
  }
  // Egyéni kód beállítása
  setCustomCode(customCode) {
    this.customCode = customCode;
  }
  // Fő generálási metódus
  generateComponents() {
    const components = [];
    Object.entries(this.figmaData.components || {}).forEach(([key, component]) => {
      const node = this.findNodeById(component.key);
      if (node) {
        const generatedComponent = this.generateSingleComponent(node, component.name);
        components.push(generatedComponent);
      }
    });
    if (components.length === 0) {
      this.findMainFrames(this.figmaData.document).forEach((frame) => {
        const generatedComponent = this.generateSingleComponent(frame, frame.name);
        components.push(generatedComponent);
      });
    }
    return components;
  }
  generateSingleComponent(node, componentName) {
    const startTime = Date.now();
    const sanitizedName = this.sanitizeComponentName(componentName);
    const jsx2 = this.generateJSX(node, sanitizedName);
    const css = this.generateCSS(node, sanitizedName);
    const accessibility = this.analyzeAccessibility(node);
    const responsive = this.analyzeResponsive(node);
    const metadata = this.generateMetadata(node, Date.now() - startTime);
    return {
      id: node.id,
      name: sanitizedName,
      jsx: jsx2,
      css,
      ...this.options.typescript && { typescript: this.generateTypeScript(node, sanitizedName) },
      accessibility,
      responsive,
      metadata
    };
  }
  // JSX generálás fejlett logikával + egyéni kód
  generateJSX(node, componentName) {
    const props = this.extractProps(node);
    const children = this.generateChildren(node);
    const className = this.generateClassName(node);
    const styles = this.generateInlineStyles(node);
    if (this.options.framework === "react") {
      const imports = this.generateImports(node);
      const propsInterface = this.options.typescript ? this.generatePropsInterface(props, componentName) : "";
      const componentSignature = this.options.typescript ? `export const ${componentName}: React.FC<${componentName}Props> = ({ ${props.map((p) => p.name).join(", ")} })` : `export const ${componentName} = ({ ${props.map((p) => p.name).join(", ")} })`;
      const customJSXSection = this.customCode.jsx ? `
  // === EGY\xC9NI JSX K\xD3D ===
  ${this.customCode.jsx}
  // === EGY\xC9NI JSX K\xD3D V\xC9GE ===
` : "";
      return `${imports}
${propsInterface}
${componentSignature} => {${customJSXSection}
  return (
    ${this.generateJSXElement(node, className, styles, children, 1)}
  );
};

export default ${componentName};`;
    }
    if (this.options.framework === "html") {
      return this.generateHTML(node, className, styles, children);
    }
    return jsx;
  }
  generateJSXElement(node, className, styles, children, depth) {
    const indent = "  ".repeat(depth);
    const tag = this.getHtmlTag(node);
    const attributes = this.generateAttributes(node);
    if (node.type === "TEXT" && node.characters) {
      return `${indent}<${tag}${className ? ` className="${className}"` : ""}${styles ? ` style={${styles}}` : ""}${attributes}>
${indent}  {${node.characters ? `"${node.characters}"` : "children"}}
${indent}</${tag}>`;
    }
    if (children) {
      return `${indent}<${tag}${className ? ` className="${className}"` : ""}${styles ? ` style={${styles}}` : ""}${attributes}>
${children}
${indent}</${tag}>`;
    }
    return `${indent}<${tag}${className ? ` className="${className}"` : ""}${styles ? ` style={${styles}}` : ""}${attributes} />`;
  }
  generateChildren(node) {
    if (!node.children || node.children.length === 0) return "";
    return node.children.map((child) => {
      const childClassName = this.generateClassName(child);
      const childStyles = this.generateInlineStyles(child);
      const grandChildren = this.generateChildren(child);
      return this.generateJSXElement(child, childClassName, childStyles, grandChildren, 2);
    }).join("\n");
  }
  // CSS generálás fejlett logikával + egyéni CSS
  generateCSS(node, componentName) {
    let baseCSS = "";
    if (this.options.styling === "tailwind") {
      baseCSS = this.generateTailwindCSS(node);
    } else {
      const styles = this.extractAllStyles(node);
      const cssRules = this.convertToCSSRules(styles, componentName);
      if (this.options.styling === "css-modules") {
        baseCSS = this.generateCSSModules(cssRules);
      } else if (this.options.styling === "styled-components") {
        baseCSS = this.generateStyledComponents(cssRules, componentName);
      } else {
        baseCSS = this.generatePlainCSS(cssRules, componentName);
      }
    }
    const customCSSSection = this.customCode.css ? `

/* === EGY\xC9NI CSS ST\xCDLUSOK === */
${this.customCode.css}
/* === EGY\xC9NI CSS ST\xCDLUSOK V\xC9GE === */` : "";
    const advancedCSSSection = this.customCode.cssAdvanced ? `

/* === FEJLETT CSS++ FUNKCI\xD3K === */
${this.customCode.cssAdvanced}
/* === FEJLETT CSS++ FUNKCI\xD3K V\xC9GE === */` : "";
    return `${baseCSS}${customCSSSection}${advancedCSSSection}`;
  }
  extractAllStyles(node) {
    const styles = {};
    if (node.absoluteBoundingBox) {
      const { width, height } = node.absoluteBoundingBox;
      styles.width = `${width}px`;
      styles.height = `${height}px`;
    }
    if (node.layoutMode) {
      styles.display = "flex";
      styles.flexDirection = node.layoutMode === "HORIZONTAL" ? "row" : "column";
      if (node.itemSpacing) {
        styles.gap = `${node.itemSpacing}px`;
      }
    }
    if (node.paddingLeft || node.paddingRight || node.paddingTop || node.paddingBottom) {
      styles.padding = `${node.paddingTop || 0}px ${node.paddingRight || 0}px ${node.paddingBottom || 0}px ${node.paddingLeft || 0}px`;
    }
    if (node.backgroundColor) {
      styles.backgroundColor = this.colorToCSS(node.backgroundColor);
    }
    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.type === "SOLID" && fill.color) {
        styles.backgroundColor = this.colorToCSS(fill.color, fill.opacity);
      } else if (fill.type === "GRADIENT_LINEAR") {
        styles.background = this.gradientToCSS(fill);
      }
    }
    if (node.cornerRadius) {
      styles.borderRadius = `${node.cornerRadius}px`;
    }
    if (node.strokes && node.strokes.length > 0 && node.strokeWeight) {
      const stroke = node.strokes[0];
      if (stroke.color) {
        styles.border = `${node.strokeWeight}px solid ${this.colorToCSS(stroke.color, stroke.opacity)}`;
      }
    }
    if (node.type === "TEXT" && node.style) {
      styles.fontFamily = `"${node.style.fontFamily}", sans-serif`;
      styles.fontSize = `${node.style.fontSize}px`;
      styles.lineHeight = `${node.style.lineHeightPx}px`;
      styles.letterSpacing = `${node.style.letterSpacing}px`;
      if (node.style.fills && node.style.fills.length > 0) {
        const textFill = node.style.fills[0];
        if (textFill.color) {
          styles.color = this.colorToCSS(textFill.color, textFill.opacity);
        }
      }
    }
    if (node.opacity !== void 0 && node.opacity !== 1) {
      styles.opacity = node.opacity;
    }
    if (node.effects && node.effects.length > 0) {
      const shadows = node.effects.filter((effect) => effect.type === "DROP_SHADOW" && effect.visible !== false).map((effect) => this.effectToCSS(effect));
      if (shadows.length > 0) {
        styles.boxShadow = shadows.join(", ");
      }
    }
    return styles;
  }
  generateTailwindCSS(node) {
    const classes = this.generateTailwindClasses(node);
    return `/* Figma alap\xFA Tailwind oszt\xE1lyok: ${classes} */

/* Komponens alapst\xEDlusok */
.${this.sanitizeComponentName(node.name).toLowerCase()} {
  @apply ${classes};
}`;
  }
  generateTailwindClasses(node) {
    const classes = [];
    if (node.layoutMode === "HORIZONTAL") {
      classes.push("flex", "flex-row");
    } else if (node.layoutMode === "VERTICAL") {
      classes.push("flex", "flex-col");
    }
    if (node.itemSpacing) {
      const gap = this.pxToTailwindSpacing(node.itemSpacing);
      classes.push(`gap-${gap}`);
    }
    if (node.paddingLeft) classes.push(`pl-${this.pxToTailwindSpacing(node.paddingLeft)}`);
    if (node.paddingRight) classes.push(`pr-${this.pxToTailwindSpacing(node.paddingRight)}`);
    if (node.paddingTop) classes.push(`pt-${this.pxToTailwindSpacing(node.paddingTop)}`);
    if (node.paddingBottom) classes.push(`pb-${this.pxToTailwindSpacing(node.paddingBottom)}`);
    if (node.absoluteBoundingBox) {
      const { width, height } = node.absoluteBoundingBox;
      classes.push(`w-[${width}px]`, `h-[${height}px]`);
    }
    if (node.backgroundColor) {
      classes.push(this.colorToTailwind(node.backgroundColor));
    }
    if (node.cornerRadius) {
      classes.push(this.borderRadiusToTailwind(node.cornerRadius));
    }
    if (node.type === "TEXT" && node.style) {
      if (node.style.fontSize) {
        classes.push(this.fontSizeToTailwind(node.style.fontSize));
      }
    }
    return classes.join(" ");
  }
  // Accessibility elemzés
  analyzeAccessibility(node) {
    const issues = [];
    const suggestions = [];
    let score = 100;
    if (this.isImage(node)) {
      issues.push({
        type: "error",
        message: "K\xE9p hi\xE1nyz\xF3 alt sz\xF6veg",
        element: node.name,
        fix: "Adj hozz\xE1 alt attrib\xFAtumot le\xEDr\xF3 sz\xF6veggel"
      });
      score -= 15;
    }
    if (node.type === "TEXT") {
      const contrastRatio = this.calculateContrastRatio(node);
      if (contrastRatio < 4.5) {
        issues.push({
          type: "warning",
          message: "Alacsony sz\xF6veg kontraszt",
          element: node.name,
          fix: "N\xF6veld a sz\xF6veg \xE9s h\xE1tt\xE9r k\xF6z\xF6tti kontrasztot"
        });
        score -= 10;
      }
    }
    if (this.isInteractiveElement(node)) {
      suggestions.push("Biztos\xEDtsd a billenty\u0171zetes navig\xE1ci\xF3 t\xE1mogat\xE1s\xE1t");
      suggestions.push("Adj hozz\xE1 ARIA c\xEDmk\xE9ket a k\xE9perny\u0151olvas\xF3khoz");
      suggestions.push("Haszn\xE1lj megfelel\u0151 focus \xE1llapotokat");
    }
    if (this.isHeading(node)) {
      suggestions.push("Ellen\u0151rizd a c\xEDmsor hierarchi\xE1t (h1, h2, h3...)");
    }
    if (this.customCode.jsx || this.customCode.css) {
      suggestions.push("Ellen\u0151rizd az egy\xE9ni k\xF3d accessibility megfelel\u0151s\xE9g\xE9t");
      suggestions.push("Teszteld a komponenst k\xE9perny\u0151olvas\xF3val");
    }
    return {
      score: Math.max(0, score),
      issues,
      suggestions,
      wcagCompliance: score >= 80 ? "AA" : score >= 60 ? "A" : "Non-compliant"
    };
  }
  // Responsive design elemzés
  analyzeResponsive(node) {
    const hasFlexLayout = node.layoutMode === "HORIZONTAL" || node.layoutMode === "VERTICAL";
    const hasConstraints = node.constraints?.horizontal !== "LEFT" || node.constraints?.vertical !== "TOP";
    const hasResponsiveDesign = hasFlexLayout || hasConstraints;
    return {
      mobile: this.generateResponsiveCSS(node, "mobile"),
      tablet: this.generateResponsiveCSS(node, "tablet"),
      desktop: this.generateResponsiveCSS(node, "desktop"),
      hasResponsiveDesign
    };
  }
  // Segédfüggvények
  findNodeById(id) {
    const search = (node) => {
      if (node.id === id) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = search(child);
          if (found) return found;
        }
      }
      return null;
    };
    return search(this.figmaData.document);
  }
  findMainFrames(node) {
    const frames = [];
    const traverse = (currentNode) => {
      if (currentNode.type === "FRAME" && currentNode.children && currentNode.children.length > 0) {
        frames.push(currentNode);
      }
      if (currentNode.children) {
        currentNode.children.forEach(traverse);
      }
    };
    traverse(node);
    return frames;
  }
  sanitizeComponentName(name) {
    return name.replace(/[^a-zA-Z0-9]/g, "").replace(/^[0-9]/, "Component$&").replace(/^./, (str) => str.toUpperCase()) || "Component";
  }
  colorToCSS(color, opacity) {
    const { r, g, b, a } = color;
    const alpha = opacity !== void 0 ? opacity : a !== void 0 ? a : 1;
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
  }
  colorToTailwind(color) {
    const { r, g, b } = color;
    if (r > 0.9 && g > 0.9 && b > 0.9) return "bg-white";
    if (r < 0.1 && g < 0.1 && b < 0.1) return "bg-black";
    if (r > 0.8 && g < 0.3 && b < 0.3) return "bg-red-500";
    if (r < 0.3 && g > 0.8 && b < 0.3) return "bg-green-500";
    if (r < 0.3 && g < 0.3 && b > 0.8) return "bg-blue-500";
    return "bg-gray-500";
  }
  pxToTailwindSpacing(px) {
    const spacing = Math.round(px / 4);
    if (spacing <= 0) return "0";
    if (spacing <= 96) return spacing.toString();
    return `[${px}px]`;
  }
  borderRadiusToTailwind(radius) {
    if (radius <= 2) return "rounded-sm";
    if (radius <= 4) return "rounded";
    if (radius <= 6) return "rounded-md";
    if (radius <= 8) return "rounded-lg";
    if (radius <= 12) return "rounded-xl";
    if (radius <= 16) return "rounded-2xl";
    return `rounded-[${radius}px]`;
  }
  fontSizeToTailwind(fontSize) {
    if (fontSize <= 12) return "text-xs";
    if (fontSize <= 14) return "text-sm";
    if (fontSize <= 16) return "text-base";
    if (fontSize <= 18) return "text-lg";
    if (fontSize <= 20) return "text-xl";
    if (fontSize <= 24) return "text-2xl";
    if (fontSize <= 30) return "text-3xl";
    return `text-[${fontSize}px]`;
  }
  getHtmlTag(node) {
    switch (node.type) {
      case "TEXT":
        return this.isHeading(node) ? "h2" : "span";
      case "FRAME":
        return "div";
      case "RECTANGLE":
        return this.isImage(node) ? "img" : "div";
      case "COMPONENT":
      case "INSTANCE":
        return "div";
      default:
        return "div";
    }
  }
  isImage(node) {
    return node.fills?.some((fill) => fill.type === "IMAGE") || false;
  }
  isInteractiveElement(node) {
    const name = node.name.toLowerCase();
    return name.includes("button") || name.includes("link") || name.includes("input") || name.includes("click");
  }
  isHeading(node) {
    if (node.type !== "TEXT") return false;
    const name = node.name.toLowerCase();
    return name.includes("title") || name.includes("heading") || name.includes("header") || node.style?.fontSize && node.style.fontSize > 20;
  }
  calculateContrastRatio(node) {
    return 4.5;
  }
  generateImports(node) {
    const imports = ['import React from "react";'];
    if (this.options.typescript) {
    }
    return imports.join("\n");
  }
  generatePropsInterface(props, componentName) {
    if (props.length === 0) return "";
    return `interface ${componentName}Props {
  ${props.map((p) => `${p.name}${p.optional ? "?" : ""}: ${p.type};`).join("\n  ")}
}

`;
  }
  extractProps(node) {
    const props = [];
    if (node.type === "TEXT" && node.characters) {
      props.push({ name: "children", type: "React.ReactNode", optional: true });
    }
    if (this.isImage(node)) {
      props.push({ name: "src", type: "string", optional: false });
      props.push({ name: "alt", type: "string", optional: false });
    }
    props.push({ name: "className", type: "string", optional: true });
    return props;
  }
  generateClassName(node) {
    if (this.options.styling === "tailwind") {
      return this.generateTailwindClasses(node);
    }
    return node.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }
  generateInlineStyles(node) {
    if (this.options.styling === "tailwind") return "";
    const styles = this.extractAllStyles(node);
    const styleEntries = Object.entries(styles).map(([key, value]) => `${key}: "${value}"`).join(", ");
    return styleEntries ? `{{ ${styleEntries} }}` : "";
  }
  generateAttributes(node) {
    const attributes = [];
    if (this.isImage(node)) {
      attributes.push("src={src}", "alt={alt}");
    }
    return attributes.length > 0 ? " " + attributes.join(" ") : "";
  }
  generateHTML(node, className, styles, children) {
    return `<!-- HTML implementation -->`;
  }
  convertToCSSRules(styles, componentName) {
    const cssRules = Object.entries(styles).map(([property, value]) => `  ${this.camelToKebab(property)}: ${value};`).join("\n");
    return `.${componentName.toLowerCase()} {
${cssRules}
}`;
  }
  generateCSSModules(cssRules) {
    return cssRules;
  }
  generateStyledComponents(cssRules, componentName) {
    return `import styled from 'styled-components';

export const Styled${componentName} = styled.div\`
${cssRules.replace(/^\.[^{]+\{/, "").replace(/\}$/, "")}
\`;`;
  }
  generatePlainCSS(cssRules, componentName) {
    return cssRules;
  }
  camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
  }
  gradientToCSS(fill) {
    return "linear-gradient(90deg, #000 0%, #fff 100%)";
  }
  effectToCSS(effect) {
    if (effect.type === "DROP_SHADOW") {
      const { offset, radius, color } = effect;
      const x = offset?.x || 0;
      const y = offset?.y || 0;
      const blur = radius || 0;
      const colorCSS = color ? this.colorToCSS(color) : "rgba(0,0,0,0.25)";
      return `${x}px ${y}px ${blur}px ${colorCSS}`;
    }
    return "";
  }
  generateResponsiveCSS(node, breakpoint) {
    return `/* ${breakpoint} responsive styles */`;
  }
  generateTypeScript(node, componentName) {
    const props = this.extractProps(node);
    return `export interface ${componentName}Props {
  ${props.map((p) => `${p.name}${p.optional ? "?" : ""}: ${p.type};`).join("\n  ")}
}

export type ${componentName}Ref = HTMLDivElement;`;
  }
  generateMetadata(node, generationTime) {
    return {
      figmaNodeId: node.id,
      componentType: this.detectComponentType(node),
      complexity: this.calculateComplexity(node),
      estimatedAccuracy: this.estimateAccuracy(node),
      generationTime,
      dependencies: this.extractDependencies(node)
    };
  }
  detectComponentType(node) {
    const name = node.name.toLowerCase();
    if (name.includes("button")) return "button";
    if (name.includes("card")) return "card";
    if (name.includes("text") || node.type === "TEXT") return "text";
    if (name.includes("input")) return "input";
    if (node.children && node.children.length > 3) return "layout";
    return "complex";
  }
  calculateComplexity(node) {
    let complexity = 0;
    if (node.children) complexity += node.children.length;
    if (node.effects && node.effects.length > 0) complexity += 2;
    if (node.fills && node.fills.length > 1) complexity += 1;
    if (this.customCode.jsx || this.customCode.css || this.customCode.cssAdvanced) {
      complexity += 1;
    }
    if (complexity <= 3) return "simple";
    if (complexity <= 8) return "medium";
    return "complex";
  }
  estimateAccuracy(node) {
    let accuracy = 85;
    if (this.calculateComplexity(node) === "simple") accuracy += 10;
    if (node.children && node.children.length > 5) accuracy -= 5;
    const componentType = this.detectComponentType(node);
    if (["button", "text", "card"].includes(componentType)) accuracy += 5;
    if (this.customCode.jsx || this.customCode.css || this.customCode.cssAdvanced) {
      accuracy += 5;
    }
    return Math.min(100, Math.max(70, accuracy));
  }
  extractDependencies(node) {
    const deps = ["react"];
    if (this.options.typescript) deps.push("@types/react");
    if (this.isImage(node)) deps.push("next/image");
    if (this.options.styling === "styled-components") deps.push("styled-components");
    return deps;
  }
};

// server/routes.ts
async function registerRoutes(app2) {
  app2.post("/api/generate", async (req, res) => {
    try {
      const data = codeGenerationRequestSchema.parse(req.body);
      const mockFigmaData = {
        document: {
          id: "root",
          name: "Document",
          type: "DOCUMENT",
          children: [
            {
              id: "frame1",
              name: "Sample Component",
              type: "FRAME",
              children: []
            }
          ]
        },
        components: {
          "comp1": { key: "frame1", name: "SampleComponent" }
        }
      };
      const generator = new AdvancedCodeGenerator(mockFigmaData, data.options);
      if (data.customCode) {
        generator.setCustomCode(data.customCode);
      }
      const component = await generator.generateComponent(
        mockFigmaData,
        "frame1",
        data.customCode
      );
      const result = {
        success: true,
        components: [component]
      };
      res.json(result);
    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({
        error: "Failed to generate components",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getGenerationProject(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          error: "Project not found"
        });
      }
      const components = await storage.getGeneratedComponentsByProject(projectId);
      res.json({
        success: true,
        project,
        components
      });
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch project"
      });
    }
  });
  app2.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllGenerationProjects();
      res.json({
        success: true,
        projects
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch projects"
      });
    }
  });
  app2.delete("/api/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      await storage.deleteGenerationProject(projectId);
      res.json({
        success: true
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete project"
      });
    }
  });
  app2.get("/api/components/:id", async (req, res) => {
    try {
      const componentId = parseInt(req.params.id);
      const component = await storage.getGeneratedComponent(componentId);
      if (!component) {
        return res.status(404).json({
          success: false,
          error: "Component not found"
        });
      }
      res.json({
        success: true,
        component
      });
    } catch (error) {
      console.error("Error fetching component:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch component"
      });
    }
  });
  app2.post("/api/fetch-figma", async (req, res) => {
    try {
      const { figmaUrl, apiKey } = req.body;
      if (!figmaUrl || !apiKey) {
        return res.status(400).json({
          success: false,
          error: "Figma URL and API key are required"
        });
      }
      const urlMatch = figmaUrl.match(/\/(file|design)\/([a-zA-Z0-9]+)/);
      if (!urlMatch) {
        return res.status(400).json({
          success: false,
          error: "Invalid Figma URL format"
        });
      }
      const fileKey = urlMatch[2];
      const figmaApiUrl = `https://api.figma.com/v1/files/${fileKey}`;
      const response = await fetch(figmaApiUrl, {
        headers: {
          "X-Figma-Token": apiKey
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          success: false,
          error: `Figma API error: ${response.status} ${response.statusText}`
        });
      }
      const figmaData = await response.json();
      if (!figmaData.document) {
        return res.status(400).json({
          success: false,
          error: "Invalid response from Figma API"
        });
      }
      let nodeCount = 0;
      let componentCount = 0;
      const countNodes = (node) => {
        nodeCount++;
        if (node.children) {
          node.children.forEach(countNodes);
        }
      };
      countNodes(figmaData.document);
      if (figmaData.components) {
        componentCount = Object.keys(figmaData.components).length;
      }
      res.json({
        success: true,
        figmaData,
        validation: {
          valid: true,
          nodeCount,
          componentCount,
          hasComponents: componentCount > 0,
          documentName: figmaData.name || "Untitled"
        }
      });
    } catch (error) {
      console.error("Figma fetch error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch Figma data"
      });
    }
  });
  app2.post("/api/validate-figma", async (req, res) => {
    try {
      const { figmaData } = req.body;
      if (!figmaData || typeof figmaData !== "object") {
        return res.status(400).json({
          success: false,
          error: "Invalid Figma data format"
        });
      }
      if (!figmaData.document) {
        return res.status(400).json({
          success: false,
          error: "Figma data must contain a document"
        });
      }
      let nodeCount = 0;
      let componentCount = 0;
      const countNodes = (node) => {
        nodeCount++;
        if (node.children) {
          node.children.forEach(countNodes);
        }
      };
      countNodes(figmaData.document);
      if (figmaData.components) {
        componentCount = Object.keys(figmaData.components).length;
      }
      res.json({
        success: true,
        validation: {
          valid: true,
          nodeCount,
          componentCount,
          hasComponents: componentCount > 0,
          documentName: figmaData.name || "Untitled"
        }
      });
    } catch (error) {
      console.error("Validation error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to validate Figma data"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
