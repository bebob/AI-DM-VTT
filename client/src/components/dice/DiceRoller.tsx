import { useState, useCallback } from 'react';
import { rollDice } from '@ai-dm-vtt/shared';
import type { DiceRollResult } from '@ai-dm-vtt/shared';
import { useNarrativeStore, createNarrativeEntry } from '../../stores/narrativeStore';
import { RetroPanel } from '../layout/RetroPanel';
import './DiceRoller.css';

const QUICK_ROLLS = [
  { label: 'd20', expr: 'd20' },
  { label: 'd12', expr: 'd12' },
  { label: 'd10', expr: 'd10' },
  { label: 'd8', expr: 'd8' },
  { label: 'd6', expr: 'd6' },
  { label: 'd4', expr: 'd4' },
];

export function DiceRoller() {
  const [expression, setExpression] = useState('');
  const [lastResult, setLastResult] = useState<DiceRollResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const addEntry = useNarrativeStore((s) => s.addEntry);

  const doRoll = useCallback(
    (expr: string) => {
      try {
        setIsRolling(true);
        // Brief animation delay
        setTimeout(() => {
          const result = rollDice(expr);
          setLastResult(result);
          setIsRolling(false);

          // Add to narrative log
          const mechText = `ROLL: ${result.expression} = [${result.rolls.join(', ')}] → ${result.total}${
            result.critical ? ' CRITICAL!' : ''
          }${result.fumble ? ' FUMBLE!' : ''}`;
          addEntry(createNarrativeEntry('mechanics', mechText));
        }, 300);
      } catch {
        setIsRolling(false);
      }
    },
    [addEntry],
  );

  const handleSubmit = () => {
    if (expression.trim()) {
      doRoll(expression.trim());
      setExpression('');
    }
  };

  return (
    <RetroPanel title="Dice" className="dice-roller">
      {/* Quick roll buttons */}
      <div className="dice-roller__quick">
        {QUICK_ROLLS.map((qr) => (
          <button key={qr.label} className="retro-btn retro-btn--small" onClick={() => doRoll(qr.expr)}>
            {qr.label}
          </button>
        ))}
      </div>

      {/* Custom expression */}
      <div className="dice-roller__custom">
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="2d6+3"
          className="dice-roller__input"
        />
        <button className="retro-btn retro-btn--primary retro-btn--small" onClick={handleSubmit}>
          ROLL
        </button>
      </div>

      {/* Result display */}
      {lastResult && (
        <div className={`dice-roller__result ${isRolling ? 'anim-shake' : ''} ${
          lastResult.critical ? 'dice-roller__result--crit' : ''
        } ${lastResult.fumble ? 'dice-roller__result--fumble' : ''}`}>
          <div className="dice-roller__total">{lastResult.total}</div>
          <div className="dice-roller__breakdown">
            [{lastResult.rolls.join(', ')}]
            {lastResult.modifier !== 0 && (
              <span>{lastResult.modifier > 0 ? '+' : ''}{lastResult.modifier}</span>
            )}
          </div>
          {lastResult.critical && <div className="dice-roller__crit-label">CRITICAL HIT!</div>}
          {lastResult.fumble && <div className="dice-roller__fumble-label">CRITICAL MISS!</div>}
        </div>
      )}

      {isRolling && !lastResult && (
        <div className="dice-roller__result anim-shake">
          <div className="dice-roller__total">?</div>
        </div>
      )}
    </RetroPanel>
  );
}
