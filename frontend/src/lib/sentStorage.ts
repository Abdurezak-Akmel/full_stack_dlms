import type { Document } from '@/types/dlms';

const STORAGE_KEY = 'dlms.sentItems';

export function getStoredSentItems(): Document[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed as Document[];
  } catch {
    return [];
  }
}

export function setStoredSentItems(items: Document[]) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage failures
  }
}

export function addStoredSentItem(item: Document) {
  const existing = getStoredSentItems();
  setStoredSentItems([item, ...existing]);
}
