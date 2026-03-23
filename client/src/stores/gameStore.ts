import { create } from 'zustand';
import type { GameMode, CombatState, CampaignMeta } from '@ai-dm-vtt/shared';

interface GameStore {
  campaign: CampaignMeta | null;
  mode: GameMode;
  sessionActive: boolean;
  currentLocation: string;
  sidebarPanel: 'character' | 'inventory' | 'combat' | 'map';
  combat: CombatState;

  setCampaign: (campaign: CampaignMeta | null) => void;
  setMode: (mode: GameMode) => void;
  setSessionActive: (active: boolean) => void;
  setLocation: (location: string) => void;
  setSidebarPanel: (panel: 'character' | 'inventory' | 'combat' | 'map') => void;
  setCombat: (combat: CombatState) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  campaign: null,
  mode: 'menu',
  sessionActive: false,
  currentLocation: 'Unknown',
  sidebarPanel: 'character',
  combat: { active: false, round: 0, turnIndex: 0, combatants: [] },

  setCampaign: (campaign) => set({ campaign }),
  setMode: (mode) => set({ mode }),
  setSessionActive: (active) => set({ sessionActive: active }),
  setLocation: (location) => set({ currentLocation: location }),
  setSidebarPanel: (panel) => set({ sidebarPanel: panel }),
  setCombat: (combat) => set({ combat }),
}));
