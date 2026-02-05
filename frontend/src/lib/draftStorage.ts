import type { DocumentType } from '@/types/dlms';

const STORAGE_KEY = 'dlms.composeDrafts';

export type DraftScope = 'person' | 'department' | 'workspace' | 'organization';

export interface ComposeDraftContentItem {
  id: string;
  title: string;
  type: 'letter' | 'document';
  source: 'archive' | 'inbox' | 'upload';
}

export interface ComposeDraftState {
  currentStep: number;
  scope: DraftScope;
  selectedUser: { id: string; name: string; email?: string; department?: string } | null;
  selectedDepartment: { id: string; name: string } | null;
  selectedWorkspace: { id: string; name: string } | null;
  ccRecipients: { id: string; name: string }[];
  contentSource: 'archive' | 'inbox' | 'upload';
  selectedContentItems: ComposeDraftContentItem[];
  comment: string;
  isSendingForApproval: boolean;
}

export interface ComposeDraftRecord {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  state: ComposeDraftState;
  primaryType?: DocumentType;
}

export function getStoredComposeDrafts(): ComposeDraftRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ComposeDraftRecord[];
  } catch {
    return [];
  }
}

function setStoredComposeDrafts(items: ComposeDraftRecord[]) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage failures
  }
}

export function addStoredComposeDraft(draft: ComposeDraftRecord) {
  const existing = getStoredComposeDrafts();
  setStoredComposeDrafts([draft, ...existing]);
}

export function deleteStoredComposeDraft(id: string) {
  const existing = getStoredComposeDrafts();
  setStoredComposeDrafts(existing.filter((d) => d.id !== id));
}

export function getStoredComposeDraftById(id: string): ComposeDraftRecord | null {
  const existing = getStoredComposeDrafts();
  return existing.find((d) => d.id === id) || null;
}
