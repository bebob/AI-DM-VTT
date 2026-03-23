import { useGameStore } from '../../stores/gameStore';
import { RetroPanel } from '../layout/RetroPanel';
import './CombatTracker.css';

export function CombatTracker() {
  const combat = useGameStore((s) => s.combat);

  if (!combat.active) {
    return (
      <RetroPanel title="Combat" className="combat-tracker">
        <div className="combat-tracker__inactive">
          No active combat.
          <br />
          <span className="combat-tracker__hint">
            Combat begins when the DM calls for initiative.
          </span>
        </div>
      </RetroPanel>
    );
  }

  return (
    <RetroPanel title={`Combat — Round ${combat.round}`} className="combat-tracker" highlight>
      <div className="combat-tracker__list">
        {combat.combatants.map((c, i) => (
          <div
            key={c.id}
            className={`combat-tracker__combatant ${
              i === combat.turnIndex ? 'combat-tracker__combatant--active' : ''
            } ${c.isPlayer ? 'combat-tracker__combatant--player' : ''}`}
          >
            <span className="combat-tracker__init">{c.initiative}</span>
            <span className="combat-tracker__name">
              {c.name}
              {c.isCompanion && <span className="combat-tracker__companion-tag"> [C]</span>}
            </span>
            {c.hp && (
              <span className="combat-tracker__hp">
                {c.hp.current}/{c.hp.max}
              </span>
            )}
            {c.conditions.length > 0 && (
              <div className="combat-tracker__conditions">
                {c.conditions.map((cond) => (
                  <span key={cond} className="combat-tracker__condition">{cond}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </RetroPanel>
  );
}
