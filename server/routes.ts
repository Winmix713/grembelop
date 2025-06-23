import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { codeGenerationRequestSchema } from "@shared/schema";
import { AdvancedCodeGenerator } from "@shared/services/advanced-code-generator";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate code from Figma data
  app.post("/api/generate", async (req, res) => {
    try {
      const data = codeGenerationRequestSchema.parse(req.body);

      // Create a mock Figma API response
      const mockFigmaData = {
        document: {
          id: 'root',
          name: 'Document',
          type: 'DOCUMENT',
          children: [
            {
              id: 'frame1',
              name: 'Sample Component',
              type: 'FRAME',
              children: []
            }
          ]
        },
        components: {
          'comp1': { key: 'frame1', name: 'SampleComponent' }
        }
      };

      // Generate using the advanced generator
      const generator = new AdvancedCodeGenerator(mockFigmaData, data.options);
      if (data.customCode) {
        generator.setCustomCode(data.customCode);
      }

      const component = await generator.generateComponent(
        mockFigmaData, 
        'frame1', 
        data.customCode
      );

      const result = {
        success: true,
        components: [component]
      };

      res.json(result);
    } catch (error) {
      console.error('Generation error:', error);
      res.status(500).json({ 
        error: "Failed to generate components",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get project by ID
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getGenerationProject(projectId);

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      const components = await storage.getGeneratedComponentsByProject(projectId);

      res.json({
        success: true,
        project,
        components
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project'
      });
    }
  });

  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllGenerationProjects();

      res.json({
        success: true,
        projects
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch projects'
      });
    }
  });

  // Delete project
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      await storage.deleteGenerationProject(projectId);

      res.json({
        success: true
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete project'
      });
    }
  });

  // Get component by ID
  app.get("/api/components/:id", async (req, res) => {
    try {
      const componentId = parseInt(req.params.id);
      const component = await storage.getGeneratedComponent(componentId);

      if (!component) {
        return res.status(404).json({
          success: false,
          error: 'Component not found'
        });
      }

      res.json({
        success: true,
        component
      });
    } catch (error) {
      console.error('Error fetching component:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch component'
      });
    }
  });

  // Fetch Figma data from API
  app.post("/api/fetch-figma", async (req, res) => {
    try {
      const { figmaUrl, apiKey } = req.body;

      if (!figmaUrl || !apiKey) {
        return res.status(400).json({
          success: false,
          error: 'Figma URL and API key are required'
        });
      }

      // Extract file key from URL - handle both /file/ and /design/ paths with parameters
      const urlMatch = figmaUrl.match(/\/(file|design)\/([a-zA-Z0-9]+)/);
      if (!urlMatch) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Figma URL format'
        });
      }

      const fileKey = urlMatch[2];

      // Fetch from Figma API
      const figmaApiUrl = `https://api.figma.com/v1/files/${fileKey}`;
      const response = await fetch(figmaApiUrl, {
        headers: {
          'X-Figma-Token': apiKey
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

      // Validate the fetched data
      if (!figmaData.document) {
        return res.status(400).json({
          success: false,
          error: 'Invalid response from Figma API'
        });
      }

      // Count nodes and components
      let nodeCount = 0;
      let componentCount = 0;

      const countNodes = (node: any) => {
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
          documentName: figmaData.name || 'Untitled'
        }
      });
    } catch (error) {
      console.error('Figma fetch error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Figma data'
      });
    }
  });

  // Validate Figma data
  app.post("/api/validate-figma", async (req, res) => {
    try {
      const { figmaData } = req.body;

      // Basic validation
      if (!figmaData || typeof figmaData !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Invalid Figma data format'
        });
      }

      if (!figmaData.document) {
        return res.status(400).json({
          success: false,
          error: 'Figma data must contain a document'
        });
      }

      // Count nodes and components
      let nodeCount = 0;
      let componentCount = 0;

      const countNodes = (node: any) => {
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
          documentName: figmaData.name || 'Untitled'
        }
      });
    } catch (error) {
      console.error('Validation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate Figma data'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}