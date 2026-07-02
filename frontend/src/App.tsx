import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from './components/ui/sidebar';
import { TooltipProvider } from './components/ui/tooltip';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardPage from './pages/DashboardPage';
import NotificationsPage from './pages/NotificationsPage';
import ChatPage from './pages/ChatPage';
import HistoryPage from './pages/HistoryPage';
import DemoPage from './pages/DemoPage';
import PassengersPage from './pages/PassengersPage';
import ChatPopover from './components/ChatPopover';
import { getPassengerById, demoReset } from './services/api';
import { loadNotifications } from './store/notifications';
import type { Passenger } from './types';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { LoginPage } from './pages/LoginPage';

// ─── Login screen ─────────────────────────────────────────────────────────────
// ─── Removed old LoginScreen ──────────────────────────────────────────────────

// ─── Page titles ──────────────────────────────────────────────────────────────
const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  dashboard:     { title: 'My Journey',       subtitle: 'View and manage your upcoming flight' },
  notifications: { title: 'Notifications',    subtitle: 'Disruption alerts and recovery updates' },
  history:       { title: 'Recovery History', subtitle: 'Past recovery requests and outcomes' },
  chat:          { title: 'Support Chat',     subtitle: 'Ask questions about your disruption' },
  demo:          { title: 'Scenario Control', subtitle: 'Simulate disruptions for demo purposes' },
  passengers:    { title: 'Switch Passenger', subtitle: 'Compare recovery across loyalty tiers' },
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [passenger, setPassenger] = useState<Passenger | null>(() => {
    const saved = localStorage.getItem('skyrecover_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract current page from path, defaulting to dashboard
  // Example: /u/passenger123/history
  const parts = location.pathname.split('/').filter(Boolean);
  let page = 'dashboard';
  if (parts[0] === 'u' && parts.length >= 3) {
    page = parts[2];
  } else if (parts[0] === 'passengers') {
    page = 'passengers';
  }

  // Refresh passenger data from server
  const refresh = useCallback(async () => {
    if (!passenger) return;
    try {
      const p = await getPassengerById(passenger.id);
      setPassenger(p);
      loadNotifications(p.id);
    } catch {}
  }, [passenger?.id]);

  useEffect(() => {
    if (passenger) {
      loadNotifications(passenger.id);
    }
  }, [passenger?.id]);

  const handleLogin = (p: Passenger) => {
    localStorage.setItem('skyrecover_session', JSON.stringify(p));
    setIsPageLoading(true);
    setPassenger(p);
    navigate(`/u/${p.id}`);
    setTimeout(() => {
      setIsPageLoading(false);
    }, 1500);
  };

  const handleSignOut = () => {
    localStorage.removeItem('skyrecover_session');
    setPassenger(null);
    navigate('/');
  };

  const handleReset = async () => {
    if (!confirm('Reset all demo data to initial state?')) return;
    await demoReset();
    if (passenger) {
      const fresh = await getPassengerById(passenger.id);
      localStorage.setItem('skyrecover_session', JSON.stringify(fresh));
      setPassenger(fresh);
      navigate(`/u/${fresh.id}`);
    } else {
      navigate('/');
    }
  };

  if (!passenger) {
    // If not on login page, redirect to root to show login
    if (location.pathname !== '/') {
      return <Navigate to="/" replace />;
    }
    return <LoginPage onLogin={handleLogin} />;
  }

  // Redirect from root to passenger dashboard if logged in
  if (location.pathname === '/') {
    return <Navigate to={`/u/${passenger.id}`} replace />;
  }

  const meta = PAGE_META[page] || { title: page, subtitle: '' };

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden w-full">
          <Sidebar
            activePage={page}
            onNavigate={(p) => navigate(p === 'dashboard' ? `/u/${passenger.id}` : p === 'passengers' ? '/passengers' : `/u/${passenger.id}/${p}`)}
            passenger={passenger}
            onSignOut={handleSignOut}
          />

          <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden h-full rounded-none!">
            <Topbar 
              title={meta.title} 
              subtitle={meta.subtitle} 
              onReset={handleReset} 
            />

            <main className="flex-1 overflow-y-auto p-6 bg-background">
              {isPageLoading ? (
                <DashboardSkeleton />
              ) : (
                <Routes>
                  <Route path="/u/:id" element={<DashboardPage passenger={passenger} onRefresh={refresh} />} />
                  <Route path="/u/:id/notifications" element={<NotificationsPage />} />
                  <Route path="/u/:id/history" element={<HistoryPage passenger={passenger} />} />
                  <Route path="/u/:id/chat" element={<ChatPage />} />
                  <Route path="/u/:id/demo" element={<DemoPage passenger={passenger} onRefresh={refresh} />} />
                  <Route path="/passengers" element={<PassengersPage onLogin={handleLogin} />} />
                  <Route path="*" element={<Navigate to={`/u/${passenger.id}`} replace />} />
                </Routes>
              )}
            </main>
          </SidebarInset>
        </div>
        
        {/* Floating Chat Widget */}
        <div className="tour-chat-widget fixed bottom-6 right-6 z-50">
          <div className="relative">
            {chatOpen && (
              <div className="absolute bottom-16 right-0 mb-2">
                <ChatPopover passengerId={passenger.id} />
              </div>
            )}
            <button
              onClick={() => setChatOpen(o => !o)}
              className="w-14 h-14 bg-card rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center overflow-hidden border-2 border-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
              title="Open Support Chat"
            >
              <img src="/ai.png" alt="Support Chat" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>

      </SidebarProvider>
    </TooltipProvider>
  );
}
