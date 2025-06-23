import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Settings, 
  Play, 
  Download, 
  Eye, 
  Code2, 
  Palette, 
  Accessibility, 
  Smartphone, 
  Monitor, 
  Tablet,
  AlertCircle,
  CheckCircle,
  Loader2,
  Zap,
  Star,
  GitBranch
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VirtualCodeViewer } from '@/components/ui/virtual-code-viewer';

interface GenerationConfig {
  framework: 'react' | 'vue' | 'html';
  styling: 'tailwind' | 'css-modules' | 'styled-components' | 'plain-css';
  typescript: boolean;
  accessibility: boolean;
  responsive: boolean;
  optimizeImages: boolean;
  generateStorybook: boolean;
}

interface FigmaFile {
  id: string;
  name: string;
  url: string;
  fileKey: string;
  lastModified: string;
  thumbnailUrl?: string;
}

interface GeneratedResult {
  id: string;
  name: string;
  jsx: string;
  css: string;
  tailwind?: string;
  typescript?: string;
  preview?: string;
  metadata: {
    framework: string;
    styling: string;
    accessibility: number;
    performance: number;
    lines: number;
    size: string;
  };
}

const defaultConfig: GenerationConfig = {
  framework: 'react',
  styling: 'tailwind',
  typescript: true,
  accessibility: true,
  responsive: true,
  optimizeImages: true,
  generateStorybook: false
};

