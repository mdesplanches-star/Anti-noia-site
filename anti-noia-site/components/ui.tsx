import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="section-title">
      <h3>{title}</h3>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  );
}

export function Pill({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'good' | 'warn' }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-shell" aria-hidden="true">
      <div className="progress-bar" style={{ width: `${value}%` }} />
    </div>
  );
}
