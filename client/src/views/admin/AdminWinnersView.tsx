import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { CheckSquare, Check, X, ExternalLink, AlertCircle } from 'lucide-react';
import {
  GET_ADMIN_PENDING_WINNERS_QUERY,
  ADMIN_VERIFY_WINNER_MUTATION,
} from '../../graphql/operations';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const AdminWinnersView: React.FC = () => {
  const { data, loading, refetch } = useQuery(GET_ADMIN_PENDING_WINNERS_QUERY);
  const [verifyWinnerMutation] = useMutation(ADMIN_VERIFY_WINNER_MUTATION);

  const [rejectModalWinner, setRejectModalWinner] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const pendingWinners = data?.adminPendingWinners || [];

  const handleApprove = async (winnerId: string) => {
    setActionSuccess('');
    try {
      await verifyWinnerMutation({
        variables: { winnerId, approve: true },
      });
      setActionSuccess('Winner scorecard proof approved successfully! Payout is now eligible.');
      refetch();
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalWinner) return;
    setActionSuccess('');
    try {
      await verifyWinnerMutation({
        variables: {
          winnerId: rejectModalWinner.id,
          approve: false,
          rejectionReason,
        },
      });
      setRejectModalWinner(null);
      setRejectionReason('');
      setActionSuccess('Winner verification rejected and notification dispatched.');
      refetch();
    } catch (err: any) {
      alert(`Rejection failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold text-offWhite tracking-tight">Winner Verification Queue</h1>
        <p className="text-sm text-offWhite-muted mt-1">
          Inspect uploaded club scorecards, audit handicaps, and approve winners for payout disbursement.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-lime/10 border border-lime/30 text-lime text-sm flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {loading ? (
        <div className="glass-card rounded-2xl p-12 text-center text-offWhite-muted">Loading queue...</div>
      ) : pendingWinners.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-offWhite-muted space-y-2">
          <CheckSquare className="w-10 h-10 text-offWhite-muted mx-auto" />
          <h3 className="text-lg font-bold text-offWhite">Verification Queue Empty</h3>
          <p className="text-xs">All winner claims have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingWinners.map((w: any) => (
            <div key={w.id} className="glass-card rounded-2xl p-6 border border-charcoal-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="lime">Draw #{w.draw?.drawNumber}</Badge>
                    <span className="text-xs font-mono text-offWhite-muted">{w.prizeTier?.matchCount}-Number Match Tier</span>
                  </div>
                  <h3 className="text-xl font-bold text-offWhite mt-1">
                    {w.user?.profile?.firstName} {w.user?.profile?.lastName} ({w.user?.email})
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-offWhite-muted">Prize Due</span>
                  <div className="text-2xl font-extrabold text-lime font-mono">
                    ${((w.prizeAmountCents || 0) / 100).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Uploaded proofs */}
              <div className="p-4 rounded-xl bg-navy-950 border border-charcoal-border text-xs space-y-2">
                <span className="text-offWhite-muted font-mono uppercase block">Submitted Scorecard Proof:</span>
                {w.proofs?.length === 0 ? (
                  <span className="text-yellow-400">Waiting for subscriber to upload scorecard image.</span>
                ) : (
                  w.proofs?.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between">
                      <a
                        href={p.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-lime hover:underline inline-flex items-center space-x-1"
                      >
                        <span>Inspect Document ({p.fileType})</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </a>
                      {p.submittedNotes && (
                        <span className="text-offWhite-muted italic">"{p.submittedNotes}"</span>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setRejectModalWinner(w)}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Reject Claim
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(w.id)}
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Approve Winner
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalWinner && (
        <Modal
          isOpen={!!rejectModalWinner}
          onClose={() => setRejectModalWinner(null)}
          title="Reject Winner Verification"
        >
          <form onSubmit={handleReject} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-offWhite-muted mb-1.5">
                Reason for Rejection (Visible to Subscriber)
              </label>
              <textarea
                required
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Scorecard image was unreadable or date did not match submitted round..."
                className="w-full px-4 py-2.5 rounded-xl bg-charcoal-card border border-charcoal-border text-offWhite text-sm focus:border-lime focus:outline-none"
              />
            </div>
            <Button type="submit" variant="danger" className="w-full py-3">
              Confirm Rejection
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
