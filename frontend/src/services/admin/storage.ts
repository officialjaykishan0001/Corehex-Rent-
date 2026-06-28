export function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
}