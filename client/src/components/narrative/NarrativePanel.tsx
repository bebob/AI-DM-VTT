import { useRef, useEffect } from 'react';
import { useNarrativeStore } from '../../stores/narrativeStore';
import { NarrativeEntry } from './NarrativeEntry';
import { PlayerInput } from './PlayerInput';
import { SuggestionsBar } from './SuggestionsBar';
import { RetroPanel } from '../layout/RetroPanel';
import './NarrativePanel.css';

export function NarrativePanel() {
  const entries = useNarrativeStore((s) => s.entries);
  const suggestions = useNarrativeStore((s) => s.suggestions);
  const isTyping = useNarrativeStore((s) => s.isTyping);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <RetroPanel className="narrative-panel" highlight>
      <div className="narrative-panel__scroll" ref={scrollRef}>
        {entries.length === 0 && (
          <div className="narrative-panel__empty">
            <div className="narrative-panel__logo">AI DUNGEON MASTER</div>
            <div className="narrative-panel__subtitle">Virtual Tabletop</div>
            <div className="narrative-panel__hint">
              Type an action, "speak in quotes", or {'<ask a meta question>'}
            </div>
          </div>
        )}
        {entries.map((entry) => (
          <NarrativeEntry key={entry.id} entry={entry} />
        ))}
        {isTyping && (
          <div className="narrative-panel__typing">
            <span className="anim-blink">...</span>
          </div>
        )}
      </div>

      {suggestions.length > 0 && <SuggestionsBar suggestions={suggestions} />}

      <PlayerInput />
    </RetroPanel>
  );
}
