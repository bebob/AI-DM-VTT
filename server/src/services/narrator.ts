import Anthropic from '@anthropic-ai/sdk';
import type { Character, NarrativeBlock, Suggestion, ParsedNarratorResponse } from '@ai-dm-vtt/shared';
import { parseMechanicsBlocks } from './mechanicsParser.js';

let client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

const SYSTEM_PROMPT = `You are an expert Dungeon Master running a D&D 5e campaign. You narrate vividly in second person ("You see...", "You hear..."), keeping prose tight and evocative — 2-4 short paragraphs max.

IMPORTANT RULES:
- When a player action would reasonably require a skill check, ability check, or saving throw, you MUST request it before resolving the outcome. Do NOT resolve uncertain actions automatically.
- Use the character's actual stats and proficiencies to determine which checks are appropriate.
- Set DCs based on difficulty: Easy 10, Medium 13, Hard 15, Very Hard 18, Nearly Impossible 25.
- For Perception checks when scanning/searching, consider the character's passive Perception.
- Never roll dice for the player. Always ask them to roll.
- Keep the world consistent and react logically to player choices.
- Maintain tension and pacing. Not every action needs a check — only when failure is meaningful.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS (include the block headers):

[NARRATIVE]
Your narrative text here. Describe what happens, what the character perceives, and what check is needed (if any). When requesting a roll, weave it naturally into the narrative, e.g. "The shadows seem to shift at the edge of your vision — make a Perception check to see what your keen eyes pick up."

[MECHANICS]
Only include this block if there are mechanical game effects to report. Use these formats:
ROLL: expression = result (outcome)
DAMAGE: expression = amount type
HP_CHANGE: character, from→to/max
CONDITION_ADD: character, condition
ITEM_GAINED: character, item quantity

[SUGGESTIONS]
- A natural next action the player might take
- Another option that requires a check [Skill DC N]
- A third option
- A fourth option [Skill DC N]

Always provide 3-5 suggestions. At least one should require a skill check with [Skill DC N] format. Suggestions should feel natural for the current situation.`;

interface NarrateRequest {
  playerAction: string;
  inputMode: 'action' | 'speech' | 'meta';
  character: Character;
  recentHistory: NarrativeBlock[];
  campaignSetting?: string;
  gameMode?: string;
}

function buildMessages(req: NarrateRequest): Array<{ role: 'user' | 'assistant'; content: string }> {
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  // Build context about the character
  const skillList = req.character.skills
    .map(s => `${s.skill} (${s.level})`)
    .join(', ');

  const charContext = [
    `CHARACTER: ${req.character.name}, ${req.character.race} ${req.character.class} ${req.character.level}`,
    `HP: ${req.character.hp.current}/${req.character.hp.max} | AC: ${req.character.ac}`,
    `Stats: STR ${req.character.abilities.STR}, DEX ${req.character.abilities.DEX}, CON ${req.character.abilities.CON}, INT ${req.character.abilities.INT}, WIS ${req.character.abilities.WIS}, CHA ${req.character.abilities.CHA}`,
    `Proficiency Bonus: +${req.character.proficiencyBonus}`,
    `Proficient Skills: ${skillList}`,
    `Passive Perception: ${req.character.passivePerception}`,
    `Features: ${req.character.features.join(', ')}`,
  ].join('\n');

  // Include recent narrative history as conversation context
  let lastRole: 'user' | 'assistant' | null = null;
  for (const entry of req.recentHistory) {
    if (entry.type === 'player-action' || entry.type === 'player-speech' || entry.type === 'player-meta') {
      const prefix = entry.type === 'player-speech' ? '(speaking) ' : entry.type === 'player-meta' ? '(meta) ' : '';
      // Merge consecutive user messages
      if (lastRole === 'user') {
        messages[messages.length - 1].content += '\n' + prefix + entry.content;
      } else {
        messages.push({ role: 'user', content: prefix + entry.content });
        lastRole = 'user';
      }
    } else if (entry.type === 'narrative' || entry.type === 'mechanics') {
      if (lastRole === 'assistant') {
        messages[messages.length - 1].content += '\n' + entry.content;
      } else {
        messages.push({ role: 'assistant', content: entry.content });
        lastRole = 'assistant';
      }
    }
  }

  // Add the current player action
  const prefix = req.inputMode === 'speech' ? '(speaking) ' : req.inputMode === 'meta' ? '(meta) ' : '';
  const playerMsg = `${charContext}\n\nSETTING: ${req.campaignSetting || 'Fantasy'}\nMODE: ${req.gameMode || 'exploration'}\n\nPLAYER ${req.inputMode.toUpperCase()}: ${prefix}${req.playerAction}`;

  if (lastRole === 'user') {
    messages[messages.length - 1].content += '\n\n' + playerMsg;
  } else {
    messages.push({ role: 'user', content: playerMsg });
  }

  return messages;
}

