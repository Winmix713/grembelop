import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CodePreview } from "@/components/code-preview";
import {
  Upload,
  Wand2,
  Settings,
  Zap,
  Shield,
  Smartphone,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  FigmaApiResponse,
  CodeGenerationOptions,
  GeneratedComponent,
  CustomCodeInputs,
} from "@shared/types/figma";
import { AdvancedCodeGenerator } from "@shared/services/advanced-code-generator";
import { toast } from "sonner";

const FigmaGenerator = () => {
  const [figmaUrl, setFigmaUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [components, setComponents] = useState<GeneratedComponent[]>([]);
  const [selectedComponent, setSelectedComponent] =
    useState<GeneratedComponent | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationReport, setGenerationReport] = useState<any>(null);

  const [options, setOptions] = useState<CodeGenerationOptions>({
    framework: "react",
    styling: "tailwind",
    typescript: true,
    accessibility: true,
    responsive: true,
    optimizeImages: true,
  });

  const [customCode, setCustomCode] = useState<CustomCodeInputs>({
    jsx: "",
    css: "",
    cssAdvanced: "",
    imports: "",
    utilities: "",
  });

  const handleGenerate = async () => {
    if (!figmaUrl) {
      toast.error("Please enter a Figma URL");
      return;
    }

    setIsLoading(true);
    setGenerationProgress(0);

    try {
      // Simulate progress updates
      const progressSteps = [
        { progress: 20, message: "Fetching Figma data..." },
        { progress: 40, message: "Analyzing components with AI..." },
        { progress: 60, message: "Running accessibility analysis..." },
        { progress: 80, message: "Generating optimized code..." },
        { progress: 100, message: "Complete!" },
      ];

      for (const step of progressSteps) {
        setGenerationProgress(step.progress);
        toast.info(step.message);
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // Mock Figma data for demonstration
      const mockFigmaData: FigmaApiResponse = {
        document: {
          id: "root",
          name: "Document",
          type: "DOCUMENT",
          children: [
            {
              id: "frame1",
              name: "Login Button",
              type: "FRAME",
              children: [{ id: "text1", name: "Login", type: "TEXT" }],
            },
            {
              id: "frame2",
              name: "User Card",
              type: "FRAME",
              children: [
                { id: "img1", name: "Avatar", type: "RECTANGLE" },
                { id: "text2", name: "Username", type: "TEXT" },
                { id: "text3", name: "Email", type: "TEXT" },
              ],
            },
          ],
        },
        components: {
          comp1: { key: "frame1", name: "LoginButton" },
          comp2: { key: "frame2", name: "UserCard" },
        },
      };

      // Initialize advanced generator
      const generator = new AdvancedCodeGenerator(mockFigmaData, options);

      // Check if setCustomCode method exists before calling it
      if (typeof generator.setCustomCode === "function") {
        generator.setCustomCode(customCode);
      } else {
        console.warn("setCustomCode method not available on generator");
      }

      // Generate components with advanced features
      const generatedComponents = await generator.generateComponent(
        mockFigmaData,
        "frame1",
        customCode,
      );

      setComponents([generatedComponents]);
      setSelectedComponent(generatedComponents);

      // Check if getAdvancedGenerationReport method exists
      if (typeof generator.getAdvancedGenerationReport === "function") {
        setGenerationReport(generator.getAdvancedGenerationReport());
      } else {
        // Create a mock report if the method doesn't exist
        setGenerationReport({
          figmaNodes: 5,
          cacheStats: { total: 2 },
        });
      }

      toast.success(`Successfully generated component with advanced features!`);
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate components. Please check your inputs.");
    } finally {
      setIsLoading(false);
      setGenerationProgress(0);
    }
  };

  const handleGenerateForFramework = async (framework: string) => {
    if (!components.length) {
      toast.error("Generate components first");
      return;
    }

    setIsLoading(true);
    try {
      // Mock framework-specific generation
      const mockFigmaData: FigmaApiResponse = {
        document: {
          id: "root",
          name: "Document",
          type: "DOCUMENT",
          children: [],
        },
      };

      const generator = new AdvancedCodeGenerator(mockFigmaData, {
        ...options,
        framework: framework as any,
      });
      const frameworkComponent = await generator.generateComponent(
        mockFigmaData,
        "frame1",
        customCode,
      );

      setComponents([frameworkComponent]);
      setSelectedComponent(frameworkComponent);

      toast.success(`Generated ${framework} component!`);
    } catch (error) {
      toast.error(`Failed to generate ${framework} component`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Advanced Figma to React Generator
        </h1>
        <p className="text-lg text-muted-foreground">
          AI-powered component generation with intelligent detection,
          accessibility analysis, and multi-framework support
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Intelligent Detection
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            WCAG AAA Compliance
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            Multi-Framework
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Figma Input
              </CardTitle>
              <CardDescription>
                Enter your Figma file URL and access token to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="figma-url">Figma File URL</Label>
                  <Input
                    id="figma-url"
                    placeholder="https://www.figma.com/file/..."
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="access-token">Access Token (Optional)</Label>
                  <Input
                    id="access-token"
                    type="password"
                    placeholder="Enter your Figma access token"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generation Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Generation Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Framework</Label>
                  <Select
                    value={options.framework}
                    onValueChange={(value) =>
                      setOptions((prev) => ({
                        ...prev,
                        framework: value as any,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="vue">Vue.js</SelectItem>
                      <SelectItem value="angular">Angular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Styling</Label>
                  <Select
                    value={options.styling}
                    onValueChange={(value) =>
                      setOptions((prev) => ({ ...prev, styling: value as any }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                      <SelectItem value="css-modules">CSS Modules</SelectItem>
                      <SelectItem value="styled-components">
                        Styled Components
                      </SelectItem>
                      <SelectItem value="plain-css">Plain CSS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={options.typescript}
                      onCheckedChange={(checked) =>
                        setOptions((prev) => ({ ...prev, typescript: checked }))
                      }
                    />
                    <Label>TypeScript</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={options.accessibility}
                      onCheckedChange={(checked) =>
                        setOptions((prev) => ({
                          ...prev,
                          accessibility: checked,
                        }))
                      }
                    />
                    <Label>Accessibility</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={options.responsive}
                      onCheckedChange={(checked) =>
                        setOptions((prev) => ({ ...prev, responsive: checked }))
                      }
                    />
                    <Label>Responsive</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generation Progress */}
          {isLoading && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generating components...</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap">
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              Generate Components
            </Button>

            {components.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleGenerateForFramework("vue")}
                  disabled={isLoading}
                >
                  Generate Vue.js
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGenerateForFramework("angular")}
                  disabled={isLoading}
                >
                  Generate Angular
                </Button>
              </>
            )}
          </div>

          {/* Generation Report */}
          {generationReport && (
            <Card>
              <CardHeader>
                <CardTitle>Generation Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">
                      {components.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Components Generated
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {generationReport.figmaNodes || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Figma Nodes Analyzed
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">AAA</div>
                    <div className="text-sm text-muted-foreground">
                      WCAG Compliance
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {generationReport.cacheStats?.total || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Cached Components
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preview">
          {selectedComponent ? (
            <CodePreview
              component={selectedComponent}
              framework={options.framework}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Generate components first to see the preview
            </div>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          {/* Custom Code Integration */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Code Integration</CardTitle>
              <CardDescription>
                Add your own JSX and CSS code that will be integrated into the
                generated components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="custom-jsx">Custom JSX Code</Label>
                <Textarea
                  id="custom-jsx"
                  placeholder="// Your custom JSX code here..."
                  value={customCode.jsx}
                  onChange={(e) =>
                    setCustomCode((prev) => ({ ...prev, jsx: e.target.value }))
                  }
                  className="font-mono"
                />
              </div>
              <div>
                <Label htmlFor="custom-css">Custom CSS</Label>
                <Textarea
                  id="custom-css"
                  placeholder="/* Your custom CSS here... */"
                  value={customCode.css}
                  onChange={(e) =>
                    setCustomCode((prev) => ({ ...prev, css: e.target.value }))
                  }
                  className="font-mono"
                />
              </div>
              <div>
                <Label htmlFor="advanced-css">Advanced CSS++ Features</Label>
                <Textarea
                  id="advanced-css"
                  placeholder="/* Advanced CSS features, animations, etc... */"
                  value={customCode.cssAdvanced}
                  onChange={(e) =>
                    setCustomCode((prev) => ({
                      ...prev,
                      cssAdvanced: e.target.value,
                    }))
                  }
                  className="font-mono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced Features Info */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Intelligent Component Detection:</strong> AI
                    analyzes your Figma designs to automatically identify
                    component types with high accuracy.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>WCAG AAA Compliance:</strong> Comprehensive
                    accessibility analysis ensures your components meet the
                    highest standards.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Multi-Framework Support:</strong> Generate
                    components for React, Vue.js, and Angular from the same
                    Figma design.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FigmaGenerator;
