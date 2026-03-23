import type { NarrativeBlock } from '@ai-dm-vtt/shared';
import './NarrativeEntry.css';

interface NarrativeEntryProps {
  entry: NarrativeBlock;
}

const TYPE_CONFIG: Record<NarrativeBlock['type'], { label: string; className: string }> = {
  'narrative': { label: '', className: 'entry--narrative' },
  'mechanics': { label: 'MECHANICS', className: 'entry--mechanics' },
  'suggestions': { label: 'WHAT DO YOU DO?', className: 'entry--suggestions' },
  'player-action': { label: '>', className: 'entry--player-action' },
  'player-speech': { label: '', className: 'entry--player-speech' },
  'player-meta': { label: 'OOC', className: 'entry--player-meta' },
  'system': { label: 'SYSTEM', className: 'entry--system' },
};

export function NarrativeEntry({ entry }: NarrativeEntryProps) {
  const config = TYPE_CONFIG[entry.type];

  return (
    <div className={`narrative-entry ${config.className}`}>
      {config.label && (
        <span className="narrative-entry__label">{config.label}</span>
      )}
      <span className="narrative-entry__content">
        {entry.type === 'player-speech' ? `"${entry.content}"` : entry.content}
      </span>
    </div>
  );
}
