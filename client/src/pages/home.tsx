import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Shield, Palette, Code, Accessibility, Smartphone } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <Code className="h-6 w-6" />,
      title: "Multi-Framework Support",
      description: "Generate components for React, Vue, and HTML with TypeScript support"
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Multiple Styling Options",
      description: "Choose from Tailwind CSS, CSS Modules, Styled Components, or plain CSS"
    },
    {
      icon: <Accessibility className="h-6 w-6" />,
      title: "Accessibility Analysis",
      description: "Built-in WCAG compliance checking with contrast ratio analysis"
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Responsive Design",
      description: "Automatic responsive breakpoints and mobile-first approach"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Advanced Code Generation",
      description: "Intelligent prop detection, semantic HTML, and performance optimization"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Production Ready",
      description: "Robust error handling, type safety, and comprehensive validation"
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="space-y-4">
          <Badge variant="outline" className="text-sm font-medium px-3 py-1">
            Advanced Figma to Code Generator
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Transform Designs into Production-Ready Code
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The most advanced Figma to code generator with robust error handling, 
            accessibility analysis, and support for multiple frameworks and styling systems.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/generator">
              Start Generating <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-6">
            View Documentation
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Powerful Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built with professional developers in mind, featuring enterprise-grade 
            reliability and comprehensive functionality.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Technical Highlights */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Technical Excellence</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every aspect has been engineered for reliability, performance, and developer experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-primary" />
                <span>Code Quality</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">TypeScript Coverage</span>
                  <Badge variant="secondary">100%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Error Handling</span>
                  <Badge variant="secondary">Comprehensive</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Validation</span>
                  <Badge variant="secondary">Zod Schema</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Performance</span>
                  <Badge variant="secondary">Optimized</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Accessibility className="h-5 w-5 text-primary" />
                <span>Accessibility Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">WCAG Compliance</span>
                  <Badge variant="secondary">AA/AAA</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Contrast Analysis</span>
                  <Badge variant="secondary">Real-time</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Semantic HTML</span>
                  <Badge variant="secondary">Automatic</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">ARIA Labels</span>
                  <Badge variant="secondary">Generated</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center space-y-6 py-12 bg-muted/30 rounded-2xl">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Ready to Transform Your Workflow?</h2>
          <p className="text-lg text-muted-foreground">
            Upload your Figma designs and get production-ready components in seconds.
          </p>
        </div>
        
        <Button asChild size="lg" className="text-lg px-8 py-6">
          <Link href="/generator">
            Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
