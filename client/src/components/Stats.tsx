import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  Code, 
  Zap,
  Target,
  Award,
  BarChart3,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatItem {
  id: string;
  label: string;
  value: string;
  previousValue?: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  description: string;
  category: 'performance' | 'usage' | 'quality' | 'efficiency';
  trend?: number[];
  unit?: string;
  target?: string;
}

interface StatsProps {
  className?: string;
  showTrends?: boolean;
  animateCounters?: boolean;
  highlightBest?: boolean;
}

const statsData: StatItem[] = [
  {
    id: 'accuracy',
    label: 'Code Accuracy',
    value: '94.8',
    previousValue: '91.2',
    change: 3.6,
    changeType: 'increase',
    icon: <Target className="h-5 w-5" />,
    description: 'Pixel-perfect component generation accuracy',
    category: 'quality',
    trend: [88, 89, 90, 91, 92, 93, 94, 94.8],
    unit: '%',
    target: '95%'
  },
  {
    id: 'generation-speed',
    label: 'Generation Speed',
    value: '47',
    previousValue: '68',
    change: -21,
    changeType: 'decrease',
    icon: <Zap className="h-5 w-5" />,
    description: 'Average time to generate components',
    category: 'performance',
    trend: [85, 78, 72, 68, 61, 55, 50, 47],
    unit: 'ms',
    target: '< 50ms'
  },
  {
    id: 'components-generated',
    label: 'Components Generated',
    value: '127,482',
    previousValue: '98,234',
    change: 29.8,
    changeType: 'increase',
    icon: <Code className="h-5 w-5" />,
    description: 'Total components created this month',
    category: 'usage',
    trend: [45000, 62000, 78000, 89000, 98234, 108000, 118000, 127482],
    unit: '',
    target: '150K'
  },
  {
    id: 'accessibility-score',
    label: 'Accessibility Score',
    value: '98.2',
    previousValue: '96.1',
    change: 2.1,
    changeType: 'increase',
    icon: <Award className="h-5 w-5" />,
    description: 'WCAG AA compliance rate',
    category: 'quality',
    trend: [92, 93, 94, 95, 96, 96.5, 97.8, 98.2],
    unit: '%',
    target: '99%'
  },
  {
    id: 'active-users',
    label: 'Active Users',
    value: '12,847',
    previousValue: '9,632',
    change: 33.4,
    changeType: 'increase',
    icon: <Users className="h-5 w-5" />,
    description: 'Daily active users this week',
    category: 'usage',
    trend: [7800, 8200, 8900, 9632, 10200, 11400, 12100, 12847],
    unit: '',
    target: '15K'
  },
  {
    id: 'processing-time',
    label: 'Processing Time',
    value: '1.24',
    previousValue: '1.89',
    change: -34.4,
    changeType: 'decrease',
    icon: <Clock className="h-5 w-5" />,
    description: 'Average design analysis time',
    category: 'performance',
    trend: [2.1, 1.98, 1.85, 1.89, 1.76, 1.54, 1.38, 1.24],
    unit: 's',
    target: '< 1s'
  }
];

// Custom hook for animated counters
function useAnimatedCounter(endValue: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && startOnView) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!isVisible && startOnView) return;

    let startTime: number;
    let animationId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(endValue * easeOutCubic));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [endValue, duration, isVisible]);

  return { count, ref };
}

// Micro sparkline component
function MiniSparkline({ data, className }: { data: number[]; className?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className={cn("w-20 h-8", className)} viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
        className="opacity-60"
      />
      <circle
        cx={data.length > 1 ? ((data.length - 1) / (data.length - 1)) * 100 : 50}
        cy={data.length > 1 ? 100 - ((data[data.length - 1] - min) / range) * 100 : 50}
        r="3"
        fill="currentColor"
        className="opacity-80"
      />
    </svg>
  );
}

