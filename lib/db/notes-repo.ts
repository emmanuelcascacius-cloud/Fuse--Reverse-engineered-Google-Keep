import { db, FuseDatabase, type LocalNote, type SyncOutboxItem } from './indexeddb';
import type { NoteColorId } from '@/lib/constants/colors';

export interface CreateNoteInput {
  id?: string;
  body: string;
  is_checklist?: boolean;
  checklist_items?: LocalNote['checklist_items'];
  color?: NoteColorId;
  source_url?: string | null;
  source_domain?: string | null;
  url_match_scope?: 'domain' | 'exact_url' | 'disabled';
  is_pinned?: boolean;
  is_archived?: boolean;
  is_trashed?: boolean;
  position?: number;
  labels?: string[];
}

export interface UpdateNoteInput {
  body?: string;
  is_checklist?: boolean;
  checklist_items?: LocalNote['checklist_items'];
  color?: NoteColorId;
  source_url?: string | null;
  source_domain?: string | null;
  url_match_scope?: 'domain' | 'exact_url' | 'disabled';
  is_pinned?: boolean;
  is_archived?: boolean;
  is_trashed?: boolean;
  position?: number;
  trashed_at?: string | null;
  deleted_at?: string | null;
  labels?: string[];
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class NotesRepository {
  private database: FuseDatabase;

  constructor(database: FuseDatabase = db) {
    this.database = database;
  }

  async createNoteLocal(input: CreateNoteInput): Promise<LocalNote> {
    const now = new Date().toISOString();
    const noteId = input.id || generateUUID();

    const newNote: LocalNote = {
      id: noteId,
      body: input.body ?? '',
      is_checklist: input.is_checklist ?? false,
      checklist_items: input.checklist_items ?? [],
      color: input.color ?? 'chalk',
      source_url: input.source_url ?? null,
      source_domain: input.source_domain ?? null,
      url_match_scope: input.url_match_scope ?? 'domain',
      is_pinned: input.is_pinned ?? false,
      is_archived: input.is_archived ?? false,
      is_trashed: input.is_trashed ?? false,
      position: input.position ?? Date.now(),
      created_at: now,
      updated_at: now,
      deleted_at: null,
      labels: input.labels ?? [],
    };

    const outboxItem: SyncOutboxItem = {
      entity_type: 'note',
      entity_id: noteId,
      operation: 'CREATE',
      payload: newNote as unknown as Record<string, unknown>,
      created_at: now,
    };

    await this.database.transaction('rw', this.database.notes, this.database.sync_outbox, async () => {
      await this.database.notes.put(newNote);
      await this.database.sync_outbox.add(outboxItem);
    });

    return newNote;
  }

  async updateNoteLocal(id: string, patch: UpdateNoteInput): Promise<LocalNote | null> {
    const existing = await this.database.notes.get(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updatedNote: LocalNote = {
      ...existing,
      ...patch,
      updated_at: now,
    };

    const outboxItem: SyncOutboxItem = {
      entity_type: 'note',
      entity_id: id,
      operation: 'UPDATE',
      payload: updatedNote as unknown as Record<string, unknown>,
      created_at: now,
    };

    await this.database.transaction('rw', this.database.notes, this.database.sync_outbox, async () => {
      await this.database.notes.put(updatedNote);
      await this.database.sync_outbox.add(outboxItem);
    });

    return updatedNote;
  }

  async trashNoteLocal(id: string): Promise<LocalNote | null> {
    return this.updateNoteLocal(id, {
      is_trashed: true,
      trashed_at: new Date().toISOString(),
    });
  }

  async restoreNoteLocal(id: string): Promise<LocalNote | null> {
    return this.updateNoteLocal(id, {
      is_trashed: false,
      trashed_at: null,
    });
  }

  async archiveNoteLocal(id: string, is_archived = true): Promise<LocalNote | null> {
    return this.updateNoteLocal(id, { is_archived });
  }

  async pinNoteLocal(id: string, is_pinned = true): Promise<LocalNote | null> {
    return this.updateNoteLocal(id, { is_pinned });
  }

  async softDeleteNoteLocal(id: string): Promise<LocalNote | null> {
    const now = new Date().toISOString();
    return this.updateNoteLocal(id, {
      deleted_at: now,
    });
  }

  async getNoteById(id: string): Promise<LocalNote | undefined> {
    return this.database.notes.get(id);
  }

  async getAllActiveNotes(): Promise<LocalNote[]> {
    const all = await this.database.notes.toArray();
    return all.filter((n) => !n.is_archived && !n.is_trashed && !n.deleted_at);
  }

  async getArchivedNotes(): Promise<LocalNote[]> {
    const all = await this.database.notes.toArray();
    return all.filter((n) => n.is_archived && !n.is_trashed && !n.deleted_at);
  }

  async getTrashedNotes(): Promise<LocalNote[]> {
    const all = await this.database.notes.toArray();
    return all.filter((n) => n.is_trashed && !n.deleted_at);
  }

  async getNotesByDomain(domain: string): Promise<LocalNote[]> {
    const normalized = domain.toLowerCase().trim();
    const all = await this.database.notes.toArray();
    return all.filter(
      (n) =>
        !n.is_archived &&
        !n.is_trashed &&
        !n.deleted_at &&
        n.source_domain?.toLowerCase() === normalized
    );
  }

  async getSyncOutbox(): Promise<SyncOutboxItem[]> {
    return this.database.sync_outbox.orderBy('id').toArray();
  }

  async clearSyncOutboxUpto(id: number): Promise<void> {
    await this.database.sync_outbox.where('id').belowOrEqual(id).delete();
  }
}

export const notesRepo = new NotesRepository();

