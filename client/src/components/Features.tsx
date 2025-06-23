import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Code2, 
  Palette, 
  Accessibility, 
  Smartphone, 
  Zap, 
  Shield, 
  GitBranch,
  Eye,
  Settings,
  Download,
  Layers,
  Target,
  Brain,
  Rocket,
  CheckCircle,
  ArrowRight,
  Play,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'generation' | 'quality' | 'developer' | 'enterprise';
  benefits: string[];
  demoUrl?: string;
  isNew?: boolean;
  isPro?: boolean;
  gradient: string;
  stats?: {
    label: string;
    value: string;
  }[];
}

interface FeaturesProps {
  className?: string;
  showCategories?: boolean;
  interactive?: boolean;
  highlightNew?: boolean;
}

const features: Feature[] = [
  {
    id: 'multi-framework',
    title: 'Multi-Framework Support',
    description: 'Generate components for React, Vue.js, and HTML with framework-specific optimizations and best practices.',
    icon: <Code2 className="h-6 w-6" />,
    category: 'generation',
    gradient: 'from-blue-500 to-cyan-500',
    benefits: [
      'React with hooks and modern patterns',
      'Vue 3 with Composition API support',
      'Semantic HTML with accessibility',
      'Framework-specific optimizations'
    ],
    stats: [
      { label: 'Frameworks', value: '3+' },
      { label: 'Accuracy', value: '95%' }
    ]
  },
  {
    id: 'advanced-styling',
    title: 'Advanced Styling Options',
    description: 'Support for multiple styling approaches including Tailwind CSS, CSS Modules, Styled Components, and Plain CSS.',
    icon: <Palette className="h-6 w-6" />,
    category: 'generation',
    gradient: 'from-purple-500 to-pink-500',
    benefits: [
      'Tailwind CSS with custom utilities',
      'CSS Modules with scoped styles',
      'Styled Components integration',
      'Plain CSS with BEM methodology'
    ],
    stats: [
      { label: 'Styling Options', value: '4' },
      { label: 'CSS Accuracy', value: '97%' }
    ]
  },
  {
    id: 'accessibility-first',
    title: 'Accessibility-First Generation',
    description: 'Automatically generate WCAG AA compliant components with semantic HTML, ARIA attributes, and accessibility testing.',
    icon: <Accessibility className="h-6 w-6" />,
    category: 'quality',
    gradient: 'from-green-500 to-emerald-500',
    benefits: [
      'WCAG AA compliance by default',
      'Automatic ARIA label generation',
      'Keyboard navigation support',
      'Screen reader optimization'
    ],
    stats: [
      { label: 'WCAG Score', value: '98%' },
      { label: 'Compliance', value: 'AA' }
    ],
    isNew: true
  },
  {
    id: 'responsive-design',
    title: 'Responsive Design System',
    description: 'Generate responsive components with mobile-first approach, breakpoint optimization, and flexible layouts.',
    icon: <Smartphone className="h-6 w-6" />,
    category: 'generation',
    gradient: 'from-orange-500 to-red-500',
    benefits: [
      'Mobile-first responsive design',
      'Custom breakpoint generation',
      'Flexible grid systems',
      'Touch-friendly interactions'
    ],
    stats: [
      { label: 'Breakpoints', value: '5' },
      { label: 'Mobile Score', value: '96%' }
    ]
  },
  {
    id: 'ai-optimization',
    title: 'AI-Powered Optimization',
    description: 'Intelligent code analysis and optimization using machine learning to improve performance and maintainability.',
    icon: <Brain className="h-6 w-6" />,
    category: 'quality',
    gradient: 'from-violet-500 to-purple-500',
    benefits: [
      'Intelligent component analysis',
      'Performance optimization',
      'Code quality improvements',
      'Best practice enforcement'
    ],
    stats: [
      { label: 'Performance', value: '+40%' },
      { label: 'Quality Score', value: '94%' }
    ],
    isNew: true
  },
  {
    id: 'typescript-support',
    title: 'TypeScript Integration',
    description: 'Full TypeScript support with automatic type generation, interface definitions, and type safety validation.',
    icon: <Shield className="h-6 w-6" />,
    category: 'developer',
    gradient: 'from-blue-600 to-indigo-600',
    benefits: [
      'Automatic type generation',
      'Interface definitions',
      'Generic type support',
      'Type safety validation'
    ],
    stats: [
      { label: 'Type Coverage', value: '100%' },
      { label: 'Type Safety', value: '99%' }
    ]
  },
  {
    id: 'version-control',
    title: 'Version Control Integration',
    description: 'Seamless integration with Git workflows, automated commits, and collaborative development features.',
    icon: <GitBranch className="h-6 w-6" />,
    category: 'developer',
    gradient: 'from-gray-600 to-gray-800',
    benefits: [
      'Git workflow automation',
      'Automated commit generation',
      'Branch management',
      'Collaborative reviews'
    ],
    stats: [
      { label: 'Git Integration', value: '100%' },
      { label: 'Automation', value: '95%' }
    ]
  },
  {
    id: 'live-preview',
    title: 'Live Preview System',
    description: 'Real-time component preview with interactive demos, responsive testing, and instant feedback.',
    icon: <Eye className="h-6 w-6" />,
    category: 'developer',
    gradient: 'from-cyan-500 to-blue-500',
    benefits: [
      'Real-time preview updates',
      'Interactive component demos',
      'Responsive preview modes',
      'Instant visual feedback'
    ],
    stats: [
      { label: 'Preview Speed', value: '<100ms' },
      { label: 'Accuracy', value: '99%' }
    ]
  },
  {
    id: 'enterprise-security',
    title: 'Enterprise Security',
    description: 'Enterprise-grade security with SOC 2 compliance, data encryption, and secure API endpoints.',
    icon: <Shield className="h-6 w-6" />,
    category: 'enterprise',
    gradient: 'from-red-600 to-pink-600',
    benefits: [
      'SOC 2 Type II compliance',
      'End-to-end encryption',
      'Secure API architecture',
      'Access control management'
    ],
    stats: [
      { label: 'Security Score', value: 'A+' },
      { label: 'Compliance', value: 'SOC 2' }
    ],
    isPro: true
  },
  {
    id: 'performance-optimization',
    title: 'Performance Optimization',
    description: 'Automatic performance optimization with code splitting, lazy loading, and bundle size reduction.',
    icon: <Zap className="h-6 w-6" />,
    category: 'quality',
    gradient: 'from-yellow-500 to-orange-500',
    benefits: [
      'Automatic code splitting',
      'Lazy loading implementation',
      'Bundle size optimization',
      'Performance monitoring'
    ],
    stats: [
      { label: 'Bundle Reduction', value: '-60%' },
      { label: 'Load Time', value: '+200%' }
    ]
  },
  {
    id: 'design-system',
    title: 'Design System Export',
    description: 'Extract and export complete design systems with tokens, components, and documentation.',
    icon: <Layers className="h-6 w-6" />,
    category: 'enterprise',
    gradient: 'from-indigo-500 to-purple-500',
    benefits: [
      'Design token extraction',
      'Component library generation',
      'Automated documentation',
      'Style guide creation'
    ],
    stats: [
      { label: 'Token Accuracy', value: '98%' },
      { label: 'Coverage', value: '100%' }
    ],
    isPro: true
  },
  {
    id: 'testing-suite',
    title: 'Automated Testing Suite',
    description: 'Generate comprehensive test suites with unit tests, integration tests, and accessibility tests.',
    icon: <Target className="h-6 w-6" />,
    category: 'quality',
    gradient: 'from-green-600 to-teal-600',
    benefits: [
      'Unit test generation',
      'Integration test suites',
      'Accessibility testing',
      'Visual regression tests'
    ],
    stats: [
      { label: 'Test Coverage', value: '95%' },
      { label: 'Reliability', value: '99%' }
    ],
    isNew: true
  }
];

