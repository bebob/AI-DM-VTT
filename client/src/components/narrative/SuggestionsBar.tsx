import type { Suggestion } from '@ai-dm-vtt/shared';
import { useNarrativeStore, createNarrativeEntry } from '../../stores/narrativeStore';
import './SuggestionsBar.css';

interface SuggestionsBarProps {
  suggestions: Suggestion[];
}

export function SuggestionsBar({ suggestions }: SuggestionsBarProps) {
  const addEntry = useNarrativeStore((s) => s.addEntry);
  const setSuggestions = useNarrativeStore((s) => s.setSuggestions);
  const setTyping = useNarrativeStore((s) => s.setTyping);

  const handleClick = (suggestion: Suggestion) => {
    addEntry(createNarrativeEntry('player-action', suggestion.text));
    setSuggestions([]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      addEntry(createNarrativeEntry('narrative',
        'The DM considers your action...\n\n(AI narrator integration coming soon.)'
      ));
    }, 1500);
  };

  return (
    <div className="suggestions-bar">
      <div className="suggestions-bar__label">WHAT DO YOU DO?</div>
      <div className="suggestions-bar__list">
        {suggestions.map((s, i) => (
          <button
            key={i}
            className="suggestions-bar__item"
            onClick={() => handleClick(s)}
          >
            <span className="suggestions-bar__text">{s.text}</span>
            {s.rollRequired && (
              <span className="suggestions-bar__roll">[{s.rollRequired}]</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
