import React, { useState, useEffect, useRef } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Maximize2 } from 'lucide-react';
import { GeneratedComponent } from '@/types/figma';
import { VirtualCodeViewer } from '@/components/VirtualCodeViewer';
import { copyToClipboard, downloadFile } from '@/lib/utils';

// Prism.js szintaxiskiemelés egyszerű nézethez
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // vagy bármilyen más téma

interface CodePreviewProps {
  component: GeneratedComponent;
  virtualViewerThresholdKB?: number; // 4. pont: konfigurálható küszöb (KB)
}

// 3. pont: copied állapot objektumban tárolva tabonként
type CopiedState = {
  [key: string]: boolean;
};

export function CodePreview({ component, virtualViewerThresholdKB = 8 }: CodePreviewProps) {
  const [activeTab, setActiveTab] = useState('jsx');
  const [copied, setCopied] = useState<CopiedState>({});
  const [useVirtualViewer, setUseVirtualViewer] = useState(true);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 2. pont: Másolás visszajelzés kezelése timeout-tal, resetelhető
  const handleCopy = async (content: string, type: string) => {
    try {
      await copyToClipboard(content);
      setCopied(prev => ({ ...prev, [type]: true }));
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Nem sikerült a másolás. Kérlek próbáld újra.'); // 5. pont: felhasználói visszajelzés hiba esetén
    }
  };

  // 1. pont: onDownload callback implementálása VirtualCodeViewer számára
  const handleDownload = (content: string, filename: string) => {
    downloadFile(content, filename);
  };

  const getFileExtension = (type: string) => {
    switch (type) {
      case 'jsx':
        return component.typescript ? '.tsx' : '.jsx';
      case 'css':
        return '.css';
      case 'typescript':
        return '.d.ts';
      default:
        return '.txt';
    }
  };

  const getLanguageForViewer = (type: string) => {
    switch (type) {
      case 'jsx':
        return component.typescript ? 'tsx' : 'jsx';
      case 'css':
        return 'css';
      case 'typescript':
        return 'typescript';
      default:
        return 'text';
    }
  };

  const getCurrentContent = () => {
    switch (activeTab) {
      case 'jsx':
        return component.jsx || '';
      case 'css':
        return component.css || '';
      case 'typescript':
        return component.typescript || '';
      default:
        return '';
    }
  };

  const getCurrentFilename = () => {
    return `${component.name || 'component'}${getFileExtension(activeTab)}`;
  };

  const getCodeSize = (content: string) => {
    const size = new Blob([content]).size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 4. pont: konfigurálható küszöb alapján virtuális nézet automatikus bekapcsolása
  useEffect(() => {
    const totalSize =
      (component.jsx?.length || 0) +
      (component.css?.length || 0) +
      (component.typescript?.length || 0);
    setUseVirtualViewer(totalSize > virtualViewerThresholdKB * 1024);
  }, [component, virtualViewerThresholdKB]);

  // 6. pont: Prism.js szintaxiskiemelés egyszerű nézetben
  useEffect(() => {
    if (!useVirtualViewer) {
      Prism.highlightAll();
    }
  }, [activeTab, useVirtualViewer, getCurrentContent()]);

  // 7. pont: Accessibility (ARIA attribútumok)
  // Például a TabsTrigger komponensbe érdemes aria-selected, role="tab" attribútumokat adni,
  // feltételezve, hogy a Tabs komponense nem kezeli ezt automatikusan.
  // Ha a használt UI komponensek nem támogatják, akkor itt lehetne bővíteni, de feltételezem, hogy támogatott.

  return (
    <div className="border-t border-gray-200" role="region" aria-label="Kód előnézet">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
          <TabsList role="tablist">
            <TabsTrigger
              value="jsx"
              role="tab"
              aria-selected={activeTab === 'jsx'}
              tabIndex={activeTab === 'jsx' ? 0 : -1}
            >
              {component.typescript ? 'TSX' : 'JSX'}
            </TabsTrigger>
            <TabsTrigger
              value="css"
              role="tab"
              aria-selected={activeTab === 'css'}
              tabIndex={activeTab === 'css' ? 0 : -1}
            >
              CSS
            </TabsTrigger>
            {component.typescript && (
              <TabsTrigger
                value="typescript"
                role="tab"
                aria-selected={activeTab === 'typescript'}
                tabIndex={activeTab === 'typescript' ? 0 : -1}
              >
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
              onClick={() => setUseVirtualViewer(!useVirtualViewer)}
              aria-pressed={useVirtualViewer}
              aria-label={
                useVirtualViewer
                  ? 'Egyszerű nézet bekapcsolása'
                  : 'Nagy teljesítményű nézet bekapcsolása'
              }
            >
              <Maximize2 className="w-4 h-4 mr-1" />
              {useVirtualViewer ? 'Egyszerű' : 'Nagy teljesítményű'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(getCurrentContent(), activeTab)}
              aria-live="polite"
              aria-atomic="true"
              aria-label={`Kód másolása ${activeTab} tabról`}
            >
              <Copy className="w-4 h-4 mr-1" />
              {copied[activeTab] ? 'Másolva!' : 'Másolás'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(getCurrentContent(), getCurrentFilename())}
              aria-label={`Kód letöltése fájlként: ${getCurrentFilename()}`}
            >
              <Download className="w-4 h-4 mr-1" />
              Letöltés
            </Button>
          </div>
        </div>

        <TabsContent value="jsx" className="p-0" role="tabpanel" aria-labelledby="jsx-tab">
          {useVirtualViewer ? (
            <VirtualCodeViewer
              code={component.jsx || ''}
              language={getLanguageForViewer('jsx')}
              filename={getCurrentFilename()}
              onCopy={() => handleCopy(component.jsx || '', 'jsx')}
              onDownload={() => handleDownload(component.jsx || '', getCurrentFilename())}
              maxHeight={400}
              showLineNumbers={true}
            />
          ) : (
            <div className="max-h-96 overflow-auto">
              <pre
                className="p-4 text-sm font-mono bg-gray-900 text-gray-100 language-jsx"
                aria-label="JSX kód"
              >
                <code className="language-jsx">{component.jsx || ''}</code>
              </pre>
            </div>
          )}
        </TabsContent>

        <TabsContent value="css" className="p-0" role="tabpanel" aria-labelledby="css-tab">
          {useVirtualViewer ? (
            <VirtualCodeViewer
              code={component.css || ''}
              language="css"
              filename={getCurrentFilename()}
              onCopy={() => handleCopy(component.css || '', 'css')}
              onDownload={() => handleDownload(component.css || '', getCurrentFilename())}
              maxHeight={400}
              showLineNumbers={true}
            />
          ) : (
            <div className="max-h-96 overflow-auto">
              <pre
                className="p-4 text-sm font-mono bg-gray-900 text-gray-100 language-css"
                aria-label="CSS kód"
              >
                <code className="language-css">{component.css || ''}</code>
              </pre>
            </div>
          )}
        </TabsContent>

        {component.typescript && (
          <TabsContent
            value="typescript"
            className="p-0"
            role="tabpanel"
            aria-labelledby="typescript-tab"
          >
            {useVirtualViewer ? (
              <VirtualCodeViewer
                code={component.typescript || ''}
                language="typescript"
                filename={getCurrentFilename()}
                onCopy={() => handleCopy(component.typescript || '', 'typescript')}
                onDownload={() =>
                  handleDownload(component.typescript || '', getCurrentFilename())
                }
                maxHeight={400}
                showLineNumbers={true}
              />
            ) : (
              <div className="max-h-96 overflow-auto">
                <pre
                  className="p-4 text-sm font-mono bg-gray-900 text-gray-100 language-typescript"
                  aria-label="Typescript definíció"
                >
                  <code className="language-typescript">{component.typescript || ''}</code>
                </pre>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}