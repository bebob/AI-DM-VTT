import type { AbilityName, SkillName } from './types.js';

export const ABILITIES: AbilityName[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

export const SKILL_ABILITY_MAP: Record<SkillName, AbilityName> = {
  'Acrobatics': 'DEX',
  'Animal Handling': 'WIS',
  'Arcana': 'INT',
  'Athletics': 'STR',
  'Deception': 'CHA',
  'History': 'INT',
  'Insight': 'WIS',
  'Intimidation': 'CHA',
  'Investigation': 'INT',
  'Medicine': 'WIS',
  'Nature': 'INT',
  'Perception': 'WIS',
  'Performance': 'CHA',
  'Persuasion': 'CHA',
  'Religion': 'INT',
  'Sleight of Hand': 'DEX',
  'Stealth': 'DEX',
  'Survival': 'WIS',
};

export const SKILLS: SkillName[] = Object.keys(SKILL_ABILITY_MAP) as SkillName[];

export const REPUTATION_THRESHOLDS: Record<string, [number, number]> = {
  'Hostile': [-100, -51],
  'Unfriendly': [-50, -11],
  'Neutral': [-10, 10],
  'Friendly': [11, 50],
  'Allied': [51, 100],
};

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function modifierString(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
