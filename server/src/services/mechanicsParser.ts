import type { MechanicsEntry, MechanicsEntryType } from '@ai-dm-vtt/shared';

const MECHANICS_BLOCK_RE = /\[MECHANICS\]\n([\s\S]*?)(?=\n\[|$)/g;

const LINE_PARSERS: Record<string, RegExp> = {
  ROLL: /^ROLL:\s*(.+?)\s*=\s*(\d+)\s*\((.+?)\)$/,
  DAMAGE: /^DAMAGE:\s*(.+?)\s*=\s*(\d+)\s*(.+)$/,
  HP_CHANGE: /^HP_CHANGE:\s*(.+?),\s*(\d+)→(\d+)\/(\d+)$/,
  ENEMY_HP: /^ENEMY_HP:\s*(.+?),\s*(-?\d+)\/(\d+)\s*\((.+?)\)$/,
  AMMO: /^AMMO:\s*(.+?),\s*(.+?)\s+(\d+)→(\d+)$/,
  ITEM_GAINED: /^ITEM_GAINED:\s*(.+?),\s*(.+?)\s+(\d+)$/,
  ITEM_LOST: /^ITEM_LOST:\s*(.+?),\s*(.+?)\s+(\d+)$/,
  CONDITION_ADD: /^CONDITION_ADD:\s*(.+?),\s*(.+)$/,
  CONDITION_REMOVE: /^CONDITION_REMOVE:\s*(.+?),\s*(.+)$/,
  SPELL_SLOT: /^SPELL_SLOT:\s*(.+?),\s*(\d+)\s+(\d+)\/(\d+)$/,
  REPUTATION: /^REPUTATION:\s*(.+?),\s*(.+?)→(.+)$/,
  CURRENCY: /^CURRENCY:\s*(.+?),\s*(\d+)→(\d+)\s*(.+)$/,
};

export function parseMechanicsBlocks(text: string): MechanicsEntry[] {
  const entries: MechanicsEntry[] = [];
  let match: RegExpExecArray | null;

  while ((match = MECHANICS_BLOCK_RE.exec(text)) !== null) {
    const blockContent = match[1];
    const lines = blockContent.split('\n').map(l => l.trim()).filter(Boolean);

    for (const line of lines) {
      const entry = parseMechanicsLine(line);
      if (entry) entries.push(entry);
    }
  }

  // Reset regex state
  MECHANICS_BLOCK_RE.lastIndex = 0;

  return entries;
}

function parseMechanicsLine(line: string): MechanicsEntry | null {
  for (const [type, regex] of Object.entries(LINE_PARSERS)) {
    const match = line.match(regex);
    if (match) {
      return {
        type: type as MechanicsEntryType,
        raw: line,
        data: buildData(type as MechanicsEntryType, match),
      };
    }
  }
  return null;
}

function buildData(type: MechanicsEntryType, match: RegExpMatchArray): Record<string, string | number> {
  switch (type) {
    case 'ROLL':
      return { expression: match[1], result: parseInt(match[2]), outcome: match[3] };
    case 'DAMAGE':
      return { expression: match[1], amount: parseInt(match[2]), damageType: match[3].trim() };
    case 'HP_CHANGE':
      return { character: match[1], from: parseInt(match[2]), to: parseInt(match[3]), max: parseInt(match[4]) };
    case 'ENEMY_HP':
      return { name: match[1], current: parseInt(match[2]), max: parseInt(match[3]), status: match[4] };
    case 'AMMO':
      return { character: match[1], item: match[2], from: parseInt(match[3]), to: parseInt(match[4]) };
    case 'ITEM_GAINED':
      return { character: match[1], item: match[2], quantity: parseInt(match[3]) };
    case 'ITEM_LOST':
      return { character: match[1], item: match[2], quantity: parseInt(match[3]) };
    case 'CONDITION_ADD':
      return { character: match[1], condition: match[2] };
    case 'CONDITION_REMOVE':
      return { character: match[1], condition: match[2] };
    case 'SPELL_SLOT':
      return { character: match[1], level: parseInt(match[2]), remaining: parseInt(match[3]), total: parseInt(match[4]) };
    case 'REPUTATION':
      return { faction: match[1], from: match[2], to: match[3] };
    case 'CURRENCY':
      return { target: match[1], from: parseInt(match[2]), to: parseInt(match[3]), denomination: match[4] };
    default:
      return {};
  }
}
