import { usePartyStore } from '../../stores/partyStore';
import { abilityModifier, modifierString, ABILITIES, SKILL_ABILITY_MAP } from '@ai-dm-vtt/shared';
import type { Character, AbilityName, SkillName } from '@ai-dm-vtt/shared';
import { RetroPanel } from '../layout/RetroPanel';
import { HpBar } from './HpBar';
import './CharacterSheet.css';

function getSkillMod(char: Character, skill: SkillName): number {
  const ability = SKILL_ABILITY_MAP[skill];
  const base = abilityModifier(char.abilities[ability]);
  const prof = char.skills.find((s) => s.skill === skill);
  if (!prof || prof.level === 'none') return base;
  if (prof.level === 'expertise') return base + char.proficiencyBonus * 2;
  return base + char.proficiencyBonus;
}

export function CharacterSheet() {
  const characters = usePartyStore((s) => s.characters);
  const activeId = usePartyStore((s) => s.activeCharacterId);

  const char = characters.find((c) => c.id === activeId) || characters[0];

  if (!char) {
    return (
      <RetroPanel title="Character" className="character-sheet">
        <div className="character-sheet__empty">
          No characters yet.
          <br />
          Create a campaign to begin.
        </div>
      </RetroPanel>
    );
  }

  return (
    <RetroPanel title={char.name} className="character-sheet">
      {/* Header */}
      <div className="cs__header">
        <div className="cs__class">
          {char.race} {char.class} {char.level}
        </div>
        <div className="cs__ac">
          <span className="stat-label">AC</span>
          <span className="stat-value">{char.ac}</span>
        </div>
      </div>

      {/* HP Bar */}
      <HpBar current={char.hp.current} max={char.hp.max} temp={char.hp.temp} />

      {/* Ability Scores */}
      <div className="cs__abilities">
        {ABILITIES.map((ab) => {
          const score = char.abilities[ab as AbilityName];
          const mod = abilityModifier(score);
          const isProfSave = char.saveProficiencies.includes(ab as AbilityName);
          return (
            <div key={ab} className="cs__ability">
              <div className="cs__ability-name">{ab}</div>
              <div className="cs__ability-score">{score}</div>
              <div className="cs__ability-mod stat-modifier">
                {modifierString(mod)}
              </div>
              {isProfSave && <div className="cs__save-prof">SAVE</div>}
            </div>
          );
        })}
      </div>

      <hr className="retro-divider" />

      {/* Skills */}
      <div className="cs__skills">
        <div className="cs__section-title">Skills</div>
        {(Object.keys(SKILL_ABILITY_MAP) as SkillName[]).map((skill) => {
          const mod = getSkillMod(char, skill);
          const prof = char.skills.find((s) => s.skill === skill);
          const level = prof?.level || 'none';
          return (
            <div key={skill} className="cs__skill-row">
              <span className={`cs__skill-prof cs__skill-prof--${level}`}>
                {level === 'expertise' ? '**' : level === 'proficient' ? '*' : ' '}
              </span>
              <span className="cs__skill-name">{skill}</span>
              <span className="cs__skill-mod stat-modifier">
                {modifierString(mod)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Features */}
      {char.features.length > 0 && (
        <>
          <hr className="retro-divider" />
          <div className="cs__section-title">Features</div>
          <ul className="cs__features">
            {char.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </>
      )}
    </RetroPanel>
  );
}
