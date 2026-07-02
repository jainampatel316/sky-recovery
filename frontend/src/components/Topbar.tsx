import { useState } from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import { useNotifications } from '../store/notifications';
import { ModeToggle } from './mode-toggle';
import { SidebarTrigger } from './ui/sidebar';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onReset?: () => void;
}

export default function Topbar({ title, subtitle, onReset }: TopbarProps) {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [bellOpen, setBellOpen] = useState(false);

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-[--card-border] bg-[--sidebar] shrink-0 z-40">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h1 className="text-base font-semibold text-[--foreground] leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-[--muted-foreground] hidden sm:block">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-medium text-violet-600 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:bg-violet-900/40 px-3 py-1.5 rounded-lg transition-colors border border-violet-200 dark:border-violet-800"
          >
            <RefreshCw size={12} />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        )}

        <ModeToggle />

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => { setBellOpen(o => !o); markAllRead(); }}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[--muted] transition-colors"
          >
            <Bell size={16} className="text-[--muted-foreground]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-violet-600 border-2 border-white" />
            )}
          </button>
          {bellOpen && (
            <div className="absolute right-0 top-10 w-80 bg-card border border-[--card-border] rounded-xl shadow-xl z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-[--card-border] flex items-center justify-between">
                <span className="text-sm font-semibold">Notifications</span>
                <span className="text-xs text-[--muted-foreground]">{notifications.length} total</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[--muted-foreground]">No notifications yet</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="flex gap-3 px-4 py-3 border-b border-[--card-border] last:border-0 hover:bg-[--muted] transition-colors">
                      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                        n.type === 'disruption' ? 'bg-red-500' :
                        n.type === 'recovery'   ? 'bg-violet-50 dark:bg-violet-900/200' :
                        n.type === 'confirm'    ? 'bg-green-500' : 'bg-blue-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[--foreground]">{n.title}</p>
                        <p className="text-xs text-[--muted-foreground] mt-0.5 line-clamp-2">{n.description}</p>
                        <p className="text-[10px] text-[--muted-foreground] mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
