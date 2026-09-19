import { Dataset, OutputItem } from '../types';

export interface LocalSessionData {
  dataset: Dataset;
  outputs: OutputItem[];
  syntax: string;
  importedFileName?: string;
  importedFileType?: 'xlsx' | 'xls' | 'csv' | 'tsv' | 'ospss' | 'sample' | 'new';
  savedAt: string;
}

const STORAGE_KEY = 'ospss_active_session_v1';
const DRAFT_KEY = 'ospss_unsaved_draft_v1';

/**
 * Saves the active workspace session explicitly as a saved project in browser storage.
 */
export function saveLocalSession(data: {
  dataset: Dataset;
  outputs: OutputItem[];
  syntax: string;
  importedFileName?: string;
  importedFileType?: 'xlsx' | 'xls' | 'csv' | 'tsv' | 'ospss' | 'sample' | 'new';
}): { success: boolean; error?: string } {
  try {
    const payload: LocalSessionData = {
      ...data,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    // Clear draft once explicitly saved
    localStorage.removeItem(DRAFT_KEY);
    return { success: true };
  } catch (err: any) {
    console.error('Error saving local session:', err);
    return { success: false, error: err.message || 'Storage quota exceeded' };
  }
}

/**
 * Saves a background safety draft (for disaster recovery if tab closes unintentionally)
 */
export function saveRecoveryDraft(data: {
  dataset: Dataset;
  outputs: OutputItem[];
  syntax: string;
  importedFileName?: string;
  importedFileType?: 'xlsx' | 'xls' | 'csv' | 'tsv' | 'ospss' | 'sample' | 'new';
}): void {
  try {
    const payload: LocalSessionData = {
      ...data,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch {
    // Ignore quota errors for background drafts
  }
}

/**
 * Loads the most recent session. Prefers the auto-saved draft (updated every 1.5s)
 * over the manual save, since the draft is always more current.
 */
export function loadLocalSession(): LocalSessionData | null {
  try {
    // Auto-save draft is always more up-to-date than manual save
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      const parsed = JSON.parse(draft);
      // Only use if it has a real dataset (not blank default)
      if (parsed?.dataset?.variables?.length > 0) return parsed;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('Could not parse stored session:', err);
  }
  return null;
}

/**
 * Clears the saved session and draft
 */
export function clearLocalSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DRAFT_KEY);
  } catch (e) {
    console.warn('Error clearing local session:', e);
  }
}
