import React from 'react';
import { useQuery } from '@apollo/client';
import { Trophy, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { GET_UPCOMING_DRAW_QUERY, GET_PAST_DRAWS_QUERY } from '../../graphql/operations';
import { Badge } from '../../components/ui/Badge';

export const DrawInfoPage: React.FC = () => {
  const { data: upcomingData } = useQuery(GET_UPCOMING_DRAW_QUERY);
  const { data: pastData, loading: pastLoading } = useQuery(GET_PAST_DRAWS_QUERY, {
    variables: { limit: 5 },
  });

  const upcomingDraw = upcomingData?.upcomingDraw;
  const pastDraws = pastData?.pastDraws || [];

  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-charcoal border border-lime/30 text-xs font-mono text-lime">
          <Trophy className="w-3.5 h-3.5" />
          <span>OFFICIAL MONTHLY PRIZE DRAWS</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-offWhite tracking-tight">
          Draw Schedules & Verified Results
        </h1>
        <p className="text-lg text-offWhite-muted leading-relaxed">
          Amateur golf scores translate directly into your 5-number draw tickets. Every draw is powered by audited operating-system CSPRNG with immutable blockchain-ready cryptographic seed hashes.
        </p>
      </div>

      {/* Upcoming Draw Card */}
      {upcomingDraw && (
        <div className="glass-card max-w-4xl mx-auto rounded-3xl p-8 border border-lime/40 glow-lime space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-lime uppercase font-semibold">Upcoming Official Draw</span>
              <h2 className="text-2xl font-bold text-offWhite">{upcomingDraw.name}</h2>
              <div className="flex items-center space-x-2 text-xs text-offWhite-muted mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Scheduled for: {new Date(upcomingDraw.scheduledAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-offWhite-muted uppercase">Estimated Prize Pool</span>
              <div className="text-3xl font-extrabold text-lime">
                ${((upcomingDraw.prizePool?.totalPoolCents || 100000) / 100).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-charcoal-border grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-charcoal/70 border border-charcoal-border text-center">
              <span className="block text-xs font-mono text-lime">Match 5 (Jackpot)</span>
              <span className="text-lg font-bold text-offWhite">40% of Pool</span>
            </div>
            <div className="p-3 rounded-xl bg-charcoal/70 border border-charcoal-border text-center">
              <span className="block text-xs font-mono text-lime">Match 4</span>
              <span className="text-lg font-bold text-offWhite">35% of Pool</span>
            </div>
            <div className="p-3 rounded-xl bg-charcoal/70 border border-charcoal-border text-center">
              <span className="block text-xs font-mono text-lime">Match 3</span>
              <span className="text-lg font-bold text-offWhite">25% of Pool</span>
            </div>
          </div>
        </div>
      )}

      {/* Past Results Section */}
      <div className="max-w-4xl mx-auto space-y-6">
        <h3 className="text-2xl font-bold text-offWhite">Recent Official Draw Results</h3>

        {pastLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-6 h-32 animate-pulse" />
            ))}
          </div>
        ) : pastDraws.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-offWhite-muted">
            No published past draws available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {pastDraws.map((d: any) => (
              <div
                key={d.id}
                className="glass-card rounded-2xl p-6 border border-charcoal-border space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono text-lime">Draw #{d.drawNumber}</span>
                    <h4 className="text-lg font-bold text-offWhite">{d.name}</h4>
                  </div>
                  <span className="text-xs text-offWhite-muted">
                    Executed: {d.executedAt ? new Date(d.executedAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                {/* Winning Numbers Balls */}
                {d.result?.winningNumbers && (
                  <div className="flex items-center space-x-3 pt-2">
                    <span className="text-xs font-mono text-offWhite-muted mr-2">Winning Numbers:</span>
                    {d.result.winningNumbers.map((num: number) => (
                      <div
                        key={num}
                        className="w-10 h-10 rounded-full bg-charcoal border-2 border-lime flex items-center justify-center text-sm font-bold font-mono text-lime shadow-md shadow-lime/10"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
