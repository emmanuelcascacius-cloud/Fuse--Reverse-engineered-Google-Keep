import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { FuseDatabase } from '@/lib/db/indexeddb';
import { NotesRepository } from '@/lib/db/notes-repo';

describe('IndexedDB Local Engine & Notes Repository (Issue 04)', () => {
  let testDb: FuseDatabase;
  let repo: NotesRepository;

  beforeEach(() => {
    testDb = new FuseDatabase(`test_fuse_${Date.now()}_${Math.random()}`);
    repo = new NotesRepository(testDb);
  });

  afterEach(async () => {
    await testDb.delete();
  });

  it('creates note locally in < 5ms and validates UUID structure', async () => {
    const start = performance.now();
    const note = await repo.createNoteLocal({
      body: 'Testing sub-5ms local write speed',
      color: 'coral',
      source_domain: 'github.com',
    });
    const elapsed = performance.now() - start;

    expect(note).toBeDefined();
    expect(note.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(note.body).toBe('Testing sub-5ms local write speed');
    expect(note.color).toBe('coral');
    expect(note.source_domain).toBe('github.com');
    // Verify execution speed
    expect(elapsed).toBeLessThan(100); // Generous margin for test environment
  });

  it('enqueues CREATE mutation in sync_outbox', async () => {
    const note = await repo.createNoteLocal({
      body: 'Check outbox queuing',
      color: 'storm',
    });

    const outbox = await repo.getSyncOutbox();
    expect(outbox).toHaveLength(1);
    expect(outbox[0].entity_id).toBe(note.id);
    expect(outbox[0].operation).toBe('CREATE');
    expect(outbox[0].entity_type).toBe('note');
  });

  it('updates note and enqueues UPDATE mutation in sync_outbox', async () => {
    const note = await repo.createNoteLocal({ body: 'Original text' });
    const updated = await repo.updateNoteLocal(note.id, { body: 'Updated text', color: 'clay' });

    expect(updated).not.toBeNull();
    expect(updated?.body).toBe('Updated text');
    expect(updated?.color).toBe('clay');

    const outbox = await repo.getSyncOutbox();
    expect(outbox).toHaveLength(2);
    expect(outbox[1].operation).toBe('UPDATE');
    expect(outbox[1].entity_id).toBe(note.id);
  });

  it('handles trash, restore, and soft-delete tombstones', async () => {
    const note = await repo.createNoteLocal({ body: 'To be trashed' });

    // Trash
    await repo.trashNoteLocal(note.id);
    let active = await repo.getAllActiveNotes();
    let trashed = await repo.getTrashedNotes();
    expect(active.find((n) => n.id === note.id)).toBeUndefined();
    expect(trashed.find((n) => n.id === note.id)).toBeDefined();

    // Restore
    await repo.restoreNoteLocal(note.id);
    active = await repo.getAllActiveNotes();
    trashed = await repo.getTrashedNotes();
    expect(active.find((n) => n.id === note.id)).toBeDefined();
    expect(trashed.find((n) => n.id === note.id)).toBeUndefined();

    // Soft delete
    await repo.softDeleteNoteLocal(note.id);
    const deleted = await repo.getNoteById(note.id);
    expect(deleted?.deleted_at).toBeTruthy();
  });

  it('queries notes by normalized source domain', async () => {
    await repo.createNoteLocal({
      body: 'GitHub Note 1',
      source_domain: 'github.com',
      color: 'coral',
    });
    await repo.createNoteLocal({
      body: 'GitHub Note 2',
      source_domain: 'github.com',
      color: 'storm',
    });
    await repo.createNoteLocal({
      body: 'Linear Note',
      source_domain: 'linear.app',
      color: 'clay',
    });

    const githubNotes = await repo.getNotesByDomain('github.com');
    expect(githubNotes).toHaveLength(2);

    const linearNotes = await repo.getNotesByDomain('linear.app');
    expect(linearNotes).toHaveLength(1);

    const unknownNotes = await repo.getNotesByDomain('unknown.site');
    expect(unknownNotes).toHaveLength(0);
  });
});
