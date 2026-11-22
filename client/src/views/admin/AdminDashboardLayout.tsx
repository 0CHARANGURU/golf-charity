import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  BarChart3,
  Trophy,
  Cpu,
  CheckSquare,
  DollarSign,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Platform Analytics', path: '/admin', icon: BarChart3 },
    { label: 'Draw Management', path: '/admin/draws', icon: Trophy },
    { label: 'Draw Simulation Sandbox', path: '/admin/simulations', icon: Cpu },
    { label: 'Winner Verification', path: '/admin/winners', icon: CheckSquare },
    { label: 'Disburse Payouts', path: '/admin/payouts', icon: DollarSign },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-navy flex">
      {/* Admin Sidebar */}
      <aside className="w-64 flex flex-col bg-navy-950 border-r border-charcoal-border p-6 justify-between">
        <div className="space-y-8">
          {/* Logo */}
          <div className="space-y-2">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-charcoal border border-lime flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-lime" />
              </div>
              <div>
                <span className="text-lg font-bold text-offWhite tracking-tight">
                  ADMIN<span className="text-lime">PANEL</span>
                </span>
                <span className="block text-[9px] font-mono text-lime uppercase">
                  Operator Console
                </span>
              </div>
            </Link>
            <Link
              to="/dashboard"
              className="text-xs text-offWhite-muted hover:text-lime flex items-center pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Go to Subscriber Portal</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-lime text-navy font-semibold shadow-sm'
                      : 'text-offWhite-muted hover:text-offWhite hover:bg-charcoal'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sign Out */}
        <div className="pt-6 border-t border-charcoal-border space-y-2">
          <div className="text-xs font-mono text-offWhite truncate">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-xs text-red-400 hover:text-red-300 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-charcoal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-8 max-w-7xl mx-auto overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
