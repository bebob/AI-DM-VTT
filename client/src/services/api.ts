const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  // Campaigns
  getCampaigns: () => request<any[]>('/campaigns'),
  createCampaign: (name: string, setting: string) =>
    request<any>('/campaigns', {
      method: 'POST',
      body: JSON.stringify({ name, setting }),
    }),
  getCampaign: (id: string) => request<any>(`/campaigns/${id}`),
  getParty: (id: string) => request<any[]>(`/campaigns/${id}/party`),
  addCharacter: (campaignId: string, character: any) =>
    request<any>(`/campaigns/${campaignId}/party`, {
      method: 'POST',
      body: JSON.stringify(character),
    }),
  getInventory: (id: string) => request<any[]>(`/campaigns/${id}/inventory`),
  getCurrency: (id: string) => request<any>(`/campaigns/${id}/currency`),

  // Dice
  rollDice: (expression: string, label?: string) =>
    request<any>('/dice/roll', {
      method: 'POST',
      body: JSON.stringify({ expression, label }),
    }),

  // Narrative
  parseNarrative: (text: string) =>
    request<any>('/narrative/parse', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  // Health
  health: () => request<{ status: string; version: string }>('/health'),
};
