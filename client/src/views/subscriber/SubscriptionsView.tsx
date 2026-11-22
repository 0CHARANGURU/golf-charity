import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { CreditCard, Calendar, CheckCircle2, ExternalLink } from 'lucide-react';
import {
  GET_MY_SUBSCRIPTION_QUERY,
  GET_SUBSCRIPTION_PLANS_QUERY,
  SYNC_CHECKOUT_SESSION_MUTATION,
} from '../../graphql/operations';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const SubscriptionsView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const { data: subData, loading, refetch } = useQuery(GET_MY_SUBSCRIPTION_QUERY);
  const { data: plansData } = useQuery(GET_SUBSCRIPTION_PLANS_QUERY);
  const [syncCheckout, { loading: syncing }] = useMutation(SYNC_CHECKOUT_SESSION_MUTATION);

  const [activationMsg, setActivationMsg] = useState('');

  useEffect(() => {
    if (sessionId) {
      syncCheckout({ variables: { sessionId } })
        .then(() => {
          setActivationMsg('Your subscription has been successfully activated via Stripe Checkout!');
          refetch();
        })
        .catch((err) => {
          console.warn('Session sync note:', err.message);
        });
    }
  }, [sessionId, syncCheckout, refetch]);

  const sub = subData?.mySubscription;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-offWhite tracking-tight">Subscription & Billing</h1>
        <p className="text-sm text-offWhite-muted mt-1">
          Manage your recurring membership, payment method, and billing statements.
        </p>
      </div>

      {activationMsg && (
        <div className="p-4 rounded-xl bg-lime/10 border border-lime/30 text-lime text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{activationMsg}</span>
        </div>
      )}

      {loading || syncing ? (
        <div className="glass-card rounded-2xl p-8 text-center text-offWhite-muted">
          Loading subscription status...
        </div>
      ) : !sub ? (
        <Card className="text-center py-12 space-y-4">
          <CreditCard className="w-12 h-12 text-offWhite-muted mx-auto" />
          <h3 className="text-xl font-bold text-offWhite">No Active Subscription</h3>
          <p className="text-sm text-offWhite-muted max-w-md mx-auto">
            You do not currently have an active recurring subscription. Subscribe to enter upcoming draws and donate to your nominated charity.
          </p>
          <a href="/plans">
            <Button>View Subscription Plans</Button>
          </a>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card glow className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase text-lime font-semibold">Active Plan</span>
                <h2 className="text-2xl font-bold text-offWhite">{sub.plan?.name || 'Standard Monthly'}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="lime">{sub.status}</Badge>
                  <span className="text-xs text-offWhite-muted font-mono">
                    ${((sub.plan?.amountCents || 2000) / 100).toFixed(2)} / {sub.plan?.interval?.toLowerCase() || 'month'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-offWhite-muted">Current Period Renewal:</span>
                <div className="text-sm font-semibold text-offWhite flex items-center justify-end space-x-1 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-lime" />
                  <span>{new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-charcoal-border flex items-center justify-between text-xs text-offWhite-muted">
              <span>Managed securely via Stripe Billing</span>
              <a
                href="https://billing.stripe.com"
                target="_blank"
                rel="noreferrer"
                className="text-lime hover:underline inline-flex items-center"
              >
                <span>Open Stripe Customer Portal</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
