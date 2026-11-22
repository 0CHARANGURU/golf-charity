import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Target, Plus, Archive, Trash2, Calendar, AlertCircle } from 'lucide-react';
import {
  GET_MY_SCORES_QUERY,
  SUBMIT_SCORE_MUTATION,
  DELETE_SCORE_MUTATION,
} from '../../graphql/operations';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const GolfScoresView: React.FC = () => {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [formData, setFormData] = useState({
    scoreValue: 36,
    playedAt: new Date().toISOString().split('T')[0],
    courseName: '',
    holesPlayed: 18,
  });
  const [errorMsg, setErrorMsg] = useState('');

  const { data, loading, refetch } = useQuery(GET_MY_SCORES_QUERY, {
    variables: { includeArchived: true },
  });

  const [submitScoreMutation, { loading: submitting }] = useMutation(SUBMIT_SCORE_MUTATION);
  const [deleteScoreMutation] = useMutation(DELETE_SCORE_MUTATION);

  const allScores = data?.myScores || [];
  const activeScores = allScores.filter((s: any) => s.isActive);
  const archivedScores = allScores.filter((s: any) => !s.isActive);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.scoreValue < 1 || formData.scoreValue > 45) {
      setErrorMsg('Golf score must be between 1 and 45 points.');
      return;
    }

    try {
      await submitScoreMutation({
        variables: {
          input: {
            scoreValue: parseInt(formData.scoreValue.toString(), 10),
            playedAt: formData.playedAt,
            courseName: formData.courseName,
            holesPlayed: parseInt(formData.holesPlayed.toString(), 10),
          },
        },
      });
      setIsSubmitOpen(false);
      setFormData({
        scoreValue: 36,
        playedAt: new Date().toISOString().split('T')[0],
        courseName: '',
        holesPlayed: 18,
      });
      refetch();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit score.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this score?')) {
      await deleteScoreMutation({ variables: { id } });
      refetch();
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-offWhite tracking-tight">Golf Scores Management</h1>
          <p className="text-sm text-offWhite-muted mt-1">
            Submit your Stableford or round scores (1-45 range). The system maintains your 5 most recent active scores.
          </p>
        </div>
        <Button onClick={() => setIsSubmitOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Submit New Score
        </Button>
      </div>

      {/* Active 5 Scores Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-lime" />
            <h2 className="text-lg font-bold text-offWhite">Active Scorecard Slots ({activeScores.length}/5)</h2>
          </div>
          <span className="text-xs font-mono text-offWhite-muted">
            Newest submitted scores push oldest into archive
          </span>
        </div>

        {activeScores.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-offWhite-muted space-y-3">
            <Target className="w-10 h-10 text-offWhite-muted mx-auto" />
            <p className="text-base font-semibold text-offWhite">No active golf scores submitted yet.</p>
            <p className="text-xs">Click "Submit New Score" above to add your first round score.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {activeScores.map((score: any) => (
              <div
                key={score.id}
                className="glass-card rounded-2xl p-5 border border-charcoal-border hover:border-lime/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <Badge variant="lime">Active</Badge>
                  <button
                    onClick={() => handleDelete(score.id)}
                    className="text-offWhite-muted hover:text-red-400 p-1 transition-colors"
                    title="Delete score"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-center py-2">
                  <span className="text-4xl font-extrabold font-mono text-lime">{score.scoreValue}</span>
                  <span className="block text-[10px] font-mono text-offWhite-muted mt-1">
                    {score.holesPlayed} Holes Played
                  </span>
                </div>
                <div className="pt-2 border-t border-charcoal-border text-xs space-y-1">
                  <p className="font-semibold text-offWhite truncate">{score.courseName}</p>
                  <p className="text-offWhite-muted text-[10px] flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {score.playedAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Archived Scores Section */}
      {archivedScores.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center space-x-2 text-offWhite-muted">
            <Archive className="w-4 h-4" />
            <h2 className="text-lg font-bold text-offWhite">Archived Scores ({archivedScores.length})</h2>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden border border-charcoal-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-offWhite-muted">
                <thead className="bg-navy-950 text-xs font-mono uppercase text-offWhite border-b border-charcoal-border">
                  <tr>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3">Course</th>
                    <th className="px-6 py-3">Date Played</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-border">
                  {archivedScores.map((score: any) => (
                    <tr key={score.id} className="hover:bg-charcoal/40">
                      <td className="px-6 py-4 font-mono font-bold text-offWhite">{score.scoreValue}</td>
                      <td className="px-6 py-4">{score.courseName}</td>
                      <td className="px-6 py-4">{score.playedAt}</td>
                      <td className="px-6 py-4">
                        <Badge variant="gray">Archived</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Submit Score Modal */}
      <Modal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} title="Submit Golf Score">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase text-offWhite-muted mb-1.5">
              Score Points (Range: 1 - 45)
            </label>
            <input
              type="number"
              min={1}
              max={45}
              required
              value={formData.scoreValue}
              onChange={(e) => setFormData({ ...formData, scoreValue: parseInt(e.target.value, 10) })}
              className="w-full px-4 py-2.5 rounded-xl bg-charcoal-card border border-charcoal-border text-offWhite focus:border-lime focus:outline-none text-base font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-offWhite-muted mb-1.5">
              Date Played (Non-Future)
            </label>
            <input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              required
              value={formData.playedAt}
              onChange={(e) => setFormData({ ...formData, playedAt: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-charcoal-card border border-charcoal-border text-offWhite focus:border-lime focus:outline-none text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-offWhite-muted mb-1.5">
              Golf Course Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Pebble Beach Golf Links"
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-charcoal-card border border-charcoal-border text-offWhite focus:border-lime focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-offWhite-muted mb-1.5">
              Holes Played
            </label>
            <select
              value={formData.holesPlayed}
              onChange={(e) => setFormData({ ...formData, holesPlayed: parseInt(e.target.value, 10) })}
              className="w-full px-4 py-2.5 rounded-xl bg-charcoal-card border border-charcoal-border text-offWhite focus:border-lime focus:outline-none text-sm"
            >
              <option value={18}>18 Holes (Standard Round)</option>
              <option value={9}>9 Holes</option>
            </select>
          </div>

          <div className="pt-2">
            <Button type="submit" isLoading={submitting} className="w-full py-3">
              Record Score
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
