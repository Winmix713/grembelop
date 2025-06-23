import React, { useState } from 'react';

import { FigmaApiResponse, GeneratedComponent } from '@/types/figma';

import { AdvancedCodeGenerator, CodeGenerationOptions } from '@/services/advanced-code-generator';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Label } from '@/components/ui/label';

import { Checkbox } from '@/components/ui/checkbox';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Badge } from '@/components/ui/badge';

import { Progress } from '@/components/ui/progress';

import { Textarea } from '@/components/ui/textarea';

import { VirtualCodeViewer } from '@/components/VirtualCodeViewer';

import { 
  Code2, 
  Download, 
  Copy, 
  Settings, 
  Zap, 
  CheckCircle,
  AlertTriangle,
  Eye,
  FileCode,
  Palette,
  Plus,
  FileText,
  Maximize2
} from 'lucide-react';

import { copyToClipboard, downloadFile } from '@/lib/utils';

interface CodeGenerationPanelProps {
  figmaData: FigmaApiResponse;
  fileKey: string;
}

interface CustomCodeInputs {
  jsx: string;
  css: string;
  cssAdvanced: string;
}

type FrameworkOption = 'react' | 'vue' | 'html';
type StylingOption = 'tailwind' | 'css-modules' | 'styled-components' | 'plain-css';

