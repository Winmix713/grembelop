import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Download, ExternalLink } from "lucide-react";

interface GeneratedComponent {
  id: string;
  name: string;
  jsx: string;
  css: string;
  typescript?: string;
  vue?: string;
  html?: string;
  metadata: {
    complexity: string;
    estimatedAccuracy: number;
    dependencies: string[];
    suggestedProps: Array<{
      name: string;
      type: string;
      required: boolean;
      description?: string;
    }>;
  };
}

interface CodePreviewProps {
  component: GeneratedComponent;
  framework: 'react' | 'vue' | 'html';
}

export function CodePreview({ component, framework }: CodePreviewProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(type);
      setTimeout(() => setCopiedCode(null), 2000);
      toast({
        title: "Copied to clipboard",
        description: `${type} code has been copied`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: `${filename} has been downloaded`,
    });
  };

  const getMainCode = () => {
    switch (framework) {
      case 'react':
        return component.jsx;
      case 'vue':
        return component.vue || component.jsx;
      case 'html':
        return component.html || component.jsx;
      default:
        return component.jsx;
    }
  };

  const getMainExtension = () => {
    switch (framework) {
      case 'react':
        return component.typescript ? '.tsx' : '.jsx';
      case 'vue':
        return '.vue';
      case 'html':
        return '.html';
      default:
        return '.jsx';
    }
  };

  const CodeBlock = ({ code, type, language = 'javascript' }: { 
    code: string; 
    type: string; 
    language?: string;
  }) => (
    <div className="relative">
      <div className="flex items-center justify-between p-2 bg-muted/50 border-b">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {language}
          </Badge>
          <span className="text-sm font-medium">{type}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(code, type)}
            className="h-8 w-8 p-0"
          >
            {copiedCode === type ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const extension = type === 'CSS' ? '.css' : 
                              type === 'TypeScript' ? '.ts' :
                              getMainExtension();
              downloadFile(code, `${component.name}${extension}`, 'text/plain');
            }}
            className="h-8 w-8 p-0"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[400px]">
        <pre className="p-4 text-sm overflow-x-auto">
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </ScrollArea>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Component Info */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{component.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              {component.metadata.complexity} complexity
            </Badge>
            <Badge variant="outline" className="text-xs">
              {component.metadata.estimatedAccuracy}% accuracy
            </Badge>
            {(component.metadata.dependencies?.length || 0) > 0 && (
              <Badge variant="outline" className="text-xs">
                {component.metadata.dependencies?.length || 0} dependencies
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const allCode = [
                `// ${component.name} Component`,
                '',
                getMainCode(),
                '',
                '/* Styles */',
                component.css,
                component.typescript ? `\n/* TypeScript Types */\n${component.typescript}` : ''
              ].filter(Boolean).join('\n');
              
              downloadFile(allCode, `${component.name}-complete.txt`, 'text/plain');
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
        </div>
      </div>

      {/* Dependencies */}
      {(component.metadata.dependencies?.length || 0) > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Required Dependencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(component.metadata.dependencies || []).map((dep) => (
                <Badge key={dep} variant="secondary" className="text-xs">
                  {dep}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Props Interface */}
      {(component.metadata.suggestedProps?.length || 0) > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Component Props</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(component.metadata.suggestedProps || []).map((prop) => (
                <div key={prop.name} className="flex items-start justify-between py-2 border-b last:border-b-0">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {prop.name}
                      </code>
                      <Badge variant={prop.required ? "destructive" : "secondary"} className="text-xs">
                        {prop.required ? 'required' : 'optional'}
                      </Badge>
                    </div>
                    {prop.description && (
                      <p className="text-sm text-muted-foreground">{prop.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {prop.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Code Tabs */}
      <Card>
        <Tabs defaultValue="main" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="main">
              {framework === 'react' ? 'React' : 
               framework === 'vue' ? 'Vue' : 'HTML'}
            </TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
            {component.typescript && (
              <TabsTrigger value="typescript">TypeScript</TabsTrigger>
            )}
            <TabsTrigger value="all">All Files</TabsTrigger>
          </TabsList>
          
          <TabsContent value="main">
            <CodeBlock
              code={getMainCode()}
              type={`${framework.toUpperCase()} Component`}
              language={framework === 'html' ? 'html' : 'javascript'}
            />
          </TabsContent>
          
          <TabsContent value="css">
            <CodeBlock
              code={component.css}
              type="CSS Styles"
              language="css"
            />
          </TabsContent>
          
          {component.typescript && (
            <TabsContent value="typescript">
              <CodeBlock
                code={component.typescript}
                type="TypeScript Types"
                language="typescript"
              />
            </TabsContent>
          )}
          
          <TabsContent value="all">
            <div className="space-y-4">
              <CodeBlock
                code={getMainCode()}
                type={`${framework.toUpperCase()} Component`}
                language={framework === 'html' ? 'html' : 'javascript'}
              />
              <CodeBlock
                code={component.css}
                type="CSS Styles"
                language="css"
              />
              {component.typescript && (
                <CodeBlock
                  code={component.typescript}
                  type="TypeScript Types"
                  language="typescript"
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
