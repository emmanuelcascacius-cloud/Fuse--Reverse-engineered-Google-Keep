import { describe, it, expect } from 'vitest';
import { ServerSyncStore } from '@/lib/sync/sync-engine';
import type { LocalNote } from '@/lib/db/indexeddb';

describe('Backend Delta Sync & LWW Resolution (Issue 12)', () => {
  it('applies client mutations and resolves conflicts using Last-Write-Wins', () => {
    const store = new ServerSyncStore();

    const olderTime = new Date('2026-01-01T10:00:00Z').toISOString();
    const newerTime = new Date('2026-01-01T10:05:00Z').toISOString();
    const newestTime = new Date('2026-01-01T10:10:00Z').toISOString();

    const initialNote: LocalNote = {
      id: 'conflict-note-1',
      body: 'Server version (10:05)',
      is_checklist: false,
      checklist_items: [],
      color: 'chalk',
      url_match_scope: 'domain',
      is_pinned: false,
      is_archived: false,
      is_trashed: false,
      position: 1,
      created_at: olderTime,
      updated_at: newerTime,
    };

    store.applyClientMutations([
      {
        entity_type: 'note',
        entity_id: 'conflict-note-1',
        operation: 'CREATE',
        payload: initialNote as unknown as Record<string, unknown>,
        created_at: newerTime,
      },
    ]);

    // 1. Stale client mutation with older updated_at (10:00) should LOSE
    const staleNote: LocalNote = {
      ...initialNote,
      body: 'Stale client edit (10:00)',
      updated_at: olderTime,
    };
    store.applyClientMutations([
      {
        entity_type: 'note',
        entity_id: 'conflict-note-1',
        operation: 'UPDATE',
        payload: staleNote as unknown as Record<string, unknown>,
        created_at: olderTime,
      },
    ]);

    let current = store.getAllNotes().find((n) => n.id === 'conflict-note-1');
    expect(current?.body).toBe('Server version (10:05)');

    // 2. Fresh client mutation with newer updated_at (10:10) should WIN
    const freshNote: LocalNote = {
      ...initialNote,
      body: 'Fresh client edit (10:10)',
      updated_at: newestTime,
    };
    store.applyClientMutations([
      {
        entity_type: 'note',
        entity_id: 'conflict-note-1',
        operation: 'UPDATE',
        payload: freshNote as unknown as Record<string, unknown>,
        created_at: newestTime,
      },
    ]);

    current = store.getAllNotes().find((n) => n.id === 'conflict-note-1');
    expect(current?.body).toBe('Fresh client edit (10:10)');
  });

  it('pulls server deltas strictly updated after last_synced_at', () => {
    const store = new ServerSyncStore();

    const t1 = new Date('2026-01-01T12:00:00Z').toISOString();
    const t2 = new Date('2026-01-01T12:30:00Z').toISOString();

    const note1: LocalNote = {
      id: 'note-1',
      body: 'Old note',
      is_checklist: false,
      checklist_items: [],
      color: 'chalk',
      url_match_scope: 'domain',
      is_pinned: false,
      is_archived: false,
      is_trashed: false,
      position: 1,
      created_at: t1,
      updated_at: t1,
    };

    const note2: LocalNote = {
      id: 'note-2',
      body: 'New note',
      is_checklist: false,
      checklist_items: [],
      color: 'coral',
      url_match_scope: 'domain',
      is_pinned: false,
      is_archived: false,
      is_trashed: false,
      position: 2,
      created_at: t2,
      updated_at: t2,
    };

    store.applyClientMutations([
      { entity_type: 'note', entity_id: 'note-1', operation: 'CREATE', payload: note1 as unknown as Record<string, unknown>, created_at: t1 },
      { entity_type: 'note', entity_id: 'note-2', operation: 'CREATE', payload: note2 as unknown as Record<string, unknown>, created_at: t2 },
    ]);

    const delta = store.getServerDelta(new Date('2026-01-01T12:15:00Z').toISOString());
    expect(delta).toHaveLength(1);
    expect(delta[0].id).toBe('note-2');
  });
});
