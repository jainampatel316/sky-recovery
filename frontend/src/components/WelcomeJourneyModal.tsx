import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';

interface WelcomeJourneyModalProps {
  open: boolean;
  onClose: () => void;
  onStart: () => void;
}

export function WelcomeJourneyModal({ open, onClose, onStart }: WelcomeJourneyModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-black w-full max-w-md rounded-[24px] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors z-10"
        >
          <X size={20} />
        </button>
        
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-6">
            <img src="/skyrecover-logo.png" alt="SkyRecover" className="w-10 h-10 object-cover scale-[1.35]" />
          </div>
          
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
            Welcome to SkyRecover
          </h2>
          
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-8">
            Experience our automated recovery platform. We've detected a disruption and instantly prepared the perfect alternative for you. Let us guide you through the seamless recovery process.
          </p>
          
          <button 
            onClick={onStart}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-[15px] bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-md shadow-violet-200 dark:shadow-none transition-all active:scale-[0.98]"
          >
            Start My Journey
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
