// ── Ability Scores ──────────────────────────────────────────────────

export type AbilityName = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export interface AbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

// ── Skills ──────────────────────────────────────────────────────────

export type SkillName =
  | 'Acrobatics' | 'Animal Handling' | 'Arcana' | 'Athletics'
  | 'Deception' | 'History' | 'Insight' | 'Intimidation'
  | 'Investigation' | 'Medicine' | 'Nature' | 'Perception'
  | 'Performance' | 'Persuasion' | 'Religion' | 'Sleight of Hand'
  | 'Stealth' | 'Survival';

export type ProficiencyLevel = 'none' | 'proficient' | 'expertise';

export interface SkillProficiency {
  skill: SkillName;
  level: ProficiencyLevel;
}

// ── Character ───────────────────────────────────────────────────────

export interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  subclass?: string;
  level: number;
  background: string;
  alignment?: string;

  abilities: AbilityScores;
  proficiencyBonus: number;
  ac: number;
  hp: { current: number; max: number; temp: number };
  hitDice: { total: number; remaining: number; die: string };
  speed: number;
  deathSaves: { successes: number; failures: number };

  saveProficiencies: AbilityName[];
  skills: SkillProficiency[];
  passivePerception: number;

  features: string[];
  traits?: string[];
  ideals?: string[];
  bonds?: string[];
  flaws?: string[];

  spellcasting?: SpellcastingInfo;
  isCompanion: boolean;
}

export interface SpellcastingInfo {
  ability: AbilityName;
  saveDC: number;
  attackBonus: number;
  cantrips: string[];
  knownSpells: string[];
  preparedSpells: string[];
  slots: SpellSlots;
}

export interface SpellSlots {
  [level: number]: { total: number; remaining: number };
}

// ── Inventory ───────────────────────────────────────────────────────

export interface Item {
  id: string;
  name: string;
  description: string;
  quantity: number;
  weight?: number;
  type: 'weapon' | 'armor' | 'potion' | 'scroll' | 'gear' | 'treasure' | 'ammo' | 'custom';
  equipped?: boolean;
  attuned?: boolean;
  charges?: { current: number; max: number };
  properties?: string[];
  homebrew?: boolean;
}

export interface CharacterInventory {
  characterId: string;
  items: Item[];
}

// ── Currency ────────────────────────────────────────────────────────

export interface Currency {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface CurrencyLedger {
  characters: Record<string, Currency>;
  partyFund: Currency;
}

// ── Reputation / Factions ───────────────────────────────────────────

export type ReputationTier = 'Hostile' | 'Unfriendly' | 'Neutral' | 'Friendly' | 'Allied';

export interface FactionReputation {
  factionId: string;
  factionName: string;
  score: number;
  tier: ReputationTier;
}

// ── Conditions ──────────────────────────────────────────────────────

export interface ActiveCondition {
  condition: string;
  source?: string;
  duration?: string;
  notes?: string;
}

export interface CharacterConditions {
  characterId: string;
  conditions: ActiveCondition[];
  exhaustionLevel: number;
}

// ── Campaign ────────────────────────────────────────────────────────

export interface CampaignMeta {
  id: string;
  name: string;
  system: string;
  setting: string;
  createdAt: string;
  lastPlayedAt?: string;
  sessionCount: number;
  currentAct: number;
  currentChapter: number;
}

// ── NPCs ────────────────────────────────────────────────────────────

export type NPCTier = 1 | 2 | 3;

export interface NPCBase {
  id: string;
  name: string;
  description: string;
  tier: NPCTier;
  location?: string;
}

export interface NPCTier1 extends NPCBase {
  tier: 1;
  role: string;
  goal: string;
  plan: string[];
  currentPlanStep: number;
  resources: string[];
  knowledge: string[];
  secret: string;
  attitudeTowardParty: string;
  voiceNotes: string;
  keyStatements: string[];
}

export interface NPCTier2 extends NPCBase {
  tier: 2;
  goal: string;
  agenda: string;
  attitudeTowardParty: string;
  secretOrInfo: string;
}

export interface NPCTier3 extends NPCBase {
  tier: 3;
  trait: string;
  infoOrService: string;
}

export type NPC = NPCTier1 | NPCTier2 | NPCTier3;

// ── Narrative ───────────────────────────────────────────────────────

export type InputMode = 'action' | 'speech' | 'meta';

export interface NarrativeBlock {
  id: string;
  type: 'narrative' | 'mechanics' | 'suggestions' | 'player-action' | 'player-speech' | 'player-meta' | 'system';
  content: string;
  timestamp: number;
}

export interface Suggestion {
  text: string;
  rollRequired?: string;
  dc?: number;
}

export interface ParsedNarratorResponse {
  narrative: string;
  mechanics?: MechanicsEntry[];
  suggestions?: Suggestion[];
}

// ── Mechanics (parsed from [MECHANICS] blocks) ──────────────────────

export type MechanicsEntryType =
  | 'ROLL' | 'DAMAGE' | 'HP_CHANGE' | 'ENEMY_HP'
  | 'AMMO' | 'ITEM_GAINED' | 'ITEM_LOST'
  | 'CONDITION_ADD' | 'CONDITION_REMOVE'
  | 'SPELL_SLOT' | 'REPUTATION' | 'CURRENCY';

export interface MechanicsEntry {
  type: MechanicsEntryType;
  raw: string;
  data: Record<string, string | number>;
}

// ── Dice ────────────────────────────────────────────────────────────

export interface DiceRollRequest {
  expression: string;
  advantage?: boolean;
  disadvantage?: boolean;
  label?: string;
}

export interface DiceRollResult {
  expression: string;
  rolls: number[];
  kept: number[];
  modifier: number;
  total: number;
  natural: number;
  critical: boolean;
  fumble: boolean;
  label?: string;
}

// ── Combat ──────────────────────────────────────────────────────────

export interface Combatant {
  id: string;
  name: string;
  initiative: number;
  isPlayer: boolean;
  isCompanion: boolean;
  hp?: { current: number; max: number };
  ac?: number;
  conditions: string[];
}

export interface CombatState {
  active: boolean;
  round: number;
  turnIndex: number;
  combatants: Combatant[];
}

// ── Game State ──────────────────────────────────────────────────────

export type GameMode = 'exploration' | 'dialog' | 'combat' | 'dramatic' | 'character-creation' | 'level-up' | 'menu';

export interface GameState {
  campaignId: string | null;
  mode: GameMode;
  combat: CombatState;
  currentLocation?: string;
  sessionActive: boolean;
}
