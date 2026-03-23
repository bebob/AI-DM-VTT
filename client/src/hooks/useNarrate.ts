import { useCallback } from 'react';
import { useNarrativeStore, createNarrativeEntry } from '../stores/narrativeStore';
import { usePartyStore } from '../stores/partyStore';
import { useGameStore } from '../stores/gameStore';
import { api } from '../services/api';
import type { InputMode } from '@ai-dm-vtt/shared';

/**
 * Hook that sends a player action to the AI narrator and updates
 * the narrative store with the response.
 */
export function useNarrate() {
  const addEntry = useNarrativeStore((s) => s.addEntry);
  const setTyping = useNarrativeStore((s) => s.setTyping);
  const setSuggestions = useNarrativeStore((s) => s.setSuggestions);
  const entries = useNarrativeStore((s) => s.entries);
  const activeCharacter = usePartyStore((s) => {
    const id = s.activeCharacterId;
    return s.characters.find((c) => c.id === id) ?? null;
  });
  const campaign = useGameStore((s) => s.campaign);
  const mode = useGameStore((s) => s.mode);

  const narrate = useCallback(
    async (playerAction: string, inputMode: InputMode = 'action') => {
      if (!activeCharacter) return;

      setSuggestions([]);
      setTyping(true);

      try {
        // Send last 20 entries as context
        const recentHistory = entries.slice(-20);

        const result = await api.narrateRespond({
          playerAction,
          inputMode,
          character: activeCharacter,
          recentHistory,
          campaignSetting: campaign?.setting,
          gameMode: mode,
        });

        setTyping(false);

        // Add narrative response
        if (result.narrative) {
          addEntry(createNarrativeEntry('narrative', result.narrative));
        }

        // Add mechanics entries
        if (result.mechanics && result.mechanics.length > 0) {
          const mechanicsText = result.mechanics.map((m: any) => m.raw).join('\n');
          addEntry(createNarrativeEntry('mechanics', mechanicsText));
        }

        // Set suggestions
        if (result.suggestions && result.suggestions.length > 0) {
          setSuggestions(result.suggestions);
        }
      } catch (err) {
        console.error('Narrator error:', err);
        setTyping(false);
        addEntry(
          createNarrativeEntry(
            'narrative',
            'The DM pauses, collecting their thoughts...\n\n(Connection to narrator failed. Try again or use the dice roller for manual play.)',
          ),
        );
        setSuggestions([
          { text: 'Try again' },
          { text: 'Look around', rollRequired: 'Perception DC 12' },
          { text: 'Continue onward' },
        ]);
      }
    },
    [activeCharacter, campaign, mode, entries, addEntry, setTyping, setSuggestions],
  );

  return narrate;
}
