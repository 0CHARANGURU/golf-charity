import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Trophy, Target, Heart, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import {
  GET_UPCOMING_DRAW_QUERY,
  GET_MY_SCORES_QUERY,
  GET_MY_CHARITY_PREF_QUERY,
  GET_MY_WINNINGS_QUERY,
} from '../../graphql/operations';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const OverviewView: React.FC = () => {
  const { data: drawData } = useQuery(GET_UPCOMING_DRAW_QUERY);
  const { data: scoresData } = useQuery(GET_MY_SCORES_QUERY);
  const { data: charityData } = useQuery(GET_MY_CHARITY_PREF_QUERY);
  const { data: winningsData } = useQuery(GET_MY_WINNINGS_QUERY);

  const upcomingDraw = drawData?.upcomingDraw;
  const activeScores = scoresData?.myScores?.filter((s: any) => s.isActive) || [];
  const charityPref = charityData?.myCharityPreference;
  const winnings = winningsData?.myWinnings || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-3xl font-extrabold text-offWhite tracking-tight">Subscriber Dashboard</h1>
        <p className="text-sm text-offWhite-muted mt-1">
          Monitor your active golf scores, draw tickets, and nominated charitable contributions.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Draw Card */}
        <Card glow className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-lime font-semibold">Next Official Draw</span>
            <Trophy className="w-4 h-4 text-lime" />
          </div>
          <div>
            <span className="text-2xl font-bold text-offWhite">
              {upcomingDraw ? upcomingDraw.name : 'December Draw'}
            </span>
            <span className="block text-xs text-offWhite-muted mt-1">
              {upcomingDraw?.scheduledAt
                ? `Date: ${new Date(upcomingDraw.scheduledAt).toLocaleDateString()}`
                : 'Scheduled Monthly'}
            </span>
          </div>
          <div className="pt-2 flex items-center justify-between text-xs border-t border-charcoal-border">
            <span className="text-offWhite-muted">Pool Estimate:</span>
            <span className="font-bold text-lime">
              ${((upcomingDraw?.prizePool?.totalPoolCents || 100000) / 100).toLocaleString()}
            </span>
          </div>
        </Card>

        {/* Active Scores Card */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-offWhite-muted font-semibold">Active Golf Scores</span>
            <Target className="w-4 h-4 text-lime" />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-offWhite">{activeScores.length}</span>
              <span className="text-xs text-offWhite-muted">/ 5 Active Slots</span>
            </div>
            <span className="block text-xs text-offWhite-muted mt-1">
              {activeScores.length === 5 ? 'All 5 slots active for next draw' : 'Add scores to complete ticket'}
            </span>
          </div>
          <div className="pt-2 flex items-center justify-between text-xs border-t border-charcoal-border">
            <Link to="/dashboard/scores" className="text-lime hover:underline inline-flex items-center">
              Manage Scores <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </Card>

        {/* Charity Allocation Card */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-offWhite-muted font-semibold">Nominated Charity</span>
            <Heart className="w-4 h-4 text-lime" />
          </div>
          <div>
            <span className="text-xl font-bold text-offWhite truncate block">
              {charityPref?.charity?.name || 'Youth Golf Foundation'}
            </span>
            <span className="block text-xs text-lime font-mono mt-1">
              {charityPref?.percentage || 15}% Guaranteed Contribution
            </span>
          </div>
          <div className="pt-2 flex items-center justify-between text-xs border-t border-charcoal-border">
            <Link to="/dashboard/charity" className="text-lime hover:underline inline-flex items-center">
              Change Cause or Percentage <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Active Scores Quick Preview */}
      <div className="glass-card rounded-2xl p-6 border border-charcoal-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-offWhite">Current 5 Active Scores</h3>
            <p className="text-xs text-offWhite-muted">These scores formulate your monthly draw entry ticket</p>
          </div>
          <Link to="/dashboard/scores">
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-lime text-navy hover:bg-lime-hover transition-colors">
              Submit Score
            </button>
          </Link>
        </div>

        {activeScores.length === 0 ? (
          <div className="text-center py-8 text-offWhite-muted text-sm space-y-2">
            <p>No active scores recorded yet.</p>
            <Link to="/dashboard/scores" className="text-lime text-xs hover:underline">
              Submit your first golf score (1-45 range)
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {activeScores.map((score: any) => (
              <div
                key={score.id}
                className="p-4 rounded-xl bg-charcoal border border-charcoal-border text-center space-y-1"
              >
                <span className="text-2xl font-extrabold font-mono text-lime">{score.scoreValue}</span>
                <span className="block text-[10px] text-offWhite-muted font-mono">{score.playedAt}</span>
                <span className="block text-[10px] text-offWhite truncate">{score.courseName}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Winnings Preview if any */}
      {winnings.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-lime/30 space-y-4">
          <div className="flex items-center space-x-2 text-lime">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-lg font-bold text-offWhite">You Have Winnings!</h3>
          </div>
          <p className="text-sm text-offWhite-muted">
            You matched winning numbers in a recent draw. Upload your scorecard proof to approve payout.
          </p>
          <Link to="/dashboard/winnings">
            <button className="px-4 py-2 rounded-xl text-xs font-bold bg-lime text-navy hover:bg-lime-hover">
              Go to Winnings & Proof Upload
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};
