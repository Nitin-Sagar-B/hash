import { useAppStore } from '../store/useAppStore.js';

const tabs = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    )
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )
  },
  {
    id: 'log',
    label: 'History',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    )
  }
];

export default function BottomNav() {
  const activeView = useAppStore(s => s.activeView);
  const setActiveView = useAppStore(s => s.setActiveView);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav safe-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {tabs.map(tab => {
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 
                ${isActive 
                  ? 'text-accent-primary' 
                  : 'text-text-tertiary hover:text-text-secondary'
                }`}
            >
              <div className="relative">
                {tab.icon(isActive)}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-primary" />
                )}
              </div>
              <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
