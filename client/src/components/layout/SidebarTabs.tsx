import { useGameStore } from '../../stores/gameStore';
import './SidebarTabs.css';

const TABS = [
  { key: 'character' as const, label: 'CHAR' },
  { key: 'inventory' as const, label: 'ITEMS' },
  { key: 'combat' as const, label: 'COMBAT' },
] as const;

export function SidebarTabs() {
  const active = useGameStore((s) => s.sidebarPanel);
  const setPanel = useGameStore((s) => s.setSidebarPanel);

  return (
    <div className="sidebar-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`sidebar-tabs__tab ${active === tab.key ? 'sidebar-tabs__tab--active' : ''}`}
          onClick={() => setPanel(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
