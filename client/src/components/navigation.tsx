import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { 
  Home, 
  Zap, 
  FileText, 
  Github, 
  Book,
  Settings,
  Code,
  Palette,
  Accessibility
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const features = [
    {
      title: "Multi-Framework Support",
      description: "Generate React, Vue, and HTML components",
      icon: <Code className="h-4 w-4" />,
      href: "/generator"
    },
    {
      title: "Advanced Styling",
      description: "Tailwind, CSS Modules, Styled Components",
      icon: <Palette className="h-4 w-4" />,
      href: "/generator"
    },
    {
      title: "Accessibility Analysis",
      description: "WCAG compliance and contrast checking",
      icon: <Accessibility className="h-4 w-4" />,
      href: "/generator"
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Main Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">FigmaGen</span>
              <Badge variant="outline" className="text-xs">
                Advanced
              </Badge>
            </Link>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/"
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                        isActive("/") && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      isActive("/generator") && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Generator
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px]">
                      <div className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            href="/generator"
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          >
                            <Zap className="h-6 w-6" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                              Advanced Code Generator
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Transform your Figma designs into production-ready components with enterprise-grade reliability.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                      <div className="grid gap-2">
                        {features.map((feature) => (
                          <NavigationMenuLink key={feature.title} asChild>
                            <Link
                              href={feature.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="flex items-center space-x-2">
                                {feature.icon}
                                <div className="text-sm font-medium leading-none">
                                  {feature.title}
                                </div>
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {feature.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <Book className="mr-2 h-4 w-4" />
                    Resources
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4">
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium leading-none">Documentation</h4>
                        <div className="grid gap-2">
                          <a
                            href="#"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Getting Started</div>
                            <p className="text-sm leading-snug text-muted-foreground">
                              Learn how to export from Figma and generate your first component
                            </p>
                          </a>
                          <a
                            href="#"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">API Reference</div>
                            <p className="text-sm leading-snug text-muted-foreground">
                              Complete API documentation and integration guide
                            </p>
                          </a>
                          <a
                            href="#"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Best Practices</div>
                            <p className="text-sm leading-snug text-muted-foreground">
                              Tips for optimal component generation and code quality
                            </p>
                          </a>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2"
              >
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </Button>

            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Settings</span>
            </Button>

            <Button asChild>
              <Link href="/generator">
                <Zap className="mr-2 h-4 w-4" />
                Generate
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
