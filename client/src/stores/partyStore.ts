import { create } from 'zustand';
import type { Character, CharacterInventory, CurrencyLedger } from '@ai-dm-vtt/shared';

interface PartyStore {
  characters: Character[];
  activeCharacterId: string | null;
  inventory: CharacterInventory[];
  currency: CurrencyLedger;

  setCharacters: (characters: Character[]) => void;
  setActiveCharacter: (id: string | null) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  setInventory: (inventory: CharacterInventory[]) => void;
  setCurrency: (currency: CurrencyLedger) => void;
}

export const usePartyStore = create<PartyStore>((set) => ({
  characters: [],
  activeCharacterId: null,
  inventory: [],
  currency: { characters: {}, partyFund: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 } },

  setCharacters: (characters) => set({ characters }),
  setActiveCharacter: (id) => set({ activeCharacterId: id }),
  updateCharacter: (id, updates) =>
    set((state) => ({
      characters: state.characters.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    })),
  setInventory: (inventory) => set({ inventory }),
  setCurrency: (currency) => set({ currency }),
}));
