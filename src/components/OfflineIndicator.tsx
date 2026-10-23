import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-neutral-900/90 text-amber-300 border border-amber-500/40 px-3.5 py-1.5 text-xs font-semibold shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <WifiOff size={14} className="animate-pulse text-amber-400" />
      <span>Offline Mode — Playing saved music</span>
    </aside>
  );
};
