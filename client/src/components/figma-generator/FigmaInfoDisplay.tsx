import React, { useMemo, useState } from 'react';

import { FigmaApiResponse } from '@/types/figma';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import { Separator } from '@/components/ui/separator';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  FileText,
  Calendar,
  Layers,
  Palette,
  Component,
  Image,
  Type,
  Square,
  Circle,
  XIcon as LucideIcon,
  Code2,
  Package,
} from 'lucide-react';

import { CodeGenerationPanel } from './CodeGenerationPanel';

import { DesignSystemPanel } from './DesignSystemPanel';

// --- Típusdefiníciók ---

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  depth: number;
}

interface FigmaInfoDisplayProps {
  figmaData: FigmaApiResponse;
  fileKey: string;
}

interface ProcessedDocument {
  allNodes: FigmaNode[];
  nodeCounts: Record<string, number>;
}

// --- Segédfüggvények és konstansok ---

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('hu-HU');
};

const ICON_MAP: Record<string, LucideIcon> = {
  TEXT: Type,
  RECTANGLE: Square,
  ELLIPSE: Circle,
  FRAME: Layers,
  COMPONENT: Component,
  INSTANCE: Component,
  DEFAULT: Square,
};

const getNodeTypeIcon = (type: string): LucideIcon => {
  return ICON_MAP[type] || ICON_MAP.DEFAULT;
};

// Optimalizált függvény, ami egyszerre gyűjti az adatokat

const processFigmaDocument = (documentNode: FigmaNode): ProcessedDocument => {
  const allNodes: FigmaNode[] = [];
  const nodeCounts: Record<string, number> = {};

  const traverse = (node: FigmaNode, depth = 0) => {
    allNodes.push({ ...node, depth });
    nodeCounts[node.type] = (nodeCounts[node.type] || 0) + 1;
    if (node.children) {
      node.children.forEach((child) => traverse(child, depth + 1));
    }
  };

  traverse(documentNode);

  return { allNodes, nodeCounts };
};

// --- Kisebb komponensek a FileInfoCard-ból (modularizálás) ---

const FileInfoItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <div>{children}</div>
  </div>
);

const FileInfoCard: React.FC<FigmaInfoDisplayProps> = ({ figmaData, fileKey }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Fájl Információk</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileInfoItem label="Fájl neve">
            <p className="text-lg font-semibold">{figmaData.name}</p>
          </FileInfoItem>

          <FileInfoItem label="Fájl kulcs">
            <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{fileKey}</p>
          </FileInfoItem>

          <FileInfoItem label="Utolsó módosítás">
            <p className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(figmaData.lastModified)}</span>
            </p>
          </FileInfoItem>

          <FileInfoItem label="Verzió">
            <p>{figmaData.version}</p>
          </FileInfoItem>

          <FileInfoItem label="Szerepkör">
            <Badge variant="secondary">{figmaData.role}</Badge>
          </FileInfoItem>

          <FileInfoItem label="Szerkesztő típus">
            <Badge variant="outline">{figmaData.editorType}</Badge>
          </FileInfoItem>
        </div>

        {figmaData.thumbnailUrl && !imageError && (
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">Előnézeti kép</label>
            <img
              src={figmaData.thumbnailUrl}
              alt="Figma fájl előnézet"
              loading="lazy"
              onError={() => setImageError(true)}
              className="max-w-xs rounded-lg border border-gray-200"
            />
          </div>
        )}

        {imageError && (
          <div className="text-red-500 text-sm mt-2">Az előnézeti kép betöltése sikertelen volt.</div>
        )}
      </CardContent>
    </Card>
  );
};

