import { useGameStore } from './stores/gameStore';
import { TitleScreen } from './components/layout/TitleScreen';
import { GameScreen } from './components/layout/GameScreen';

export function App() {
  const mode = useGameStore((s) => s.mode);

  if (mode === 'menu') {
    return <TitleScreen />;
  }

  return <GameScreen />;
}
