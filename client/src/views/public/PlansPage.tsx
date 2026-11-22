import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { Check, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { GET_SUBSCRIPTION_PLANS_QUERY, CREATE_CHECKOUT_SESSION_MUTATION } from '../../graphql/operations';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

export const PlansPage: React.FC = () => {
  const [interval, setInterval] = useState<'MONTH' | 'YEAR'>('MONTH');
  const { data, loading } = useQuery(GET_SUBSCRIPTION_PLANS_QUERY);
  const [createCheckout, { loading: checkoutLoading }] = useMutation(CREATE_CHECKOUT_SESSION_MUTATION);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const plans = data?.subscriptionPlans || [];
  const currentPlan = plans.find((p: any) => p.interval === interval);

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    try {
      const { data } = await createCheckout({ variables: { planId } });
      const url = data.createCheckoutSession.checkoutUrl;
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      alert(`Checkout failed: ${err.message}`);
    }
  };

  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-charcoal border border-lime/30 text-xs font-mono text-lime">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TRANSPARENT FINTECH PRICING</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-offWhite tracking-tight">
          One Membership. Real Charity. Monthly Jackpots.
        </h1>
        <p className="text-lg text-offWhite-muted leading-relaxed">
          Every subscription guarantees at least a 10% direct contribution to your nominated cause, while funding audited monthly cash draws for amateur golfers.
        </p>

        {/* Billing Toggle */}
        <div className="pt-6 inline-flex p-1.5 rounded-xl bg-charcoal border border-charcoal-border">
          <button
            onClick={() => setInterval('MONTH')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              interval === 'MONTH'
                ? 'bg-lime text-navy font-semibold shadow-sm'
                : 'text-offWhite-muted hover:text-offWhite'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setInterval('YEAR')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              interval === 'YEAR'
                ? 'bg-lime text-navy font-semibold shadow-sm'
                : 'text-offWhite-muted hover:text-offWhite'
            }`}
          >
            Annual Billing (Save 17%)
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Standard Tier */}
        <div className="glass-card rounded-2xl p-8 space-y-6 border border-charcoal-border flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-offWhite">Standard Membership</h3>
            <p className="text-sm text-offWhite-muted">
              Ideal for golfers looking to support a charity and enter regular monthly draws.
            </p>
            <div className="pt-2">
              <span className="text-4xl font-extrabold text-offWhite">
                ${interval === 'MONTH' ? '20' : '200'}
              </span>
              <span className="text-sm text-offWhite-muted">/{interval === 'MONTH' ? 'month' : 'year'}</span>
            </div>

            <div className="pt-4 border-t border-charcoal-border space-y-3 text-sm text-offWhite">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-lime" />
                <span>1 Draw Ticket every month</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-lime" />
                <span>Min 10% donation to your nominated charity</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-lime" />
                <span>5 active score tracking (1-45 range)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-lime" />
                <span>Eligible for 3-, 4-, and 5-number match prizes</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => currentPlan && handleSubscribe(currentPlan.id)}
            isLoading={checkoutLoading}
            className="w-full py-3"
          >
            Get Started
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {/* Supporter / Annual Focus Card */}
        <div className="glass-card rounded-2xl p-8 space-y-6 border border-lime/40 glow-lime flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-lime text-navy text-[10px] font-mono font-bold uppercase">
            Most Popular
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-offWhite">Annual Champion</h3>
            <p className="text-sm text-offWhite-muted">
              Maximize your charity footprint and secure automatic entry into 12 consecutive monthly draws.
            </p>
            <div className="pt-2">
              <span className="text-4xl font-extrabold text-lime">$200</span>
              <span className="text-sm text-offWhite-muted">/year (Save $40)</span>
            </div>

            <div className="pt-4 border-t border-charcoal-border space-y-3 text-sm text-offWhite">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-lime" />
                <span>12 Automated Monthly Draw Entries</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-lime" />
                <span>Increased charity allocation flexibility</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-lime" />
                <span>Priority scorecard verification queue</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-lime" />
                <span>Exclusive Annual Grand Jackpot eligibility</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => currentPlan && handleSubscribe(currentPlan.id)}
            isLoading={checkoutLoading}
            className="w-full py-3 bg-lime text-navy hover:bg-lime-hover"
          >
            Join as Champion
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
