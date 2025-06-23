import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Scan, 
  Brain, 
  Code2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Play,
  Pause,
  RotateCcw,
  Download,
  Eye,
  Settings,
  Zap,
  Target,
  Layers,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress: number;
  duration?: number;
  startTime?: number;
  endTime?: number;
  details?: string[];
  metrics?: {
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'stable';
  }[];
}

interface ProcessFlowProps {
  className?: string;
  autoStart?: boolean;
  onStepComplete?: (step: ProcessStep) => void;
  onProcessComplete?: (results: any) => void;
  showMetrics?: boolean;
  interactive?: boolean;
}

const initialSteps: ProcessStep[] = [
  {
    id: 'upload',
    title: 'Design Upload',
    description: 'Upload and validate Figma design files',
    icon: <Upload className="h-5 w-5" />,
    status: 'pending',
    progress: 0,
    details: [
      'Validate file format and structure',
      'Extract design tokens and components',
      'Verify layer organization',
      'Check for unsupported elements'
    ],
    metrics: [
      { label: 'File Size', value: '2.4 MB', trend: 'stable' },
      { label: 'Components', value: '24', trend: 'up' },
      { label: 'Layers', value: '156', trend: 'stable' }
    ]
  },
  {
    id: 'analysis',
    title: 'AI Analysis',
    description: 'Analyze design structure and semantics',
    icon: <Brain className="h-5 w-5" />,
    status: 'pending',
    progress: 0,
    details: [
      'Component type identification',
      'Layout pattern recognition',
      'Style property extraction',
      'Interaction state detection'
    ],
    metrics: [
      { label: 'Accuracy', value: '94.8%', trend: 'up' },
      { label: 'Confidence', value: '92.1%', trend: 'stable' },
      { label: 'Complexity', value: 'Medium', trend: 'stable' }
    ]
  },
  {
    id: 'generation',
    title: 'Code Generation',
    description: 'Generate framework-specific components',
    icon: <Code2 className="h-5 w-5" />,
    status: 'pending',
    progress: 0,
    details: [
      'React/Vue/HTML structure generation',
      'Styling implementation (CSS/Tailwind)',
      'TypeScript definitions',
      'Accessibility attributes'
    ],
    metrics: [
      { label: 'Lines Generated', value: '847', trend: 'up' },
      { label: 'Bundle Size', value: '12.3 KB', trend: 'down' },
      { label: 'Dependencies', value: '3', trend: 'stable' }
    ]
  },
  {
    id: 'optimization',
    title: 'Quality Optimization',
    description: 'Optimize code quality and accessibility',
    icon: <Target className="h-5 w-5" />,
    status: 'pending',
    progress: 0,
    details: [
      'WCAG compliance validation',
      'Performance optimization',
      'Code quality analysis',
      'Best practices application'
    ],
    metrics: [
      { label: 'WCAG Score', value: '98.2%', trend: 'up' },
      { label: 'Performance', value: 'A+', trend: 'stable' },
      { label: 'Maintainability', value: '95%', trend: 'up' }
    ]
  },
  {
    id: 'finalization',
    title: 'Output Finalization',
    description: 'Package and prepare final deliverables',
    icon: <CheckCircle className="h-5 w-5" />,
    status: 'pending',
    progress: 0,
    details: [
      'Component packaging',
      'Documentation generation',
      'Preview compilation',
      'Export preparation'
    ],
    metrics: [
      { label: 'Package Size', value: '156 KB', trend: 'down' },
      { label: 'Files Created', value: '8', trend: 'stable' },
      { label: 'Documentation', value: '100%', trend: 'stable' }
    ]
  }
];

