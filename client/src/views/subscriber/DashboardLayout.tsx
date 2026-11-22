import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Trophy,
  LayoutDashboard,
  Target,
  History,
  Award,
  Heart,
  CreditCard,
  User,
  LogOut,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@apollo/client';
import { GET_MY_NOTIFICATIONS_QUERY } from '../../graphql/operations';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: notifData } = useQuery(GET_MY_NOTIFICATIONS_QUERY, {
    variables: { unreadOnly: true },
    pollInterval: 15000,
  });

  const unreadCount = notifData?.myNotifications?.length || 0;

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Golf Scores', path: '/dashboard/scores', icon: Target },
    { label: 'Draw History', path: '/dashboard/draws', icon: History },
    { label: 'Winnings & Proof', path: '/dashboard/winnings', icon: Award },
    { label: 'My Charity', path: '/dashboard/charity', icon: Heart },
    { label: 'Subscription', path: '/dashboard/subscription', icon: CreditCard },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-navy flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-navy-950 border-r border-charcoal-border p-6 justify-between">
        <div className="space-y-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-charcoal border border-lime/30 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-lime" />
            </div>
            <div>
              <span className="text-lg font-bold text-offWhite tracking-tight">
                GOLF<span className="text-lime">CHARITY</span>
              </span>
              <span className="block text-[9px] font-mono uppercase text-offWhite-muted">
                Subscriber Portal
              </span>
            </div>
          </Link>

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

        {/* User Footer */}
        <div className="pt-6 border-t border-charcoal-border space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-charcoal border border-charcoal-border flex items-center justify-center text-xs font-mono font-bold text-lime">
              {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="truncate">
              <span className="block text-xs font-semibold text-offWhite truncate">
                {user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user?.email}
              </span>
              <span className="block text-[10px] font-mono text-lime">SUBSCRIBER</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-xs text-red-400 hover:text-red-300 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-charcoal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-navy-950/80 backdrop-blur border-b border-charcoal-border px-6 flex items-center justify-between sticky top-0 z-40">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-offWhite-muted hover:text-offWhite hover:bg-charcoal"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center space-x-4 ml-auto">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-offWhite-muted hover:text-offWhite hover:bg-charcoal transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-lime border-2 border-navy" />
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-charcoal border border-charcoal-border p-4 shadow-xl z-50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-charcoal-border">
                    <span className="text-xs font-mono uppercase text-offWhite font-semibold">Notifications</span>
                    <span className="text-[10px] font-mono text-lime">{unreadCount} Unread</span>
                  </div>
                  {notifData?.myNotifications?.length === 0 ? (
                    <p className="text-xs text-offWhite-muted text-center py-4">No unread notifications</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {notifData?.myNotifications?.map((n: any) => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-navy-950 border border-charcoal-border/50 text-xs space-y-1">
                          <span className="font-semibold text-offWhite block">{n.title}</span>
                          <p className="text-offWhite-muted text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Nested View */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
