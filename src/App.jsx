import { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore.js';
import PinLockScreen from './components/PinLockScreen.jsx';
import BottomNav from './components/BottomNav.jsx';
import Dashboard from './views/Dashboard.jsx';
import Chat from './views/Chat.jsx';
import LogHistory from './views/LogHistory.jsx';

export default function App() {
  const isUnlocked = useAppStore(s => s.isUnlocked);
  const unlock = useAppStore(s => s.unlock);
  const activeView = useAppStore(s => s.activeView);
  const hydrate = useAppStore(s => s.hydrate);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate state from IndexedDB on mount
  useEffect(() => {
    const init = async () => {
      await hydrate();
      setIsLoading(false);
    };
    init();
  }, [hydrate]);

  // Loading screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center animate-fade-in">
          <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-6 shadow-[0_8px_32px_rgba(79,70,229,0.25)] bg-accent-primary">
            <span className="text-3xl font-extrabold text-white">🌸</span>
          </div>
          <div className="w-8 h-8 border-[3px] border-[rgba(255,255,255,0.05)] border-t-accent-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // PIN Lock
  if (!isUnlocked) {
    return <PinLockScreen onUnlock={unlock} />;
  }

  // Main App
  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'chat' && <Chat />}
        {activeView === 'log' && <LogHistory />}
      </main>
      <BottomNav />
    </div>
  );
}
