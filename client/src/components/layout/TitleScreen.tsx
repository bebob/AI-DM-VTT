import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { usePartyStore } from '../../stores/partyStore';
import { useNarrativeStore, createNarrativeEntry } from '../../stores/narrativeStore';
import { api } from '../../services/api';
import type { Character, Suggestion } from '@ai-dm-vtt/shared';
import './TitleScreen.css';

// Sample character for demo purposes
const SAMPLE_CHARACTER: Character = {
  id: 'demo-roland',
  name: 'Roland Deschain',
  race: 'Human',
  class: 'Fighter',
  subclass: 'Gunslinger',
  level: 5,
  background: 'Outlander',
  alignment: 'Lawful Neutral',
  abilities: { STR: 14, DEX: 18, CON: 14, INT: 12, WIS: 16, CHA: 10 },
  proficiencyBonus: 3,
  ac: 16,
  hp: { current: 44, max: 44, temp: 0 },
  hitDice: { total: 5, remaining: 5, die: 'd10' },
  speed: 30,
  deathSaves: { successes: 0, failures: 0 },
  saveProficiencies: ['STR', 'CON'],
  skills: [
    { skill: 'Athletics', level: 'proficient' },
    { skill: 'Perception', level: 'expertise' },
    { skill: 'Survival', level: 'proficient' },
    { skill: 'Intimidation', level: 'proficient' },
    { skill: 'Stealth', level: 'proficient' },
    { skill: 'Insight', level: 'proficient' },
  ],
  passivePerception: 19,
  features: [
    'Fighting Style: Archery (+2 ranged)',
    'Second Wind (1d10+5)',
    'Action Surge (1/rest)',
    'Extra Attack',
    'Gunslinger: Trick Shot',
  ],
  traits: ['The gunslinger walks a lonely road.'],
  bonds: ['The Dark Tower must be reached.'],
  flaws: ['Will sacrifice anything for the Tower.'],
  isCompanion: false,
};

export function TitleScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const setCampaign = useGameStore((s) => s.setCampaign);
  const setMode = useGameStore((s) => s.setMode);
  const setCharacters = usePartyStore((s) => s.setCharacters);
  const setActiveCharacter = usePartyStore((s) => s.setActiveCharacter);
  const addEntry = useNarrativeStore((s) => s.addEntry);
  const setSuggestions = useNarrativeStore((s) => s.setSuggestions);

  const OPENING_SUGGESTIONS: Suggestion[] = [
    { text: 'Investigate the glinting metal', rollRequired: 'Perception DC 12', dc: 12 },
    { text: 'Scan the horizon for threats', rollRequired: 'Perception DC 13', dc: 13 },
    { text: 'Press on toward the mountains' },
    { text: 'Check your supplies', rollRequired: 'Survival DC 10', dc: 10 },
  ];

  const handleNewCampaign = async () => {
    setIsLoading(true);
    try {
      const campaign = await api.createCampaign('The Dark Tower', 'Mid-World');
      setCampaign(campaign);
      setCharacters([SAMPLE_CHARACTER]);
      setActiveCharacter(SAMPLE_CHARACTER.id);
      setMode('exploration');

      addEntry(createNarrativeEntry('system', '--- SESSION START ---'));
      addEntry(createNarrativeEntry('narrative',
        'The desert stretched before you, endless and cruel. Somewhere ahead, the Man in Black fled. Behind you, the memory of Tull burned like a brand.\n\n' +
        'Your canteen was half-empty. The sun pressed down like a physical weight. The mountains shimmered on the horizon, impossibly distant.\n\n' +
        'A hawk circled overhead, riding the thermals. Below it, something glinted in the sand — metal, catching the light. A hundred yards off the trail.',
      ));
      setSuggestions(OPENING_SUGGESTIONS);
    } catch (err) {
      console.error('Failed to create campaign:', err);
      // Fall back to offline mode
      setCampaign({
        id: 'demo',
        name: 'The Dark Tower',
        system: 'D&D 5e',
        setting: 'Mid-World',
        createdAt: new Date().toISOString(),
        sessionCount: 1,
        currentAct: 1,
        currentChapter: 1,
      });
      setCharacters([SAMPLE_CHARACTER]);
      setActiveCharacter(SAMPLE_CHARACTER.id);
      setMode('exploration');

      addEntry(createNarrativeEntry('system', '--- SESSION START (Offline Mode) ---'));
      addEntry(createNarrativeEntry('narrative',
        'The desert stretched before you, endless and cruel. Somewhere ahead, the Man in Black fled. Behind you, the memory of Tull burned like a brand.\n\n' +
        'Your canteen was half-empty. The sun pressed down like a physical weight. The mountains shimmered on the horizon, impossibly distant.\n\n' +
        'A hawk circled overhead, riding the thermals. Below it, something glinted in the sand — metal, catching the light. A hundred yards off the trail.',
      ));
      setSuggestions(OPENING_SUGGESTIONS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = () => {
    setCampaign({
      id: 'demo',
      name: 'Demo Session',
      system: 'D&D 5e',
      setting: 'Forgotten Realms',
      createdAt: new Date().toISOString(),
      sessionCount: 1,
      currentAct: 1,
      currentChapter: 1,
    });
    setCharacters([SAMPLE_CHARACTER]);
    setActiveCharacter(SAMPLE_CHARACTER.id);
    setMode('exploration');

    addEntry(createNarrativeEntry('system', '--- DEMO SESSION ---'));
    addEntry(createNarrativeEntry('narrative',
      'Welcome, adventurer. This is a demo of the AI Dungeon Master Virtual Tabletop.\n\n' +
      'Try typing actions in the text box below. Roll dice with the panel on the right. Explore the character sheet and inventory tabs.\n\n' +
      'The AI narrator is ready. Type an action or click a suggestion to begin.',
    ));
    setSuggestions([
      { text: 'Look around the tavern', rollRequired: 'Perception DC 12', dc: 12 },
      { text: 'Talk to the barkeep' },
      { text: 'Check the notice board', rollRequired: 'Investigation DC 10', dc: 10 },
      { text: 'Draw your weapon' },
    ]);
  };

  return (
    <div className="title-screen">
      <div className="title-screen__content">
        <h1 className="title-screen__title">
          <span className="title-screen__title-line">AI DUNGEON</span>
          <span className="title-screen__title-line title-screen__title-line--accent">MASTER</span>
        </h1>
        <div className="title-screen__subtitle">Virtual Tabletop</div>

        <div className="title-screen__version">v0.1.0</div>

        <div className="title-screen__menu">
          <button
            className="retro-btn retro-btn--primary title-screen__btn"
            onClick={handleNewCampaign}
            disabled={isLoading}
          >
            {isLoading ? 'CREATING...' : 'NEW CAMPAIGN'}
          </button>
          <button
            className="retro-btn title-screen__btn"
            onClick={handleDemo}
          >
            DEMO SESSION
          </button>
          <button className="retro-btn title-screen__btn" disabled>
            LOAD CAMPAIGN
          </button>
        </div>

        <div className="title-screen__hint">
          Press START to begin your adventure
        </div>
      </div>
    </div>
  );
}