function parseResponse(text: string): ParsedNarratorResponse {
  // Extract [NARRATIVE] block
  const narrativeMatch = text.match(/\[NARRATIVE\]\n([\s\S]*?)(?=\n\[(?:MECHANICS|SUGGESTIONS)\]|$)/);
  const narrative = narrativeMatch ? narrativeMatch[1].trim() : text.trim();

  // Extract [MECHANICS] block
  const mechanics = parseMechanicsBlocks(text);

  // Extract [SUGGESTIONS] block
  const suggestionsMatch = text.match(/\[SUGGESTIONS\]\n([\s\S]*?)(?=\n\[|$)/);
  const suggestions: Suggestion[] = suggestionsMatch
    ? suggestionsMatch[1]
        .split('\n')
        .map((l: string) => l.replace(/^[•\-*]\s*/, '').trim())
        .filter(Boolean)
        .map((s: string) => {
          const rollMatch = s.match(/\[(.+?)\]/);
          const dcMatch = s.match(/DC\s*(\d+)/i);
          return {
            text: s.replace(/\[.+?\]/, '').trim(),
            rollRequired: rollMatch ? rollMatch[1] : undefined,
            dc: dcMatch ? parseInt(dcMatch[1]) : undefined,
          };
        })
    : [];

  return { narrative, mechanics: mechanics.length > 0 ? mechanics : undefined, suggestions };
}

export async function narrate(req: NarrateRequest): Promise<ParsedNarratorResponse> {
  const anthropic = getClient();

  if (!anthropic) {
    return getFallbackResponse(req);
  }

  const messages = buildMessages(req);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages,
  });

  const text = response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n');

  return parseResponse(text);
}

function getFallbackResponse(req: NarrateRequest): ParsedNarratorResponse {
  // Intelligent fallback when no API key is configured
  const action = req.playerAction.toLowerCase();

  // Detect if the action implies a skill check
  const checkMap: Array<{ keywords: string[]; skill: string; dc: number; narrative: string }> = [
    { keywords: ['look', 'scan', 'watch', 'observe', 'peer', 'search for threats', 'horizon'],
      skill: 'Perception', dc: 13,
      narrative: 'You narrow your eyes against the glare, scanning the terrain carefully. The desert holds its secrets close — make a Perception check to see what your trained eyes can pick out.' },
    { keywords: ['search', 'examine', 'inspect', 'investigate', 'check', 'look for clues'],
      skill: 'Investigation', dc: 12,
      narrative: 'You kneel down and begin to methodically examine the area, looking for anything out of the ordinary. Make an Investigation check.' },
    { keywords: ['sneak', 'hide', 'creep', 'stealth', 'quietly', 'silently'],
      skill: 'Stealth', dc: 13,
      narrative: 'You slow your breathing and move carefully, placing each foot with deliberate precision. Make a Stealth check to see if you go unnoticed.' },
    { keywords: ['persuade', 'convince', 'talk', 'speak', 'negotiate', 'reason with'],
      skill: 'Persuasion', dc: 14,
      narrative: 'You consider your words carefully, choosing an approach that might sway the situation in your favor. Make a Persuasion check.' },
    { keywords: ['intimidate', 'threaten', 'demand', 'scare', 'growl'],
      skill: 'Intimidation', dc: 13,
      narrative: 'You draw yourself up, letting the weight of your presence speak before your words do. Make an Intimidation check.' },
    { keywords: ['climb', 'jump', 'swim', 'push', 'lift', 'force', 'break'],
      skill: 'Athletics', dc: 13,
      narrative: 'This will test your physical limits. Brace yourself and make an Athletics check.' },
    { keywords: ['track', 'forage', 'navigate', 'survive', 'trail', 'find water'],
      skill: 'Survival', dc: 12,
      narrative: 'You study the ground and the sky, drawing on your experience in the wild. Make a Survival check.' },
    { keywords: ['recall', 'remember', 'know', 'lore', 'history', 'recognize'],
      skill: 'History', dc: 14,
      narrative: 'You search your memory for anything relevant — old tales, half-remembered lessons, fragments of knowledge. Make a History check.' },
    { keywords: ['sense', 'read', 'motive', 'lying', 'trust', 'feel', 'gut'],
      skill: 'Insight', dc: 13,
      narrative: 'You study the situation carefully, trusting your instincts to read what lies beneath the surface. Make an Insight check.' },
  ];

  for (const check of checkMap) {
    if (check.keywords.some(kw => action.includes(kw))) {
      return {
        narrative: check.narrative,
        suggestions: [
          { text: `Roll ${check.skill} check`, rollRequired: `${check.skill} DC ${check.dc}`, dc: check.dc },
          { text: 'Try a different approach' },
          { text: 'Proceed cautiously' },
          { text: 'Look around first', rollRequired: 'Perception DC 12', dc: 12 },
        ],
      };
    }
  }

  // Default response for actions that don't map to a check
  return {
    narrative: 'You steel your resolve and act. The world around you shifts in response to your choice.\n\nWhat do you do next?',
    suggestions: [
      { text: 'Look around the area', rollRequired: 'Perception DC 12', dc: 12 },
      { text: 'Press onward' },
      { text: 'Search for anything useful', rollRequired: 'Investigation DC 13', dc: 13 },
      { text: 'Ready your weapon' },
    ],
  };
}
