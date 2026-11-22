import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Menu, X, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-navy/90 backdrop-blur-md border-b border-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-charcoal border border-lime/30 flex items-center justify-center group-hover:border-lime transition-colors">
              <Trophy className="w-5 h-5 text-lime" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-offWhite">
                GOLF<span className="text-lime">CHARITY</span>
              </span>
              <span className="block text-[10px] tracking-wider text-offWhite-muted uppercase font-mono">
                Subscription Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/how-it-works" className="text-sm font-medium text-offWhite-muted hover:text-offWhite transition-colors">
              How It Works
            </Link>
            <Link to="/plans" className="text-sm font-medium text-offWhite-muted hover:text-offWhite transition-colors">
              Plans & Pricing
            </Link>
            <Link to="/charities" className="text-sm font-medium text-offWhite-muted hover:text-offWhite transition-colors">
              Charities
            </Link>
            <Link to="/draws" className="text-sm font-medium text-offWhite-muted hover:text-offWhite transition-colors">
              Draw Information
            </Link>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-offWhite hover:text-lime transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/plans"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-lime text-navy hover:bg-lime-hover transition-all duration-200 shadow-sm"
            >
              Get Started
              <ArrowRight className="ml-1.5 w-4 h-4" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-offWhite-muted hover:text-offWhite hover:bg-charcoal"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-950 border-b border-charcoal px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-offWhite-muted hover:text-offWhite"
          >
            How It Works
          </Link>
          <Link
            to="/plans"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-offWhite-muted hover:text-offWhite"
          >
            Plans & Pricing
          </Link>
          <Link
            to="/charities"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-offWhite-muted hover:text-offWhite"
          >
            Charity Directory
          </Link>
          <Link
            to="/draws"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-offWhite-muted hover:text-offWhite"
          >
            Draw Information
          </Link>
          <div className="pt-4 border-t border-charcoal flex flex-col space-y-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg text-sm font-medium border border-charcoal text-offWhite"
            >
              Sign In
            </Link>
            <Link
              to="/plans"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg text-sm font-semibold bg-lime text-navy"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
