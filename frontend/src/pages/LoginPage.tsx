import { useState, useEffect } from 'react';
import { loginWithEmail, forgotPassword, resetPassword, getPassengers } from '../services/api';
import type { Passenger } from '../types';

type AuthView = 'LOGIN' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD';

export function LoginPage({ onLogin }: { onLogin: (p: Passenger) => void }) {
  const [view, setView] = useState<AuthView>('LOGIN');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [demoPassengers, setDemoPassengers] = useState<Passenger[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Automatically switch to RESET_PASSWORD if token is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
      setView('RESET_PASSWORD');
    }
    
    getPassengers().then(setDemoPassengers).catch(console.error);
  }, []);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const data = await loginWithEmail(email, password);
      onLogin(data.passenger);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setSuccess(data.message);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const data = await resetPassword(resetToken, newPassword);
      setSuccess(data.message);
      setTimeout(() => setView('LOGIN'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      
      {/* Left Pane - Branding & Graphic */}
      <div className="hidden md:flex flex-col flex-1 relative bg-violet-600 text-white overflow-hidden p-10 justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-purple-800 z-0 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544015759-2487372d622f?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30 z-0" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-sm border border-white/30">
            <img src="/skyrecover-logo.png" alt="Logo" className="w-full h-full object-cover scale-[1.35]" />
          </div>
          <span className="text-xl font-bold tracking-tight">SkyRecover</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight tracking-tight">Turn disruptions into opportunities.</h1>
          <p className="text-violet-100 text-lg font-light leading-relaxed">
            Our intelligent recovery platform automatically handles cancellations and delays, ensuring your passengers are rebooked, accommodated, and satisfied—instantly.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs font-medium text-violet-300">
          <span>Hackathon MVP</span>
          <span>© 2026 SkyRecover</span>
        </div>
      </div>

      {/* Right Pane - Auth Forms */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative">
        <div className="w-full max-w-[400px]">
          
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border border-border mb-4">
              <img src="/skyrecover-logo.png" alt="Logo" className="w-full h-full object-cover scale-[1.35]" />
            </div>
            <h2 className="text-2xl font-bold">SkyRecover</h2>
          </div>

          {view === 'LOGIN' && (
            <div className="animate-fade-in-up">
              <div className="mb-8 text-center md:text-left">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h2>
                <p className="text-sm text-muted-foreground mt-2">Enter your email and password to sign in</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-input bg-card text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <button
                      type="button"
                      onClick={() => { clearMessages(); setView('FORGOT_PASSWORD'); }}
                      className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-input bg-card text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-all disabled:opacity-60 flex items-center justify-center shadow-md shadow-violet-200 dark:shadow-none"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign In'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground mb-4 font-semibold uppercase tracking-wider text-center">Demo Accounts (Password: password123)</p>
                <div className="flex flex-col gap-2">
                  {demoPassengers.slice(0, 3).map(p => (
                    <button 
                      key={p.email} 
                      onClick={() => { setEmail(p.email); setPassword('password123'); }} 
                      className="text-sm px-4 py-2 border border-border rounded-lg bg-card hover:bg-muted transition-colors text-left"
                    >
                      Fill {p.firstName} {p.lastName} ({p.loyaltyStatus || 'Member'})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === 'FORGOT_PASSWORD' && (
            <div className="animate-fade-in-up">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">Reset Password</h2>
                <p className="text-sm text-muted-foreground mt-2">Enter your email and we'll send you a link to reset your password.</p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-input bg-card text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="name@example.com"
                    required
                  />
                </div>

                {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>}
                {success && <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-200 font-medium">{success}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-all disabled:opacity-60 flex items-center justify-center shadow-md shadow-violet-200 dark:shadow-none mt-2"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => { clearMessages(); setView('LOGIN'); }}
                  className="w-full h-11 bg-transparent hover:bg-muted text-foreground rounded-xl font-medium transition-colors border border-border"
                >
                  Back to Login
                </button>
              </form>
            </div>
          )}

          {view === 'RESET_PASSWORD' && (
            <div className="animate-fade-in-up">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">Set New Password</h2>
                <p className="text-sm text-muted-foreground mt-2">Create a new, secure password for your account.</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-input bg-card text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>}
                {success && <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-200 font-medium">{success}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-all disabled:opacity-60 flex items-center justify-center shadow-md shadow-violet-200 dark:shadow-none mt-2"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Reset Password'}
                </button>
              </form>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
