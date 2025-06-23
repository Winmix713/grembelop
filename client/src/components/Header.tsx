
import React, { useState } from 'react';
import { Figma, Github, Settings, Menu, X } from 'lucide-react';

function Logo() {
  return (
    <div className="flex items-center space-x-3">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
        <Figma className="w-6 h-6 text-white" aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900">Figma-to-Code</h1>
        <p className="text-sm text-gray-500">AI-Powered Component Generator</p>
      </div>
    </div>
  );
}

function NavLinks({ onLinkClick }) {
  return (
    <nav className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-4 md:space-y-0">
      {[
        { href: '#process', label: 'Process' },
        { href: '#features', label: 'Features' },
        { href: '#docs', label: 'Documentation' },
      ].map(({ href, label }) => (
        <a
          key={href}
          href={href}
          onClick={onLinkClick}
          className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          {label}
        </a>
      ))}
    </nav>
  );
}

function ActionButtons() {
  return (
    <div className="flex items-center space-x-3">
      <button
        aria-label="Settings"
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
        onClick={() => alert('Settings clicked')}
      >
        <Settings className="w-5 h-5" />
      </button>
      <button
        aria-label="GitHub"
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
        onClick={() => window.open('https://github.com', '_blank')}
      >
        <Github className="w-5 h-5" />
      </button>
      <button
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
        onClick={() => alert('Get Started clicked')}
      >
        Get Started
      </button>
    </div>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen((open) => !open);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Logo />

          {/* Desktop nav */}
          <div className="hidden md:flex md:flex-1 md:justify-center">
            <NavLinks />
          </div>

          {/* Action buttons desktop */}
          <div className="hidden md:flex">
            <ActionButtons />
          </div>

          {/* Mobile menu button */}
          <button
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-6">
            <NavLinks onLinkClick={closeMobileMenu} />
            <ActionButtons />
          </div>
        )}
      </div>
    </header>
  );
}
