import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { Trophy, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { REGISTER_MUTATION } from '../../graphql/operations';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    country: 'US',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [registerMutation, { loading }] = useMutation(REGISTER_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const { data } = await registerMutation({
        variables: { input: formData },
      });
      const { accessToken, refreshToken, user } = data.register;
      login(accessToken, user, refreshToken);
      navigate('/dashboard/scores');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="glass-card max-w-lg w-full rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-charcoal border border-lime/30 items-center justify-center">
            <Trophy className="w-6 h-6 text-lime" />
          </div>
          <h2 className="text-2xl font-bold text-offWhite">Create Your Account</h2>
          <p className="text-sm text-offWhite-muted">
            Join the platform, submit your golf scores, and nominate your cause
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-offWhite-muted mb-1.5">
                First Name
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Rory"
                className="w-full px-4 py-2.5 rounded-xl bg-charcoal border border-charcoal-border text-offWhite placeholder-offWhite-muted/50 focus:border-lime focus:outline-none transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-offWhite-muted mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="McIlroy"
                className="w-full px-4 py-2.5 rounded-xl bg-charcoal border border-charcoal-border text-offWhite placeholder-offWhite-muted/50 focus:border-lime focus:outline-none transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-offWhite-muted mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="golfer@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-charcoal border border-charcoal-border text-offWhite placeholder-offWhite-muted/50 focus:border-lime focus:outline-none transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-offWhite-muted mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 8 characters"
              className="w-full px-4 py-2.5 rounded-xl bg-charcoal border border-charcoal-border text-offWhite placeholder-offWhite-muted/50 focus:border-lime focus:outline-none transition-colors text-sm"
            />
          </div>

          <div className="pt-2 text-xs text-offWhite-muted space-y-1">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime" />
              <span>Includes entry into all upcoming monthly prize draws</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime" />
              <span>Min 10% guaranteed allocation to your selected charity</span>
            </div>
          </div>

          <Button type="submit" isLoading={loading} className="w-full py-3">
            Complete Registration
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-offWhite-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-lime hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
