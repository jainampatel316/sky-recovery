import { useState } from 'react';
import { Zap, XCircle, Clock, RefreshCw } from 'lucide-react';
import type { Passenger } from '../types';
import { demoCancelFlight, demoDelayFlight, demoReset } from '../services/api';

export default function DemoPage({ passenger, onRefresh }: { passenger: Passenger; onRefresh: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const flight = passenger.bookings[0]?.flight;

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try { await fn(); onRefresh(); } finally { setBusy(null); }
  };

  const scenarios = flight ? [
    {
      id: 'cancel',
      icon: <XCircle size={20} className="text-red-500" />,
      label: 'Simulate Cancellation',
      description: `Mark flight ${flight.flightNumber} as CANCELLED (weather) and trigger AI recovery.`,
      color: 'border-red-200 hover:border-red-400 hover:bg-red-50',
      fn: () => demoCancelFlight(flight.id),
    },
    {
      id: 'delay120',
      icon: <Clock size={20} className="text-amber-500" />,
      label: 'Simulate 2hr Delay',
      description: 'Delay triggers meal voucher. AI recommends waiting.',
      color: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50',
      fn: () => demoDelayFlight(flight.id, 120),
    },
    {
      id: 'delay480',
      icon: <Clock size={20} className="text-orange-500" />,
      label: 'Simulate 9hr Delay',
      description: 'Long delay triggers meal + hotel voucher + compensation. AI recommends rebooking.',
      color: 'border-orange-200 hover:border-orange-400 hover:bg-orange-50',
      fn: () => demoDelayFlight(flight.id, 540),
    },
  ] : [];

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in-up">
      <div className="bg-card border border-[--card-border] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[--card-border]">
          <Zap size={16} className="text-violet-500" />
          <h2 className="text-sm font-semibold">Scenario Control Panel</h2>
          <span className="ml-auto text-xs text-[--muted-foreground] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">Demo Only</span>
        </div>
        <div className="p-5 space-y-3">
          {!flight ? (
            <p className="text-sm text-[--muted-foreground]">No active booking found. Reset the demo first.</p>
          ) : (
            scenarios.map(s => (
              <button key={s.id} onClick={() => run(s.id, s.fn)} disabled={!!busy || flight.status !== 'SCHEDULED'}
                className={`w-full flex items-start gap-4 p-4 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${s.color}`}>
                <div className="mt-0.5">{s.icon}</div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold">{s.label}</p>
                  <p className="text-xs text-[--muted-foreground] mt-0.5">{s.description}</p>
                </div>
                {busy === s.id && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mt-0.5 shrink-0" />}
              </button>
            ))
          )}

          {flight?.status !== 'SCHEDULED' && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Flight is already disrupted. Reset the demo to simulate another scenario.
            </p>
          )}
        </div>
      </div>

      {/* Reset */}
      <div className="bg-card border border-[--card-border] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[--card-border]">
          <h2 className="text-sm font-semibold">Reset Demo Database</h2>
          <p className="text-xs text-[--muted-foreground] mt-0.5">Wipes all data and re-seeds the original scenario.</p>
        </div>
        <div className="p-5">
          <button onClick={() => run('reset', async () => { await demoReset(); })}
            disabled={!!busy}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50">
            <RefreshCw size={14} className={busy === 'reset' ? 'animate-spin' : ''} />
            {busy === 'reset' ? 'Resetting...' : 'Reset All Demo Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
