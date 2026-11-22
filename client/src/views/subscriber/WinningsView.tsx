import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Award, Upload, CheckCircle2, AlertCircle, FileText, DollarSign } from 'lucide-react';
import { GET_MY_WINNINGS_QUERY, SUBMIT_PROOF_MUTATION } from '../../graphql/operations';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const WinningsView: React.FC = () => {
  const { data, loading, refetch } = useQuery(GET_MY_WINNINGS_QUERY);
  const [submitProofMutation, { loading: uploading }] = useMutation(SUBMIT_PROOF_MUTATION);

  const [activeWinner, setActiveWinner] = useState<any | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const winnings = data?.myWinnings || [];

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWinner) return;
    setErrorMsg('');

    try {
      await submitProofMutation({
        variables: {
          input: {
            winnerId: activeWinner.id,
            fileUrl,
            fileType: 'image/jpeg',
            fileSizeBytes: 1048576,
            notes,
          },
        },
      });
      setActiveWinner(null);
      setFileUrl('');
      setNotes('');
      refetch();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit scorecard proof.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-offWhite tracking-tight">Winnings & Proof Verification</h1>
        <p className="text-sm text-offWhite-muted mt-1">
          Review your prize payouts and submit signed club scorecards for administrative verification.
        </p>
      </div>

      {loading ? (
        <div className="glass-card rounded-2xl p-12 text-center text-offWhite-muted">Loading winnings...</div>
      ) : winnings.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-offWhite-muted space-y-3">
          <Award className="w-12 h-12 text-offWhite-muted mx-auto" />
          <h3 className="text-lg font-bold text-offWhite">No Prize Winnings Yet</h3>
          <p className="text-sm max-w-md mx-auto">
            Maintain your 5 active golf scores and ensure your monthly subscription is active to enter upcoming draws.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {winnings.map((win: any) => (
            <div
              key={win.id}
              className="glass-card rounded-2xl p-6 border border-charcoal-border space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono text-lime">Draw #{win.draw?.drawNumber}</span>
                  <h3 className="text-xl font-bold text-offWhite">{win.draw?.name}</h3>
                  <span className="text-xs text-offWhite-muted">
                    Tier: {win.prizeTier?.matchCount}-Number Match Prize
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-offWhite-muted">Prize Amount</span>
                  <div className="text-3xl font-extrabold text-lime">
                    ${((win.prizeAmountCents || 0) / 100).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Status Row */}
              <div className="pt-4 border-t border-charcoal-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-offWhite-muted">Verification Status:</span>
                  <Badge
                    variant={
                      win.verificationStatus === 'APPROVED'
                        ? 'lime'
                        : win.verificationStatus === 'REJECTED'
                        ? 'red'
                        : 'gray'
                    }
                  >
                    {win.verificationStatus}
                  </Badge>

                  {win.payout && (
                    <span className="text-xs font-mono text-offWhite-muted">
                      Payout: <span className="text-lime font-bold">{win.payout.status}</span> ({win.payout.payoutReference})
                    </span>
                  )}
                </div>

                {win.verificationStatus !== 'APPROVED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveWinner(win)}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Upload Scorecard Proof
                  </Button>
                )}
              </div>

              {win.rejectionReason && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  Rejection Reason: {win.rejectionReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Proof Upload Modal */}
      {activeWinner && (
        <Modal
          isOpen={!!activeWinner}
          onClose={() => setActiveWinner(null)}
          title={`Upload Scorecard Proof - Draw #${activeWinner.draw?.drawNumber}`}
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase text-offWhite-muted mb-1.5">
                Scorecard Image / Document URL
              </label>
              <input
                type="url"
                required
                placeholder="https://example.com/my-scorecard.jpg"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-charcoal-card border border-charcoal-border text-offWhite text-sm focus:border-lime focus:outline-none"
              />
              <span className="text-[10px] text-offWhite-muted block mt-1">
                Provide a photo of your signed paper scorecard or certified digital handicap record.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-offWhite-muted mb-1.5">
                Notes for Verifier
              </label>
              <textarea
                rows={3}
                placeholder="Signed by club pro at Pebble Beach on Nov 18..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-charcoal-card border border-charcoal-border text-offWhite text-sm focus:border-lime focus:outline-none"
              />
            </div>

            <Button type="submit" isLoading={uploading} className="w-full py-3">
              Submit Proof for Review
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
