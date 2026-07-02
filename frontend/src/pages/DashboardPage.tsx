import { useState, useEffect } from 'react';
import {
  Plane, AlertTriangle, Clock, CheckCircle2, ArrowRight, Wifi,
  UtensilsCrossed, Hotel, DollarSign, ChevronRight, Info
} from 'lucide-react';
import type { Passenger, AnalysisResult, Flight } from '../types';
import { analyzeRecovery, acceptRecovery, requestRefund } from '../services/api';
import { pushNotification } from '../store/notifications';
import { JourneyTour } from '../components/JourneyTour';
import { WelcomeJourneyModal } from '../components/WelcomeJourneyModal';

// ─── Disruption badge ────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CANCELLED: 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200 dark:border-red-800',
    DELAYED:   'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 dark:border-amber-800',
    SCHEDULED: 'bg-green-50 dark:bg-green-900/20 text-green-600 border-green-200 dark:border-green-800',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${styles[status] || styles.SCHEDULED}`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse-dot ${
        status === 'CANCELLED' ? 'bg-red-50 dark:bg-red-900/200' : status === 'DELAYED' ? 'bg-amber-50 dark:bg-amber-900/200' : 'bg-green-50 dark:bg-green-900/200'
      }`} />
      {status}
    </span>
  );
}

