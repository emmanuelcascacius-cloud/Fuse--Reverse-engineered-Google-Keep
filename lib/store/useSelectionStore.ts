import { create } from 'zustand';

interface SelectionState {
  selectedIds: string[];
  focusedId: string | null;
  toggleSelect: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  selectAll: (allIds: string[]) => void;
  clearSelection: () => void;
  setFocusedId: (id: string | null) => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedIds: [],
  focusedId: null,

  toggleSelect: (id) => {
    set((state) => {
      const exists = state.selectedIds.includes(id);
      return {
        selectedIds: exists
          ? state.selectedIds.filter((item) => item !== id)
          : [...state.selectedIds, id],
      };
    });
  },

  selectMultiple: (ids) => {
    set({ selectedIds: ids });
  },

  selectAll: (allIds) => {
    set({ selectedIds: allIds });
  },

  clearSelection: () => {
    set({ selectedIds: [], focusedId: null });
  },

  setFocusedId: (id) => {
    set({ focusedId: id });
  },
}));