function StepCard({ 
  step, 
  index, 
  isActive, 
  showMetrics, 
  onAction 
}: { 
  step: ProcessStep; 
  index: number; 
  isActive: boolean; 
  showMetrics: boolean;
  onAction?: (action: string) => void;
}) {
  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (step.status) {
      case 'completed': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'error': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'active': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 shadow-lg';
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50';
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-md",
      getStatusColor(),
      isActive && "ring-2 ring-blue-500"
    )}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              step.status === 'completed' && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
              step.status === 'active' && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
              step.status === 'error' && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
              step.status === 'pending' && "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            )}>
              {step.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                {getStatusIcon()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {step.description}
              </p>
            </div>
          </div>
          
          <Badge variant="outline" className="text-xs">
            Step {index + 1}
          </Badge>
        </div>

        {/* Progress */}
        {step.status === 'active' && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{step.progress}%</span>
            </div>
            <Progress value={step.progress} className="h-2" />
          </div>
        )}

        {/* Duration */}
        {step.duration && (step.status === 'completed' || step.status === 'active') && (
          <div className="text-xs text-gray-500 mb-3">
            Duration: {step.duration}ms
            {step.status === 'active' && ' (in progress)'}
          </div>
        )}

        {/* Details */}
        <div className="space-y-2 mb-4">
          {step.details?.map((detail, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <div className={cn(
                "h-1.5 w-1.5 rounded-full",
                step.status === 'completed' && "bg-green-500",
                step.status === 'active' && idx < Math.floor(step.progress / 25) && "bg-blue-500",
                step.status === 'active' && idx >= Math.floor(step.progress / 25) && "bg-gray-300",
                step.status === 'pending' && "bg-gray-300"
              )} />
              <span className={cn(
                step.status === 'completed' && "text-green-700 dark:text-green-300",
                step.status === 'active' && idx < Math.floor(step.progress / 25) && "text-blue-700 dark:text-blue-300",
                "text-gray-600 dark:text-gray-400"
              )}>
                {detail}
              </span>
            </div>
          ))}
        </div>

        {/* Metrics */}
        {showMetrics && step.metrics && step.status !== 'pending' && (
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            {step.metrics.map((metric, idx) => (
              <div key={idx} className="text-center">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {metric.value}
                </div>
                <div className="text-xs text-gray-500">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {step.status === 'active' && onAction && (
          <div className="flex gap-2 mt-4">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onAction('pause')}
              className="h-8"
            >
              <Pause className="h-3 w-3 mr-1" />
              Pause
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onAction('restart')}
              className="h-8"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Restart
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProcessFlow({ 
  className, 
  autoStart = false, 
  onStepComplete, 
  onProcessComplete,
  showMetrics = true,
  interactive = true
}: ProcessFlowProps) {
  const [steps, setSteps] = useState<ProcessStep[]>(initialSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Simulate step processing
  const processStep = async (stepIndex: number) => {
    if (stepIndex >= steps.length) {
      setIsRunning(false);
      onProcessComplete?.({
        totalTime: Date.now() - (steps[0].startTime || Date.now()),
        stepsCompleted: steps.length,
        success: true
      });
      return;
    }

    const step = steps[stepIndex];
    const startTime = Date.now();

    // Mark step as active
    setSteps(prev => prev.map((s, i) => 
      i === stepIndex 
        ? { ...s, status: 'active', progress: 0, startTime }
        : s
    ));

    // Simulate progress
    const duration = 2000 + Math.random() * 3000; // 2-5 seconds
    const progressInterval = 50;
    const progressStep = 100 / (duration / progressInterval);

    let currentProgress = 0;
    const interval = setInterval(() => {
      if (isPaused) return;

      currentProgress += progressStep + Math.random() * 5;
      currentProgress = Math.min(currentProgress, 100);

      setSteps(prev => prev.map((s, i) => 
        i === stepIndex 
          ? { ...s, progress: Math.floor(currentProgress) }
          : s
      ));

      if (currentProgress >= 100) {
        clearInterval(interval);
        const endTime = Date.now();
        
        // Mark step as completed
        setSteps(prev => prev.map((s, i) => 
          i === stepIndex 
            ? { 
                ...s, 
                status: 'completed', 
                progress: 100, 
                endTime,
                duration: endTime - startTime 
              }
            : s
        ));

        onStepComplete?.(step);
        
        // Move to next step
        setTimeout(() => {
          setCurrentStepIndex(stepIndex + 1);
        }, 500);
      }
    }, progressInterval);

    return () => clearInterval(interval);
  };

  const startProcess = () => {
    setIsRunning(true);
    setIsPaused(false);
    setCurrentStepIndex(0);
    
    // Reset all steps
    setSteps(prev => prev.map(step => ({
      ...step,
      status: 'pending',
      progress: 0,
      startTime: undefined,
      endTime: undefined,
      duration: undefined
    })));
  };

  const pauseProcess = () => {
    setIsPaused(!isPaused);
  };

  const resetProcess = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStepIndex(-1);
    
    setSteps(prev => prev.map(step => ({
      ...step,
      status: 'pending',
      progress: 0,
      startTime: undefined,
      endTime: undefined,
      duration: undefined
    })));
  };

  // Auto-start effect
  useEffect(() => {
    if (autoStart && !isRunning) {
      startProcess();
    }
  }, [autoStart]);

  // Process step effect
  useEffect(() => {
    if (currentStepIndex >= 0 && currentStepIndex < steps.length && isRunning && !isPaused) {
      processStep(currentStepIndex);
    }
  }, [currentStepIndex, isRunning, isPaused]);

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalProgress = (completedSteps / steps.length) * 100;

  return (
    <section className={cn("py-12", className)}>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Layers className="h-6 w-6 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Generation Process
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Follow the real-time progress of your Figma design transformation into 
            production-ready code with detailed insights at each stage.
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Overall Progress
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {completedSteps} of {steps.length} steps completed
                </p>
              </div>
              
              <div className="flex gap-2">
                {interactive && (
                  <>
                    {!isRunning ? (
                      <Button onClick={startProcess} size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Start Process
                      </Button>
                    ) : (
                      <Button onClick={pauseProcess} size="sm" variant="outline">
                        {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                        {isPaused ? 'Resume' : 'Pause'}
                      </Button>
                    )}
                    <Button onClick={resetProcess} size="sm" variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <Progress value={totalProgress} className="h-3" />
            
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
              <span>Progress: {Math.round(totalProgress)}%</span>
              {isRunning && (
                <span className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                  {isPaused ? 'Paused' : 'Processing...'}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Process Steps */}
        <div className="grid gap-6 lg:grid-cols-2">
          {steps.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              index={index}
              isActive={currentStepIndex === index}
              showMetrics={showMetrics}
              onAction={(action) => {
                if (action === 'pause') pauseProcess();
                if (action === 'restart') resetProcess();
              }}
            />
          ))}
        </div>

        {/* Process Summary */}
        {completedSteps === steps.length && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Process Complete!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your components have been successfully generated with high quality and accessibility standards.
              </p>
              <div className="flex justify-center gap-4">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download Results
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Components
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}