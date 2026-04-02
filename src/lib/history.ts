export interface HistoryEntry {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  mode: string;
  time: number;
  fare: number;
  timestamp: number;
}

const STORAGE_KEY = 'city-transit-history';
const MAX_HISTORY = 20;

export function saveToHistory(entry: HistoryEntry): void {
  const history = getHistory();
  // Remove duplicate
  const filtered = history.filter(h => !(h.fromId === entry.fromId && h.toId === entry.toId && h.mode === entry.mode));
  filtered.unshift(entry);
  if (filtered.length > MAX_HISTORY) filtered.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getPreferenceFromHistory(): string {
  const history = getHistory();
  if (history.length < 3) return 'fastest';
  
  const modes = history.slice(0, 10).map(h => h.mode);
  const counts: Record<string, number> = {};
  for (const m of modes) {
    counts[m] = (counts[m] || 0) + 1;
  }
  
  const topMode = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  
  if (topMode === 'walk' || topMode === 'bike') return 'eco';
  if (topMode === 'bus') return 'cheapest';
  if (topMode === 'metro') return 'fastest';
  return 'comfortable';
}
