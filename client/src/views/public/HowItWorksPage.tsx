import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Heart, ShieldCheck, Target, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Subscribe & Nominate a Cause',
      desc: 'Join with a monthly or annual membership. Nominate any verified non-profit partner; at least 10% of your fee is guaranteed directly to their mission.',
      icon: Heart,
    },
    {
      num: '02',
      title: 'Submit Your Active Golf Scores',
      desc: 'Log your Stableford points or golf scores in the range of 1 to 45 points. The system maintains your 5 most recent active scores automatically archiving older ones.',
      icon: Target,
    },
    {
      num: '03',
      title: 'Automated Monthly Draw Entry',
      desc: 'Prior to each monthly draw, your active golf scores translate deterministically into your official 5-number draw ticket.',
      icon: Trophy,
    },
    {
      num: '04',
      title: 'Cryptographic Draws & Instant Disbursals',
      desc: 'Numbers are drawn via OS-level CSPRNG. Match 3, 4, or 5 numbers to win. Equal splits, rollover mechanics, and direct payouts to your bank or card.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-offWhite tracking-tight">
          How Golf Charity Works
        </h1>
        <p className="text-lg text-offWhite-muted leading-relaxed">
          A revolutionary blend of recreational golf, audited non-profit philanthropy, and recurring cash rewards.
        </p>
      </div>

      {/* 4 Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="glass-card rounded-2xl p-8 space-y-4 border border-charcoal-border hover:border-lime/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-mono font-extrabold text-lime">{step.num}</span>
                <div className="w-10 h-10 rounded-xl bg-charcoal border border-charcoal-border flex items-center justify-center">
                  <Icon className="w-5 h-5 text-lime" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-offWhite">{step.title}</h3>
              <p className="text-sm text-offWhite-muted leading-relaxed">{step.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Prize Tier Architecture */}
      <div className="glass-card max-w-4xl mx-auto rounded-2xl p-8 space-y-6 border border-charcoal-border">
        <h3 className="text-2xl font-bold text-offWhite text-center">Prize Pool Distribution Architecture</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-4 rounded-xl bg-charcoal border border-lime/30 space-y-2">
            <span className="text-xs font-mono text-lime uppercase font-semibold">Tier 1: Jackpot</span>
            <div className="text-3xl font-extrabold text-offWhite">40%</div>
            <p className="text-xs text-offWhite-muted">Match all 5 numbers drawn</p>
          </div>
          <div className="p-4 rounded-xl bg-charcoal border border-charcoal-border space-y-2">
            <span className="text-xs font-mono text-lime uppercase font-semibold">Tier 2: Major Prize</span>
            <div className="text-3xl font-extrabold text-offWhite">35%</div>
            <p className="text-xs text-offWhite-muted">Match 4 numbers drawn</p>
          </div>
          <div className="p-4 rounded-xl bg-charcoal border border-charcoal-border space-y-2">
            <span className="text-xs font-mono text-lime uppercase font-semibold">Tier 3: Consolation</span>
            <div className="text-3xl font-extrabold text-offWhite">25%</div>
            <p className="text-xs text-offWhite-muted">Match 3 numbers drawn</p>
          </div>
        </div>
        <p className="text-xs text-center text-offWhite-muted">
          *If any tier produces zero winners, 100% of that tier's allocated funds automatically roll over to the next monthly draw.
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-8">
        <Link to="/plans">
          <Button size="lg">
            View Plans & Join Platform
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
