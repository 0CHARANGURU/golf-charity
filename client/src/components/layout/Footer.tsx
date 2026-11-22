import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 border-t border-charcoal pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-charcoal">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-charcoal border border-lime/30 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-lime" />
              </div>
              <span className="text-lg font-bold tracking-tight text-offWhite">
                GOLF<span className="text-lime">CHARITY</span>
              </span>
            </div>
            <p className="text-sm text-offWhite-muted leading-relaxed">
              Transforming golf scores into charitable donations and monthly prize jackpots. 
              Fintech-grade transparency, auditable draws, guaranteed philanthropy.
            </p>
            <div className="flex items-center space-x-2 text-xs text-lime">
              <ShieldCheck className="w-4 h-4" />
              <span>PostgreSQL Audited & Stripe Protected</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-offWhite font-mono mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-offWhite-muted">
              <li><Link to="/how-it-works" className="hover:text-lime transition-colors">How It Works</Link></li>
              <li><Link to="/plans" className="hover:text-lime transition-colors">Subscription Plans</Link></li>
              <li><Link to="/charities" className="hover:text-lime transition-colors">Certified Charities</Link></li>
              <li><Link to="/draws" className="hover:text-lime transition-colors">Draw Schedules & Results</Link></li>
            </ul>
          </div>

          {/* Transparency & Charity */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-offWhite font-mono mb-4">
              Philanthropy & Rules
            </h4>
            <ul className="space-y-2 text-sm text-offWhite-muted">
              <li><span className="text-offWhite">10% Min Charity Allocation</span></li>
              <li><span className="text-offWhite">Equal Winner Distribution</span></li>
              <li><span className="text-offWhite">Rollover Jackpot Mechanics</span></li>
              <li><span className="text-offWhite">Score Verification Protocol</span></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-offWhite font-mono mb-4">
              Compliance
            </h4>
            <ul className="space-y-2 text-sm text-offWhite-muted">
              <li><Link to="/faq" className="hover:text-lime transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/terms" className="hover:text-lime transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-lime transition-colors">Privacy Policy</Link></li>
              <li><Link to="/contact" className="hover:text-lime transition-colors">Contact Support</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-offWhite-muted space-y-4 sm:space-y-0">
          <p>&copy; {new Date().getFullYear()} Golf Charity Platform. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span>Powered by</span>
            <span className="text-offWhite font-medium">Stripe & PostgreSQL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
