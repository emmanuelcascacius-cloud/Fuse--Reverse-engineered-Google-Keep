import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { FuseDatabase } from '@/lib/db/indexeddb';
import { NotesRepository } from '@/lib/db/notes-repo';

describe('Sync Outbox Queue Engine (Issue 04)', () => {
  let testDb: FuseDatabase;
  let repo: NotesRepository;

  beforeEach(() => {
    testDb = new FuseDatabase(`test_outbox_${Date.now()}_${Math.random()}`);
    repo = new NotesRepository(testDb);
  });

  afterEach(async () => {
    await testDb.delete();
  });

  it('maintains strict FIFO order in outbox mutations', async () => {
    const note1 = await repo.createNoteLocal({ body: 'First note' });
    const note2 = await repo.createNoteLocal({ body: 'Second note' });
    await repo.updateNoteLocal(note1.id, { body: 'Updated first note' });
    await repo.trashNoteLocal(note2.id);

    const outbox = await repo.getSyncOutbox();
    expect(outbox).toHaveLength(4);

    expect(outbox[0].entity_id).toBe(note1.id);
    expect(outbox[0].operation).toBe('CREATE');

    expect(outbox[1].entity_id).toBe(note2.id);
    expect(outbox[1].operation).toBe('CREATE');

    expect(outbox[2].entity_id).toBe(note1.id);
    expect(outbox[2].operation).toBe('UPDATE');

    expect(outbox[3].entity_id).toBe(note2.id);
    expect(outbox[3].operation).toBe('UPDATE');
  });

  it('clears outbox items up to synced id', async () => {
    await repo.createNoteLocal({ body: 'Note A' });
    await repo.createNoteLocal({ body: 'Note B' });
    await repo.createNoteLocal({ body: 'Note C' });

    let outbox = await repo.getSyncOutbox();
    expect(outbox).toHaveLength(3);

    const secondItemId = outbox[1].id!;
    await repo.clearSyncOutboxUpto(secondItemId);

    outbox = await repo.getSyncOutbox();
    expect(outbox).toHaveLength(1);
    expect((outbox[0].payload as { body: string }).body).toBe('Note C');
  });
});
