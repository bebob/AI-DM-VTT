import './HpBar.css';

interface HpBarProps {
  current: number;
  max: number;
  temp?: number;
}

export function HpBar({ current, max, temp = 0 }: HpBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const hpColor = pct > 50 ? 'var(--color-hp-full)' : pct > 25 ? 'var(--color-hp-mid)' : 'var(--color-hp-low)';

  return (
    <div className="hp-bar">
      <div className="hp-bar__label">
        <span className="stat-label">HP</span>
        <span className="hp-bar__numbers">
          <span style={{ color: hpColor }}>{current}</span>
          <span className="hp-bar__sep">/</span>
          <span>{max}</span>
          {temp > 0 && <span className="hp-bar__temp">+{temp}</span>}
        </span>
      </div>
      <div className="hp-bar__track">
        <div
          className="hp-bar__fill"
          style={{ width: `${pct}%`, backgroundColor: hpColor }}
        />
        {temp > 0 && (
          <div
            className="hp-bar__temp-fill"
            style={{ width: `${Math.min(100, ((current + temp) / max) * 100) - pct}%` }}
          />
        )}
      </div>
    </div>
  );
}
