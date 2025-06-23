import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from './ui/button';
import { Copy, Download, Search, ChevronUp, ChevronDown, Maximize2, Minimize2, AlertTriangle } from 'lucide-react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

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

const ITEM_HEIGHT = 24;
const BUFFER_SIZE = 10;

// Biztonságos HTML escape függvény
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Fejlesztett szintaxis kiemelő - moduláris és bővíthető
class SyntaxHighlighter {
  private static readonly LANGUAGE_CONFIGS = {
    javascript: {
      keywords: ['import', 'export', 'from', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'try', 'catch', 'finally', 'class', 'extends', 'async', 'await'],
      types: ['string', 'number', 'boolean', 'object', 'undefined', 'null'],
      operators: ['===', '!==', '==', '!=', '>=', '<=', '>', '<', '&&', '||', '!', '+', '-', '*', '/', '%'],
    },
    typescript: {
      keywords: ['import', 'export', 'from', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'try', 'catch', 'finally', 'class', 'extends', 'interface', 'type', 'enum', 'async', 'await'],
      types: ['string', 'number', 'boolean', 'object', 'undefined', 'null', 'any', 'void', 'never'],
      operators: ['===', '!==', '==', '!=', '>=', '<=', '>', '<', '&&', '||', '!', '+', '-', '*', '/', '%'],
    },
    jsx: {
      keywords: ['import', 'export', 'from', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'try', 'catch', 'finally', 'class', 'extends'],
      types: ['string', 'number', 'boolean', 'object', 'undefined', 'null'],
      operators: ['===', '!==', '==', '!=', '>=', '<=', '>', '<', '&&', '||', '!', '+', '-', '*', '/', '%'],
    },
    tsx: {
      keywords: ['import', 'export', 'from', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'try', 'catch', 'finally', 'class', 'extends', 'interface', 'type', 'enum'],
      types: ['string', 'number', 'boolean', 'object', 'undefined', 'null', 'any', 'void', 'never'],
      operators: ['===', '!==', '==', '!=', '>=', '<=', '>', '<', '&&', '||', '!', '+', '-', '*', '/', '%'],
    },
    css: {
      keywords: ['@import', '@media', '@keyframes', '@supports', '@charset'],
      properties: ['color', 'background', 'margin', 'padding', 'border', 'font-size', 'display', 'position', 'width', 'height'],
      values: ['auto', 'none', 'inherit', 'initial', 'unset'],
    },
  };

  static highlight(content: string, language: string): string {
    if (!content.trim()) return escapeHtml(content);

    let highlighted = escapeHtml(content);
    const config = this.LANGUAGE_CONFIGS[language as keyof typeof this.LANGUAGE_CONFIGS];

    if (!config) return highlighted;

    // JavaScript/TypeScript/JSX/TSX szintaxis kiemelés
    if (['javascript', 'typescript', 'jsx', 'tsx'].includes(language)) {
      // Kulcsszavak
      config.keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        highlighted = highlighted.replace(regex, `<span class="text-blue-600 font-semibold">${keyword}</span>`);
      });

      // Típusok
      if (config.types) {
        config.types.forEach(type => {
          const regex = new RegExp(`\\b${type}\\b`, 'g');
          highlighted = highlighted.replace(regex, `<span class="text-purple-600">${type}</span>`);
        });
      }

      // Stringek (javított regex)
      highlighted = highlighted.replace(
        /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
        '<span class="text-green-600">$1$2$1</span>'
      );
      
      // Kommentek
      highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="text-gray-500 italic">$1</span>');
      highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500 italic">$1</span>');

      // Számok
      highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="text-orange-600">$1</span>');
    }

    // CSS szintaxis kiemelés
    if (language === 'css') {
      // Kulcsszavak (@rules)
      config.keywords.forEach(keyword => {
        const regex = new RegExp(`\\${keyword}\\b`, 'g');
        highlighted = highlighted.replace(regex, `<span class="text-purple-600 font-semibold">${keyword}</span>`);
      });

      // Tulajdonságok
      if (config.properties) {
        config.properties.forEach(prop => {
          const regex = new RegExp(`\\b${prop}(?=\\s*:)`, 'g');
          highlighted = highlighted.replace(regex, `<span class="text-blue-600">${prop}</span>`);
        });
      }
      
      // Értékek
      highlighted = highlighted.replace(/(:\s*)([^;{]+)/g, '$1<span class="text-green-600">$2</span>');
      
      // Szelektorok
      highlighted = highlighted.replace(/^([^{]+)({)/gm, '<span class="text-purple-600">$1</span>$2');

      // Kommentek
      highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500 italic">$1</span>');
    }

    return highlighted;
  }
}

// Debounce hook
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

// Keresési hook
function useSearch(lines: CodeLine[], searchTerm: string) {
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const searchMatches = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return [];
    
    const matches: SearchMatch[] = [];
    const searchRegex = new RegExp(debouncedSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    
    lines.forEach((line, lineIndex) => {
      let match;
      const regex = new RegExp(searchRegex);
      while ((match = regex.exec(line.content)) !== null) {
        matches.push({
          lineIndex,
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });
        if (regex.lastIndex === match.index) {
          regex.lastIndex++;
        }
      }
    });
    
    return matches;
  }, [lines, debouncedSearchTerm]);

  return { searchMatches, debouncedSearchTerm };
}

