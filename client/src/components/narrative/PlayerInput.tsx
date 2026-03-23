import { useState, useCallback, type KeyboardEvent } from 'react';
import { useNarrativeStore, createNarrativeEntry } from '../../stores/narrativeStore';
import { useNarrate } from '../../hooks/useNarrate';
import type { InputMode } from '@ai-dm-vtt/shared';
import './PlayerInput.css';

function detectMode(text: string): InputMode {
  const trimmed = text.trim();
  if (trimmed.startsWith('<') && trimmed.endsWith('>')) return 'meta';
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) return 'speech';
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) return 'speech';
  return 'action';
}

function cleanInput(text: string, mode: InputMode): string {
  const trimmed = text.trim();
  if (mode === 'meta') return trimmed.slice(1, -1).trim();
  if (mode === 'speech') return trimmed.slice(1, -1).trim();
  return trimmed;
}

const MODE_LABELS: Record<InputMode, string> = {
  action: 'ACTION',
  speech: 'SPEECH',
  meta: 'META',
};

const MODE_HINTS: Record<InputMode, string> = {
  action: 'What do you do?',
  speech: '"Speak in character..."',
  meta: '<Ask the DM a question>',
};

export function PlayerInput() {
  const [text, setText] = useState('');
  const addEntry = useNarrativeStore((s) => s.addEntry);
  const isTyping = useNarrativeStore((s) => s.isTyping);
  const narrate = useNarrate();

  const currentMode = text.trim() ? detectMode(text) : 'action';

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const mode = detectMode(trimmed);
    const clean = cleanInput(trimmed, mode);
    const entryType = mode === 'meta' ? 'player-meta' : mode === 'speech' ? 'player-speech' : 'player-action';

    addEntry(createNarrativeEntry(entryType, clean));
    setText('');

    narrate(clean, mode);
  }, [text, isTyping, addEntry, narrate]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <div className="player-input">
      <div className="player-input__mode-indicator">
        <span className={`player-input__mode player-input__mode--${currentMode}`}>
          {MODE_LABELS[currentMode]}
        </span>
      </div>
      <div className="player-input__row">
        <textarea
          className="player-input__textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={MODE_HINTS[currentMode]}
          rows={2}
          disabled={isTyping}
        />
        <button
          className="retro-btn retro-btn--primary player-input__send"
          onClick={handleSubmit}
          disabled={isTyping}
        >
          GO
        </button>
      </div>
    </div>
  );
}
