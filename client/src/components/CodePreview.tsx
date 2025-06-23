
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Eye, Code, Smartphone, Tablet, Monitor } from 'lucide-react';
import { GeneratedComponent } from '@/types/figma-generator';

interface CodePreviewProps {
  components: GeneratedComponent[];
  selectedComponent?: GeneratedComponent;
  onComponentSelect?: (component: GeneratedComponent) => void;
}

export const CodePreview: React.FC<CodePreviewProps> = ({
  components,
  selectedComponent,
  onComponentSelect
}) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [viewportSize, setViewportSize] = useState('desktop');
  const [previewCode, setPreviewCode] = useState('');

  useEffect(() => {
    if (selectedComponent) {
      generatePreviewCode(selectedComponent);
    }
  }, [selectedComponent]);

  const generatePreviewCode = (component: GeneratedComponent) => {
    // Generate a complete preview with the component
    const previewTemplate = `
import React from 'react';
${component.jsx}

export default function Preview() {
  return (
    <div className="p-8 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Component Preview</h1>
        <div className="border rounded-lg p-6">
          <${component.name} />
        </div>
      </div>
    </div>
  );
}`;
    setPreviewCode(previewTemplate);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getViewportClass = () => {
    switch (viewportSize) {
      case 'mobile': return 'max-w-sm';
      case 'tablet': return 'max-w-md';
      default: return 'max-w-full';
    }
  };

  if (!selectedComponent) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">No Component Selected</h3>
        <p className="text-muted-foreground">
          Select a component from the list to see the live preview and code.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Component Selector */}
      <div className="flex gap-2 flex-wrap">
        {components.map((component) => (
          <Button
            key={component.id}
            variant={selectedComponent.id === component.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onComponentSelect?.(component)}
          >
            {component.name}
          </Button>
        ))}
      </div>

      {/* Main Preview Area */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between p-4 border-b">
            <TabsList>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="jsx" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                JSX
              </TabsTrigger>
              <TabsTrigger value="css" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                CSS
              </TabsTrigger>
              {selectedComponent.typescript && (
                <TabsTrigger value="typescript" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Types
                </TabsTrigger>
              )}
            </TabsList>

            {/* Viewport Controls */}
            {activeTab === 'preview' && (
              <div className="flex items-center gap-2">
                <Button
                  variant={viewportSize === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewportSize('mobile')}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewportSize === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewportSize('tablet')}
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewportSize === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewportSize('desktop')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="preview" className="p-0">
            <div className={`mx-auto transition-all duration-300 ${getViewportClass()}`}>
              <div className="p-8 bg-background border-x min-h-[400px]">
                {/* Live Preview Area */}
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Component: {selectedComponent.name}
                  </div>
                  
                  {/* Render component preview */}
                  <div 
                    className="border rounded-lg p-6 bg-card"
                    dangerouslySetInnerHTML={{ 
                      __html: `<div class="${selectedComponent.name.toLowerCase()}">Preview of ${selectedComponent.name}</div>` 
                    }}
                  />
                  
                  {/* Accessibility Score */}
                  <div className="flex items-center gap-2 text-sm">
                    <span>Accessibility Score:</span>
                    <span className={`font-semibold ${
                      selectedComponent.accessibility.score >= 90 ? 'text-green-600' : 
                      selectedComponent.accessibility.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {selectedComponent.accessibility.score}/100
                    </span>
                    <span className="text-muted-foreground">
                      (WCAG {selectedComponent.accessibility.wcagCompliance})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="jsx" className="p-0">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 z-10"
                onClick={() => copyToClipboard(selectedComponent.jsx)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <pre className="p-6 text-sm overflow-auto max-h-[600px] bg-muted">
                <code>{selectedComponent.jsx}</code>
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="css" className="p-0">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 z-10"
                onClick={() => copyToClipboard(selectedComponent.css)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <pre className="p-6 text-sm overflow-auto max-h-[600px] bg-muted">
                <code>{selectedComponent.css}</code>
              </pre>
            </div>
          </TabsContent>

          {selectedComponent.typescript && (
            <TabsContent value="typescript" className="p-0">
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-4 right-4 z-10"
                  onClick={() => copyToClipboard(selectedComponent.typescript)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <pre className="p-6 text-sm overflow-auto max-h-[600px] bg-muted">
                  <code>{selectedComponent.typescript}</code>
                </pre>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </Card>

      {/* Component Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Metadata</h4>
          <div className="space-y-1 text-sm">
            <div>Type: {selectedComponent.metadata.componentType}</div>
            <div>Complexity: {selectedComponent.metadata.complexity}</div>
            <div>Accuracy: {selectedComponent.metadata.estimatedAccuracy}%</div>
            <div>Generation: {selectedComponent.metadata.generationTime}ms</div>
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-semibold mb-2">Accessibility</h4>
          <div className="space-y-1 text-sm">
            <div>Score: {selectedComponent.accessibility.score}/100</div>
            <div>WCAG: {selectedComponent.accessibility.wcagCompliance}</div>
            <div>Issues: {selectedComponent.accessibility.issues.length}</div>
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-semibold mb-2">Dependencies</h4>
          <div className="space-y-1 text-sm">
            {selectedComponent.metadata.dependencies.map((dep, index) => (
              <div key={index} className="font-mono">{dep}</div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
