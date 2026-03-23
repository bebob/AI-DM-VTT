import { Router } from 'express';
import { rollDice, rollBatch } from '../services/diceEngine.js';

const router = Router();

router.post('/roll', (req, res) => {
  try {
    const { expression, label } = req.body;
    if (!expression) {
      res.status(400).json({ error: 'Missing expression' });
      return;
    }
    const result = rollDice(expression);
    if (label) result.label = label;
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/batch', (req, res) => {
  try {
    const { expression, count, label } = req.body;
    if (!expression || !count) {
      res.status(400).json({ error: 'Missing expression or count' });
      return;
    }
    const results = rollBatch(expression, count);
    res.json({ expression, count, results, label });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
