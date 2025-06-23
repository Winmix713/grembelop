import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Copy, 
  Download, 
  Search, 
  ChevronUp, 
  ChevronDown, 
  Maximize2, 
  Minimize2,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VirtualCodeViewerProps {
  code: string;
  language: string;
  filename: string;
  onCopy?: () => void;
  onDownload?: () => void;
  maxHeight?: number;
  showLineNumbers?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
  fontSize?: 'sm' | 'base' | 'lg';
  enableSearch?: boolean;
  enableVirtualization?: boolean;
  virtualizationThreshold?: number;
}

interface CodeLine {
  number: number;
  content: string;
  highlighted?: boolean;
}

interface SearchMatch {
  lineIndex: number;
  startIndex: number;
  endIndex: number;
}

// Language configuration interfaces
interface BaseLanguageConfig {
  keywords: string[];
}

interface ProgrammingLanguageConfig extends BaseLanguageConfig {
  types: string[];
  operators: string[];
}

interface CSSLanguageConfig extends BaseLanguageConfig {
  properties: string[];
  values: string[];
}

type LanguageConfig = ProgrammingLanguageConfig | CSSLanguageConfig;

// Utility function for escaping HTML
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Advanced syntax highlighter with professional-grade features
class SyntaxHighlighter {
  private static readonly LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
    javascript: {
      keywords: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'extends', 'import', 'export', 'default', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super'],
      types: ['string', 'number', 'boolean', 'object', 'array', 'null', 'undefined'],
      operators: ['+', '-', '*', '/', '=', '==', '===', '!=', '!==', '<', '>', '<=', '>=', '&&', '||', '!']
    },
    typescript: {
      keywords: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'extends', 'import', 'export', 'default', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'interface', 'type', 'enum', 'namespace', 'declare'],
      types: ['string', 'number', 'boolean', 'object', 'array', 'null', 'undefined', 'any', 'void', 'never', 'unknown'],
      operators: ['+', '-', '*', '/', '=', '==', '===', '!=', '!==', '<', '>', '<=', '>=', '&&', '||', '!', '?', ':']
    },
    jsx: {
      keywords: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'extends', 'import', 'export', 'default', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super'],
      types: ['string', 'number', 'boolean', 'object', 'array', 'null', 'undefined'],
      operators: ['+', '-', '*', '/', '=', '==', '===', '!=', '!==', '<', '>', '<=', '>=', '&&', '||', '!']
    },
    css: {
      keywords: ['@media', '@import', '@keyframes', '@font-face', '!important'],
      properties: ['color', 'background', 'font-size', 'margin', 'padding', 'border', 'width', 'height', 'display', 'position', 'top', 'left', 'right', 'bottom'],
      values: ['auto', 'inherit', 'initial', 'none', 'block', 'inline', 'flex', 'grid', 'absolute', 'relative', 'fixed']
    }
  };

  static highlight(content: string, language: string): string {
    const config = this.LANGUAGE_CONFIGS[language];
    if (!config) return escapeHtml(content);

    let highlighted = escapeHtml(content);

    // Highlight types if available (for programming languages)
    if ('types' in config) {
      config.types.forEach((type: string) => {
        const regex = new RegExp(`\\b${type}\\b`, 'g');
        highlighted = highlighted.replace(regex, `<span class="syntax-type">${type}</span>`);
      });
    }

    // Highlight keywords
    config.keywords.forEach((keyword: string) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="syntax-keyword">${keyword}</span>`);
    });

    // Highlight strings
    highlighted = highlighted.replace(
      /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
      '<span class="syntax-string">$1$2$1</span>'
    );

    // Highlight comments
    highlighted = highlighted.replace(
      /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
      '<span class="syntax-comment">$1</span>'
    );

    // Highlight numbers
    highlighted = highlighted.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span class="syntax-number">$1</span>'
    );

    // CSS-specific highlighting
    if (language === 'css' && 'properties' in config) {
      // Highlight properties
      config.properties.forEach((prop: string) => {
        const regex = new RegExp(`\\b${prop}\\b(?=\\s*:)`, 'g');
        highlighted = highlighted.replace(regex, `<span class="syntax-property">${prop}</span>`);
      });

      // Highlight values
      config.values.forEach((value: string) => {
        const regex = new RegExp(`\\b${value}\\b`, 'g');
        highlighted = highlighted.replace(regex, `<span class="syntax-value">${value}</span>`);
      });
    }

    return highlighted;
  }
}

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Advanced search functionality
function useSearch(lines: CodeLine[], searchTerm: string) {
  return useMemo(() => {
    if (!searchTerm.trim()) return [];

    const matches: SearchMatch[] = [];
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    lines.forEach((line, lineIndex) => {
      let match;
      while ((match = regex.exec(line.content)) !== null) {
        matches.push({
          lineIndex,
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });
      }
    });

    return matches;
  }, [lines, searchTerm]);
}

export function VirtualCodeViewer({
  code,
  language,
  filename,
  onCopy,
  onDownload,
  maxHeight = 600,
  showLineNumbers = true,
  className,
  theme = 'light',
  fontSize = 'base',
  enableSearch = true,
  enableVirtualization = true,
  virtualizationThreshold = 1000
}: VirtualCodeViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [customTheme, setCustomTheme] = useState(theme);
  const [customFontSize, setCustomFontSize] = useState(fontSize);
  const [enableLineNumbers, setEnableLineNumbers] = useState(showLineNumbers);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Parse code into lines
  const lines = useMemo((): CodeLine[] => {
    return code.split('\n').map((content, index) => ({
      number: index + 1,
      content,
      highlighted: false
    }));
  }, [code]);

  // Search functionality
  const searchMatches = useSearch(lines, debouncedSearchTerm);
  
  // Virtualization logic
  const shouldVirtualize = enableVirtualization && lines.length > virtualizationThreshold;
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: shouldVirtualize ? 50 : lines.length });

  // Copy functionality
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      onCopy?.();
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }, [code, onCopy]);

  // Download functionality
  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onDownload?.();
  }, [code, filename, onDownload]);

  // Search navigation
  const navigateSearch = useCallback((direction: 'next' | 'prev') => {
    if (searchMatches.length === 0) return;

    const newIndex = direction === 'next' 
      ? (currentSearchIndex + 1) % searchMatches.length
      : (currentSearchIndex - 1 + searchMatches.length) % searchMatches.length;

    setCurrentSearchIndex(newIndex);

    // Scroll to the search result
    const match = searchMatches[newIndex];
    if (scrollableRef.current && match) {
      const lineElement = scrollableRef.current.querySelector(`[data-line="${match.lineIndex}"]`);
      if (lineElement) {
        lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [searchMatches, currentSearchIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'c':
            if (e.target === containerRef.current || containerRef.current?.contains(e.target as Node)) {
              e.preventDefault();
              handleCopy();
            }
            break;
          case 'f':
            if (e.target === containerRef.current || containerRef.current?.contains(e.target as Node)) {
              e.preventDefault();
              const searchInput = containerRef.current?.querySelector('input[type="text"]') as HTMLInputElement;
              searchInput?.focus();
            }
            break;
        }
      }

      if (searchTerm && searchMatches.length > 0) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            navigateSearch(e.shiftKey ? 'prev' : 'next');
            break;
          case 'Escape':
            setSearchTerm('');
            setCurrentSearchIndex(0);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleCopy, searchTerm, searchMatches.length, navigateSearch]);

  // Render line with syntax highlighting and search highlights
  const renderLine = useCallback((line: CodeLine, index: number) => {
    let content = SyntaxHighlighter.highlight(line.content, language);
    
    // Apply search highlighting
    if (debouncedSearchTerm) {
      const regex = new RegExp(`(${debouncedSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      content = content.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    return (
      <div
        key={line.number}
        data-line={index}
        className={cn(
          "flex items-start gap-3 px-4 py-1 hover:bg-muted/50 transition-colors",
          line.highlighted && "bg-blue-50 dark:bg-blue-900/20"
        )}
      >
        {enableLineNumbers && (
          <span className="select-none text-muted-foreground text-right w-8 flex-shrink-0 font-mono text-sm">
            {line.number}
          </span>
        )}
        <div
          className={cn(
            "flex-1 font-mono whitespace-pre-wrap break-all",
            customFontSize === 'sm' && "text-sm",
            customFontSize === 'base' && "text-base",
            customFontSize === 'lg' && "text-lg"
          )}
          dangerouslySetInnerHTML={{ __html: content || '&nbsp;' }}
        />
      </div>
    );
  }, [language, debouncedSearchTerm, enableLineNumbers, customFontSize]);

  const displayedLines = shouldVirtualize 
    ? lines.slice(visibleRange.start, visibleRange.end)
    : lines;

  return (
    <Card 
      ref={containerRef}
      className={cn(
        "w-full overflow-hidden",
        customTheme === 'dark' && "dark",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="font-mono text-xs">
            {language.toUpperCase()}
          </Badge>
          <span className="text-sm font-medium truncate">{filename}</span>
          <Badge variant="outline" className="text-xs">
            {lines.length} lines
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {enableSearch && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 w-48"
                />
              </div>
              {searchMatches.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {currentSearchIndex + 1} of {searchMatches.length}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigateSearch('prev')}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigateSearch('next')}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          <Separator orientation="vertical" className="h-6" />

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
            className="h-8 w-8 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-8 w-8 p-0"
          >
            <Copy className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            className="h-8 w-8 p-0"
          >
            <Download className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b bg-muted/20">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Theme</label>
              <select
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value as 'light' | 'dark')}
                className="w-full mt-1 px-2 py-1 text-sm border rounded"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Font Size</label>
              <select
                value={customFontSize}
                onChange={(e) => setCustomFontSize(e.target.value as 'sm' | 'base' | 'lg')}
                className="w-full mt-1 px-2 py-1 text-sm border rounded"
              >
                <option value="sm">Small</option>
                <option value="base">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enableLineNumbers}
                onChange={(e) => setEnableLineNumbers(e.target.checked)}
                className="rounded"
              />
              <label className="text-sm font-medium">Line Numbers</label>
            </div>
          </div>
        </div>
      )}

      {/* Code Content */}
      <CardContent className="p-0">
        <div
          ref={scrollableRef}
          className={cn(
            "overflow-auto",
            !isExpanded && `max-h-[${maxHeight}px]`
          )}
          style={{ maxHeight: isExpanded ? 'none' : `${maxHeight}px` }}
        >
          <div className="min-h-full">
            {displayedLines.map((line, index) => 
              renderLine(line, shouldVirtualize ? visibleRange.start + index : index)
            )}
            
            {shouldVirtualize && visibleRange.end < lines.length && (
              <div className="p-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setVisibleRange(prev => ({
                    ...prev,
                    end: Math.min(prev.end + 50, lines.length)
                  }))}
                >
                  Load More Lines ({lines.length - visibleRange.end} remaining)
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>


    </Card>
  );
}