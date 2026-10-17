import { describe, it, expect } from 'vitest';
import {
  calculateColumnCount,
  estimateCardHeight,
  binPackCards,
} from '@/hooks/useMasonryColumns';
import type { LocalNote } from '@/lib/db/indexeddb';

describe('Masonry Bin-Packing Layout Algorithm (Issue 06)', () => {
  it('calculates column count based on viewport width', () => {
    // formula: floor((width - sidebar - 48) / (240 + 16))
    // width 1200, sidebar 280 -> available = 872 -> floor(872 / 256) = 3
    expect(calculateColumnCount(1200, 280)).toBe(3);

    // width 600, sidebar 0 -> available = 552 -> floor(552 / 256) = 2
    expect(calculateColumnCount(600, 0)).toBe(2);

    // narrow viewport -> minimum 1 column
    expect(calculateColumnCount(320, 0)).toBe(1);
  });

  it('estimates card heights proportionally to character length', () => {
    const microNote: LocalNote = {
      id: '1',
      body: 'Quick note',
      is_checklist: false,
      checklist_items: [],
      color: 'chalk',
      url_match_scope: 'domain',
      is_pinned: false,
      is_archived: false,
      is_trashed: false,
      position: 1,
      created_at: '',
      updated_at: '',
    };

    const longNote: LocalNote = {
      ...microNote,
      id: '2',
      body: 'Long content '.repeat(20),
    };

    const microHeight = estimateCardHeight(microNote);
    const longHeight = estimateCardHeight(longNote);

    expect(microHeight).toBeGreaterThanOrEqual(60);
    expect(longHeight).toBeGreaterThan(microHeight);
    expect(longHeight).toBeLessThanOrEqual(380);
  });

  it('packs cards into shortest columns using greedy bin packing', () => {
    const notes: LocalNote[] = [
      {
        id: '1',
        body: 'Short',
        is_checklist: false,
        checklist_items: [],
        color: 'coral',
        url_match_scope: 'domain',
        is_pinned: false,
        is_archived: false,
        is_trashed: false,
        position: 1,
        created_at: '',
        updated_at: '',
      },
      {
        id: '2',
        body: 'Very long text '.repeat(15),
        is_checklist: false,
        checklist_items: [],
        color: 'storm',
        url_match_scope: 'domain',
        is_pinned: false,
        is_archived: false,
        is_trashed: false,
        position: 2,
        created_at: '',
        updated_at: '',
      },
      {
        id: '3',
        body: 'Third note',
        is_checklist: false,
        checklist_items: [],
        color: 'clay',
        url_match_scope: 'domain',
        is_pinned: false,
        is_archived: false,
        is_trashed: false,
        position: 3,
        created_at: '',
        updated_at: '',
      },
    ];

    const columns = binPackCards(notes, 2);
    expect(columns).toHaveLength(2);
    // Note 1 goes to col 0, Note 2 goes to col 1. Note 3 goes to the shorter column (col 0).
    expect(columns[0].map((n) => n.id)).toEqual(['1', '3']);
    expect(columns[1].map((n) => n.id)).toEqual(['2']);
  });
});

