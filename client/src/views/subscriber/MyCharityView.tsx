import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Heart, Check, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import {
  GET_MY_CHARITY_PREF_QUERY,
  GET_CHARITIES_QUERY,
  SET_CHARITY_PREF_MUTATION,
} from '../../graphql/operations';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const MyCharityView: React.FC = () => {
  const { data: prefData, loading: prefLoading, refetch } = useQuery(GET_MY_CHARITY_PREF_QUERY);
  const { data: charitiesData } = useQuery(GET_CHARITIES_QUERY);
  const [setPrefMutation, { loading: saving }] = useMutation(SET_CHARITY_PREF_MUTATION);

  const [percentage, setPercentage] = useState(10);
  const [selectedCharityId, setSelectedCharityId] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentPref = prefData?.myCharityPreference;
  const charities = charitiesData?.charities?.charities || [];

  useEffect(() => {
    if (currentPref) {
      setPercentage(currentPref.percentage || 10);
      setSelectedCharityId(currentPref.charity?.id || '');
    } else if (charities.length > 0) {
      setSelectedCharityId(charities[0].id);
    }
  }, [currentPref, charities]);

  const handleSave = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!selectedCharityId) return;

    if (percentage < 10) {
      setErrorMsg('Allocation must be at least 10.00%.');
      return;
    }

    try {
      await setPrefMutation({
        variables: {
          charityId: selectedCharityId,
          percentage: parseFloat(percentage.toString()),
        },
      });
      setSuccessMsg('Charity preference updated successfully!');
      refetch();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update charity preference.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-offWhite tracking-tight">My Nominated Charity</h1>
        <p className="text-sm text-offWhite-muted mt-1">
          Select which certified non-profit receives your subscription donation and configure your contribution percentage (minimum 10%).
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-lime/10 border border-lime/30 text-lime text-sm flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Percentage Allocation Card */}
      <Card glow className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-offWhite">Contribution Percentage</h3>
            <p className="text-xs text-offWhite-muted">Minimum 10% required by platform standards</p>
          </div>
          <span className="text-3xl font-extrabold font-mono text-lime">{percentage}%</span>
        </div>

        <div>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={percentage}
            onChange={(e) => setPercentage(parseInt(e.target.value, 10))}
            className="w-full accent-lime h-2 bg-charcoal rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-offWhite-muted mt-2">
            <span>10% (Minimum)</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100% (Pure Philanthropy)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-navy-950 border border-charcoal-border text-xs text-offWhite-muted space-y-1">
          <p className="text-offWhite font-semibold">Financial Impact Summary:</p>
          <p>
            On a $20/month plan, an allocation of {percentage}% directs{' '}
            <span className="text-lime font-bold font-mono">
              ${((20 * percentage) / 100).toFixed(2)}
            </span>{' '}
            each month directly to your chosen charity.
          </p>
        </div>
      </Card>

      {/* Charity Selection Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-offWhite">Select Beneficiary Organization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {charities.map((charity: any) => {
            const isSelected = selectedCharityId === charity.id;
            return (
              <div
                key={charity.id}
                onClick={() => setSelectedCharityId(charity.id)}
                className={`p-5 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-charcoal border-lime shadow-md shadow-lime/10'
                    : 'glass-card border-charcoal-border hover:border-charcoal-light'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-offWhite">{charity.name}</h4>
                      <span className="text-xs font-mono text-offWhite-muted">
                        {charity.registrationNumber}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-lime text-navy flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-offWhite-muted mt-2 line-clamp-2">
                    {charity.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-charcoal-border/50">
                  <Badge variant="gray">{charity.category}</Badge>
                  <span className="text-[11px] text-lime font-mono">
                    Raised: ${((charity.totalReceivedCents || 0) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={handleSave} isLoading={saving} className="px-8 py-3">
          Save Charity Preferences
        </Button>
      </div>
    </div>
  );
};
