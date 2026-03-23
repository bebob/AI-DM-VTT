import { v4 as uuid } from 'uuid';
import type {
  CampaignMeta, Character, CharacterInventory, CurrencyLedger,
  FactionReputation, CharacterConditions, Item,
} from '@ai-dm-vtt/shared';
import {
  campaignPath, readJsonFile, writeJsonFile, readTextFile,
  writeTextFile, ensureDir, listCampaigns, fileExists,
} from '../utils/fileStore.js';

// ── Campaign CRUD ───────────────────────────────────────────────────

export async function getCampaigns(): Promise<CampaignMeta[]> {
  const ids = await listCampaigns();
  const metas: CampaignMeta[] = [];
  for (const id of ids) {
    try {
      const meta = await readJsonFile<CampaignMeta>(campaignPath(id, 'campaign.json'));
      metas.push(meta);
    } catch {
      // Skip invalid campaigns
    }
  }
  return metas;
}

export async function getCampaign(id: string): Promise<CampaignMeta> {
  return readJsonFile<CampaignMeta>(campaignPath(id, 'campaign.json'));
}

export async function createCampaign(name: string, setting: string): Promise<CampaignMeta> {
  const id = uuid();
  const meta: CampaignMeta = {
    id,
    name,
    system: 'D&D 5e',
    setting,
    createdAt: new Date().toISOString(),
    sessionCount: 0,
    currentAct: 1,
    currentChapter: 1,
  };

  // Create directory structure
  const dirs = [
    'lore/canon', 'lore/npcs/tier-1', 'lore/npcs/tier-2', 'lore/npcs/tier-3',
    'lore/factions', 'lore/locations',
    'ledger', 'rules/srd', 'tables/encounters', 'tables/settlements',
    'tables/loot', 'tables/atmosphere', 'sessions',
  ];
  for (const dir of dirs) {
    await ensureDir(campaignPath(id, dir));
  }

  // Write initial files
  await writeJsonFile(campaignPath(id, 'campaign.json'), meta);
  await writeJsonFile(campaignPath(id, 'ledger', 'party.json'), []);
  await writeJsonFile(campaignPath(id, 'ledger', 'inventory.json'), []);
  await writeJsonFile(campaignPath(id, 'ledger', 'currency.json'), { characters: {}, partyFund: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 } });
  await writeJsonFile(campaignPath(id, 'ledger', 'reputation.json'), []);
  await writeTextFile(campaignPath(id, 'arc.md'), `# ${name} — Story Arc\n\n## Act 1: The Hook\n\n## Act 2: The Crucible\n\n## Act 3: The Tower\n`);
  await writeTextFile(campaignPath(id, 'brief.md'), `# SESSION BRIEF — Session 1\n\nNo session brief generated yet.\n`);
  await writeTextFile(campaignPath(id, 'snapshot.md'), `# Campaign Snapshot\n\nNo snapshot generated yet.\n`);
  await writeTextFile(campaignPath(id, 'lore', 'world-state.md'), `# World State\n\nCampaign has not yet begun.\n`);
  await writeTextFile(campaignPath(id, 'lore', 'timeline.md'), `# Timeline\n\nNo events yet.\n`);
  await writeTextFile(campaignPath(id, 'lore', 'threads.md'), `# Open Threads\n\nNo threads planted yet.\n`);
  await writeTextFile(campaignPath(id, 'rules', 'homebrew.md'), `# Homebrew Rules\n\nNo homebrew rules yet.\n`);
  await writeTextFile(campaignPath(id, 'rules', 'encounter-balance.md'), `# Encounter Balance\n\n## Solo Play (1 PC)\n- Levels 1-3: No enemy above 15 HP, no multiattack, max 2 enemies\n- Always provide escape routes in deadly encounters\n- Death save threshold: 3 failures (RAW)\n- Healing potion availability: generous in early game\n`);

  return meta;
}

// ── Party / Characters ──────────────────────────────────────────────

export async function getParty(campaignId: string): Promise<Character[]> {
  return readJsonFile<Character[]>(campaignPath(campaignId, 'ledger', 'party.json'));
}

export async function saveParty(campaignId: string, party: Character[]): Promise<void> {
  await writeJsonFile(campaignPath(campaignId, 'ledger', 'party.json'), party);
}

export async function addCharacter(campaignId: string, character: Character): Promise<Character> {
  const party = await getParty(campaignId);
  party.push(character);
  await saveParty(campaignId, party);
  return character;
}

export async function updateCharacter(campaignId: string, characterId: string, updates: Partial<Character>): Promise<Character> {
  const party = await getParty(campaignId);
  const idx = party.findIndex(c => c.id === characterId);
  if (idx === -1) throw new Error(`Character not found: ${characterId}`);
  party[idx] = { ...party[idx], ...updates };
  await saveParty(campaignId, party);
  return party[idx];
}

// ── Inventory ───────────────────────────────────────────────────────

export async function getInventory(campaignId: string): Promise<CharacterInventory[]> {
  return readJsonFile<CharacterInventory[]>(campaignPath(campaignId, 'ledger', 'inventory.json'));
}

export async function saveInventory(campaignId: string, inventory: CharacterInventory[]): Promise<void> {
  await writeJsonFile(campaignPath(campaignId, 'ledger', 'inventory.json'), inventory);
}

// ── Currency ────────────────────────────────────────────────────────

export async function getCurrency(campaignId: string): Promise<CurrencyLedger> {
  return readJsonFile<CurrencyLedger>(campaignPath(campaignId, 'ledger', 'currency.json'));
}

export async function saveCurrency(campaignId: string, currency: CurrencyLedger): Promise<void> {
  await writeJsonFile(campaignPath(campaignId, 'ledger', 'currency.json'), currency);
}

// ── Reputation ──────────────────────────────────────────────────────

export async function getReputation(campaignId: string): Promise<FactionReputation[]> {
  return readJsonFile<FactionReputation[]>(campaignPath(campaignId, 'ledger', 'reputation.json'));
}

// ── Session Brief ───────────────────────────────────────────────────

export async function getSessionBrief(campaignId: string): Promise<string> {
  return readTextFile(campaignPath(campaignId, 'brief.md'));
}

// ── Session Log ─────────────────────────────────────────────────────

export async function writeSessionLog(campaignId: string, sessionNumber: number, content: string): Promise<void> {
  const num = String(sessionNumber).padStart(3, '0');
  await writeTextFile(campaignPath(campaignId, 'sessions', `session-${num}.md`), content);
}
