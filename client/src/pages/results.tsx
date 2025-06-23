import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { CodePreview } from "@/components/code-preview"; // Javított import - named import
import AccessibilityReport from "@/components/accessibility-report";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileCode,
  Layers,
} from "lucide-react";

export default function Results() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/projects/${id}`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Results</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Failed to load generation results"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { project, components } = data;
  const result = project.results;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">
              Generated on {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              {project.options.framework}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {project.options.styling}
            </Badge>
          </div>
        </div>

        {/* Generation Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Layers className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">
                    {result.summary.componentCount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Components
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileCode className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">
                    {result.summary.totalNodes}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Nodes
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">
                    {result.summary.averageAccuracy}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Accuracy
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">
                    {(result.totalTime / 1000).toFixed(1)}s
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Generation Time
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Errors and Warnings */}
        {((result.errors?.length || 0) > 0 ||
          (result.warnings?.length || 0) > 0) && (
          <div className="space-y-4">
            {(result.errors?.length || 0) > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Errors ({result.errors?.length || 0})</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {(result.errors || []).map(
                      (error: string, index: number) => (
                        <li key={index} className="text-sm">
                          {error}
                        </li>
                      ),
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {(result.warnings?.length || 0) > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  Warnings ({result.warnings?.length || 0})
                </AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {(result.warnings || [])
                      .slice(0, 5)
                      .map((warning: string, index: number) => (
                        <li key={index} className="text-sm">
                          {warning}
                        </li>
                      ))}
                    {(result.warnings?.length || 0) > 5 && (
                      <li className="text-sm text-muted-foreground">
                        ... and {(result.warnings?.length || 0) - 5} more
                        warnings
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>

      {/* Components */}
      {components && components.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Generated Components</h2>

          {components.map((component: any) => (
            <Card key={component.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <span>{component.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {component.metadata.componentType}
                    </Badge>
                    <Badge
                      variant={
                        component.metadata.complexity === "high"
                          ? "destructive"
                          : component.metadata.complexity === "medium"
                            ? "default"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {component.metadata.complexity}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>
                      {component.metadata.estimatedAccuracy}% accuracy
                    </span>
                    <span>•</span>
                    <span>{component.metadata.nodeCount} nodes</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="code" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="code">Code</TabsTrigger>
                    <TabsTrigger value="accessibility">
                      Accessibility
                    </TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  </TabsList>

                  <TabsContent value="code" className="mt-6">
                    <CodePreview
                      component={component}
                      framework={project.options.framework}
                    />
                  </TabsContent>

                  <TabsContent value="accessibility" className="mt-6">
                    <AccessibilityReport
                      report={component.accessibilityReport}
                    />
                  </TabsContent>

                  <TabsContent value="metadata" className="mt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Complexity
                          </div>
                          <div className="text-lg font-semibold capitalize">
                            {component.metadata.complexity}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Accuracy
                          </div>
                          <div className="text-lg font-semibold">
                            {component.metadata.estimatedAccuracy}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Generation Time
                          </div>
                          <div className="text-lg font-semibold">
                            {component.metadata.generationTime}ms
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Node Count
                          </div>
                          <div className="text-lg font-semibold">
                            {component.metadata.nodeCount}
                          </div>
                        </div>
                      </div>

                      {(component.metadata.dependencies?.length || 0) > 0 && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-2">
                            Dependencies
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(component.metadata.dependencies || []).map(
                              (dep: string) => (
                                <Badge
                                  key={dep}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {dep}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {(component.metadata.warnings?.length || 0) > 0 && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-2">
                            Warnings
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {(component.metadata.warnings || []).map(
                              (warning: string, index: number) => (
                                <li key={index}>{warning}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
