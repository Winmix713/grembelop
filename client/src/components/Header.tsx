import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  Code2, 
  Github, 
  Twitter, 
  Zap, 
  User, 
  Settings, 
  LogOut,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  Star,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
  onThemeToggle?: () => void;
  theme?: 'light' | 'dark';
  user?: {
    name: string;
    email: string;
    avatar?: string;
    plan: 'free' | 'pro' | 'enterprise';
  };
  notifications?: number;
}

interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  isNew?: boolean;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    label: 'Generator',
    href: '/generator',
    icon: <Code2 className="h-4 w-4" />
  },
  {
    label: 'Features',
    href: '/features',
    children: [
      { label: 'Code Generation', href: '/features/generation' },
      { label: 'Accessibility', href: '/features/accessibility', isNew: true },
      { label: 'Responsive Design', href: '/features/responsive' },
      { label: 'Performance', href: '/features/performance' }
    ]
  },
  {
    label: 'Documentation',
    href: '/docs',
    children: [
      { label: 'Getting Started', href: '/docs/getting-started' },
      { label: 'API Reference', href: '/docs/api' },
      { label: 'Examples', href: '/docs/examples' },
      { label: 'Troubleshooting', href: '/docs/troubleshooting' }
    ]
  },
  {
    label: 'Pricing',
    href: '/pricing',
    badge: 'New'
  }
];

export function Header({ 
  className, 
  onThemeToggle, 
  theme = 'light', 
  user,
  notifications = 0 
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'enterprise': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b transition-all duration-200",
      isScrolled 
        ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm" 
        : "bg-white dark:bg-gray-900",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Code2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  FigmaGen
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  AI Code Generator
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <div key={item.label} className="relative">
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
                        "hover:bg-gray-100 dark:hover:bg-gray-800",
                        activeDropdown === item.label && "bg-gray-100 dark:bg-gray-800"
                      )}
                    >
                      {item.icon}
                      {item.label}
                      {item.badge && (
                        <Badge className="ml-1 text-xs bg-green-100 text-green-800">
                          {item.badge}
                        </Badge>
                      )}
                      <ChevronDown className={cn(
                        "h-3 w-3 transition-transform",
                        activeDropdown === item.label && "rotate-180"
                      )} />
                    </button>

                    {/* Dropdown Menu */}
                    {activeDropdown === item.label && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                        {item.children.map((child) => (
                          <a
                            key={child.label}
                            href={child.href}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                          >
                            {child.icon}
                            {child.label}
                            {child.isNew && (
                              <Badge className="ml-auto text-xs bg-green-100 text-green-800">
                                New
                              </Badge>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
                      "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    {item.icon}
                    {item.label}
                    {item.badge && (
                      <Badge className="ml-1 text-xs bg-green-100 text-green-800">
                        {item.badge}
                      </Badge>
                    )}
                  </a>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Social Links */}
            <div className="hidden lg:flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeToggle}
              className="h-8 w-8 p-0"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            {/* Notifications */}
            {user && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                    {notifications > 9 ? '9+' : notifications}
                  </Badge>
                )}
              </Button>
            )}

            {/* User Menu or Auth Buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('user')}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className={cn("text-xs capitalize", getPlanBadgeColor(user.plan))}>
                        {user.plan}
                      </Badge>
                    </div>
                  </div>
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>

                {/* User Dropdown */}
                {activeDropdown === 'user' && (
                  <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                    
                    <a
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <User className="h-4 w-4" />
                      Dashboard
                    </a>
                    
                    <a
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </a>

                    {user.plan === 'free' && (
                      <a
                        href="/upgrade"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Star className="h-4 w-4" />
                        Upgrade to Pro
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </a>
                    )}

                    <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                      <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Zap className="h-3 w-3 mr-1" />
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="md:hidden h-8 w-8 p-0"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <div key={item.label}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => toggleDropdown(`mobile-${item.label}`)}
                        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          {item.icon}
                          {item.label}
                          {item.badge && (
                            <Badge className="text-xs bg-green-100 text-green-800">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <ChevronDown className={cn(
                          "h-3 w-3 transition-transform",
                          activeDropdown === `mobile-${item.label}` && "rotate-180"
                        )} />
                      </button>
                      
                      {activeDropdown === `mobile-${item.label}` && (
                        <div className="ml-4 mt-2 space-y-1">
                          {item.children.map((child) => (
                            <a
                              key={child.label}
                              href={child.href}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                            >
                              {child.icon}
                              {child.label}
                              {child.isNew && (
                                <Badge className="ml-auto text-xs bg-green-100 text-green-800">
                                  New
                                </Badge>
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <a
                      href={item.href}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                    >
                      {item.icon}
                      {item.label}
                      {item.badge && (
                        <Badge className="ml-auto text-xs bg-green-100 text-green-800">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(activeDropdown || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setActiveDropdown(null);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </header>
  );
}