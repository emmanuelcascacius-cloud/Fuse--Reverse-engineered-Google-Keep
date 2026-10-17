import { create } from 'zustand';
import { notesRepo, type CreateNoteInput, type UpdateNoteInput } from '@/lib/db/notes-repo';
import type { LocalNote } from '@/lib/db/indexeddb';
import type { NoteColorId } from '@/lib/constants/colors';

interface NotesState {
  notes: LocalNote[];
  archivedNotes: LocalNote[];
  trashedNotes: LocalNote[];
  isLoading: boolean;
  activeFilter: {
    label?: string | null;
    color?: NoteColorId | null;
    domain?: string | null;
    searchQuery?: string;
  };
  lastDeletedNote: LocalNote | null; // For 5-second Undo toast

  // Actions
  fetchNotes: () => Promise<void>;
  createNote: (input: CreateNoteInput) => Promise<LocalNote>;
  updateNote: (id: string, patch: UpdateNoteInput) => Promise<LocalNote | null>;
  trashNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  archiveNote: (id: string, is_archived?: boolean) => Promise<void>;
  pinNote: (id: string, is_pinned?: boolean) => Promise<void>;
  changeColor: (id: string, color: NoteColorId) => Promise<void>;
  undoTrash: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setColorFilter: (color: NoteColorId | null) => void;
  setLabelFilter: (label: string | null) => void;
  setDomainFilter: (domain: string | null) => void;
  clearFilters: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  archivedNotes: [],
  trashedNotes: [],
  isLoading: false,
  activeFilter: {},
  lastDeletedNote: null,

  fetchNotes: async () => {
    set({ isLoading: true });
    try {
      const [active, archived, trashed] = await Promise.all([
        notesRepo.getAllActiveNotes(),
        notesRepo.getArchivedNotes(),
        notesRepo.getTrashedNotes(),
      ]);
      set({ notes: active, archivedNotes: archived, trashedNotes: trashed, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createNote: async (input) => {
    const note = await notesRepo.createNoteLocal(input);
    set((state) => ({
      notes: [note, ...state.notes],
    }));
    return note;
  },

  updateNote: async (id, patch) => {
    const updated = await notesRepo.updateNoteLocal(id, patch);
    if (!updated) return null;

    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? updated : n)),
      archivedNotes: state.archivedNotes.map((n) => (n.id === id ? updated : n)),
    }));
    return updated;
  },

  trashNote: async (id) => {
    const existing = get().notes.find((n) => n.id === id);
    await notesRepo.trashNoteLocal(id);
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      archivedNotes: state.archivedNotes.filter((n) => n.id !== id),
      lastDeletedNote: existing ?? null,
    }));
    await get().fetchNotes();
  },

  restoreNote: async (id) => {
    await notesRepo.restoreNoteLocal(id);
    await get().fetchNotes();
  },

  archiveNote: async (id, is_archived = true) => {
    await notesRepo.archiveNoteLocal(id, is_archived);
    await get().fetchNotes();
  },

  pinNote: async (id, is_pinned = true) => {
    await notesRepo.pinNoteLocal(id, is_pinned);
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, is_pinned } : n)),
    }));
  },

  changeColor: async (id, color) => {
    await notesRepo.updateNoteLocal(id, { color });
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, color } : n)),
      archivedNotes: state.archivedNotes.map((n) => (n.id === id ? { ...n, color } : n)),
    }));
  },

  undoTrash: async () => {
    const last = get().lastDeletedNote;
    if (last) {
      await notesRepo.restoreNoteLocal(last.id);
      set({ lastDeletedNote: null });
      await get().fetchNotes();
    }
  },

  setSearchQuery: (query) => {
    set((state) => ({
      activeFilter: { ...state.activeFilter, searchQuery: query },
    }));
  },

  setColorFilter: (color) => {
    set((state) => ({
      activeFilter: { ...state.activeFilter, color },
    }));
  },

  setLabelFilter: (label) => {
    set((state) => ({
      activeFilter: { ...state.activeFilter, label },
    }));
  },

  setDomainFilter: (domain) => {
    set((state) => ({
      activeFilter: { ...state.activeFilter, domain },
    }));
  },

  clearFilters: () => {
    set({ activeFilter: {} });
  },
}));
