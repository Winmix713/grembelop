import React, { useReducer, useCallback, useMemo } from 'react';

import { FigmaApiResponse } from '@/types/figma';
import { DesignSystemExtractor, DesignTokens } from '@/services/design-system-extractor';
import { DesignSystemExporter, ExportOptions } from '@/services/design-system-exporter';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { VirtualCodeViewer } from '@/components/VirtualCodeViewer';

import {
  Palette,
  Download,
  Copy,
  Eye,
  Settings,
  Package,
  Sparkles,
  Maximize2,
  Type,
  Layers,
  Space as Spacing,
  Zap,
} from 'lucide-react';

import { copyToClipboard, downloadFile } from '@/lib/utils';
import { toast } from 'react-hot-toast';

// --- Állapot és reducer ---

interface DesignSystemState {
  designTokens: DesignTokens | null;
  isExtracting: boolean;
  previewCode: string;
  copied: boolean;
  useVirtualViewer: boolean;
  exportOptions: ExportOptions;
}

type Action =
  | { type: 'SET_EXTRACTING'; payload: boolean }
  | { type: 'SET_DESIGN_TOKENS'; payload: DesignTokens }
  | { type: 'SET_PREVIEW_CODE'; payload: string }
  | { type: 'SET_COPIED'; payload: boolean }
  | { type: 'SET_USE_VIRTUAL_VIEWER'; payload: boolean }
  | { type: 'SET_EXPORT_OPTIONS'; payload: Partial<ExportOptions> };

const initialState: DesignSystemState = {
  designTokens: null,
  isExtracting: false,
  previewCode: '',
  copied: false,
  useVirtualViewer: true,
  exportOptions: {
    format: 'css',
    includeComments: true,
    useCustomProperties: true,
    prefix: '',
  },
};

function reducer(state: DesignSystemState, action: Action): DesignSystemState {
  switch (action.type) {
    case 'SET_EXTRACTING':
      return { ...state, isExtracting: action.payload };
    case 'SET_DESIGN_TOKENS':
      return { ...state, designTokens: action.payload, isExtracting: false };
    case 'SET_PREVIEW_CODE':
      return { ...state, previewCode: action.payload };
    case 'SET_COPIED':
      return { ...state, copied: action.payload };
    case 'SET_USE_VIRTUAL_VIEWER':
      return { ...state, useVirtualViewer: action.payload };
    case 'SET_EXPORT_OPTIONS':
      return {
        ...state,
        exportOptions: { ...state.exportOptions, ...action.payload },
      };
    default:
      return state;
  }
}

// --- Lokalizált szövegek ---

const UI_TEXTS = {
  HEADER_TITLE: 'Design System Export',
  EXTRACT_BUTTON: 'Design Tokenek Kinyerése',
  EXTRACTING: 'Kinyerés...',
  EXPORT_SETTINGS: 'Export Beállítások',
  EXPORT_SUCCESS: 'Exportálás sikeres!',
  COPY_SUCCESS: 'Kód másolva a vágólapra!',
  EXTRACTION_ERROR: 'Hiba történt a design tokenek kinyerése során.',
  EXPORT_ERROR: 'Hiba történt az exportálás során.',
  COPY_ERROR: 'Hiba történt a másolás során.',
  PREVIEW_TITLE: 'Design Tokens Előnézet',
  CODE_PREVIEW_TITLE: 'Generált Kód Előnézet',
  COPY_BUTTON: 'Másolás',
  COPIED_BUTTON: 'Másolva!',
  EXPORT_FORMAT_LABEL: 'Export Formátum',
  PREFIX_LABEL: 'Prefix (opcionális)',
  OPTIONS_LABEL: 'Opciók',
  COMMENTS_LABEL: 'Kommentek',
  CUSTOM_PROPS_LABEL: 'CSS Custom Properties',
  VIRTUAL_VIEWER_LABEL: 'Nagy teljesítményű megjelenítő',
};

// --- Hibakezelő hook ---

function useErrorHandler() {
  const handleError = useCallback((error: Error, context: string) => {
    console.error(`${context}:`, error);
    toast.error(`Hiba történt: ${context}`);
  }, []);
  return { handleError };
}

// --- Export logika hook ---

