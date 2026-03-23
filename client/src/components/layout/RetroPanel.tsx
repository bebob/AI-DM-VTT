import type { ReactNode } from 'react';

interface RetroPanelProps {
  title?: string;
  highlight?: boolean;
  className?: string;
  children: ReactNode;
}

export function RetroPanel({ title, highlight, className = '', children }: RetroPanelProps) {
  return (
    <div className={`retro-panel ${highlight ? 'retro-panel--highlight' : ''} ${className}`}>
      {title && <div className="retro-panel__header">{title}</div>}
      {children}
    </div>
  );
}
