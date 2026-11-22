import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './config/apollo';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Public Views
import { HomePage } from './views/public/HomePage';
import { HowItWorksPage } from './views/public/HowItWorksPage';
import { PlansPage } from './views/public/PlansPage';
import { CharityDirectoryPage } from './views/public/CharityDirectoryPage';
import { DrawInfoPage } from './views/public/DrawInfoPage';
import { FAQPage } from './views/public/FAQPage';
import { ContactPage } from './views/public/ContactPage';
import { LoginPage } from './views/public/LoginPage';
import { RegisterPage } from './views/public/RegisterPage';

// Subscriber Dashboard Views
import { DashboardLayout } from './views/subscriber/DashboardLayout';
import { OverviewView } from './views/subscriber/OverviewView';
import { GolfScoresView } from './views/subscriber/GolfScoresView';
import { DrawHistoryView } from './views/subscriber/DrawHistoryView';
import { WinningsView } from './views/subscriber/WinningsView';
import { MyCharityView } from './views/subscriber/MyCharityView';
import { SubscriptionsView } from './views/subscriber/SubscriptionsView';

// Admin Dashboard Views
import { AdminDashboardLayout } from './views/admin/AdminDashboardLayout';
import { AdminAnalyticsView } from './views/admin/AdminAnalyticsView';
import { AdminDrawsView } from './views/admin/AdminDrawsView';
import { AdminSimulationsView } from './views/admin/AdminSimulationsView';
import { AdminWinnersView } from './views/admin/AdminWinnersView';
import { AdminPayoutsView } from './views/admin/AdminPayoutsView';

// Route Guards
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';

const PublicLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-navy text-offWhite">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export const App: React.FC = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/charities" element={<CharityDirectoryPage />} />
              <Route path="/draws" element={<DrawInfoPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Subscriber Portal (Protected) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<OverviewView />} />
                <Route path="scores" element={<GolfScoresView />} />
                <Route path="draws" element={<DrawHistoryView />} />
                <Route path="winnings" element={<WinningsView />} />
                <Route path="charity" element={<MyCharityView />} />
                <Route path="subscription" element={<SubscriptionsView />} />
                <Route path="subscriptions" element={<SubscriptionsView />} />
              </Route>
            </Route>

            {/* Admin Portal (Admin Only) */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboardLayout />}>
                <Route index element={<AdminAnalyticsView />} />
                <Route path="draws" element={<AdminDrawsView />} />
                <Route path="simulations" element={<AdminSimulationsView />} />
                <Route path="winners" element={<AdminWinnersView />} />
                <Route path="payouts" element={<AdminPayoutsView />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<PublicLayout />}>
              <Route
                path="*"
                element={
                  <div className="py-24 text-center">
                    <h2 className="text-2xl font-bold">Page Not Found</h2>
                    <a href="/" className="text-lime mt-2 inline-block">Return Home</a>
                  </div>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  );
};

export default App;
