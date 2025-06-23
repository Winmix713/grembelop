import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Code, Palette, Accessibility, Smartphone, TestTube } from "lucide-react";

interface GenerationOptions {
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

interface CustomCode {
  jsx: string;
  css: string;
  cssAdvanced: string;
  imports?: string;
  utilities?: string;
}

interface GenerationOptionsProps {
  options: GenerationOptions;
  onOptionsChange: (options: GenerationOptions) => void;
  customCode: CustomCode;
  onCustomCodeChange: (customCode: CustomCode) => void;
}

export default function GenerationOptions({ 
  options, 
  onOptionsChange, 
  customCode, 
  onCustomCodeChange 
}: GenerationOptionsProps) {
  const updateOption = <K extends keyof GenerationOptions>(
    key: K, 
    value: GenerationOptions[K]
  ) => {
    onOptionsChange({ ...options, [key]: value });
  };

  const updateCustomCode = <K extends keyof CustomCode>(
    key: K, 
    value: CustomCode[K]
  ) => {
    onCustomCodeChange({ ...customCode, [key]: value });
  };

  const addBreakpoint = () => {
    const name = prompt("Breakpoint name (e.g., 'xl'):");
    const width = prompt("Breakpoint width in pixels (e.g., '1440'):");
    
    if (name && width && !isNaN(Number(width))) {
      updateOption('customBreakpoints', {
        ...options.customBreakpoints,
        [name]: Number(width)
      });
    }
  };

  const removeBreakpoint = (name: string) => {
    if (options.customBreakpoints) {
      const { [name]: removed, ...rest } = options.customBreakpoints;
      updateOption('customBreakpoints', rest);
    }
  };

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic" className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span>Basic</span>
        </TabsTrigger>
        <TabsTrigger value="styling" className="flex items-center space-x-2">
          <Palette className="h-4 w-4" />
          <span>Styling</span>
        </TabsTrigger>
        <TabsTrigger value="features" className="flex items-center space-x-2">
          <Accessibility className="h-4 w-4" />
          <span>Features</span>
        </TabsTrigger>
        <TabsTrigger value="custom" className="flex items-center space-x-2">
          <Code className="h-4 w-4" />
          <span>Custom</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Framework Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="framework">Target Framework</Label>
              <Select
                value={options.framework}
                onValueChange={(value: 'react' | 'vue' | 'html') => updateOption('framework', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="vue">Vue.js</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="typescript">TypeScript Support</Label>
                <div className="text-sm text-muted-foreground">
                  Generate TypeScript interfaces and types
                </div>
              </div>
              <Switch
                id="typescript"
                checked={options.typescript}
                onCheckedChange={(checked) => updateOption('typescript', checked)}
                disabled={options.framework === 'html'}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="styling" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Styling Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="styling">Styling System</Label>
              <Select
                value={options.styling}
                onValueChange={(value: GenerationOptions['styling']) => updateOption('styling', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select styling system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                  <SelectItem value="css-modules">CSS Modules</SelectItem>
                  <SelectItem value="styled-components">Styled Components</SelectItem>
                  <SelectItem value="plain-css">Plain CSS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="optimizeImages">Optimize Images</Label>
                <div className="text-sm text-muted-foreground">
                  Generate optimized image handling code
                </div>
              </div>
              <Switch
                id="optimizeImages"
                checked={options.optimizeImages}
                onCheckedChange={(checked) => updateOption('optimizeImages', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="features" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Accessibility className="h-5 w-5" />
              <span>Accessibility & Quality</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="accessibility">Accessibility Analysis</Label>
                <div className="text-sm text-muted-foreground">
                  WCAG compliance checking and contrast analysis
                </div>
              </div>
              <Switch
                id="accessibility"
                checked={options.accessibility}
                onCheckedChange={(checked) => updateOption('accessibility', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="responsive">Responsive Design</Label>
                <div className="text-sm text-muted-foreground">
                  Generate responsive CSS with breakpoints
                </div>
              </div>
              <Switch
                id="responsive"
                checked={options.responsive}
                onCheckedChange={(checked) => updateOption('responsive', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="includeComments">Include Comments</Label>
                <div className="text-sm text-muted-foreground">
                  Add helpful comments to generated code
                </div>
              </div>
              <Switch
                id="includeComments"
                checked={options.includeComments}
                onCheckedChange={(checked) => updateOption('includeComments', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="generateTests">Generate Tests</Label>
                <div className="text-sm text-muted-foreground">
                  Create basic test files for components
                </div>
              </div>
              <Switch
                id="generateTests"
                checked={options.generateTests}
                onCheckedChange={(checked) => updateOption('generateTests', checked)}
                disabled={options.framework === 'html'}
              />
            </div>
          </CardContent>
        </Card>

        {options.responsive && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>Custom Breakpoints</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {options.customBreakpoints ? (
                  Object.entries(options.customBreakpoints).map(([name, width]) => (
                    <Badge
                      key={name}
                      variant="outline"
                      className="flex items-center space-x-2 px-3 py-1"
                    >
                      <span>{name}: {width}px</span>
                      <button
                        onClick={() => removeBreakpoint(name)}
                        className="ml-2 text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Using default breakpoints (mobile: 768px, tablet: 1024px, desktop: 1440px)
                  </div>
                )}
              </div>
              
              <Button variant="outline" size="sm" onClick={addBreakpoint}>
                Add Custom Breakpoint
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="custom" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Custom Code Injection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="customJsx">Custom JSX/Template Code</Label>
              <Textarea
                id="customJsx"
                placeholder="// Add custom JSX code that will be injected into components&#10;const customLogic = () => {&#10;  // Your custom logic here&#10;};"
                value={customCode.jsx}
                onChange={(e) => updateCustomCode('jsx', e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="customCss">Custom CSS Styles</Label>
              <Textarea
                id="customCss"
                placeholder="/* Add custom CSS styles */&#10;.custom-class {&#10;  /* Your custom styles */&#10;}"
                value={customCode.css}
                onChange={(e) => updateCustomCode('css', e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="customAdvanced">Advanced CSS Features</Label>
              <Textarea
                id="customAdvanced"
                placeholder="/* Advanced CSS features (animations, custom properties, etc.) */&#10;@keyframes fadeIn {&#10;  from { opacity: 0; }&#10;  to { opacity: 1; }&#10;}"
                value={customCode.cssAdvanced}
                onChange={(e) => updateCustomCode('cssAdvanced', e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="customImports">Custom Imports</Label>
              <Textarea
                id="customImports"
                placeholder="// Add custom import statements&#10;import { customHook } from './custom-hook';&#10;import { CustomComponent } from './CustomComponent';"
                value={customCode.imports || ''}
                onChange={(e) => updateCustomCode('imports', e.target.value)}
                rows={4}
                className="font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