// ─── Flight card ─────────────────────────────────────────────────────────────
function FlightCard({
  flight, pnr, cabinClass, seat, onCancel, onDelay
}: {
  flight: Flight; pnr: string; cabinClass: string; seat?: string;
  onCancel: () => void; onDelay: (mins: number) => void;
}) {
  const dep = new Date(flight.departureTime);
  const arr = new Date(flight.arrivalTime);
  const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="tour-flight-card bg-card rounded-xl border border-[--card-border] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[--card-border]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
            <Plane size={18} className="text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">{flight.flightNumber}</p>
            <p className="text-xs text-[--muted-foreground]">{fmtDate(dep)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={flight.status} />
          <span className="text-xs text-[--muted-foreground] bg-[--muted] px-2 py-1 rounded-md">{pnr}</span>
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center justify-between px-6 py-6">
        <div className="text-left">
          <p className="text-4xl font-extralight tracking-tight">{flight.departureAirport}</p>
          <p className="text-xs text-[--muted-foreground] mt-1">Departure</p>
          <p className="text-lg font-semibold mt-1">{fmt(dep)}</p>
        </div>
        <div className="flex flex-col items-center gap-1 flex-1 px-4">
          <div className="flex items-center w-full gap-2">
            <div className="h-px flex-1 bg-[--card-border]" />
            <Plane size={18} className="text-violet-400 rotate-90" />
            <div className="h-px flex-1 bg-[--card-border]" />
          </div>
          <span className="text-[10px] text-[--muted-foreground] mt-1">Direct</span>
        </div>
        <div className="text-right">
          <p className="text-4xl font-extralight tracking-tight">{flight.arrivalAirport}</p>
          <p className="text-xs text-[--muted-foreground] mt-1">Arrival</p>
          <p className="text-lg font-semibold mt-1">{fmt(arr)}</p>
        </div>
      </div>

      {/* Details */}
      <div className="flex items-center gap-6 px-6 pb-5 text-xs text-[--muted-foreground]">
        <span><span className="font-medium text-[--foreground]">{cabinClass}</span> Class</span>
        {seat && <span>Seat <span className="font-medium text-[--foreground]">{seat}</span></span>}
      </div>

      {/* Demo actions (only for non-disrupted) */}
      {flight.status === 'SCHEDULED' && (
        <div className="flex gap-2 px-5 pb-4">
          <button onClick={onCancel}
            className="flex-1 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 py-1.5 rounded-lg transition-colors">
            Simulate Cancel
          </button>
          <button onClick={() => onDelay(180)}
            className="flex-1 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 py-1.5 rounded-lg transition-colors">
            Simulate 3hr Delay
          </button>
          <button onClick={() => onDelay(540)}
            className="flex-1 text-xs font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:bg-orange-900/40 border border-orange-200 dark:border-orange-800 py-1.5 rounded-lg transition-colors">
            Simulate 9hr Delay
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Confidence ring ──────────────────────────────────────────────────────────
function ConfidenceRing({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const r = 28, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="#ffffff" strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="text-sm font-bold text-white">{pct}%</span>
    </div>
  );
}

// ─── Voucher chips ────────────────────────────────────────────────────────────
function VoucherChips({ vouchers }: { vouchers: { meal: boolean; hotel: boolean; compensation: number } }) {
  return (
    <div className="tour-vouchers flex flex-wrap gap-2">
      {vouchers.meal && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-full text-xs font-medium text-orange-700 dark:text-orange-400">
          <UtensilsCrossed size={12} /> Meal Voucher
        </div>
      )}
      {vouchers.hotel && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-medium text-blue-700 dark:text-blue-400">
          <Hotel size={12} /> Hotel Voucher
        </div>
      )}
      {vouchers.compensation > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full text-xs font-medium text-green-700 dark:text-green-400">
          <DollarSign size={12} /> ${vouchers.compensation} Compensation
        </div>
      )}
    </div>
  );
}

// ─── Recovery Timeline ────────────────────────────────────────────────────────
function Timeline({ steps }: { steps: { label: string; done: boolean; active?: boolean }[] }) {
  return (
    <ol className="relative border-l-2 border-[--card-border] ml-3 space-y-4">
      {steps.map((s, i) => (
        <li key={i} className="ml-5">
          <span className={`absolute -left-[9px] flex w-4 h-4 rounded-full ring-2 ring-card items-center justify-center ${
            s.done ? 'bg-violet-600' : s.active ? 'bg-violet-200' : 'bg-[--card-border]'
          }`}>
            {s.done && <CheckCircle2 size={10} className="text-white" />}
          </span>
          <p className={`text-xs font-medium ${s.done ? 'text-[--foreground]' : s.active ? 'text-violet-600' : 'text-[--muted-foreground]'}`}>
            {s.label}
          </p>
        </li>
      ))}
    </ol>
  );
}

// ─── Recovery Panel ───────────────────────────────────────────────────────────
type RecoveryTab = 'rebook' | 'refund' | 'wait';

function RecoveryPanel({ analysis, bookingId, onComplete }: {
  analysis: AnalysisResult; bookingId: string; onComplete: () => void;
}) {
  const [tab, setTab] = useState<RecoveryTab>(
    analysis.recommendation.action === 'WAIT' ? 'wait' :
    analysis.recommendation.action === 'REFUND' ? 'refund' : 'rebook'
  );
  const [selectedFlight, setSelectedFlight] = useState<string>(
    analysis.recommendation.alternativeFlightId || analysis.alternatives[0]?.id || ''
  );
  const [refundReason, setRefundReason] = useState<string>('CANCELLED');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { type: string; data: any }>(null);

  const handleRebook = async () => {
    setBusy(true);
    try {
      await acceptRecovery(bookingId, analysis.recommendation.id, selectedFlight);
      pushNotification({ title: 'Reschedule Requested', description: 'Your reschedule request is pending admin approval.', unread: true, type: 'info' });
      setDone({ type: 'rebook', data: null });
      setTimeout(onComplete, 3000);
    } finally { setBusy(false); }
  };

  const handleRefund = async () => {
    setBusy(true);
    try {
      const result = await requestRefund(bookingId, refundReason);
      pushNotification({ title: 'Refund Requested', description: 'Your refund request is pending admin approval.', unread: true, type: 'info' });
      setDone({ type: 'refund', data: result });
    } finally { setBusy(false); }
  };

  if (done) {
    return (
      <div className="bg-card rounded-xl border border-[--card-border] p-8 flex flex-col items-center text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
          <Clock size={32} className="text-amber-600" />
        </div>
        <h3 className="text-xl font-bold mb-1 text-amber-700 dark:text-amber-500">
          {done.type === 'rebook' ? 'Reschedule Requested' : 'Refund Requested'}
        </h3>
        <p className="text-sm text-[--muted-foreground] max-w-md mx-auto mt-2">
          Your request is currently <span className="font-semibold text-amber-600 dark:text-amber-500">pending</span>. It has been sent to the administration team for review and final confirmation.
        </p>
        
        {done.type === 'refund' && done.data && (
          <div className="mt-6 text-left bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 w-full max-w-sm">
            <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">Refund Details</p>
            <div className="mt-2 space-y-1 text-sm text-[--muted-foreground]">
              <div className="flex justify-between"><span>Amount</span><span className="font-semibold text-amber-700 dark:text-amber-500">${done.data.refundAmount}</span></div>
              <div className="flex justify-between"><span>Ref</span><span className="font-mono text-xs">{done.data.confirmationCode}</span></div>
              <div className="flex justify-between"><span>Status</span><span className="font-medium text-amber-600">Pending Approval</span></div>
            </div>
          </div>
        )}
        <button onClick={onComplete} className="mt-6 px-6 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'rebook', label: 'Auto-Rebook' },
    { id: 'refund', label: 'Request Refund' },
    { id: 'wait',   label: analysis.disruption.type === 'DELAYED' ? 'Stay & Wait' : 'Other Options' },
  ] as const;

  return (
    <div className="tour-recovery-panel bg-card border-2 border-violet-500 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(124,58,237,0.12)] animate-fade-in-up">
      {/* Top Banner */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-card/20 flex items-center justify-center">
            <Wifi size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold">Recovery Recommendation</p>
            <p className="text-xs text-violet-200">Based on airline policy and availability</p>
          </div>
        </div>
        <ConfidenceRing score={analysis.recommendation.confidenceScore} />
      </div>

      {/* Vouchers */}
      {(analysis.vouchers?.meal || analysis.vouchers?.hotel || analysis.vouchers?.compensation > 0) && (
        <div className="px-5 py-3 border-b border-[--card-border] bg-amber-50 dark:bg-amber-900/20">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-500 mb-2 uppercase tracking-wide">You're Eligible For</p>
          <VoucherChips vouchers={analysis.vouchers} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[--card-border]">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as RecoveryTab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'text-violet-600 border-b-2 border-violet-600'
                : 'text-[--muted-foreground] hover:text-[--foreground]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* Recommendation Reason */}
        <div className="flex gap-3 mb-5 p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 rounded-lg">
          <Info size={15} className="text-violet-500 mt-0.5 shrink-0" />
          <p className="text-xs text-violet-800 leading-relaxed">{analysis.recommendation.reason}</p>
        </div>

        {tab === 'rebook' && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[--muted-foreground] uppercase tracking-wide">Available Flights</p>
            {analysis.alternatives.length === 0 ? (
              <p className="text-sm text-[--muted-foreground] py-4 text-center">No alternative flights available at this time.</p>
            ) : (
              analysis.alternatives.map(f => {
                const dep = new Date(f.departureTime);
                const arr = new Date(f.arrivalTime);
                const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isRecommended = f.id === analysis.recommendation.alternativeFlightId;
                return (
                  <label key={f.id} className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                    selectedFlight === f.id ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20' : 'border-[--card-border] hover:border-violet-200 dark:border-violet-800'
                  }`}>
                    <input type="radio" name="flight" value={f.id} checked={selectedFlight === f.id}
                      onChange={() => setSelectedFlight(f.id)} className="accent-violet-600" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{f.flightNumber}</span>
                        {isRecommended && (
                          <span className="text-[10px] font-semibold text-violet-600 bg-violet-100 dark:bg-violet-900/40 px-2 py-0.5 rounded-full">Recommended</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[--muted-foreground]">
                        <span>{f.departureAirport} {fmt(dep)}</span>
                        <ArrowRight size={10} />
                        <span>{f.arrivalAirport} {fmt(arr)}</span>
                      </div>
                    </div>
                  </label>
                );
              })
            )}
            <button onClick={handleRebook} disabled={busy || !selectedFlight}
              className="w-full mt-2 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
              {busy ? 'Requesting...' : 'Request Reschedule'}
            </button>
          </div>
        )}

        {tab === 'refund' && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-[--muted-foreground] uppercase tracking-wide">Reason for Refund</p>
            {[
              { id: 'CANCELLED', label: 'Flight Cancelled by Airline', sub: 'Full refund eligible. Confidence: 99%' },
              { id: 'MEDICAL',   label: 'Medical Emergency',            sub: 'Full refund eligible with documentation. 95%' },
              { id: 'VOLUNTARY', label: 'Voluntary (Change of Plans)',   sub: 'Partial refund may apply. 72%' },
            ].map(r => (
              <label key={r.id} className={`flex gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                refundReason === r.id ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20' : 'border-[--card-border] hover:border-violet-200 dark:border-violet-800'
              }`}>
                <input type="radio" name="refundReason" value={r.id} checked={refundReason === r.id}
                  onChange={() => setRefundReason(r.id)} className="accent-violet-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{r.label}</p>
                  <p className="text-xs text-[--muted-foreground]">{r.sub}</p>
                </div>
              </label>
            ))}
            <button onClick={handleRefund} disabled={busy}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
              {busy ? 'Processing...' : 'Request Refund'}
            </button>
          </div>
        )}

        {tab === 'wait' && (
          <div className="space-y-4">
            {analysis.disruption.type === 'DELAYED' ? (
              <>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-amber-600" />
                    <p className="text-sm font-semibold text-amber-800">Delay Information</p>
                  </div>
                  <p className="text-xs text-amber-700">Your flight is delayed by approximately {analysis.disruption.delayMinutes ?? '—'} minutes. The gate and updated departure time will be confirmed shortly.</p>
                </div>
                <p className="text-sm text-[--muted-foreground]">If the delay extends further, we will automatically re-evaluate your options and notify you.</p>
                <button onClick={onComplete}
                  className="w-full py-2.5 border border-[--card-border] text-[--foreground] rounded-lg text-sm font-medium hover:bg-[--muted] transition-colors">
                  I'll Wait at the Gate
                </button>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-[--muted-foreground]">Please contact a SkyRecover agent for assistance with special circumstances.</p>
                <button
                  onClick={() => { pushNotification({ title: 'Agent Requested', description: 'A recovery agent will contact you shortly.', unread: true, type: 'info' }); onComplete(); }}
                  className="mt-4 px-6 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors">
                  Request Human Agent
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard page ───────────────────────────────────────────────────────────
interface DashboardPageProps { passenger: Passenger; onRefresh: () => void; }

export default function DashboardPage({ passenger, onRefresh }: DashboardPageProps) {
  const booking = passenger?.bookings?.[0];
  const flight = booking?.flight;
  const isDisrupted = flight && (flight.status === 'CANCELLED' || flight.status === 'DELAYED');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);

  // User Journey Logic
  const journeyKey = `skyrecover_journey_v14_${passenger.email}`;
  const [startTour, setStartTour] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(journeyKey) === 'true';
    if (!hasSeenTour) {
      setShowModal(true);
    }
  }, [journeyKey]);

  const handleStartJourney = async () => {
    setShowModal(false);
    localStorage.setItem(journeyKey, 'true');
    
    if (flight && flight.status === 'SCHEDULED') {
      try {
        const { demoCancelFlight } = await import('../services/api');
        await demoCancelFlight(flight.id);
        onRefresh();
        setTimeout(() => setStartTour(true), 500);
      } catch (error) {
        console.error("Failed to start journey:", error);
      }
    } else {
      setTimeout(() => setStartTour(true), 500);
    }
  };

  // Auto-run analysis when disruption detected
  useEffect(() => {
    if (isDisrupted && !analysis) {
      setAnalyzing(true);
      pushNotification({
        title: `Flight ${flight.status}`,
        description: `Flight ${flight.flightNumber} has been ${flight.status.toLowerCase()}. We are analyzing your recovery options.`,
        unread: true,
        type: 'disruption',
      });
      analyzeRecovery(booking.id)
        .then(data => {
          setAnalysis(data);
          pushNotification({ title: 'Recovery Options Ready', description: 'We have identified the best recovery plan for you.', unread: true, type: 'recovery' });
        })
        .catch(console.error)
        .finally(() => setAnalyzing(false));
    }
  }, [isDisrupted]);

  const handleComplete = () => { setDone(false); setAnalysis(null); onRefresh(); };

  if (!booking || !flight) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[--muted-foreground]">
        <Plane size={40} className="mb-3 opacity-30" />
        <p className="text-sm">No upcoming flights found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in-up">
      {/* Recovery Timeline (always visible when disrupted) */}
      {isDisrupted && (
        <div className="tour-timeline bg-card border border-[--card-border] rounded-xl p-5">
          <p className="text-xs font-semibold text-[--muted-foreground] uppercase tracking-wide mb-4">Recovery Timeline</p>
          <Timeline steps={[
            { label: 'Disruption Detected', done: true },
            { label: 'Analyzing Options', done: !analyzing, active: analyzing },
            { label: 'Options Presented',   done: !!analysis },
            { label: 'Decision Made',       done: done },
            { label: 'Confirmed & Notified', done: done },
          ]} />
        </div>
      )}

      {/* Disruption alert */}
      {isDisrupted && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${
          flight.status === 'CANCELLED'
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
        }`}>
          <AlertTriangle size={18} className={flight.status === 'CANCELLED' ? 'text-red-500' : 'text-amber-500'} />
          <div>
            <p className={`text-sm font-semibold ${flight.status === 'CANCELLED' ? 'text-red-800' : 'text-amber-800'}`}>
              Flight {flight.status}
            </p>
            <p className={`text-xs mt-0.5 ${flight.status === 'CANCELLED' ? 'text-red-600' : 'text-amber-600'}`}>
              {flight.status === 'CANCELLED'
                ? `Flight ${flight.flightNumber} has been cancelled. Please review your recovery options below.`
                : `Flight ${flight.flightNumber} is delayed. We are monitoring the situation.`}
            </p>
          </div>
        </div>
      )}

      {/* Flight Card */}
      <FlightCard
        flight={flight}
        pnr={booking.pnr}
        cabinClass={booking.class}
        seat={booking.seatNumber}
        onCancel={async () => {
          const { demoCancelFlight } = await import('../services/api');
          await demoCancelFlight(flight.id);
          onRefresh();
        }}
        onDelay={async (mins) => {
          const { demoDelayFlight } = await import('../services/api');
          await demoDelayFlight(flight.id, mins);
          onRefresh();
        }}
      />

      {/* Recovery Panel */}
      {analyzing && (
        <div className="bg-card border border-violet-200 dark:border-violet-800 rounded-xl p-6 flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
            <Wifi size={20} className="text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-violet-800">Analyzing Options...</p>
            <p className="text-xs text-[--muted-foreground]">Checking flight availability, loyalty tier, and policy rules</p>
          </div>
        </div>
      )}

      {analysis && !done && (
        <RecoveryPanel analysis={analysis} bookingId={booking.id} onComplete={handleComplete} />
      )}

      <WelcomeJourneyModal 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        onStart={handleStartJourney} 
      />

      <JourneyTour 
        run={startTour} 
        onFinish={() => setStartTour(false)} 
      />
    </div>
  );
}
