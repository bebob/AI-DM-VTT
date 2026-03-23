import type { DiceRollResult } from './types.js';

/**
 * Parse and roll dice expressions like "2d6+3", "d20", "4d6kh3", "d20 adv"
 */
export function rollDice(expression: string): DiceRollResult {
  const trimmed = expression.trim().toLowerCase();

  // Check for advantage/disadvantage
  const hasAdvantage = trimmed.includes(' adv');
  const hasDisadvantage = trimmed.includes(' dis');
  const cleanExpr = trimmed.replace(/ (adv|dis)$/, '');

  // Parse: [count]d<sides>[kh<keep>|kl<keep>][+/-modifier]
  const match = cleanExpr.match(/^(\d*)d(\d+)(?:kh(\d+)|kl(\d+))?([+-]\d+)?$/);
  if (!match) {
    throw new Error(`Invalid dice expression: ${expression}`);
  }

  const count = match[1] ? parseInt(match[1]) : 1;
  const sides = parseInt(match[2]);
  const keepHighest = match[3] ? parseInt(match[3]) : undefined;
  const keepLowest = match[4] ? parseInt(match[4]) : undefined;
  const modifier = match[5] ? parseInt(match[5]) : 0;

  let effectiveCount = count;
  let effectiveKeepHighest = keepHighest;
  let effectiveKeepLowest = keepLowest;

  // Advantage/disadvantage: roll 2d20, keep highest/lowest 1
  if ((hasAdvantage || hasDisadvantage) && count === 1 && sides === 20) {
    effectiveCount = 2;
    if (hasAdvantage) effectiveKeepHighest = 1;
    if (hasDisadvantage) effectiveKeepLowest = 1;
  }

  // Roll the dice
  const rolls: number[] = [];
  for (let i = 0; i < effectiveCount; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }

  // Determine which dice to keep
  let kept: number[];
  if (effectiveKeepHighest !== undefined) {
    kept = [...rolls].sort((a, b) => b - a).slice(0, effectiveKeepHighest);
  } else if (effectiveKeepLowest !== undefined) {
    kept = [...rolls].sort((a, b) => a - b).slice(0, effectiveKeepLowest);
  } else {
    kept = [...rolls];
  }

  const keptSum = kept.reduce((sum, v) => sum + v, 0);
  const total = keptSum + modifier;
  const natural = kept.length === 1 ? kept[0] : keptSum;

  return {
    expression,
    rolls,
    kept,
    modifier,
    total,
    natural,
    critical: sides === 20 && kept.length === 1 && kept[0] === 20,
    fumble: sides === 20 && kept.length === 1 && kept[0] === 1,
  };
}

/**
 * Roll multiple expressions at once (e.g., batch initiative rolls)
 */
export function rollBatch(expression: string, count: number): DiceRollResult[] {
  return Array.from({ length: count }, () => rollDice(expression));
}
