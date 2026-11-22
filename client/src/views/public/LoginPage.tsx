import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { Trophy, ArrowRight, AlertCircle } from 'lucide-react';
import { LOGIN_MUTATION } from '../../graphql/operations';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const { data } = await loginMutation({
        variables: { input: { email, password } },
      });
      const { accessToken, refreshToken, user } = data.login;
      login(accessToken, user, refreshToken);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="glass-card max-w-md w-full rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-charcoal border border-lime/30 items-center justify-center">
            <Trophy className="w-6 h-6 text-lime" />
          </div>
          <h2 className="text-2xl font-bold text-offWhite">Welcome Back</h2>
          <p className="text-sm text-offWhite-muted">Sign in to your Golf Charity subscriber account</p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-offWhite-muted mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="golfer@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-charcoal border border-charcoal-border text-offWhite placeholder-offWhite-muted/50 focus:border-lime focus:outline-none transition-colors text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-offWhite-muted">
                Password
              </label>
              <a href="#forgot" className="text-xs text-lime hover:underline">
                Forgot?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-charcoal border border-charcoal-border text-offWhite placeholder-offWhite-muted/50 focus:border-lime focus:outline-none transition-colors text-sm"
            />
          </div>

          <Button type="submit" isLoading={loading} className="w-full py-3">
            Sign In
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-offWhite-muted">
            Don't have an active subscription?{' '}
            <Link to="/plans" className="text-lime hover:underline font-medium">
              View Plans
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
