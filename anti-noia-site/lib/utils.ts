import type { AppState, Person } from '@/lib/types';

export function money(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function pct(value: number, total: number): number {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

export function getPersonName(id: string, people: Person[]): string {
  return people.find((p) => p.id === id)?.name ?? id;
}

export function saveState(key: string, state: AppState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(state));
}

export function loadState<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
