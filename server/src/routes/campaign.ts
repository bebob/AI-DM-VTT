import { Router } from 'express';
import * as campaignService from '../services/campaignService.js';

const router = Router();

router.get('/', async (_req, res) => {
  const campaigns = await campaignService.getCampaigns();
  res.json(campaigns);
});

router.post('/', async (req, res) => {
  const { name, setting } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Missing campaign name' });
    return;
  }
  const campaign = await campaignService.createCampaign(name, setting || 'Original');
  res.status(201).json(campaign);
});

router.get('/:id', async (req, res) => {
  try {
    const campaign = await campaignService.getCampaign(req.params.id);
    res.json(campaign);
  } catch {
    res.status(404).json({ error: 'Campaign not found' });
  }
});

router.get('/:id/party', async (req, res) => {
  try {
    const party = await campaignService.getParty(req.params.id);
    res.json(party);
  } catch {
    res.status(404).json({ error: 'Campaign not found' });
  }
});

router.post('/:id/party', async (req, res) => {
  try {
    const character = await campaignService.addCharacter(req.params.id, req.body);
    res.status(201).json(character);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id/party/:charId', async (req, res) => {
  try {
    const character = await campaignService.updateCharacter(req.params.id, req.params.charId, req.body);
    res.json(character);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

router.get('/:id/inventory', async (req, res) => {
  try {
    const inventory = await campaignService.getInventory(req.params.id);
    res.json(inventory);
  } catch {
    res.status(404).json({ error: 'Campaign not found' });
  }
});

router.get('/:id/currency', async (req, res) => {
  try {
    const currency = await campaignService.getCurrency(req.params.id);
    res.json(currency);
  } catch {
    res.status(404).json({ error: 'Campaign not found' });
  }
});

router.get('/:id/brief', async (req, res) => {
  try {
    const brief = await campaignService.getSessionBrief(req.params.id);
    res.json({ content: brief });
  } catch {
    res.status(404).json({ error: 'Brief not found' });
  }
});

export default router;