function useDesignSystemExport(
  designTokens: DesignTokens | null,
  exportOptions: ExportOptions,
  dispatch: React.Dispatch<Action>
) {
  const updatePreview = useCallback(
    (newOptions: Partial<ExportOptions>) => {
      dispatch({ type: 'SET_EXPORT_OPTIONS', payload: newOptions });
      if (!designTokens) return;
      const updatedOptions = { ...exportOptions, ...newOptions };
      const exporter = new DesignSystemExporter(designTokens, updatedOptions);
      const files = exporter.export();
      if (files.length > 0) {
        dispatch({ type: 'SET_PREVIEW_CODE', payload: files[0].content });
      }
    },
    [designTokens, exportOptions, dispatch]
  );

  return { updatePreview };
}

// --- Újrafelhasználható kisebb komponensek ---

interface ColorScaleProps {
  scale: Record<string, string>;
  title: string;
}
const ColorScale = React.memo(({ scale, title }: ColorScaleProps) => (
  <div className="space-y-3">
    <h4 className="font-semibold text-gray-900">{title}</h4>
    <div className="grid grid-cols-11 gap-2">
      {Object.entries(scale).map(([key, color]) => (
        <div key={key} className="text-center">
          <div
            className="w-full h-12 rounded-lg border border-gray-200 mb-1"
            style={{ backgroundColor: color }}
            title={`${key}: ${color}`}
          />
          <div className="text-xs text-gray-600">{key}</div>
        </div>
      ))}
    </div>
  </div>
));

interface TypographyStylesProps {
  styles: Record<
    string,
    {
      fontFamily: string;
      fontSize: string;
      fontWeight: string | number;
      lineHeight: string;
      letterSpacing?: string;
    }
  >;
}
const TypographyStyles = React.memo(({ styles }: TypographyStylesProps) => (
  <div className="space-y-4">
    {Object.entries(styles).map(([key, style]) => (
      <div key={key} className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900">{key}</h4>
          <Badge variant="outline">{style.fontSize}</Badge>
        </div>
        <div
          className="text-gray-700"
          style={{
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing,
          }}
        >
          The quick brown fox jumps over the lazy dog
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {style.fontFamily} • {style.fontWeight} • {style.lineHeight}
        </div>
      </div>
    ))}
  </div>
));

interface SpacingScaleProps {
  spacing: Record<string, string>;
}
const SpacingScale = React.memo(({ spacing }: SpacingScaleProps) => (
  <div className="space-y-4">
    {Object.entries(spacing).map(([key, value]) => (
      <div
        key={key}
        className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg"
      >
        <div className="w-16 text-sm font-medium text-gray-700">{key}</div>
        <div className="bg-blue-200 rounded" style={{ width: value, height: '20px' }} />
        <div className="text-sm text-gray-600">{value}</div>
      </div>
    ))}
  </div>
));

interface ShadowsProps {
  shadows: Record<string, string>;
}
const Shadows = React.memo(({ shadows }: ShadowsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Object.entries(shadows).map(([key, shadow]) => (
      <div key={key} className="space-y-2">
        <div className="text-sm font-medium text-gray-700">{key}</div>
        <div className="w-full h-20 bg-white rounded-lg" style={{ boxShadow: shadow }} />
        <div className="text-xs text-gray-500 font-mono">{shadow}</div>
      </div>
    ))}
  </div>
));

interface BorderRadiusProps {
  borderRadius: Record<string, string>;
}
const BorderRadiusDisplay = React.memo(({ borderRadius }: BorderRadiusProps) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Object.entries(borderRadius).map(([key, value]) => (
      <div key={key} className="text-center space-y-2">
        <div className="text-sm font-medium text-gray-700">{key}</div>
        <div
          className="w-full h-16 bg-blue-100 border-2 border-blue-300"
          style={{ borderRadius: value }}
        />
        <div className="text-xs text-gray-500">{value}</div>
      </div>
    ))}
  </div>
));

// --- Header komponens ---

