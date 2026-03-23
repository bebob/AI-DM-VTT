import { create } from 'zustand';
import type { NarrativeBlock, Suggestion } from '@ai-dm-vtt/shared';

interface NarrativeStore {
  entries: NarrativeBlock[];
  suggestions: Suggestion[];
  isTyping: boolean;

  addEntry: (entry: NarrativeBlock) => void;
  setSuggestions: (suggestions: Suggestion[]) => void;
  setTyping: (typing: boolean) => void;
  clearEntries: () => void;
}

let nextId = 1;

export function createNarrativeEntry(
  type: NarrativeBlock['type'],
  content: string,
): NarrativeBlock {
  return {
    id: `entry-${nextId++}`,
    type,
    content,
    timestamp: Date.now(),
  };
}

export const useNarrativeStore = create<NarrativeStore>((set) => ({
  entries: [],
  suggestions: [],
  isTyping: false,

  addEntry: (entry) => set((state) => ({ entries: [...state.entries, entry] })),
  setSuggestions: (suggestions) => set({ suggestions }),
  setTyping: (typing) => set({ isTyping: typing }),
  clearEntries: () => set({ entries: [], suggestions: [] }),
}));
