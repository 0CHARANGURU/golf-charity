import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { DollarSign, Check, Send, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  GET_ADMIN_PENDING_WINNERS_QUERY,
  ADMIN_PROCESS_PAYOUT_MUTATION,
} from '../../graphql/operations';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const AdminPayoutsView: React.FC = () => {
  const { data, loading, refetch } = useQuery(GET_ADMIN_PENDING_WINNERS_QUERY);
  const [processPayoutMutation, { loading: processing }] = useMutation(ADMIN_PROCESS_PAYOUT_MUTATION);

  const [payoutMethod, setPayoutMethod] = useState('STRIPE_CONNECT');
  const [payoutMessage, setPayoutMessage] = useState('');

  // Winners that are APPROVED but not yet disbursed
  const approvedWinners = (data?.adminPendingWinners || []).filter(
    (w: any) => w.verificationStatus === 'APPROVED'
  );

  const handleDisburse = async (winnerId: string) => {
    if (!confirm('Execute payout disbursement for this approved winner?')) return;
    setPayoutMessage('');
    try {
      const { data } = await processPayoutMutation({
        variables: { winnerId, payoutMethod },
      });
      const payout = data.adminProcessPayout;
      setPayoutMessage(`Disbursed $${(payout.amountCents / 100).toFixed(2)}! Reference: ${payout.payoutReference}`);
      refetch();
    } catch (err: any) {
      alert(`Payout failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold text-offWhite tracking-tight">Prize Payouts & Financial Disbursements</h1>
        <p className="text-sm text-offWhite-muted mt-1">
          Issue verified cash prizes to winning subscribers via Stripe Connect or ACH/SEPA transfer rails.
        </p>
      </div>

      {payoutMessage && (
        <div className="p-4 rounded-xl bg-lime/10 border border-lime/30 text-lime text-sm flex items-center space-x-2">
          <Check className="w-5 h-5" />
          <span>{payoutMessage}</span>
        </div>
      )}

      {/* Global Payout Rail Controller */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-offWhite">Disbursement Rail</h3>
            <p className="text-xs text-offWhite-muted">Selected payout gateway for all outbound batch distributions</p>
          </div>
          <select
            value={payoutMethod}
            onChange={(e) => setPayoutMethod(e.target.value)}
            className="px-4 py-2 rounded-xl bg-navy-950 border border-charcoal-border text-offWhite text-sm focus:border-lime focus:outline-none"
          >
            <option value="STRIPE_CONNECT">Stripe Connect (Instant / Standard ACH)</option>
            <option value="BANK_TRANSFER">Direct Wire / SEPA Bank Transfer</option>
            <option value="PAYPAL">PayPal Payouts API</option>
          </select>
        </div>
      </Card>

      {/* List of Eligible Approved Winners */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-offWhite">Approved Claims Awaiting Disbursement</h3>

        {loading ? (
          <div className="glass-card rounded-2xl p-8 text-center text-offWhite-muted">Loading eligible claims...</div>
        ) : approvedWinners.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-offWhite-muted space-y-2">
            <DollarSign className="w-10 h-10 text-offWhite-muted mx-auto" />
            <h4 className="text-base font-bold text-offWhite">No Pending Payouts</h4>
            <p className="text-xs">All approved winner prizes have been disbursed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvedWinners.map((winner: any) => (
              <div
                key={winner.id}
                className="glass-card rounded-2xl p-6 border border-charcoal-border space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <Badge variant="lime">Approved Claim</Badge>
                    <h4 className="text-lg font-bold text-offWhite mt-1">
                      {winner.user?.profile?.firstName} {winner.user?.profile?.lastName} ({winner.user?.email})
                    </h4>
                    <span className="text-xs text-offWhite-muted">
                      Draw #{winner.draw?.drawNumber} • {winner.prizeTier?.matchCount}-Number Match
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono text-offWhite-muted">Disbursement Amount</span>
                    <div className="text-2xl font-extrabold text-lime font-mono">
                      ${((winner.prizeAmountCents || 0) / 100).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    onClick={() => handleDisburse(winner.id)}
                    isLoading={processing}
                    className="py-2.5 px-5"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Disburse Payout
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