const DesignTokensHeader = React.memo(
  ({
    onExtract,
    isExtracting,
  }: {
    onExtract: () => void;
    isExtracting: boolean;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="w-5 h-5" />
          <span>{UI_TEXTS.HEADER_TITLE}</span>
          <Sparkles className="w-4 h-4 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-gray-600 mb-4">
            Automatikus design token library generálás a Figma fájlból. Teljes színpaletta, typography, spacing és egyéb design elemek
            kinyerése.
          </p>
          <Button
            onClick={onExtract}
            disabled={isExtracting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isExtracting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{UI_TEXTS.EXTRACTING}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>{UI_TEXTS.EXTRACT_BUTTON}</span>
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
);

// --- Export beállítások komponens ---

interface ExportConfigurationProps {
  exportOptions: ExportOptions;
  onUpdate: (options: Partial<ExportOptions>) => void;
  useVirtualViewer: boolean;
  onToggleVirtualViewer: (useVirtual: boolean) => void;
  onExport: () => void;
  onCopy: () => void;
  copied: boolean;
}

const ExportConfiguration = React.memo(
  ({
    exportOptions,
    onUpdate,
    useVirtualViewer,
    onToggleVirtualViewer,
    onExport,
    onCopy,
    copied,
  }: ExportConfigurationProps) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>{UI_TEXTS.EXPORT_SETTINGS}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="format-select">{UI_TEXTS.EXPORT_FORMAT_LABEL}</Label>
            <Select
              id="format-select"
              value={exportOptions.format}
              onValueChange={(value: ExportOptions['format']) => onUpdate({ format: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="css">CSS Custom Properties</SelectItem>
                <SelectItem value="scss">SCSS Variables</SelectItem>
                <SelectItem value="js">JavaScript/TypeScript</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="tailwind">Tailwind Config</SelectItem>
                <SelectItem value="figma-tokens">Figma Tokens</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prefix-input">{UI_TEXTS.PREFIX_LABEL}</Label>
            <Input
              id="prefix-input"
              placeholder="ds-"
              value={exportOptions.prefix || ''}
              onChange={(e) => onUpdate({ prefix: e.target.value })}
            />
          </div>
          <div className="space-y-3">
            <Label>{UI_TEXTS.OPTIONS_LABEL}</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="comments"
                  checked={exportOptions.includeComments}
                  onCheckedChange={(checked) => onUpdate({ includeComments: !!checked })}
                />
                <Label htmlFor="comments" className="text-sm">
                  {UI_TEXTS.COMMENTS_LABEL}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="custom-props"
                  checked={exportOptions.useCustomProperties}
                  onCheckedChange={(checked) => onUpdate({ useCustomProperties: !!checked })}
                />
                <Label htmlFor="custom-props" className="text-sm">
                  {UI_TEXTS.CUSTOM_PROPS_LABEL}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="virtual-viewer-ds"
                  checked={useVirtualViewer}
                  onCheckedChange={(checked) => onToggleVirtualViewer(!!checked)}
                />
                <Label htmlFor="virtual-viewer-ds" className="text-sm">
                  {UI_TEXTS.VIRTUAL_VIEWER_LABEL}
                </Label>
              </div>
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <Button onClick={onExport} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={onCopy}>
              <Copy className="w-4 h-4" />
              <span className="sr-only">{copied ? UI_TEXTS.COPIED_BUTTON : UI_TEXTS.COPY_BUTTON}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
);

// --- Design Tokens Tabs komponens ---

interface DesignTokensTabsProps {
  designTokens: DesignTokens;
  activeTab: string;
  onTabChange: (tab: string) => void;
  previewCode: string;
  exportOptions: ExportOptions;
  copied: boolean;
  onCopy: () => void;
  useVirtualViewer: boolean;
  onToggleVirtualViewer: (useVirtual: boolean) => void;
}

const DesignTokensTabs = React.memo(
  ({
    designTokens,
    activeTab,
    onTabChange,
    previewCode,
    exportOptions,
    copied,
    onCopy,
    useVirtualViewer,
    onToggleVirtualViewer,
  }: DesignTokensTabsProps) => {
    // Memoizált tab tartalmak

    const colorTabs = useMemo(() => (
      <>
        <ColorScale scale={designTokens.colors.primary} title="Primary Colors" />
        <ColorScale scale={designTokens.colors.secondary} title="Secondary Colors" />
        <ColorScale scale={designTokens.colors.neutral} title="Neutral Colors" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ColorScale scale={designTokens.colors.semantic.success} title="Success" />
          <ColorScale scale={designTokens.colors.semantic.error} title="Error" />
        </div>
      </>
    ), [designTokens]);

    const typographyTab = useMemo(() => (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Font Families</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(designTokens.typography.fontFamilies).map(([key, family]) => (
              <div key={key} className="p-3 border border-gray-200 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">{key}</div>
                <div style={{ fontFamily: family }} className="text-lg">
                  {family}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Text Styles</h4>
          <TypographyStyles styles={designTokens.typography.textStyles} />
        </div>
      </div>
    ), [designTokens]);

    const spacingTab = useMemo(() => (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Semantic Spacing</h4>
          <SpacingScale spacing={designTokens.spacing.semantic} />
        </div>
      </div>
    ), [designTokens]);

    const shadowsTab = useMemo(() => (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Elevation Shadows</h4>
          <Shadows shadows={designTokens.shadows.elevation} />
        </div>
      </div>
    ), [designTokens]);

    const borderRadiusTab = useMemo(() => (
      <BorderRadiusDisplay borderRadius={designTokens.borderRadius} />
    ), [designTokens]);

    const getLanguageForViewer = (format: string) => {
      switch (format) {
        case 'css':
          return 'css';
        case 'scss':
          return 'scss';
        case 'js':
          return 'javascript';
        case 'json':
          return 'json';
        case 'tailwind':
          return 'javascript';
        case 'figma-tokens':
          return 'json';
        default:
          return 'text';
      }
    };

    const getCodeSize = (content: string) => {
      const size = new Blob([content]).size;
      if (size < 1024) return `${size} B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>{UI_TEXTS.PREVIEW_TITLE}</span>
            </CardTitle>
            {previewCode && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {getCodeSize(previewCode)}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleVirtualViewer(!useVirtualViewer)}
                >
                  <Maximize2 className="w-4 h-4 mr-2" />
                  {useVirtualViewer ? 'Egyszerű nézet' : 'Nagy teljesítményű nézet'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="colors">Színek</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="spacing">Spacing</TabsTrigger>
              <TabsTrigger value="shadows">Shadows</TabsTrigger>
              <TabsTrigger value="radius">Border Radius</TabsTrigger>
              <TabsTrigger value="code">Kód</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-6 mt-6">
              {colorTabs}
            </TabsContent>
            <TabsContent value="typography" className="mt-6">
              {typographyTab}
            </TabsContent>
            <TabsContent value="spacing" className="mt-6">
              {spacingTab}
            </TabsContent>
            <TabsContent value="shadows" className="mt-6">
              {shadowsTab}
            </TabsContent>
            <TabsContent value="radius" className="mt-6">
              {borderRadiusTab}
            </TabsContent>
            <TabsContent value="code" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{UI_TEXTS.CODE_PREVIEW_TITLE}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{exportOptions.format.toUpperCase()}</Badge>
                    <Badge variant="secondary" className="text-xs">
                      {getCodeSize(previewCode)}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={onCopy}>
                      <Copy className="w-4 h-4 mr-1" />
                      {copied ? UI_TEXTS.COPIED_BUTTON : UI_TEXTS.COPY_BUTTON}
                    </Button>
                  </div>
                </div>
                {useVirtualViewer ? (
                  <VirtualCodeViewer
                    code={previewCode}
                    language={getLanguageForViewer(exportOptions.format)}
                    filename={`design-tokens.${exportOptions.format === 'js' ? 'js' : exportOptions.format}`}
                    onCopy={onCopy}
                    onDownload={() => {}}
                    maxHeight={600}
                    showLineNumbers={true}
                  />
                ) : (
                  <div className="max-h-96 overflow-auto rounded-lg border border-gray-200">
                    <pre className="p-4 text-sm font-mono bg-gray-50">
                      <code>{previewCode}</code>
                    </pre>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }
);

// --- Statisztikák komponens ---

interface DesignSystemStatsProps {
  designTokens: DesignTokens;
}

const DesignSystemStats = React.memo(({ designTokens }: DesignSystemStatsProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Design System Statisztikák</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {Object.keys(designTokens.colors.primary).length +
              Object.keys(designTokens.colors.secondary).length +
              Object.keys(designTokens.colors.neutral).length}
          </div>
          <div className="text-sm text-blue-800">Színek</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {Object.keys(designTokens.typography.textStyles).length}
          </div>
          <div className="text-sm text-green-800">Text Styles</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {Object.keys(designTokens.spacing.semantic).length}
          </div>
          <div className="text-sm text-purple-800">Spacing Values</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {Object.keys(designTokens.shadows.elevation).length}
          </div>
          <div className="text-sm text-orange-800">Shadow Levels</div>
        </div>
      </div>
    </CardContent>
  </Card>
));

// --- Fő komponens ---

interface DesignSystemPanelProps {
  figmaData: FigmaApiResponse;
  fileKey: string;
}

export function DesignSystemPanel({ figmaData, fileKey }: DesignSystemPanelProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { handleError } = useErrorHandler();

  const { updatePreview } = useDesignSystemExport(state.designTokens, state.exportOptions, dispatch);

  const handleExtractTokens = useCallback(async () => {
    dispatch({ type: 'SET_EXTRACTING', payload: true });
    try {
      const extractor = new DesignSystemExtractor(figmaData);
      const tokens = extractor.extractDesignTokens();
      dispatch({ type: 'SET_DESIGN_TOKENS', payload: tokens });

      // Frissítsük az előnézetet az aktuális export beállításokkal
      updatePreview({});

      toast.success('Design tokenek sikeresen kinyerve!');
    } catch (error) {
      handleError(error as Error, UI_TEXTS.EXTRACTION_ERROR);
      dispatch({ type: 'SET_EXTRACTING', payload: false });
    }
  }, [figmaData, updatePreview, handleError]);

  const handleExport = useCallback(() => {
    if (!state.designTokens) return;
    try {
      const exporter = new DesignSystemExporter(state.designTokens, state.exportOptions);
      const files = exporter.export();
      files.forEach((file) => {
        downloadFile(file.content, file.filename);
      });
      toast.success(UI_TEXTS.EXPORT_SUCCESS);
    } catch (error) {
      handleError(error as Error, UI_TEXTS.EXPORT_ERROR);
    }
  }, [state.designTokens, state.exportOptions, handleError]);

  const handleCopy = useCallback(async () => {
    if (!state.previewCode) return;
    try {
      await copyToClipboard(state.previewCode);
      dispatch({ type: 'SET_COPIED', payload: true });
      toast.success(UI_TEXTS.COPY_SUCCESS);
      setTimeout(() => dispatch({ type: 'SET_COPIED', payload: false }), 2000);
    } catch (error) {
      handleError(error as Error, UI_TEXTS.COPY_ERROR);
    }
  }, [state.previewCode, handleError]);

  const toggleVirtualViewer = useCallback(
    (useVirtual: boolean) => {
      dispatch({ type: 'SET_USE_VIRTUAL_VIEWER', payload: useVirtual });
    },
    [dispatch]
  );

  return (
    <>
      {/* Toast container (ha szükséges) */}
      <div id="toast-container" />
      <div className="space-y-6">
        <DesignTokensHeader onExtract={handleExtractTokens} isExtracting={state.isExtracting} />

        {state.designTokens && (
          <>
            <ExportConfiguration
              exportOptions={state.exportOptions}
              onUpdate={updatePreview}
              useVirtualViewer={state.useVirtualViewer}
              onToggleVirtualViewer={toggleVirtualViewer}
              onExport={handleExport}
              onCopy={handleCopy}
              copied={state.copied}
            />

            <DesignTokensTabs
              designTokens={state.designTokens}
              activeTab={state.exportOptions.format} // vagy külön állapot az aktív tabnak
              onTabChange={(tab) => {
                // Ha külön állapot kell az aktív tabnak, itt kezelhető
              }}
              previewCode={state.previewCode}
              exportOptions={state.exportOptions}
              copied={state.copied}
              onCopy={handleCopy}
              useVirtualViewer={state.useVirtualViewer}
              onToggleVirtualViewer={toggleVirtualViewer}
            />

            <DesignSystemStats designTokens={state.designTokens} />
          </>
        )}
      </div>
    </>
  );
}