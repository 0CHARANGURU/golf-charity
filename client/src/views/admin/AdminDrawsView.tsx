import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Trophy, Play, Plus, Calendar, CheckCircle2 } from 'lucide-react';
import {
  GET_UPCOMING_DRAW_QUERY,
  GET_PAST_DRAWS_QUERY,
  ADMIN_EXECUTE_DRAW_MUTATION,
  GET_DRAW_CONFIGURATIONS_QUERY,
} from '../../graphql/operations';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const AdminDrawsView: React.FC = () => {
  const { data: upcomingData, refetch: refetchUpcoming } = useQuery(GET_UPCOMING_DRAW_QUERY);
  const { data: pastData, refetch: refetchPast } = useQuery(GET_PAST_DRAWS_QUERY);
  const { data: configData } = useQuery(GET_DRAW_CONFIGURATIONS_QUERY);

  const [executeDrawMutation, { loading: executing }] = useMutation(ADMIN_EXECUTE_DRAW_MUTATION);
  const [successMessage, setSuccessMessage] = useState('');

  const upcomingDraw = upcomingData?.upcomingDraw;
  const pastDraws = pastData?.pastDraws || [];

  const handleExecuteDraw = async (drawId: string) => {
    if (!confirm('Are you sure you want to execute this official draw? This will draw CSPRNG numbers, score all tickets, allocate prize pools, and notify winners.')) {
      return;
    }
    setSuccessMessage('');
    try {
      await executeDrawMutation({ variables: { drawId } });
      setSuccessMessage('Draw executed and officially published successfully!');
      refetchUpcoming();
      refetchPast();
    } catch (err: any) {
      alert(`Draw execution failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-offWhite tracking-tight">Draw Management</h1>
        <p className="text-sm text-offWhite-muted mt-1">
          Execute scheduled official monthly prize draws and audit cryptographic seed results.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-lime/10 border border-lime/30 text-lime text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Scheduled Draw Card */}
      {upcomingDraw ? (
        <Card glow className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Badge variant="lime">Scheduled for Execution</Badge>
                <span className="text-xs font-mono text-offWhite-muted">Draw #{upcomingDraw.drawNumber}</span>
              </div>
              <h2 className="text-2xl font-bold text-offWhite mt-2">{upcomingDraw.name}</h2>
              <p className="text-xs text-offWhite-muted flex items-center mt-1">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                Target Date: {new Date(upcomingDraw.scheduledAt).toLocaleDateString()}
              </p>
            </div>

            <Button
              onClick={() => handleExecuteDraw(upcomingDraw.id)}
              isLoading={executing}
              className="py-3 px-6"
            >
              <Play className="w-4 h-4 mr-2" />
              Execute Official Draw (CSPRNG)
            </Button>
          </div>
        </Card>
      ) : (
        <div className="glass-card rounded-2xl p-8 text-center text-offWhite-muted">
          No scheduled draw currently awaiting execution.
        </div>
      )}

      {/* Executed Past Draws */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-offWhite">Past Executed & Published Draws</h3>
        <div className="space-y-4">
          {pastDraws.map((d: any) => (
            <div key={d.id} className="glass-card rounded-2xl p-6 border border-charcoal-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono text-lime font-bold">Draw #{d.drawNumber}</span>
                  <h4 className="text-lg font-bold text-offWhite">{d.name}</h4>
                </div>
                <Badge variant="lime">PUBLISHED</Badge>
              </div>

              {d.result?.winningNumbers && (
                <div className="flex items-center space-x-3 pt-2">
                  <span className="text-xs font-mono text-offWhite-muted mr-2">Winning Numbers:</span>
                  {d.result.winningNumbers.map((n: number) => (
                    <div
                      key={n}
                      className="w-9 h-9 rounded-full bg-charcoal border border-lime flex items-center justify-center font-mono font-bold text-lime text-xs"
                    >
                      {n}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
