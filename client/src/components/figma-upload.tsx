
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Globe, CheckCircle, AlertTriangle, Loader2, Eye, EyeOff } from "lucide-react";

interface FigmaUploadProps {
  onDataUploaded: (data: any, name?: string) => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
}

interface ValidationResult {
  valid: boolean;
  nodeCount: number;
  componentCount: number;
  hasComponents: boolean;
  documentName: string;
}

export default function FigmaUpload({ onDataUploaded, projectName, onProjectNameChange }: FigmaUploadProps) {
  const [figmaUrl, setFigmaUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const { toast } = useToast();

  const fetchMutation = useMutation({
    mutationFn: async ({ url, key }: { url: string; key: string }) => {
      const response = await apiRequest('POST', '/api/fetch-figma', { 
        figmaUrl: url, 
        apiKey: key 
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.validation.valid) {
        setValidationResult(data.validation);
        onDataUploaded(data.figmaData, data.validation.documentName);
        if (!projectName && data.validation.documentName) {
          onProjectNameChange(data.validation.documentName);
        }
        toast({
          title: "Figma Data Loaded",
          description: `Found ${data.validation.componentCount} components and ${data.validation.nodeCount} nodes`,
        });
      } else {
        toast({
          title: "Invalid Figma Data",
          description: data.error || "Failed to load Figma data",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Fetch Failed",
        description: error.message || "Failed to fetch Figma data",
        variant: "destructive",
      });
    },
  });

  const handleFetchFigma = () => {
    if (!figmaUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a Figma file URL",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Figma API key",
        variant: "destructive",
      });
      return;
    }

    const figmaUrlPattern = /https:\/\/www\.figma\.com\/(file|design)\/([a-zA-Z0-9]+)/;
    if (!figmaUrlPattern.test(figmaUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Figma file URL",
        variant: "destructive",
      });
      return;
    }

    fetchMutation.mutate({ url: figmaUrl, key: apiKey });
  };

  return (
    <div className="space-y-6">
      {/* Project Name Input */}
      <div className="space-y-2">
        <Label htmlFor="projectName">Project Name</Label>
        <Input
          id="projectName"
          placeholder="Enter project name..."
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
        />
      </div>

      {/* Figma URL and API Key Input */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {fetchMutation.isPending ? (
            <div className="space-y-4 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Fetching Figma Data</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we load your design file...
                </p>
              </div>
            </div>
          ) : validationResult ? (
            <div className="space-y-4 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <div>
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                  Figma Data Loaded Successfully
                </h3>
                <p className="text-sm text-muted-foreground">
                  {validationResult.documentName}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{validationResult.nodeCount}</div>
                  <div className="text-muted-foreground">Total Nodes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{validationResult.componentCount}</div>
                  <div className="text-muted-foreground">Components</div>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={() => {
                  setValidationResult(null);
                  setFigmaUrl("");
                  setApiKey("");
                }}
              >
                Load Different File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Load from Figma</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="figma-url">Figma File URL</Label>
                <Input
                  id="figma-url"
                  placeholder="https://www.figma.com/file/..."
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-key">Figma API Key</Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    placeholder="figd_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                onClick={handleFetchFigma} 
                className="w-full"
                disabled={!figmaUrl.trim() || !apiKey.trim()}
              >
                <Globe className="mr-2 h-4 w-4" />
                Load Figma Data
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>How to get your Figma API key:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            <li>Go to your Figma account settings</li>
            <li>Navigate to "Personal access tokens"</li>
            <li>Click "Create new token" and give it a name</li>
            <li>Copy the token and paste it above</li>
          </ol>
          <p className="mt-2 text-sm">
            <strong>URL format:</strong> https://www.figma.com/file/[FILE_KEY]/[FILE_NAME]
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