export function CodeGenerationPanel({ figmaData, fileKey }: CodeGenerationPanelProps) {
  const [options, setOptions] = useState<CodeGenerationOptions>({
    framework: 'react',
    styling: 'tailwind',
    typescript: true,
    accessibility: true,
    responsive: true,
    optimizeImages: true,
  });

  const [customCode, setCustomCode] = useState<CustomCodeInputs>({
    jsx: '',
    css: '',
    cssAdvanced: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedComponents, setGeneratedComponents] = useState<GeneratedComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<GeneratedComponent | null>(null);
  const [activeTab, setActiveTab] = useState<'jsx' | 'css' | 'typescript'>('jsx');
  const [copied, setCopied] = useState<string | null>(null);
  const [showCustomInputs, setShowCustomInputs] = useState(false);
  const [useVirtualViewer, setUseVirtualViewer] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Egységesített opció frissítés
  const updateOption = <K extends keyof CodeGenerationOptions>(key: K, value: CodeGenerationOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const generator = new AdvancedCodeGenerator(figmaData, options);
      generator.setCustomCode(customCode);
      // Feltételezve, hogy generateComponents async lehet
      const components = await Promise.resolve(generator.generateComponents());
      setGeneratedComponents(components);
      if (components.length > 0) {
        setSelectedComponent(components[0]);
        const totalCodeSize = components[0].jsx.length + components[0].css.length;
        setUseVirtualViewer(totalCodeSize > 10000);
      }
    } catch (error) {
      console.error('Kódgenerálási hiba:', error);
      setErrorMessage('Hiba történt a kód generálása során. Kérlek, próbáld újra.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (content: string, type: string) => {
    try {
      await copyToClipboard(content);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Másolási hiba:', error);
      setErrorMessage('Nem sikerült a másolás. Próbáld újra.');
    }
  };

  const handleDownload = (content: string, filename: string) => {
    downloadFile(content, filename);
  };

  const getFileExtension = (type: string) => {
    switch (type) {
      case 'jsx': return options.typescript ? '.tsx' : '.jsx';
      case 'css': return '.css';
      case 'typescript': return '.d.ts';
      default: return '.txt';
    }
  };

  const getLanguageForViewer = (type: string) => {
    switch (type) {
      case 'jsx': return options.typescript ? 'tsx' : 'jsx';
      case 'css': return 'css';
      case 'typescript': return 'typescript';
      default: return 'text';
    }
  };

  const handleDownloadAll = () => {
    if (!selectedComponent) return;

    const files = [
      { name: `${selectedComponent.name}${getFileExtension('jsx')}`, content: selectedComponent.jsx },
      { name: `${selectedComponent.name}.css`, content: selectedComponent.css },
    ];

    if (selectedComponent.typescript) {
      files.push({ name: `${selectedComponent.name}.d.ts`, content: selectedComponent.typescript });
    }

    files.forEach(file => {
      downloadFile(file.content, file.name);
    });
  };

  const getCurrentContent = () => {
    if (!selectedComponent) return '';

    switch (activeTab) {
      case 'jsx': return selectedComponent.jsx;
      case 'css': return selectedComponent.css;
      case 'typescript': return selectedComponent.typescript || '';
      default: return '';
    }
  };

  const getCurrentFilename = () => {
    if (!selectedComponent) return 'code.txt';
    return `${selectedComponent.name}${getFileExtension(activeTab)}`;
  };

  const getCodeSize = (content: string) => {
    const size = new Blob([content]).size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Új komponens a kódnéző tabokhoz a duplikáció csökkentésére
  interface CodeViewerTabProps {
    code: string;
    language: string;
    filename: string;
    onCopy: () => void;
    onDownload: () => void;
    useVirtualViewer: boolean;
  }

  const CodeViewerTab = ({ code, language, filename, onCopy, onDownload, useVirtualViewer }: CodeViewerTabProps) => {
    return useVirtualViewer ? (
      <VirtualCodeViewer
        code={code}
        language={language}
        filename={filename}
        onCopy={onCopy}
        onDownload={onDownload}
        maxHeight={500}
        showLineNumbers={true}
      />
    ) : (
      <div className="max-h-96 overflow-auto rounded-lg border border-gray-200" role="region" aria-label={`${filename} kódnéző`}>
        <pre className="p-4 text-sm font-mono bg-gray-50">
          <code>{code}</code>
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {/* Konfigurációs Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" aria-hidden="true" />
            <span>Kódgenerálási Beállítások</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <div className="space-y-2">
              <Label htmlFor="framework-select">Framework</Label>
              <Select
                id="framework-select"
                value={options.framework}
                onValueChange={(value: FrameworkOption) => updateOption('framework', value)}
                aria-label="Framework választása"
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
              <Label htmlFor="styling-select">CSS Framework</Label>
              <Select
                id="styling-select"
                value={options.styling}
                onValueChange={(value: StylingOption) => updateOption('styling', value)}
                aria-label="CSS Framework választása"
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

            <div className="space-y-4">
              <Label>További Opciók</Label>
              <div className="space-y-3">

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="typescript" 
                    checked={options.typescript}
                    onCheckedChange={(checked) => updateOption('typescript', !!checked)}
                    aria-checked={options.typescript}
                    role="checkbox"
                    aria-labelledby="label-typescript"
                  />
                  <Label htmlFor="typescript" id="label-typescript">TypeScript</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="accessibility" 
                    checked={options.accessibility}
                    onCheckedChange={(checked) => updateOption('accessibility', !!checked)}
                    aria-checked={options.accessibility}
                    role="checkbox"
                    aria-labelledby="label-accessibility"
                  />
                  <Label htmlFor="accessibility" id="label-accessibility">Accessibility</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="responsive" 
                    checked={options.responsive}
                    onCheckedChange={(checked) => updateOption('responsive', !!checked)}
                    aria-checked={options.responsive}
                    role="checkbox"
                    aria-labelledby="label-responsive"
                  />
                  <Label htmlFor="responsive" id="label-responsive">Responsive Design</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="virtual-viewer" 
                    checked={useVirtualViewer}
                    onCheckedChange={(checked) => setUseVirtualViewer(!!checked)}
                    aria-checked={useVirtualViewer}
                    role="checkbox"
                    aria-labelledby="label-virtual-viewer"
                  />
                  <Label htmlFor="virtual-viewer" id="label-virtual-viewer">Nagy teljesítményű megjelenítő</Label>
                </div>

              </div>
            </div>

          </div>

          {/* Egyéni Kód Hozzáadása Gomb */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowCustomInputs(!showCustomInputs)}
              className="mb-4 w-full"
              aria-expanded={showCustomInputs}
              aria-controls="custom-code-section"
            >
              <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
              {showCustomInputs ? 'Egyéni Kód Elrejtése' : 'Egyéni Kód Hozzáadása'}
            </Button>

            {/* Egyéni Kód Beviteli Mezők */}
            {showCustomInputs && (
              <section id="custom-code-section" aria-live="polite" className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Egyéni Kód Hozzáadása</h4>

                <div className="space-y-4">

                  <div>
                    <Label htmlFor="custom-jsx" className="flex items-center space-x-2 mb-2">
                      <FileCode className="w-4 h-4" aria-hidden="true" />
                      <span>JSX Kód Hozzáadása</span>
                    </Label>
                    <Textarea
                      id="custom-jsx"
                      placeholder="// Egyéni JSX kód, amely beépül a generált komponensbe
const customElement = <div>Egyéni tartalom</div>;"
                      value={customCode.jsx}
                      onChange={(e) => setCustomCode({...customCode, jsx: e.target.value})}
                      className="min-h-[100px] font-mono text-sm"
                      aria-label="Egyéni JSX kód"
                    />
                  </div>

                  <div>
                    <Label htmlFor="custom-css" className="flex items-center space-x-2 mb-2">
                      <Palette className="w-4 h-4" aria-hidden="true" />
                      <span>CSS Kód Hozzáadása</span>
                    </Label>
                    <Textarea
                      id="custom-css"
                      placeholder="/* Egyéni CSS stílusok */
.custom-class {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border-radius: 8px;
  padding: 16px;
}"
                      value={customCode.css}
                      onChange={(e) => setCustomCode({...customCode, css: e.target.value})}
                      className="min-h-[100px] font-mono text-sm"
                      aria-label="Egyéni CSS kód"
                    />
                  </div>

                  <div>
                    <Label htmlFor="custom-css-advanced" className="flex items-center space-x-2 mb-2">
                      <Zap className="w-4 h-4" aria-hidden="true" />
                      <span>CSS++ Kód Hozzáadása (Fejlett)</span>
                    </Label>
                    <Textarea
                      id="custom-css-advanced"
                      placeholder="/* Fejlett CSS funkciók: animációk, transitions, custom properties */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.advanced-component {
  --primary-color: #3b82f6;
  animation: fadeInUp 0.6s ease-out;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}"
                      value={customCode.cssAdvanced}
                      onChange={(e) => setCustomCode({...customCode, cssAdvanced: e.target.value})}
                      className="min-h-[120px] font-mono text-sm"
                      aria-label="Fejlett CSS kód"
                    />
                  </div>

                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3" role="note" aria-live="polite">
                  <div className="flex items-start space-x-2">
                    <FileText className="w-4 h-4 text-blue-600 mt-0.5" aria-hidden="true" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Hogyan működik:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>JSX Kód:</strong> Beépül a generált React komponensbe</li>
                        <li>• <strong>CSS Kód:</strong> Hozzáadódik a komponens stíluslapjához</li>
                        <li>• <strong>CSS++:</strong> Fejlett CSS funkciók (animációk, custom properties)</li>
                        <li>• A Figma adatok + egyéni kód = teljes React komponens</li>
                      </ul>
                    </div>
                  </div>
                </div>

              </section>
            )}

            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 mt-4"
              aria-busy={isGenerating}
              aria-live="polite"
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" aria-hidden="true"></div>
                  <span>Új Kód Generálása...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Code2 className="w-4 h-4" aria-hidden="true" />
                  <span>Új Kód Generálása</span>
                </div>
              )}
            </Button>

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" role="alert" aria-live="assertive">
                {errorMessage}
              </div>
            )}

          </div>

        </CardContent>
      </Card>

      {/* Generált Komponensek */}
      {generatedComponents.length > 0 && (
        <div className="space-y-6">

          {/* Komponens Választó */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <FileCode className="w-5 h-5" aria-hidden="true" />
                  <span>Generált Komponensek ({generatedComponents.length})</span>
                </CardTitle>
                {selectedComponent && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUseVirtualViewer(!useVirtualViewer)}
                      aria-pressed={useVirtualViewer}
                      aria-label={useVirtualViewer ? 'Egyszerű nézet bekapcsolása' : 'Nagy teljesítményű nézet bekapcsolása'}
                    >
                      <Maximize2 className="w-4 h-4 mr-2" aria-hidden="true" />
                      {useVirtualViewer ? 'Egyszerű nézet' : 'Nagy teljesítményű nézet'}
                    </Button>
                    <Button
                      onClick={handleDownloadAll}
                      variant="outline"
                      size="sm"
                      aria-label="Összes komponens letöltése"
                    >
                      <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                      Összes Letöltése
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
                {generatedComponents.map((component) => {
                  const totalSize = component.jsx.length + component.css.length + (component.typescript?.length || 0);
                  return (
                    <div
                      key={component.id}
                      onClick={() => setSelectedComponent(component)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedComponent?.id === component.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      role="listitem"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedComponent(component);
                          e.preventDefault();
                        }
                      }}
                      aria-selected={selectedComponent?.id === component.id}
                      aria-label={`Komponens: ${component.name}, típusa: ${component.metadata.componentType}, pontosság: ${component.metadata.estimatedAccuracy} százalék`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{component.name}</h4>
                        <Badge variant="outline">{component.metadata.componentType}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        Pontosság: {component.metadata.estimatedAccuracy}%
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            component.accessibility.score >= 80 ? 'bg-green-500' : 
                            component.accessibility.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} aria-hidden="true"></div>
                          <span className="text-xs text-gray-500">
                            WCAG {component.accessibility.wcagCompliance}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {getCodeSize(component.jsx + component.css + (component.typescript || ''))}
                          </Badge>
                          {(customCode.jsx || customCode.css || customCode.cssAdvanced) && (
                            <Badge variant="secondary" className="text-xs">
                              <Plus className="w-3 h-3 mr-1" aria-hidden="true" />
                              Egyéni
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Kiválasztott Komponens Részletei */}
          {selectedComponent && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" aria-hidden="true" />
                    <span>{selectedComponent.name}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {selectedComponent.metadata.complexity}
                    </Badge>
                    <Badge variant="outline">
                      {selectedComponent.metadata.estimatedAccuracy}% pontosság
                    </Badge>
                    {(customCode.jsx || customCode.css || customCode.cssAdvanced) && (
                      <Badge variant="default" className="bg-green-600">
                        <Plus className="w-3 h-3 mr-1" aria-hidden="true" />
                        Egyéni kóddal
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Minőségi Jelentés */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg" role="region" aria-label="Minőségi mutatók">
                  <h4 className="font-semibold mb-3">Minőségi Mutatók</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Accessibility</span>
                        <span className="text-sm font-medium">{selectedComponent.accessibility.score}%</span>
                      </div>
                      <Progress value={selectedComponent.accessibility.score} className="h-2" aria-valuenow={selectedComponent.accessibility.score} aria-valuemin={0} aria-valuemax={100} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Vizuális Pontosság</span>
                        <span className="text-sm font-medium">{selectedComponent.metadata.estimatedAccuracy}%</span>
                      </div>
                      <Progress value={selectedComponent.metadata.estimatedAccuracy} className="h-2" aria-valuenow={selectedComponent.metadata.estimatedAccuracy} aria-valuemin={0} aria-valuemax={100} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Responsive</span>
                        <span className="text-sm font-medium">
                          {selectedComponent.responsive.hasResponsiveDesign ? '100%' : '0%'}
                        </span>
                      </div>
                      <Progress 
                        value={selectedComponent.responsive.hasResponsiveDesign ? 100 : 0} 
                        className="h-2" 
                        aria-valuenow={selectedComponent.responsive.hasResponsiveDesign ? 100 : 0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                </div>

                {/* Kód Megjelenítés */}
                <Tabs 
                  value={activeTab} 
                  onValueChange={setActiveTab} 
                  aria-label="Kód megjelenítési tabok"
                >
                  <div className="flex items-center justify-between mb-4">
                    <TabsList>
                      <TabsTrigger value="jsx" aria-selected={activeTab === 'jsx'}>
                        {options.typescript ? 'TSX' : 'JSX'}
                      </TabsTrigger>
                      <TabsTrigger value="css" aria-selected={activeTab === 'css'}>
                        CSS
                      </TabsTrigger>
                      {options.typescript && (
                        <TabsTrigger value="typescript" aria-selected={activeTab === 'typescript'}>
                          Types
                        </TabsTrigger>
                      )}
                    </TabsList>

                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs" aria-live="polite" aria-atomic="true">
                        {getCodeSize(getCurrentContent())}
                      </Badge>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(getCurrentContent(), activeTab)}
                        aria-label={`Másolás a vágólapra (${activeTab} kód)`}
                      >
                        <Copy className="w-4 h-4 mr-1" aria-hidden="true" />
                        {copied === activeTab ? 'Másolva!' : 'Másolás'}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(getCurrentContent(), getCurrentFilename())}
                        aria-label={`Letöltés fájlként (${activeTab} kód)`}
                      >
                        <Download className="w-4 h-4 mr-1" aria-hidden="true" />
                        Letöltés
                      </Button>
                    </div>
                  </div>

                  <TabsContent value="jsx">
                    <CodeViewerTab
                      code={selectedComponent.jsx}
                      language={getLanguageForViewer('jsx')}
                      filename={getCurrentFilename()}
                      onCopy={() => setCopied('jsx')}
                      onDownload={() => handleDownload(selectedComponent.jsx, getCurrentFilename())}
                      useVirtualViewer={useVirtualViewer}
                    />
                  </TabsContent>

                  <TabsContent value="css">
                    <CodeViewerTab
                      code={selectedComponent.css}
                      language="css"
                      filename={getCurrentFilename()}
                      onCopy={() => setCopied('css')}
                      onDownload={() => handleDownload(selectedComponent.css, getCurrentFilename())}
                      useVirtualViewer={useVirtualViewer}
                    />
                  </TabsContent>

                  {options.typescript && selectedComponent.typescript && (
                    <TabsContent value="typescript">
                      <CodeViewerTab
                        code={selectedComponent.typescript}
                        language="typescript"
                        filename={getCurrentFilename()}
                        onCopy={() => setCopied('typescript')}
                        onDownload={() => handleDownload(selectedComponent.typescript!, getCurrentFilename())}
                        useVirtualViewer={useVirtualViewer}
                      />
                    </TabsContent>
                  )}

                </Tabs>

                {/* Accessibility Figyelmeztetések */}
                {selectedComponent.accessibility.issues.length > 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg" role="alert" aria-live="assertive">
                    <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" aria-hidden="true" />
                      Accessibility Problémák
                    </h4>
                    <div className="space-y-2">
                      {selectedComponent.accessibility.issues.map((issue, index) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium text-yellow-800">{issue.message}</div>
                          <div className="text-yellow-700">Javítás: {issue.fix}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Javaslatok */}
                {selectedComponent.accessibility.suggestions.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg" role="note" aria-live="polite">
                    <h4 className="font-semibold text-blue-800 mb-2">Javaslatok</h4>
                    <ul className="space-y-1">
                      {selectedComponent.accessibility.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-blue-700 flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" aria-hidden="true" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </CardContent>
            </Card>
          )}

        </div>
      )}

    </div>
  );
}