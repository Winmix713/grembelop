import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const generationProjects = pgTable("generation_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  figmaData: jsonb("figma_data").notNull(),
  options: jsonb("options").notNull(),
  results: jsonb("results"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const generatedComponents = pgTable("generated_components", {
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGenerationProjectSchema = createInsertSchema(generationProjects).pick({
  name: true,
  figmaData: true,
  options: true,
  userId: true,
});

export const insertGeneratedComponentSchema = createInsertSchema(generatedComponents).pick({
  projectId: true,
  name: true,
  jsx: true,
  css: true,
  typescript: true,
  vue: true,
  html: true,
  metadata: true,
  accessibilityReport: true,
  responsiveBreakpoints: true,
});

// Select schemas
export const selectUserSchema = createSelectSchema(users);
export const selectGenerationProjectSchema = createSelectSchema(generationProjects);
export const selectGeneratedComponentSchema = createSelectSchema(generatedComponents);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGenerationProject = z.infer<typeof insertGenerationProjectSchema>;
export type GenerationProject = typeof generationProjects.$inferSelect;

export type InsertGeneratedComponent = z.infer<typeof insertGeneratedComponentSchema>;
export type GeneratedComponentRecord = typeof generatedComponents.$inferSelect;

// API Request/Response types
export const codeGenerationRequestSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  figmaData: z.object({
    document: z.any(),
    components: z.any().optional(),
    styles: z.any().optional(),
    name: z.string().optional()
  }),
  options: z.object({
    framework: z.enum(['react', 'vue', 'html']),
    styling: z.enum(['tailwind', 'css-modules', 'styled-components', 'plain-css']),
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

export type CodeGenerationRequest = z.infer<typeof codeGenerationRequestSchema>;

export const generationResultSchema = z.object({
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

export type GenerationResult = z.infer<typeof generationResultSchema>;