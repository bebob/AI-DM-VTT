import { Router } from 'express';
import { parseMechanicsBlocks } from '../services/mechanicsParser.js';

const router = Router();

/**
 * Parse a narrator response into structured blocks.
 * In v1 this is called by the client after receiving AI output.
 * Later this will be called automatically as the AI streams.
 */
router.post('/parse', (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Missing text' });
      return;
    }

    const mechanics = parseMechanicsBlocks(text);

    // Extract [NARRATIVE] block
    const narrativeMatch = text.match(/\[NARRATIVE\]\n([\s\S]*?)(?=\n\[|$)/);
    const narrative = narrativeMatch ? narrativeMatch[1].trim() : text;

    // Extract [SUGGESTIONS] block
    const suggestionsMatch = text.match(/\[SUGGESTIONS\]\n([\s\S]*?)(?=\n\[|$)/);
    const suggestions = suggestionsMatch
      ? suggestionsMatch[1]
          .split('\n')
          .map((l: string) => l.replace(/^[•\-*]\s*/, '').trim())
          .filter(Boolean)
          .map((s: string) => {
            const rollMatch = s.match(/\[(.+?)\]/);
            return {
              text: s.replace(/\[.+?\]/, '').trim(),
              rollRequired: rollMatch ? rollMatch[1] : undefined,
            };
          })
      : [];

    res.json({ narrative, mechanics, suggestions });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
