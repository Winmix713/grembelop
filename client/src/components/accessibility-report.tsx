import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Eye, 
  Contrast,
  Shield,
  Accessibility
} from "lucide-react";

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  element: string;
  fix: string;
  wcagCriterion?: string;
}

interface AccessibilityReport {
  score: number;
  issues: AccessibilityIssue[];
  suggestions: string[];
  wcagCompliance: 'AAA' | 'AA' | 'A' | 'Non-compliant';
  contrastRatios?: Array<{
    element: string;
    ratio: number;
    passes: boolean;
  }>;
}

interface AccessibilityReportProps {
  report: AccessibilityReport;
}

export default function AccessibilityReport({ report }: AccessibilityReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getComplianceColor = (compliance: string) => {
    switch (compliance) {
      case 'AAA': return 'bg-green-100 text-green-800 border-green-200';
      case 'AA': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'A': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const errorCount = report.issues.filter(issue => issue.type === 'error').length;
  const warningCount = report.issues.filter(issue => issue.type === 'warning').length;
  const infoCount = report.issues.filter(issue => issue.type === 'info').length;

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className={`text-2xl font-bold ${getScoreColor(report.score)}`}>
                  {report.score}/100
                </div>
                <div className="text-sm text-muted-foreground">Accessibility Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Accessibility className="h-6 w-6 text-primary" />
              </div>
              <div>
                <Badge 
                  variant="outline" 
                  className={`${getComplianceColor(report.wcagCompliance)} border`}
                >
                  WCAG {report.wcagCompliance}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">Compliance Level</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{report.issues.length}</div>
                <div className="text-sm text-muted-foreground">Total Issues</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Accessibility Score</span>
              <span className={`text-sm font-medium ${getScoreColor(report.score)}`}>
                {report.score}%
              </span>
            </div>
            <Progress value={report.score} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Issues Breakdown */}
      {report.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Issues Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{infoCount}</div>
                <div className="text-sm text-muted-foreground">Info</div>
              </div>
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-3">
                {report.issues.map((issue, index) => (
                  <Alert key={index} className="border">
                    <div className="flex items-start space-x-3">
                      {getIssueIcon(issue.type)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <AlertTitle className="text-sm font-medium">
                            {issue.message}
                          </AlertTitle>
                          {issue.wcagCriterion && (
                            <Badge variant="outline" className="text-xs">
                              {issue.wcagCriterion}
                            </Badge>
                          )}
                        </div>
                        <AlertDescription className="text-sm">
                          <div><strong>Element:</strong> {issue.element}</div>
                          <div><strong>Fix:</strong> {issue.fix}</div>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Contrast Ratios */}
      {report.contrastRatios && report.contrastRatios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Contrast className="h-5 w-5" />
              <span>Contrast Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.contrastRatios.map((contrast, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {contrast.passes ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">{contrast.element}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {contrast.ratio.toFixed(2)}:1
                    </span>
                    <Badge 
                      variant={contrast.passes ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {contrast.passes ? "PASS" : "FAIL"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">
                <strong>WCAG Guidelines:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Normal text: 4.5:1 minimum (AA), 7:1 enhanced (AAA)</li>
                  <li>Large text (18pt+): 3:1 minimum (AA), 4.5:1 enhanced (AAA)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {report.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Improvement Suggestions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Perfect Score Message */}
      {report.score === 100 && report.issues.length === 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Perfect Accessibility Score!</AlertTitle>
          <AlertDescription className="text-green-700">
            This component meets all accessibility standards and follows WCAG {report.wcagCompliance} guidelines.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
