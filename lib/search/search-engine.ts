import type { LocalNote } from '@/lib/db/indexeddb';
import type { NoteColorId } from '@/lib/constants/colors';

export interface SearchFilters {
  query?: string;
  color?: NoteColorId | null;
  label?: string | null;
  domain?: string | null;
  type?: 'checklist' | 'text' | 'url' | null;
}

export function filterNotes(notes: LocalNote[], filters: SearchFilters): LocalNote[] {
  const query = filters.query?.toLowerCase().trim() || '';

  return notes.filter((note) => {
    // 1. Color filter
    if (filters.color && note.color !== filters.color) {
      return false;
    }

    // 2. Label filter
    if (filters.label && (!note.labels || !note.labels.includes(filters.label))) {
      return false;
    }

    // 3. Domain filter
    if (filters.domain && note.source_domain?.toLowerCase() !== filters.domain.toLowerCase()) {
      return false;
    }

    // 4. Type filter
    if (filters.type === 'checklist' && !note.is_checklist) {
      return false;
    }
    if (filters.type === 'text' && note.is_checklist) {
      return false;
    }
    if (filters.type === 'url' && !note.source_url && !note.source_domain) {
      return false;
    }

    // 5. Query matching across body, checklists, labels, source_domain
    if (!query) return true;

    const bodyMatch = note.body?.toLowerCase().includes(query);
    const checklistMatch = note.checklist_items?.some((i) =>
      i.text.toLowerCase().includes(query)
    );
    const labelMatch = note.labels?.some((l) => l.toLowerCase().includes(query));
    const domainMatch = note.source_domain?.toLowerCase().includes(query);
    const urlMatch = note.source_url?.toLowerCase().includes(query);

    return Boolean(bodyMatch || checklistMatch || labelMatch || domainMatch || urlMatch);
  });
}

export interface HighlightSegment {
  text: string;
  isMatch: boolean;
}

export function highlightText(text: string, query: string): HighlightSegment[] {
  if (!text || !query.trim()) {
    return [{ text: text || '', isMatch: false }];
  }

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return parts
    .filter((p) => p.length > 0)
    .map((part) => ({
      text: part,
      isMatch: part.toLowerCase() === query.trim().toLowerCase(),
    }));
}