function StatCard({ 
  stat, 
  animateCounters, 
  showTrends, 
  isHighlighted 
}: { 
  stat: StatItem; 
  animateCounters: boolean; 
  showTrends: boolean;
  isHighlighted: boolean;
}) {
  const numericValue = parseFloat(stat.value.replace(/,/g, ''));
  const { count, ref } = useAnimatedCounter(numericValue, 2000, animateCounters);

  const formatValue = (value: number) => {
    if (stat.unit === '%') return value.toFixed(1);
    if (stat.value.includes(',')) return value.toLocaleString();
    if (stat.unit === 's' || stat.unit === 'ms') return value.toFixed(2);
    return value.toString();
  };

  const getChangeIcon = () => {
    if (!stat.change) return null;
    
    if (stat.changeType === 'increase') {
      return <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />;
    } else if (stat.changeType === 'decrease') {
      return stat.category === 'performance' 
        ? <TrendingDown className="h-3 w-3 text-green-600 dark:text-green-400" />
        : <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />;
    }
    return null;
  };

  const getChangeColor = () => {
    if (!stat.change) return 'text-gray-500';
    
    if (stat.changeType === 'increase') {
      return stat.category === 'performance' 
        ? 'text-red-600 dark:text-red-400' 
        : 'text-green-600 dark:text-green-400';
    } else if (stat.changeType === 'decrease') {
      return stat.category === 'performance' 
        ? 'text-green-600 dark:text-green-400'
        : 'text-red-600 dark:text-red-400';
    }
    return 'text-gray-500';
  };

  const getCategoryColor = () => {
    switch (stat.category) {
      case 'performance': return 'from-blue-500 to-cyan-500';
      case 'usage': return 'from-green-500 to-emerald-500';
      case 'quality': return 'from-purple-500 to-violet-500';
      case 'efficiency': return 'from-orange-500 to-amber-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <Card className={cn(
      "relative transition-all duration-300 hover:shadow-lg group",
      isHighlighted && "ring-2 ring-blue-500 shadow-lg scale-105"
    )}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "p-2 rounded-lg bg-gradient-to-r text-white",
            getCategoryColor()
          )}>
            {stat.icon}
          </div>
          
          {showTrends && stat.trend && (
            <MiniSparkline 
              data={stat.trend} 
              className={cn(
                "text-gray-400 group-hover:text-gray-600 transition-colors",
                getChangeColor()
              )}
            />
          )}
        </div>

        {/* Value */}
        <div ref={ref} className="space-y-1">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {animateCounters ? formatValue(count) : stat.value}
            <span className="text-sm font-normal text-gray-500 ml-1">
              {stat.unit}
            </span>
          </div>
          
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {stat.label}
          </div>
        </div>

        {/* Change Indicator */}
        {stat.change && (
          <div className="flex items-center gap-1 mt-2">
            {getChangeIcon()}
            <span className={cn("text-xs font-medium", getChangeColor())}>
              {Math.abs(stat.change)}%
            </span>
            <span className="text-xs text-gray-500">vs last period</span>
          </div>
        )}

        {/* Target Progress */}
        {stat.target && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Target: {stat.target}</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {Math.round((numericValue / parseFloat(stat.target.replace(/[^\d.]/g, ''))) * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={cn("h-full bg-gradient-to-r transition-all duration-1000", getCategoryColor())}
                style={{ 
                  width: `${Math.min(100, (numericValue / parseFloat(stat.target.replace(/[^\d.]/g, ''))) * 100)}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          {stat.description}
        </p>

        {/* Category Badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-2 right-2 text-xs capitalize opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {stat.category}
        </Badge>
      </CardContent>
    </Card>
  );
}

export function Stats({ 
  className, 
  showTrends = true, 
  animateCounters = true, 
  highlightBest = true 
}: StatsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = Array.from(new Set(statsData.map(stat => stat.category)));
  
  const filteredStats = selectedCategory === 'all' 
    ? statsData 
    : statsData.filter(stat => stat.category === selectedCategory);

  const bestPerformingStat = highlightBest 
    ? statsData.reduce((best, current) => {
        const currentScore = current.change || 0;
        const bestScore = best.change || 0;
        return currentScore > bestScore ? current : best;
      })
    : null;

  return (
    <section className={cn("py-12", className)}>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Performance Analytics
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Real-time insights into code generation performance, quality metrics, 
            and user engagement across our platform.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                selectedCategory === 'all'
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              All Metrics
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all capitalize",
                  selectedCategory === category
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStats.map((stat) => (
            <StatCard
              key={stat.id}
              stat={stat}
              animateCounters={animateCounters}
              showTrends={showTrends}
              isHighlighted={highlightBest && bestPerformingStat?.id === stat.id}
            />
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  System Health
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                All systems operational. Average uptime: 99.8% with optimal 
                performance across all generation endpoints.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Target className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Quality Assurance
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                WCAG AA compliance maintained at 98.2% with continuous 
                improvements in accessibility and code quality.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}