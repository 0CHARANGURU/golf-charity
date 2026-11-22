import React from 'react';
import { useQuery } from '@apollo/client';
import { Trophy, Calendar, CheckCircle2 } from 'lucide-react';
import { GET_PAST_DRAWS_QUERY, GET_UPCOMING_DRAW_QUERY } from '../../graphql/operations';
import { Badge } from '../../components/ui/Badge';

export const DrawHistoryView: React.FC = () => {
  const { data: upcomingData } = useQuery(GET_UPCOMING_DRAW_QUERY);
  const { data: pastData, loading } = useQuery(GET_PAST_DRAWS_QUERY, {
    variables: { limit: 10 },
  });

  const upcomingDraw = upcomingData?.upcomingDraw;
  const pastDraws = pastData?.pastDraws || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-offWhite tracking-tight">Draw History & Entries</h1>
        <p className="text-sm text-offWhite-muted mt-1">
          Review your official draw tickets, winning number matches, and prize allocations.
        </p>
      </div>

      {/* Active Upcoming Draw Entry Card */}
      {upcomingDraw && (
        <div className="glass-card rounded-2xl p-6 border border-lime/40 glow-lime space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-lime font-semibold">Current Active Entry</span>
            <Badge variant="lime">Enrolled</Badge>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-offWhite">{upcomingDraw.name}</h3>
              <p className="text-xs text-offWhite-muted flex items-center mt-1">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                Scheduled execution: {new Date(upcomingDraw.scheduledAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-offWhite-muted">Your Ticket Formulation:</span>
              <span className="block text-sm font-semibold text-lime">Active 5 Golf Scores</span>
            </div>
          </div>
        </div>
      )}

      {/* Past Draws Explorer */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-offWhite">Past Executed Draws</h2>
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-6 h-28 animate-pulse" />
            ))}
          </div>
        ) : pastDraws.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-offWhite-muted">
            No past draw history available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {pastDraws.map((draw: any) => (
              <div
                key={draw.id}
                className="glass-card rounded-2xl p-6 border border-charcoal-border space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono text-lime">Draw #{draw.drawNumber}</span>
                    <h3 className="text-lg font-bold text-offWhite">{draw.name}</h3>
                  </div>
                  <span className="text-xs text-offWhite-muted">
                    {draw.executedAt ? new Date(draw.executedAt).toLocaleDateString() : 'Executed'}
                  </span>
                </div>

                {/* Winning numbers display */}
                {draw.result?.winningNumbers && (
                  <div className="p-4 rounded-xl bg-navy-950 border border-charcoal-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-offWhite-muted mr-2">Official Drawn Numbers:</span>
                      {draw.result.winningNumbers.map((num: number) => (
                        <div
                          key={num}
                          className="w-9 h-9 rounded-full bg-charcoal border border-lime flex items-center justify-center font-mono font-bold text-lime text-xs"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs font-mono text-offWhite-muted">
                      Hash: {draw.result.drawSeedHash.substring(0, 16)}...
                    </div>
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
