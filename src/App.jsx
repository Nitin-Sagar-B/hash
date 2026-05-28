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
      <div className="fixed inset-0 flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0f0f1a 50%, #13131f 100%)' }}>
        <div className="flex flex-col items-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #A78BFA)',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
            }}>
            <span className="text-2xl font-bold text-white">#</span>
          </div>
          <div className="w-6 h-6 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
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
