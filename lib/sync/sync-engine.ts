import type { LocalNote, SyncOutboxItem } from '@/lib/db/indexeddb';

export interface SyncPushRequest {
  mutations: SyncOutboxItem[];
  last_synced_at?: string | null;
}

export interface SyncResponse {
  appliedCount: number;
  serverMutations: LocalNote[];
  server_synced_at: string;
}

// In-memory or simulated server store for synchronization testing & server route
export class ServerSyncStore {
  private notesStore: Map<string, LocalNote> = new Map();

  constructor(initialNotes: LocalNote[] = []) {
    initialNotes.forEach((n) => this.notesStore.set(n.id, n));
  }

  // Apply mutations using Last-Write-Wins (LWW) resolution
  applyClientMutations(mutations: SyncOutboxItem[]): number {
    let applied = 0;

    for (const mut of mutations) {
      if (mut.entity_type !== 'note') continue;

      const incoming = mut.payload as unknown as LocalNote;
      const existing = this.notesStore.get(mut.entity_id);

      if (!existing) {
        // No conflict, store new note
        this.notesStore.set(mut.entity_id, incoming);
        applied++;
      } else {
        // LWW: compare updated_at
        const incomingTime = new Date(incoming.updated_at || 0).getTime();
        const existingTime = new Date(existing.updated_at || 0).getTime();

        if (incomingTime >= existingTime) {
          this.notesStore.set(mut.entity_id, incoming);
          applied++;
        }
      }
    }

    return applied;
  }

  // Pull server changes updated after last_synced_at
  getServerDelta(lastSyncedAt?: string | null): LocalNote[] {
    const threshold = lastSyncedAt ? new Date(lastSyncedAt).getTime() : 0;
    const result: LocalNote[] = [];

    for (const note of this.notesStore.values()) {
      const noteTime = new Date(note.updated_at).getTime();
      if (noteTime > threshold) {
        result.push(note);
      }
    }

    return result;
  }

  // Get notes for contextual lookup sorted by Priority States: Red (coral), Blue (storm), Black (clay)
  getContextNotes(domain?: string | null): LocalNote[] {
    if (!domain) return [];
    const normalized = domain.toLowerCase().trim();

    const matched = Array.from(this.notesStore.values()).filter(
      (n) =>
        !n.is_archived &&
        !n.is_trashed &&
        !n.deleted_at &&
        n.source_domain?.toLowerCase() === normalized
    );

    // Sort Red (coral) first, then Blue (storm), then Black (clay), then others
    const priorityWeight: Record<string, number> = {
      coral: 1,
      storm: 2,
      clay: 3,
      chalk: 4,
    };

    return matched.sort((a, b) => {
      const weightA = priorityWeight[a.color] || 10;
      const weightB = priorityWeight[b.color] || 10;
      if (weightA !== weightB) {
        return weightA - weightB;
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }

  getAllNotes(): LocalNote[] {
    return Array.from(this.notesStore.values());
  }
}

export const serverStore = new ServerSyncStore();

