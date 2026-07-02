import { useState, useEffect } from 'react';
import { History, CheckCircle2, RefreshCw, Clock, CreditCard } from 'lucide-react';
import { getRecoveryHistory } from '../services/api';
import type { Passenger } from '../types';

export default function HistoryPage({ passenger }: { passenger: Passenger }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bookingId = passenger.bookings[0]?.id;
    if (!bookingId) { setLoading(false); return; }
    getRecoveryHistory(bookingId)
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [passenger]);

  const actionColors: Record<string, string> = {
    REBOOK:  'bg-violet-50 dark:bg-violet-900/20 text-violet-700 border-violet-200',
    REFUND:  'bg-green-50 text-green-700 border-green-200',
    WAIT:    'bg-amber-50 text-amber-700 border-amber-200',
    ESCALATE:'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="bg-card border border-[--card-border] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[--card-border]">
          <History size={16} className="text-[--muted-foreground]" />
          <h2 className="text-sm font-semibold">Recovery History</h2>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center"><div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : history.length === 0 ? (
          <div className="py-16 text-center">
            <History size={32} className="mx-auto text-[--card-border] mb-3" />
            <p className="text-sm text-[--muted-foreground]">No recovery requests yet</p>
            <p className="text-xs text-[--muted-foreground] mt-1">Simulate a flight disruption to see recovery history</p>
          </div>
        ) : (
          <ul className="divide-y divide-[--card-border]">
            {history.map((req: any) => (
              <li key={req.id} className="px-5 py-4 hover:bg-[--muted] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${actionColors[req.recommendations[0]?.action] || 'bg-gray-50 dark:bg-gray-800 text-gray-600 border-gray-200 dark:border-gray-700'}`}>
                      {req.recommendations[0]?.action || 'UNKNOWN'}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      req.status === 'RESOLVED' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <span className="text-xs text-[--muted-foreground]">
                    {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {req.recommendations.map((rec: any) => (
                  <div key={rec.id} className="text-xs text-[--muted-foreground] leading-relaxed">
                    <p className="line-clamp-2">{rec.reason}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px]">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Confidence:</span> {Math.round(rec.confidenceScore * 100)}%
                      </span>
                      <span className={`font-medium ${rec.status === 'ACCEPTED' ? 'text-green-600' : 'text-[--muted-foreground]'}`}>
                        {rec.status}
                      </span>
                    </div>
                  </div>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