export function Generator() {
  const [config, setConfig] = useState<GenerationConfig>(defaultConfig);
  const [figmaUrl, setFigmaUrl] = useState('');
  const [figmaFile, setFigmaFile] = useState<FigmaFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateConfig = <K extends keyof GenerationConfig>(
    key: K, 
    value: GenerationConfig[K]
  ) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.fig') && !file.type.includes('figma')) {
      setError('Please upload a valid Figma file');
      return;
    }

    setError(null);
    // Simulate file processing
    const mockFile: FigmaFile = {
      id: `file_${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      fileKey: `key_${Math.random().toString(36).substr(2, 9)}`,
      lastModified: new Date().toISOString(),
      thumbnailUrl: undefined
    };

    setFigmaFile(mockFile);
  }, []);

  const handleUrlSubmit = useCallback(() => {
    if (!figmaUrl.trim()) {
      setError('Please enter a valid Figma URL');
      return;
    }

    const figmaUrlPattern = /https:\/\/www\.figma\.com\/(file|proto)\/([a-zA-Z0-9]+)/;
    const match = figmaUrl.match(figmaUrlPattern);

    if (!match) {
      setError('Please enter a valid Figma URL (e.g., https://www.figma.com/file/...)');
      return;
    }

    setError(null);
    const fileKey = match[2];
    const mockFile: FigmaFile = {
      id: `url_${Date.now()}`,
      name: 'Figma Design File',
      url: figmaUrl,
      fileKey,
      lastModified: new Date().toISOString()
    };

    setFigmaFile(mockFile);
  }, [figmaUrl]);

  const simulateGeneration = useCallback(async () => {
    if (!figmaFile) return;

    setIsLoading(true);
    setProgress(0);
    setError(null);
    setResults([]);

    const steps = [
      { name: 'Analyzing Figma design...', duration: 1500 },
      { name: 'Extracting components...', duration: 2000 },
      { name: 'Generating code structure...', duration: 2500 },
      { name: 'Applying styling...', duration: 1800 },
      { name: 'Optimizing accessibility...', duration: 1200 },
      { name: 'Finalizing output...', duration: 1000 }
    ];

    let totalProgress = 0;
    const progressStep = 100 / steps.length;

    for (const step of steps) {
      setCurrentStep(step.name);
      
      await new Promise(resolve => {
        const interval = setInterval(() => {
          totalProgress += progressStep / (step.duration / 100);
          setProgress(Math.min(totalProgress, (steps.indexOf(step) + 1) * progressStep));
        }, 100);

        setTimeout(() => {
          clearInterval(interval);
          resolve(void 0);
        }, step.duration);
      });
    }

    // Generate mock results
    const mockResults: GeneratedResult[] = [
      {
        id: 'component_1',
        name: 'HeaderComponent',
        jsx: generateMockJSX('HeaderComponent', config),
        css: generateMockCSS('HeaderComponent'),
        tailwind: config.styling === 'tailwind' ? 'flex items-center justify-between p-4 bg-white shadow-md' : undefined,
        typescript: config.typescript ? generateMockTypeScript('HeaderComponent') : undefined,
        metadata: {
          framework: config.framework,
          styling: config.styling,
          accessibility: 98,
          performance: 94,
          lines: 156,
          size: '4.2 KB'
        }
      },
      {
        id: 'component_2',
        name: 'CardComponent',
        jsx: generateMockJSX('CardComponent', config),
        css: generateMockCSS('CardComponent'),
        tailwind: config.styling === 'tailwind' ? 'bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow' : undefined,
        typescript: config.typescript ? generateMockTypeScript('CardComponent') : undefined,
        metadata: {
          framework: config.framework,
          styling: config.styling,
          accessibility: 96,
          performance: 92,
          lines: 89,
          size: '2.8 KB'
        }
      }
    ];

    setResults(mockResults);
    setSelectedResult(mockResults[0]);
    setIsLoading(false);
    setProgress(100);
    setCurrentStep('Generation complete!');
  }, [figmaFile, config]);

  const generateMockJSX = (componentName: string, config: GenerationConfig) => {
    if (config.framework === 'react') {
      return `import React from 'react';
${config.typescript ? `
interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
}
` : ''}
const ${componentName}${config.typescript ? `: React.FC<${componentName}Props>` : ''} = ({ className, children }) => {
  return (
    <div className={\`component-root \${className}\`}>
      <h2>Generated ${componentName}</h2>
      {children}
    </div>
  );
};

export default ${componentName};`;
    } else if (config.framework === 'vue') {
      return `<template>
  <div class="component-root">
    <h2>Generated ${componentName}</h2>
    <slot />
  </div>
</template>

<script>
export default {
  name: '${componentName}',
  props: {
    className: String
  }
}
</script>`;
    } else {
      return `<div class="component-root">
  <h2>Generated ${componentName}</h2>
  <!-- Component content -->
</div>`;
    }
  };

  const generateMockCSS = (componentName: string) => {
    return `.component-root {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.component-root h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

@media (max-width: 768px) {
  .component-root {
    padding: 0.75rem;
  }
  
  .component-root h2 {
    font-size: 1.25rem;
  }
}`;
  };

  const generateMockTypeScript = (componentName: string) => {
    return `export interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export interface ${componentName}State {
  isLoading: boolean;
  error: string | null;
}

export type ${componentName}Variant = ${componentName}Props['variant'];
export type ${componentName}Size = ${componentName}Props['size'];`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
              <Code2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Figma to Code Generator
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Transform your Figma designs into production-ready components
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Design Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="url" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">Figma URL</TabsTrigger>
                    <TabsTrigger value="file">Upload File</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="url" className="space-y-3">
                    <Label htmlFor="figma-url">Figma File URL</Label>
                    <Input
                      id="figma-url"
                      placeholder="https://www.figma.com/file/..."
                      value={figmaUrl}
                      onChange={(e) => setFigmaUrl(e.target.value)}
                    />
                    <Button onClick={handleUrlSubmit} className="w-full">
                      Load from URL
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="file" className="space-y-3">
                    <Label htmlFor="figma-file">Upload Figma File</Label>
                    <Input
                      id="figma-file"
                      type="file"
                      accept=".fig"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                    />
                    <Button 
                      onClick={() => fileInputRef.current?.click()} 
                      variant="outline" 
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </TabsContent>
                </Tabs>

                {figmaFile && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        {figmaFile.name}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Ready for generation
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Generation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Framework</Label>
                  <Select 
                    value={config.framework} 
                    onValueChange={(value: 'react' | 'vue' | 'html') => updateConfig('framework', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="vue">Vue.js</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Styling Approach</Label>
                  <Select 
                    value={config.styling} 
                    onValueChange={(value: GenerationConfig['styling']) => updateConfig('styling', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                      <SelectItem value="css-modules">CSS Modules</SelectItem>
                      <SelectItem value="styled-components">Styled Components</SelectItem>
                      <SelectItem value="plain-css">Plain CSS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="typescript"
                      checked={config.typescript}
                      onCheckedChange={(checked) => updateConfig('typescript', !!checked)}
                    />
                    <Label htmlFor="typescript">TypeScript</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="accessibility"
                      checked={config.accessibility}
                      onCheckedChange={(checked) => updateConfig('accessibility', !!checked)}
                    />
                    <Label htmlFor="accessibility">Accessibility</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="responsive"
                      checked={config.responsive}
                      onCheckedChange={(checked) => updateConfig('responsive', !!checked)}
                    />
                    <Label htmlFor="responsive">Responsive Design</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="optimize-images"
                      checked={config.optimizeImages}
                      onCheckedChange={(checked) => updateConfig('optimizeImages', !!checked)}
                    />
                    <Label htmlFor="optimize-images">Optimize Images</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="storybook"
                      checked={config.generateStorybook}
                      onCheckedChange={(checked) => updateConfig('generateStorybook', !!checked)}
                    />
                    <Label htmlFor="storybook">Generate Storybook</Label>
                  </div>
                </div>

                <Button 
                  onClick={simulateGeneration}
                  disabled={!figmaFile || isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? 'Generating...' : 'Generate Components'}
                </Button>
              </CardContent>
            </Card>

            {isLoading && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Generation Progress</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentStep}
                    </p>
                    <div className="text-xs text-gray-500">
                      {Math.round(progress)}% complete
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {results.length > 0 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Generated Components
                      </span>
                      <Badge variant="secondary">
                        {results.length} component{results.length !== 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {results.map((result) => (
                        <div
                          key={result.id}
                          onClick={() => setSelectedResult(result)}
                          className={cn(
                            "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                            selectedResult?.id === result.id
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-700"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{result.name}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {result.metadata.framework}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {result.metadata.styling}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-1">
                              <Accessibility className="h-3 w-3" />
                              <span>{result.metadata.accessibility}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              <span>{result.metadata.performance}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Code2 className="h-3 w-3" />
                              <span>{result.metadata.lines} lines</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>{result.metadata.size}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {selectedResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{selectedResult.name}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="jsx" className="w-full">
                        <TabsList>
                          <TabsTrigger value="jsx">
                            {config.framework === 'react' ? 'JSX' : config.framework === 'vue' ? 'Vue' : 'HTML'}
                          </TabsTrigger>
                          <TabsTrigger value="css">CSS</TabsTrigger>
                          {selectedResult.tailwind && <TabsTrigger value="tailwind">Tailwind</TabsTrigger>}
                          {selectedResult.typescript && <TabsTrigger value="typescript">TypeScript</TabsTrigger>}
                        </TabsList>
                        
                        <TabsContent value="jsx" className="mt-4">
                          <VirtualCodeViewer
                            code={selectedResult.jsx}
                            language={config.framework === 'react' ? 'jsx' : config.framework === 'vue' ? 'vue' : 'html'}
                            filename={`${selectedResult.name}.${config.framework === 'react' ? 'jsx' : config.framework === 'vue' ? 'vue' : 'html'}`}
                          />
                        </TabsContent>
                        
                        <TabsContent value="css" className="mt-4">
                          <VirtualCodeViewer
                            code={selectedResult.css}
                            language="css"
                            filename={`${selectedResult.name}.css`}
                          />
                        </TabsContent>
                        
                        {selectedResult.tailwind && (
                          <TabsContent value="tailwind" className="mt-4">
                            <VirtualCodeViewer
                              code={selectedResult.tailwind}
                              language="css"
                              filename={`${selectedResult.name}.tailwind.css`}
                            />
                          </TabsContent>
                        )}
                        
                        {selectedResult.typescript && (
                          <TabsContent value="typescript" className="mt-4">
                            <VirtualCodeViewer
                              code={selectedResult.typescript}
                              language="typescript"
                              filename={`${selectedResult.name}.types.ts`}
                            />
                          </TabsContent>
                        )}
                      </Tabs>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!isLoading && results.length === 0 && (
              <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Code2 className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Ready to Generate
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    Upload a Figma file or provide a Figma URL, configure your settings, 
                    and click "Generate Components" to start creating production-ready code.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}