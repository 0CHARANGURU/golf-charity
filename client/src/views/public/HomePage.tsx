import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Heart, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-navy">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-36 border-b border-charcoal">
        {/* Glow ambient effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-lime/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-charcoal border border-lime/30 text-xs font-mono text-lime">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NEXT OFFICIAL DRAW: DECEMBER 15, 2026</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-offWhite leading-[1.1]">
              Amateur Golf Meets <span className="text-lime">Fintech Charity</span> & Cash Jackpots
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-offWhite-muted leading-relaxed">
              Subscribe, log your 5 active golf scores, nominate your favorite cause with at least 10% guaranteed contribution, and compete for verified monthly prize draws.
            </p>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/plans"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-semibold bg-lime text-navy hover:bg-lime-hover shadow-lg hover:shadow-lime/20 transition-all duration-200"
              >
                Start Subscription
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-medium bg-charcoal hover:bg-charcoal-light border border-charcoal-border text-offWhite transition-colors"
              >
                Learn How It Works
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-offWhite-muted">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-lime" />
                <span>Min 10% Charity Guarantee</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-lime" />
                <span>CSPRNG Cryptographic Draws</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-lime" />
                <span>Equal Split Rollover Jackpots</span>
              </div>
            </div>
          </div>

          {/* Platform Preview Cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 space-y-4 hover:border-lime/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-charcoal flex items-center justify-center border border-charcoal-border">
                <Trophy className="w-6 h-6 text-lime" />
              </div>
              <h3 className="text-xl font-bold text-offWhite">Monthly Prize Draws</h3>
              <p className="text-sm text-offWhite-muted leading-relaxed">
                Match 3, 4, or 5 numbers (1-45) derived from your scores. 40% top jackpot, 35% mid tier, and 25% consolation with rollover mechanics.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4 hover:border-lime/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-charcoal flex items-center justify-center border border-charcoal-border">
                <Heart className="w-6 h-6 text-lime" />
              </div>
              <h3 className="text-xl font-bold text-offWhite">Empower Real Charities</h3>
              <p className="text-sm text-offWhite-muted leading-relaxed">
                Select from verified partner non-profits. Allocate from 10% to 100% of your membership directly to your chosen philanthropic initiative.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4 hover:border-lime/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-charcoal flex items-center justify-center border border-charcoal-border">
                <ShieldCheck className="w-6 h-6 text-lime" />
              </div>
              <h3 className="text-xl font-bold text-offWhite">Audited & Transparent</h3>
              <p className="text-sm text-offWhite-muted leading-relaxed">
                Every draw, entry, and payout is logged with immutable cryptographic hashes and PostgreSQL serializable transaction locks.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
