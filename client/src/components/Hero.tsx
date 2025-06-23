import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowRight, 
  Sparkles, 
  Code2, 
  Palette, 
  Zap,
  Github,
  ExternalLink,
  Play,
  CheckCircle,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroProps {
  className?: string;
  onGetStarted?: () => void;
  onWatchDemo?: () => void;
}

interface FeatureHighlight {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

interface StatItem {
  value: string;
  label: string;
  change?: string;
}

const featureHighlights: FeatureHighlight[] = [
  {
    icon: <Code2 className="h-6 w-6" />,
    title: "Multi-Framework Support",
    description: "Generate React, Vue, and HTML components with enterprise-grade quality",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: <Palette className="h-6 w-6" />,
    title: "Advanced Styling",
    description: "Tailwind CSS, CSS Modules, Styled Components, and Plain CSS support",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "AI-Powered Analysis",
    description: "Intelligent accessibility analysis and responsive design generation",
    gradient: "from-orange-500 to-red-500"
  }
];

const stats: StatItem[] = [
  { value: "95%", label: "Code Accuracy", change: "+12%" },
  { value: "50ms", label: "Generation Speed", change: "-30%" },
  { value: "WCAG AA", label: "Accessibility", change: "Compliant" },
  { value: "100K+", label: "Components Generated", change: "+45%" }
];

export function Hero({ className, onGetStarted, onWatchDemo }: HeroProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % featureHighlights.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className={cn("relative overflow-hidden py-20 lg:py-32", className)}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-purple-400/10 to-pink-400/10 blur-2xl animate-pulse delay-2000" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          {/* Left Column - Content */}
          <div className={cn(
            "space-y-8 transition-all duration-1000",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            {/* Badge */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                <Sparkles className="h-3 w-3 mr-1" />
                Advanced AI-Powered Generator
              </Badge>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-muted-foreground ml-1">5.0</span>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="block text-gray-900 dark:text-white">
                  Transform Figma to
                </span>
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Production Code
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                Generate pixel-perfect, accessible components from Figma designs with our 
                advanced AI engine. Support for React, Vue, HTML with enterprise-grade 
                quality and WCAG compliance.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={onGetStarted}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={onWatchDemo}
                className="group border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
                <ExternalLink className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="h-4 w-4 text-green-500" />
                No Credit Card Required
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Free Forever Plan
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Github className="h-4 w-4" />
                Open Source
              </div>
            </div>
          </div>

          {/* Right Column - Interactive Feature Demo */}
          <div className={cn(
            "space-y-6 transition-all duration-1000 delay-300",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            {/* Feature Showcase Cards */}
            <div className="space-y-4">
              {featureHighlights.map((feature, index) => (
                <Card
                  key={feature.title}
                  className={cn(
                    "transition-all duration-500 hover:shadow-lg cursor-pointer",
                    currentFeature === index
                      ? "scale-105 shadow-xl border-blue-200 dark:border-blue-800"
                      : "hover:scale-102 opacity-80"
                  )}
                  onClick={() => setCurrentFeature(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-lg bg-gradient-to-r text-white",
                        feature.gradient
                      )}>
                        {feature.icon}
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                      {currentFeature === index && (
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            Active
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Performance Stats */}
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={stat.label} className="text-center space-y-1">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </div>
                      {stat.change && (
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                          {stat.change}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
    </section>
  );
}