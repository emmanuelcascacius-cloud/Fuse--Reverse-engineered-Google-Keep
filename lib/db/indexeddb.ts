import Dexie, { type Table } from 'dexie';
import type { ChecklistItem } from './schema';
import type { NoteColorId } from '@/lib/constants/colors';

export interface LocalNote {
  id: string; // Client UUIDv4
  user_id?: string;
  body: string; // Plain text or newline-separated checklist items
  is_checklist: boolean;
  checklist_items: ChecklistItem[];
  color: NoteColorId;
  source_url?: string | null;
  source_domain?: string | null;
  url_match_scope: 'domain' | 'exact_url' | 'disabled';
  is_pinned: boolean;
  is_archived: boolean;
  is_trashed: boolean;
  position: number;
  trashed_at?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null; // Soft-delete tombstone
  labels?: string[]; // Array of label names or IDs
}

export interface LocalLabel {
  id: string;
  user_id?: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type OutboxOperation = 'CREATE' | 'UPDATE' | 'DELETE';

export interface SyncOutboxItem {
  id?: number; // auto-increment
  entity_type: 'note' | 'label';
  entity_id: string;
  operation: OutboxOperation;
  payload: Record<string, unknown>;
  created_at: string;
}

export class FuseDatabase extends Dexie {
  notes!: Table<LocalNote, string>;
  labels!: Table<LocalLabel, string>;
  sync_outbox!: Table<SyncOutboxItem, number>;

  constructor(databaseName = 'fuse_local_db') {
    super(databaseName);
    this.version(1).stores({
      notes: 'id, source_domain, source_url, color, is_pinned, is_archived, is_trashed, updated_at, deleted_at',
      labels: 'id, name, updated_at, deleted_at',
      sync_outbox: '++id, entity_type, entity_id, operation, created_at',
    });
  }
}

export const db = new FuseDatabase();