const categories = [
  { id: 'generation', label: 'Code Generation', icon: <Code2 className="h-4 w-4" /> },
  { id: 'quality', label: 'Quality & Testing', icon: <Target className="h-4 w-4" /> },
  { id: 'developer', label: 'Developer Tools', icon: <Settings className="h-4 w-4" /> },
  { id: 'enterprise', label: 'Enterprise', icon: <Shield className="h-4 w-4" /> }
];

function FeatureCard({ 
  feature, 
  isActive, 
  onHover, 
  onDemo 
}: { 
  feature: Feature; 
  isActive: boolean; 
  onHover: (id: string | null) => void;
  onDemo?: (feature: Feature) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <Card
      ref={cardRef}
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer",
        isActive && "ring-2 ring-blue-500 shadow-xl",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      onMouseEnter={() => onHover(feature.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity",
        feature.gradient
      )} />
      
      <CardContent className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "p-3 rounded-lg bg-gradient-to-r text-white",
            feature.gradient
          )}>
            {feature.icon}
          </div>
          
          <div className="flex gap-2">
            {feature.isNew && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                New
              </Badge>
            )}
            {feature.isPro && (
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                Pro
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {feature.description}
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            {feature.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          {feature.stats && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {feature.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onDemo?.(feature)}
            >
              <Play className="h-3 w-3 mr-1" />
              Try Now
            </Button>
            {feature.demoUrl && (
              <Button size="sm" variant="outline">
                <Eye className="h-3 w-3 mr-1" />
                Demo
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Features({ 
  className, 
  showCategories = true, 
  interactive = true,
  highlightNew = true 
}: FeaturesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(feature => feature.category === selectedCategory);

  const newFeatures = features.filter(feature => feature.isNew);
  const proFeatures = features.filter(feature => feature.isPro);

  const handleDemo = (feature: Feature) => {
    setActiveFeature(feature.id);
    // Handle demo logic here
  };

  return (
    <section className={cn("py-16", className)}>
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Rocket className="h-6 w-6 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Powerful Features
            </h2>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Everything you need to transform Figma designs into production-ready code 
            with enterprise-grade quality and developer-friendly tools.
          </p>
        </div>

        {/* Feature Highlights */}
        {highlightNew && (newFeatures.length > 0 || proFeatures.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6">
            {newFeatures.length > 0 && (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Star className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      New Features
                    </h3>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      {newFeatures.length}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Latest enhancements to improve your development workflow
                  </p>
                  <div className="space-y-1">
                    {newFeatures.slice(0, 3).map(feature => (
                      <div key={feature.id} className="text-sm text-gray-700 dark:text-gray-300">
                        • {feature.title}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {proFeatures.length > 0 && (
              <Card className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Enterprise Features
                    </h3>
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                      Pro
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Advanced capabilities for enterprise-scale development
                  </p>
                  <div className="space-y-1">
                    {proFeatures.slice(0, 3).map(feature => (
                      <div key={feature.id} className="text-sm text-gray-700 dark:text-gray-300">
                        • {feature.title}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Category Filter */}
        {showCategories && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                  selectedCategory === 'all'
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                All Features
                <Badge variant="outline" className="text-xs">
                  {features.length}
                </Badge>
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                    selectedCategory === category.id
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  {category.icon}
                  {category.label}
                  <Badge variant="outline" className="text-xs">
                    {features.filter(f => f.category === category.id).length}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredFeatures.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              isActive={activeFeature === feature.id || hoveredFeature === feature.id}
              onHover={setHoveredFeature}
              onDemo={interactive ? handleDemo : undefined}
            />
          ))}
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-cyan-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Transform Your Design Workflow?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Join thousands of developers who are already using our platform to 
              generate production-ready code from Figma designs.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                View Pricing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}