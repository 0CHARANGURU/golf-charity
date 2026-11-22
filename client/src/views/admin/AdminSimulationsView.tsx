import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Cpu, Play, ShieldCheck, BarChart2 } from 'lucide-react';
import { GET_DRAW_CONFIGURATIONS_QUERY, ADMIN_RUN_SIMULATION_MUTATION } from '../../graphql/operations';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const AdminSimulationsView: React.FC = () => {
  const { data: configData } = useQuery(GET_DRAW_CONFIGURATIONS_QUERY);
  const [runSimulationMutation, { loading }] = useMutation(ADMIN_RUN_SIMULATION_MUTATION);

  const [ticketCount, setTicketCount] = useState(1000);
  const [mode, setMode] = useState<'RANDOM' | 'FREQUENCY_WEIGHTED'>('RANDOM');
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  const configs = configData?.drawConfigurations || [];
  const activeConfig = configs[0];

  const handleRunSimulation = async () => {
    if (!activeConfig) return;
    try {
      const { data } = await runSimulationMutation({
        variables: {
          configurationId: activeConfig.id,
          count: parseInt(ticketCount.toString(), 10),
          mode,
        },
      });
      setSimulationResult(data.adminRunSimulation);
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold text-offWhite tracking-tight">Draw Simulation Sandbox</h1>
        <p className="text-sm text-offWhite-muted mt-1">
          Perform probabilistic stress testing across large ticket volumes without touching official database records.
        </p>
      </div>

      {/* Isolation Guarantee Pill */}
      <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-lime/10 border border-lime/30 text-lime text-xs font-mono">
        <ShieldCheck className="w-4 h-4" />
        <span>SIMULATION ISOLATION GUARANTEED: ZERO WRITES TO OFFICIAL DRAW TABLES</span>
      </div>

      {/* Sandbox Controller Card */}
      <Card glow className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase text-offWhite-muted mb-1.5">
              Simulated Tickets
            </label>
            <select
              value={ticketCount}
              onChange={(e) => setTicketCount(parseInt(e.target.value, 10))}
              className="w-full px-4 py-2.5 rounded-xl bg-charcoal-card border border-charcoal-border text-offWhite text-sm focus:border-lime focus:outline-none"
            >
              <option value={100}>100 Tickets</option>
              <option value={500}>500 Tickets</option>
              <option value={1000}>1,000 Tickets</option>
              <option value={5000}>5,000 Tickets</option>
              <option value={10000}>10,000 Tickets</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-offWhite-muted mb-1.5">
              Draw Algorithm Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl bg-charcoal-card border border-charcoal-border text-offWhite text-sm focus:border-lime focus:outline-none"
            >
              <option value="RANDOM">Uniform Random CSPRNG</option>
              <option value="FREQUENCY_WEIGHTED">Score Frequency Weighted</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleRunSimulation}
              isLoading={loading}
              className="w-full py-2.5"
            >
              <Cpu className="w-4 h-4 mr-2" />
              Run Simulation
            </Button>
          </div>
        </div>
      </Card>

      {/* Simulation Results Visualization */}
      {simulationResult && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-offWhite">Simulation Outcome & Match Distribution</h2>

          {/* Winning Numbers Drawn */}
          <div className="glass-card rounded-2xl p-6 border border-charcoal-border space-y-3">
            <span className="text-xs font-mono text-offWhite-muted">Simulated Winning Numbers:</span>
            <div className="flex items-center space-x-3">
              {simulationResult.winningNumbers.map((n: number) => (
                <div
                  key={n}
                  className="w-10 h-10 rounded-full bg-charcoal border-2 border-lime flex items-center justify-center font-mono font-bold text-lime text-sm"
                >
                  {n}
                </div>
              ))}
            </div>
          </div>

          {/* Match Counts Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {[0, 1, 2, 3, 4, 5].map((matches) => {
              const count = simulationResult.simulationStats?.matchCounts?.[matches] || 0;
              const isWinner = matches >= 3;
              return (
                <div
                  key={matches}
                  className={`p-4 rounded-xl text-center space-y-1 border ${
                    isWinner
                      ? 'bg-charcoal border-lime/40 shadow-sm shadow-lime/10'
                      : 'bg-navy-950 border-charcoal-border'
                  }`}
                >
                  <span className={`text-xs font-mono font-semibold block ${isWinner ? 'text-lime' : 'text-offWhite-muted'}`}>
                    {matches} Match{matches !== 1 ? 'es' : ''}
                  </span>
                  <span className="text-2xl font-bold font-mono text-offWhite block">{count}</span>
                  <span className="text-[10px] text-offWhite-muted font-mono block">
                    {((count / simulationResult.simulatedEntryCount) * 100).toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