export function VirtualCodeViewer({
  code,
  language,
  filename,
  onCopy,
  onDownload,
  maxHeight = 400,
  showLineNumbers = true,
  className,
  theme = 'light',
  fontSize = 'sm',
  enableSearch = true,
  enableVirtualization = true,
  virtualizationThreshold = 1000,
}: VirtualCodeViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMatch, setCurrentMatch] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(maxHeight);
  const [error, setError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Kód sorokra bontása
  const lines = useMemo(() => {
    try {
      const codeLines = code.split('\n');
      return codeLines.map((content, index) => ({
        number: index + 1,
        content,
        highlighted: false
      }));
    } catch (err) {
      setError('Hiba történt a kód feldolgozása során');
      return [];
    }
  }, [code]);

  // Keresési funkció
  const { searchMatches, debouncedSearchTerm } = useSearch(lines, searchTerm);

  // Virtualizáció döntése
  const shouldUseVirtualization = enableVirtualization && lines.length > virtualizationThreshold;

  // Kiemelt sorok a keresés alapján
  const highlightedLines = useMemo(() => {
    return lines.map((line, index) => ({
      ...line,
      highlighted: searchMatches.some(match => match.lineIndex === index)
    }));
  }, [lines, searchMatches]);

  // Virtualizáció számítások
  const visibleRange = useMemo(() => {
    if (!shouldUseVirtualization) {
      return { startIndex: 0, endIndex: lines.length };
    }

    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const endIndex = Math.min(
      lines.length,
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, lines.length, shouldUseVirtualization]);

  // Látható sorok
  const visibleLines = useMemo(() => {
    return highlightedLines.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [highlightedLines, visibleRange]);

  // Scroll kezelés debounce-szal
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Keresés navigáció
  const navigateToMatch = useCallback((direction: 'next' | 'prev') => {
    if (searchMatches.length === 0) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = currentMatch >= searchMatches.length - 1 ? 0 : currentMatch + 1;
    } else {
      newIndex = currentMatch <= 0 ? searchMatches.length - 1 : currentMatch - 1;
    }
    
    setCurrentMatch(newIndex);
    
    // Scroll a találathoz animációval
    const match = searchMatches[newIndex];
    const targetScrollTop = match.lineIndex * ITEM_HEIGHT - containerHeight / 2;
    
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      });
    }
  }, [searchMatches, currentMatch, containerHeight]);

  // Sor renderelés
  const renderLine = useCallback((line: CodeLine, index: number) => {
    let content = line.content;
    
    // Keresési találatok kiemelése
    if (debouncedSearchTerm && searchMatches.length > 0) {
      const lineMatches = searchMatches.filter(match => 
        match.lineIndex === (shouldUseVirtualization ? visibleRange.startIndex + index : index)
      );
      
      if (lineMatches.length > 0) {
        // Hátrafelé dolgozunk, hogy az indexek ne változzanak
        lineMatches.reverse().forEach(match => {
          const before = content.slice(0, match.startIndex);
          const highlighted = content.slice(match.startIndex, match.endIndex);
          const after = content.slice(match.endIndex);
          
          content = before + `<mark class="bg-yellow-300 text-black px-1 rounded">${escapeHtml(highlighted)}</mark>` + after;
        });
      }
    }

    // Szintaxis kiemelés (csak ha nincs keresési találat)
    if (!debouncedSearchTerm) {
      content = SyntaxHighlighter.highlight(content, language);
    }

    const fontSizeClass = {
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg'
    }[fontSize];

    const themeClasses = theme === 'dark' 
      ? 'bg-gray-900 text-gray-100 hover:bg-gray-800' 
      : 'bg-white text-gray-900 hover:bg-gray-50';

    return (
      <div
        key={`${line.number}-${shouldUseVirtualization ? visibleRange.startIndex : 0}`}
        className={cn(
          "flex items-start font-mono leading-6 transition-colors",
          fontSizeClass,
          themeClasses,
          line.highlighted && (theme === 'dark' ? "bg-yellow-900/20" : "bg-yellow-50")
        )}
        style={{ height: ITEM_HEIGHT }}
        role="row"
        aria-label={`Sor ${line.number}: ${line.content}`}
      >
        {showLineNumbers && (
          <div className="flex-shrink-0 w-12 text-right text-gray-400 pr-4 select-none" role="rowheader">
            {line.number}
          </div>
        )}
        <div 
          className="flex-1 px-2 overflow-hidden"
          dangerouslySetInnerHTML={{ __html: content || '&nbsp;' }}
          role="cell"
        />
      </div>
    );
  }, [debouncedSearchTerm, searchMatches, visibleRange.startIndex, language, showLineNumbers, fontSize, theme, shouldUseVirtualization]);

  // Komponens méret figyelése
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerHeight(isExpanded ? window.innerHeight - rect.top - 100 : maxHeight);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isExpanded, maxHeight]);

  // Másolás funkció fejlesztett hibakezelésssel
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      onCopy?.();
    } catch (err) {
      // Fallback régi böngészőkhöz
      try {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        onCopy?.();
      } catch (fallbackErr) {
        setError('Nem sikerült a másolás. Kérlek, próbáld újra.');
        console.error('Copy failed:', fallbackErr);
      }
    }
  }, [code, onCopy]);

  // Letöltés funkció
  const handleDownload = useCallback(() => {
    try {
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onDownload?.();
    } catch (err) {
      setError('Nem sikerült a letöltés. Kérlek, próbáld újra.');
      console.error('Download failed:', err);
    }
  }, [code, filename, onDownload]);

  const totalHeight = shouldUseVirtualization ? lines.length * ITEM_HEIGHT : 'auto';
  const offsetY = shouldUseVirtualization ? visibleRange.startIndex * ITEM_HEIGHT : 0;

  const getCodeSize = (content: string) => {
    const size = new Blob([content]).size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (error) {
    return (
      <div className="border border-red-300 rounded-lg p-4 bg-red-50">
        <div className="flex items-center space-x-2 text-red-800">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Hiba történt</span>
        </div>
        <p className="text-red-700 mt-1">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setError(null)}
          className="mt-2"
        >
          Újrapróbálkozás
        </Button>
      </div>
    );
  }

  return (
    <div 
      className={cn("border border-gray-200 rounded-lg overflow-hidden", 
        theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white', 
        className
      )}
      role="region"
      aria-label={`Kódnéző: ${filename}`}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-3 border-b",
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      )}>
        <div className="flex items-center space-x-3">
          <span className={cn("font-medium", theme === 'dark' ? 'text-gray-100' : 'text-gray-900')}>
            {filename}
          </span>
          <Badge variant="outline" className="text-xs">
            {language.toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {lines.length.toLocaleString()} sorok
          </Badge>
          {searchMatches.length > 0 && (
            <Badge variant="default" className="text-xs">
              {searchMatches.length} találat
            </Badge>
          )}
          {shouldUseVirtualization && (
            <Badge variant="outline" className="text-xs">
              Virtualizált
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Keresés */}
          {enableSearch && (
            <div className="flex items-center space-x-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                <Input
                  placeholder="Keresés..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentMatch(0);
                  }}
                  className="pl-7 h-8 w-32 text-xs"
                  aria-label="Keresés a kódban"
                />
              </div>
              
              {searchMatches.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToMatch('prev')}
                    className="h-8 w-8 p-0"
                    aria-label="Előző találat"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToMatch('next')}
                    className="h-8 w-8 p-0"
                    aria-label="Következő találat"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                  <span className="text-xs text-gray-500">
                    {currentMatch + 1}/{searchMatches.length}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Akció gombok */}
          <Badge variant="outline" className="text-xs">
            {getCodeSize(code)}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0"
            aria-label="Másolás vágólapra"
          >
            <Copy className="w-3 h-3" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-8 w-8 p-0"
            aria-label="Letöltés fájlként"
          >
            <Download className="w-3 h-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
            aria-label={isExpanded ? 'Összecsukás' : 'Kibontás'}
          >
            {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {/* Kód terület */}
      <div
        ref={containerRef}
        className="relative"
        style={{ height: containerHeight }}
      >
        {shouldUseVirtualization ? (
          <div
            ref={scrollContainerRef}
            className="absolute inset-0 overflow-auto"
            onScroll={handleScroll}
            role="grid"
            aria-label="Kód sorok"
          >
            <div style={{ height: totalHeight, position: 'relative' }}>
              <div
                style={{
                  transform: `translateY(${offsetY}px)`,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                }}
              >
                {visibleLines.map((line, index) => renderLine(line, index))}
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-auto h-full" role="grid" aria-label="Kód sorok">
            {highlightedLines.map((line, index) => renderLine(line, index))}
          </div>
        )}
      </div>
    </div>
  );
}