import { useState, useEffect } from 'react';
import { Users, ChevronRight } from 'lucide-react';
import { getPassengerByEmail, getPassengers } from '../services/api';
import type { Passenger } from '../types';

export default function PassengersPage({ onLogin }: { onLogin: (p: Passenger) => void }) {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPassengers().then(setPassengers).catch(console.error);
  }, []);

  const getStyleForLoyalty = (loyalty: string) => {
    switch (loyalty) {
      case 'PLATINUM': return { color: 'border-purple-200 bg-purple-50', badge: 'bg-purple-100 text-purple-700', note: 'Highest tier — premium recovery' };
      case 'GOLD': return { color: 'border-amber-200 bg-amber-50', badge: 'bg-amber-100 text-amber-700', note: 'Gold tier — priority recovery' };
      case 'SILVER': return { color: 'border-gray-200 bg-gray-50', badge: 'bg-gray-100 text-gray-700', note: 'Silver tier — enhanced recovery' };
      default: return { color: 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800', badge: 'bg-slate-100 text-slate-600', note: 'Standard member' };
    }
  };

  const select = async (email: string) => {
    setLoading(email);
    setError(null);
    try {
      const p = await getPassengerByEmail(email);
      onLogin(p);
    } catch {
      setError('Failed to load passenger. Make sure the backend is running.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="bg-card border border-[--card-border] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[--card-border]">
          <Users size={16} className="text-[--muted-foreground]" />
          <h2 className="text-sm font-semibold">Switch Passenger</h2>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-xs text-[--muted-foreground] mb-4">
            Switch between demo passengers to see how the AI engine treats different loyalty tiers.
          </p>
          {passengers.map(p => {
            const style = getStyleForLoyalty(p.loyaltyStatus || 'MEMBER');
            const fullName = `${p.firstName} ${p.lastName}`;
            return (
              <button
                key={p.email}
                onClick={() => select(p.email)}
                disabled={!!loading}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-sm disabled:opacity-50 ${style.color}`}
              >
                <div className="w-10 h-10 rounded-full bg-card border border-[--card-border] flex items-center justify-center font-semibold text-sm shrink-0">
                  {fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{fullName}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>{p.loyaltyStatus}</span>
                  </div>
                  <p className="text-xs text-[--muted-foreground] mt-0.5">{style.note}</p>
                  <p className="text-[10px] text-[--muted-foreground] mt-1">{p.email}</p>
                </div>
                {loading === p.email
                  ? <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  : <ChevronRight size={16} className="text-[--muted-foreground] shrink-0" />}
              </button>
            );
          })}
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
