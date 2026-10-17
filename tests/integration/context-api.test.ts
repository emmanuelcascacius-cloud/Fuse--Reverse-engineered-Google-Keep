import { describe, it, expect } from 'vitest';
import { ServerSyncStore } from '@/lib/sync/sync-engine';
import type { LocalNote } from '@/lib/db/indexeddb';

describe('Domain Context API & Priority Sorting (Issue 12)', () => {
  it('queries matching domain notes and strictly sorts Red (coral) first, Blue (storm) second, Black (clay) third', () => {
    const store = new ServerSyncStore();

    const notes: LocalNote[] = [
      {
        id: 'note-chalk',
        body: 'Default white note on github',
        is_checklist: false,
        checklist_items: [],
        color: 'chalk',
        source_domain: 'github.com',
        url_match_scope: 'domain',
        is_pinned: false,
        is_archived: false,
        is_trashed: false,
        position: 1,
        created_at: new Date('2026-01-01T10:00:00Z').toISOString(),
        updated_at: new Date('2026-01-01T10:00:00Z').toISOString(),
      },
      {
        id: 'note-coral',
        body: 'Urgent red bug on github',
        is_checklist: false,
        checklist_items: [],
        color: 'coral', // Priority 1
        source_domain: 'github.com',
        url_match_scope: 'domain',
        is_pinned: false,
        is_archived: false,
        is_trashed: false,
        position: 2,
        created_at: new Date('2026-01-01T10:01:00Z').toISOString(),
        updated_at: new Date('2026-01-01T10:01:00Z').toISOString(),
      },
      {
        id: 'note-clay',
        body: 'Neutral black log on github',
        is_checklist: false,
        checklist_items: [],
        color: 'clay', // Priority 3
        source_domain: 'github.com',
        url_match_scope: 'domain',
        is_pinned: false,
        is_archived: false,
        is_trashed: false,
        position: 3,
        created_at: new Date('2026-01-01T10:02:00Z').toISOString(),
        updated_at: new Date('2026-01-01T10:02:00Z').toISOString(),
      },
      {
        id: 'note-storm',
        body: 'Active blue research on github',
        is_checklist: false,
        checklist_items: [],
        color: 'storm', // Priority 2
        source_domain: 'github.com',
        url_match_scope: 'domain',
        is_pinned: false,
        is_archived: false,
        is_trashed: false,
        position: 4,
        created_at: new Date('2026-01-01T10:03:00Z').toISOString(),
        updated_at: new Date('2026-01-01T10:03:00Z').toISOString(),
      },
      {
        id: 'note-other-domain',
        body: 'Note on linear.app',
        is_checklist: false,
        checklist_items: [],
        color: 'coral',
        source_domain: 'linear.app',
        url_match_scope: 'domain',
        is_pinned: false,
        is_archived: false,
        is_trashed: false,
        position: 5,
        created_at: new Date('2026-01-01T10:04:00Z').toISOString(),
        updated_at: new Date('2026-01-01T10:04:00Z').toISOString(),
      },
    ];

    store.applyClientMutations(
      notes.map((n) => ({
        entity_type: 'note',
        entity_id: n.id,
        operation: 'CREATE',
        payload: n as unknown as Record<string, unknown>,
        created_at: n.created_at,
      }))
    );

    const contextNotes = store.getContextNotes('github.com');

    // Only github.com notes should match
    expect(contextNotes).toHaveLength(4);
    expect(contextNotes.find((n) => n.id === 'note-other-domain')).toBeUndefined();

    // Verify ordering: Coral (1) -> Storm (2) -> Clay (3) -> Chalk (4)
    expect(contextNotes[0].id).toBe('note-coral');
    expect(contextNotes[1].id).toBe('note-storm');
    expect(contextNotes[2].id).toBe('note-clay');
    expect(contextNotes[3].id).toBe('note-chalk');
  });

  it('excludes archived, trashed, or soft-deleted notes from context response', () => {
    const store = new ServerSyncStore();

    const trashedNote: LocalNote = {
      id: 'trashed-1',
      body: 'Trashed github note',
      is_checklist: false,
      checklist_items: [],
      color: 'coral',
      source_domain: 'github.com',
      url_match_scope: 'domain',
      is_pinned: false,
      is_archived: false,
      is_trashed: true,
      position: 1,
      created_at: '',
      updated_at: '',
    };

    store.applyClientMutations([
      {
        entity_type: 'note',
        entity_id: 'trashed-1',
        operation: 'CREATE',
        payload: trashedNote as unknown as Record<string, unknown>,
        created_at: '',
      },
    ]);

    const context = store.getContextNotes('github.com');
    expect(context).toHaveLength(0);
  });
});

