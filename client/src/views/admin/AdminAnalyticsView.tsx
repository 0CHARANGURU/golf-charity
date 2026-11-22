import React from 'react';
import { useQuery } from '@apollo/client';
import { Users, DollarSign, Heart, Award, Trophy, ShieldCheck } from 'lucide-react';
import { GET_ADMIN_ANALYTICS_QUERY } from '../../graphql/operations';
import { Card } from '../../components/ui/Card';

export const AdminAnalyticsView: React.FC = () => {
  const { data, loading } = useQuery(GET_ADMIN_ANALYTICS_QUERY);
  const analytics = data?.adminAnalytics;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-offWhite tracking-tight">Platform Financial & Operational Analytics</h1>
        <p className="text-sm text-offWhite-muted mt-1">
          High-level metrics across subscriber revenue, non-profit disbursements, and draw operations.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Active Subscribers */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between text-offWhite-muted">
              <span className="text-xs font-mono uppercase font-semibold">Active Subscribers</span>
              <Users className="w-5 h-5 text-lime" />
            </div>
            <div className="text-3xl font-extrabold text-offWhite">
              {analytics?.totalSubscribers || 0}
            </div>
            <p className="text-xs text-offWhite-muted">Paying members with monthly draw entry</p>
          </Card>

          {/* Monthly Recurring Revenue */}
          <Card glow className="space-y-3">
            <div className="flex items-center justify-between text-offWhite-muted">
              <span className="text-xs font-mono uppercase font-semibold text-lime">Monthly Recurring Revenue</span>
              <DollarSign className="w-5 h-5 text-lime" />
            </div>
            <div className="text-3xl font-extrabold text-lime">
              ${(((analytics?.monthlyRecurringRevenueCents || 0)) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-offWhite-muted">Gross active subscriber subscription billing</p>
          </Card>

          {/* Total Charity Raised */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between text-offWhite-muted">
              <span className="text-xs font-mono uppercase font-semibold">Total Charity Raised</span>
              <Heart className="w-5 h-5 text-lime" />
            </div>
            <div className="text-3xl font-extrabold text-offWhite">
              ${(((analytics?.totalCharityRaisedCents || 0)) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-offWhite-muted">Accrued across all verified partner charities</p>
          </Card>

          {/* Total Prizes Disbursed */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between text-offWhite-muted">
              <span className="text-xs font-mono uppercase font-semibold">Prizes Disbursed</span>
              <Award className="w-5 h-5 text-lime" />
            </div>
            <div className="text-3xl font-extrabold text-offWhite">
              ${(((analytics?.totalPrizesDisbursedCents || 0)) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-offWhite-muted">Paid to verified 3-, 4-, and 5-match winners</p>
          </Card>

          {/* Active Golf Scores */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between text-offWhite-muted">
              <span className="text-xs font-mono uppercase font-semibold">Active Golf Scores</span>
              <Trophy className="w-5 h-5 text-lime" />
            </div>
            <div className="text-3xl font-extrabold text-offWhite">
              {analytics?.totalActiveScores || 0}
            </div>
            <p className="text-xs text-offWhite-muted">Active amateur rounds currently eligible for draws</p>
          </Card>

          {/* Pending Verifications */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between text-offWhite-muted">
              <span className="text-xs font-mono uppercase font-semibold">Pending Score Verifications</span>
              <ShieldCheck className="w-5 h-5 text-lime" />
            </div>
            <div className="text-3xl font-extrabold text-offWhite">
              {analytics?.pendingVerificationsCount || 0}
            </div>
            <p className="text-xs text-offWhite-muted">Uploaded winner scorecards awaiting admin approval</p>
          </Card>
        </div>
      )}
    </div>
  );
};
