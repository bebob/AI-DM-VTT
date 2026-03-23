import { NarrativePanel } from '../narrative/NarrativePanel';
import { SidebarTabs } from './SidebarTabs';
import { CharacterSheet } from '../character/CharacterSheet';
import { InventoryPanel } from '../inventory/InventoryPanel';
import { CombatTracker } from '../combat/CombatTracker';
import { DiceRoller } from '../dice/DiceRoller';
import { useGameStore } from '../../stores/gameStore';
import './GameScreen.css';

export function GameScreen() {
  const sidebarPanel = useGameStore((s) => s.sidebarPanel);

  return (
    <div className="game-screen">
      <div className="game-screen__main">
        <NarrativePanel />
      </div>

      <div className="game-screen__sidebar">
        <SidebarTabs />
        <div className="game-screen__sidebar-content">
          {sidebarPanel === 'character' && <CharacterSheet />}
          {sidebarPanel === 'inventory' && <InventoryPanel />}
          {sidebarPanel === 'combat' && <CombatTracker />}
        </div>
        <DiceRoller />
      </div>
    </div>
  );
}
