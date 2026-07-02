import { Bell, CheckCheck, AlertTriangle, Plane, Check, Info } from 'lucide-react';
import { useNotifications } from '../store/notifications';

const iconMap: Record<string, JSX.Element> = {
  disruption: <AlertTriangle size={14} className="text-red-500" />,
  recovery:   <Plane size={14} className="text-violet-500" />,
  confirm:    <Check size={14} className="text-green-500" />,
  info:       <Info size={14} className="text-blue-500" />,
};

export default function NotificationsPage() {
  const { notifications, markAllRead } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="bg-card border border-[--card-border] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[--card-border]">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-[--muted-foreground]" />
            <h2 className="text-sm font-semibold">All Notifications</h2>
            <span className="text-xs text-[--muted-foreground] bg-[--muted] px-2 py-0.5 rounded-full">{notifications.length}</span>
          </div>
          <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium">
            <CheckCheck size={13} /> Mark all read
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="py-16 text-center">
            <Bell size={32} className="mx-auto text-[--card-border] mb-3" />
            <p className="text-sm text-[--muted-foreground]">No notifications yet</p>
            <p className="text-xs text-[--muted-foreground] mt-1">Disruption alerts and recovery updates will appear here</p>
          </div>
        ) : (
          <ul>
            {notifications.map((n, i) => (
              <li key={n.id} className={`flex gap-4 px-5 py-4 border-b border-[--card-border] last:border-0 hover:bg-[--muted] transition-colors ${i === 0 ? 'animate-slide-in' : ''}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: n.type === 'disruption' ? '#fef2f2' : n.type === 'confirm' ? '#f0fdf4' : n.type === 'recovery' ? '#f5f3ff' : '#eff6ff' }}>
                  {iconMap[n.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[--foreground]">{n.title}</p>
                    <span className="text-[10px] text-[--muted-foreground] shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-[--muted-foreground] mt-0.5 leading-relaxed">{n.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