const StatsCard: React.FC<{
  stats: { totalNodes: number; componentCount: number; styleCount: number; nodeTypesCount: number };
}> = ({ stats }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Layers className="w-5 h-5" />
        <span>Tartalom Statisztikák</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalNodes}</div>
          <div className="text-sm text-blue-800">Összes elem</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.componentCount}</div>
          <div className="text-sm text-green-800">Komponensek</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.styleCount}</div>
          <div className="text-sm text-purple-800">Stílusok</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.nodeTypesCount}</div>
          <div className="text-sm text-orange-800">Elem típusok</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const NodeTypeDistributionCard: React.FC<{ nodeCounts: Record<string, number> }> = ({ nodeCounts }) => (
  <Card>
    <CardHeader>
      <CardTitle>Elem Típusok Megoszlása</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Object.entries(nodeCounts).map(([type, count]) => {
          const IconComponent = getNodeTypeIcon(type);
          return (
            <div key={type} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <IconComponent className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">{type}</span>
              <Badge variant="secondary" className="ml-auto">
                {count}
              </Badge>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

const ComponentListCard: React.FC<{ components: FigmaApiResponse['components'] }> = ({ components }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Component className="w-5 h-5" />
        <span>Komponensek ({Object.keys(components || {}).length})</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {Object.entries(components || {}).map(([key, component]) => (
          <div key={key} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{component.name}</h4>
                {component.description && <p className="text-sm text-gray-600 mt-1">{component.description}</p>}
                <p className="text-xs text-gray-500 mt-2">Kulcs: {component.key}</p>
              </div>
              {component.componentSetId && <Badge variant="outline">Komponens készlet</Badge>}
            </div>
            {component.documentationLinks?.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700">Dokumentáció:</p>
                {component.documentationLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline block"
                  >
                    {link.uri}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const StyleListCard: React.FC<{ styles: FigmaApiResponse['styles'] }> = ({ styles }) => {
  if (!styles || Object.keys(styles).length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="w-5 h-5" />
          <span>Stílusok ({Object.keys(styles).length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(styles).map(([key, style]) => (
            <div key={key} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold">{style.name}</h4>
              {style.description && <p className="text-sm text-gray-600 mt-1">{style.description}</p>}
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline">{style.styleType}</Badge>
                <p className="text-xs text-gray-500">Kulcs: {style.key}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// --- FŐ KOMPONENS ---

export function FigmaInfoDisplay({ figmaData, fileKey }: FigmaInfoDisplayProps) {
  // useMemo hook a számítások optimalizálásához.
  // Csak akkor számol újra, ha a figmaData.document megváltozik.
  const { allNodes, nodeCounts } = useMemo(() => {
    if (!figmaData?.document) {
      return { allNodes: [], nodeCounts: {} };
    }
    return processFigmaDocument(figmaData.document as FigmaNode);
  }, [figmaData.document]);

  const componentCount = Object.keys(figmaData.components || {}).length;
  const styleCount = Object.keys(figmaData.styles || {}).length;

  const stats = {
    totalNodes: allNodes.length,
    componentCount,
    styleCount,
    nodeTypesCount: Object.keys(nodeCounts).length,
  };

  // TODO: Loading state és hibakezelés bővítése, ha szükséges

  return (
    <div className="space-y-6">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Fájl Információk</span>
          </TabsTrigger>

          <TabsTrigger value="design-system" className="flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>Design System</span>
          </TabsTrigger>

          <TabsTrigger value="generate" className="flex items-center space-x-2">
            <Code2 className="w-4 h-4" />
            <span>Kód Generálás</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <FileInfoCard figmaData={figmaData} fileKey={fileKey} />

          <StatsCard stats={stats} />

          <NodeTypeDistributionCard nodeCounts={nodeCounts} />

          {componentCount > 0 && <ComponentListCard components={figmaData.components} />}

          {styleCount > 0 && <StyleListCard styles={figmaData.styles} />}

          {/* Dokumentum struktúra */}

          <Card>
            <CardHeader>
              <CardTitle>Dokumentum Struktúra (első 50 elem)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-xs border rounded-md p-2 bg-gray-50">
                {allNodes.slice(0, 50).map((node) => {
                  const IconComponent = getNodeTypeIcon(node.type);
                  return (
                    <div
                      key={node.id}
                      className="flex items-center space-x-2 py-1 hover:bg-gray-100 rounded"
                      style={{ paddingLeft: `${node.depth * 16}px` }}
                    >
                      <IconComponent className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      <span className="truncate" title={node.name}>
                        {node.name || 'Névtelen'}
                      </span>
                      <span className="text-gray-400">({node.type})</span>
                    </div>
                  );
                })}
                {allNodes.length > 50 && (
                  <div className="text-center py-2 text-gray-500">... és még {allNodes.length - 50} elem</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design-system">
          <DesignSystemPanel figmaData={figmaData} fileKey={fileKey} />
        </TabsContent>

        <TabsContent value="generate">
          <CodeGenerationPanel figmaData={figmaData} fileKey={fileKey} />
        </TabsContent>
      </Tabs>
    </div>
  );
}