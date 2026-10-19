'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNotesStore } from '@/lib/store/useNotesStore';
import { useSelectionStore } from '@/lib/store/useSelectionStore';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { filterNotes } from '@/lib/search/search-engine';
import { QuickCaptureBar } from '@/components/capture/QuickCaptureBar';
import { MasonryGrid } from '@/components/grid/MasonryGrid';
import { NoteModal } from '@/components/modal/NoteModal';
import { SidebarNav, type NavView } from '@/components/sidebar/SidebarNav';
import { BatchActionBar } from '@/components/toolbar/BatchActionBar';
import { EditLabelsModal } from '@/components/labels/EditLabelsModal';
import { ShortcutsModal } from '@/components/modal/ShortcutsModal';
import type { LocalNote } from '@/lib/db/indexeddb';
import type { NoteColorId } from '@/lib/constants/colors';
import {
  Menu,
  Moon,
  Sun,
  LayoutGrid,
  List,
  Undo2,
} from 'lucide-react';

export default function FuseApp() {
  const { resolvedTheme, toggleTheme } = useTheme();

  // Stores
  const {
    notes,
    archivedNotes,
    trashedNotes,
    fetchNotes,
    createNote,
    updateNote,
    trashNote,
    archiveNote,
    pinNote,
    undoTrash,
    lastDeletedNote,
  } = useNotesStore();

  const {
    selectedIds,
    toggleSelect,
    clearSelection,
    focusedId,
    setFocusedId,
  } = useSelectionStore();

  // Navigation & View State
  const [currentView, setCurrentView] = useState<NavView>('notes');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isListView, setIsListView] = useState(false);

  // Modals state
  const [modalNote, setModalNote] = useState<LocalNote | null>(null);
  const [isEditLabelsOpen, setIsEditLabelsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [labels, setLabels] = useState<string[]>([
    'work',
    'projects',
    'urgent',
    'reading',
    'ideas',
  ]);

  // Search & Filters state
  const [filters] = useState<{
    query?: string;
    color?: NoteColorId | null;
    label?: string | null;
    domain?: string | null;
    type?: 'checklist' | 'text' | 'url' | null;
  }>({});

  // Initial data load
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Determine active dataset according to current view
  const currentDataset = useMemo(() => {
    if (currentView === 'archive') return archivedNotes;
    if (currentView === 'trash') return trashedNotes;
    return notes;
  }, [currentView, notes, archivedNotes, trashedNotes]);

  // Filter notes by search query, facet filters, or sidebar label
  const displayedNotes = useMemo(() => {
    const mergedFilters = {
      ...filters,
      label: selectedLabel || filters.label,
    };
    return filterNotes(currentDataset, mergedFilters);
  }, [currentDataset, filters, selectedLabel]);

  // Global Keyboard Navigation
  useGlobalShortcuts({
    notes: displayedNotes,
    selectedIds,
    focusedId,
    onFocusQuickCapture: () => {
      const captureInput = document.querySelector('[data-testid="quick-capture-bar"]') as HTMLElement | null;
      captureInput?.click();
    },
    onFocusSearch: () => {
      const searchInput = document.querySelector('[data-testid="search-input"]') as HTMLInputElement | null;
      searchInput?.focus();
    },
    onFocusNext: () => {
      if (displayedNotes.length === 0) return;
      const currentIndex = displayedNotes.findIndex((n) => n.id === focusedId);
      const nextIndex = (currentIndex + 1) % displayedNotes.length;
      setFocusedId(displayedNotes[nextIndex].id);
    },
    onFocusPrev: () => {
      if (displayedNotes.length === 0) return;
      const currentIndex = displayedNotes.findIndex((n) => n.id === focusedId);
      const prevIndex = (currentIndex - 1 + displayedNotes.length) % displayedNotes.length;
      setFocusedId(displayedNotes[prevIndex].id);
    },
    onArchive: async (ids) => {
      for (const id of ids) {
        await archiveNote(id, currentView !== 'archive');
      }
      clearSelection();
    },
    onTrash: async (ids) => {
      for (const id of ids) {
        await trashNote(id);
      }
      clearSelection();
    },
    onTogglePin: async (ids) => {
      for (const id of ids) {
        const n = notes.find((item) => item.id === id);
        if (n) {
          await pinNote(id, !n.is_pinned);
        }
      }
    },
    onToggleShortcutsModal: () => setIsShortcutsOpen((o) => !o),
    onClearSelection: () => clearSelection(),
  });

  // Batch action handlers
  const handleBatchPin = useCallback(async () => {
    for (const id of selectedIds) {
      await pinNote(id, true);
    }
  }, [selectedIds, pinNote]);

  const handleBatchArchive = useCallback(async () => {
    for (const id of selectedIds) {
      await archiveNote(id, true);
    }
    clearSelection();
  }, [selectedIds, archiveNote, clearSelection]);

  const handleBatchDelete = useCallback(async () => {
    for (const id of selectedIds) {
      await trashNote(id);
    }
    clearSelection();
  }, [selectedIds, trashNote, clearSelection]);

  const handleBatchColor = useCallback(async (color: NoteColorId) => {
    for (const id of selectedIds) {
      await updateNote(id, { color });
    }
  }, [selectedIds, updateNote]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-primary antialiased">
      {/* 1. App Header */}
      <header className="h-16 px-4 border-b border-border-hairline flex items-center justify-between sticky top-0 z-30 bg-header backdrop-blur-md">
        {/* Left: Hamburger Menu */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Toggle navigation drawer"
            className="w-10 h-10 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Right: Actions (View Toggle, Theme Toggle) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={isListView ? 'Switch to grid view' : 'Switch to list view'}
            className="w-10 h-10 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
            onClick={() => setIsListView(!isListView)}
          >
            {isListView ? (
              <LayoutGrid className="w-5 h-5 stroke-[1.75]" />
            ) : (
              <List className="w-5 h-5 stroke-[1.75]" />
            )}
          </button>

          <button
            type="button"
            aria-label="Toggle dark mode"
            className="w-10 h-10 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
            onClick={toggleTheme}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-5 h-5 stroke-[1.75]" />
            ) : (
              <Moon className="w-5 h-5 stroke-[1.75]" />
            )}
          </button>
        </div>
      </header>

      {/* 2. Main Body: Sidebar Drawer + Notes Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <SidebarNav
          currentView={currentView}
          selectedLabel={selectedLabel}
          labels={labels}
          isOpen={isSidebarOpen}
          onSelectView={(v) => {
            setCurrentView(v);
            setSelectedLabel(null);
          }}
          onSelectLabel={(lbl) => {
            setCurrentView('notes');
            setSelectedLabel(lbl);
          }}
          onOpenEditLabels={() => setIsEditLabelsOpen(true)}
        />

        {/* Notes Feed Canvas */}
        <main className="flex-1 overflow-y-auto px-4 pb-16">
          {/* Quick Capture Bar (Only shown in active notes view) */}
          {currentView === 'notes' && !selectedLabel && (
            <QuickCaptureBar
              onSaveNote={async (noteData) => {
                await createNote(noteData);
              }}
              availableLabels={labels}
              onCreateLabel={(name) => setLabels((l) => [...l, name])}
            />
          )}

          {/* Active Label or Filter Header */}
          {selectedLabel && (
            <div className="max-w-7xl mx-auto px-6 pt-4 pb-2 text-[14px] text-text-secondary flex items-center gap-2">
              <span>Viewing label:</span>
              <span className="font-semibold text-text-primary">#{selectedLabel}</span>
            </div>
          )}

          {/* Masonry / List Card Grid */}
          <MasonryGrid
            notes={displayedNotes}
            isListView={isListView}
            selectedIds={selectedIds}
            onSelect={(id) => toggleSelect(id)}
            onClickNote={(note) => setModalNote(note)}
            onPin={async (id, pin) => pinNote(id, pin)}
            onArchive={async (id, arc) => archiveNote(id, arc)}
            onTrash={async (id) => trashNote(id)}
            onColorChange={(id) => {
              const allColorIds: NoteColorId[] = [
                'coral', 'storm', 'clay', 'chalk', 'peach', 'sand',
                'mint', 'sage', 'fog', 'dusk', 'blossom', 'earth'
              ];
              const current = notes.find((n) => n.id === id);
              const currentIndex = allColorIds.indexOf(current?.color || 'chalk');
              const next = allColorIds[(currentIndex + 1) % allColorIds.length];
              updateNote(id, { color: next });
            }}
            onToggleChecklistItem={async (noteId, itemId, checked) => {
              const targetNote = notes.find((n) => n.id === noteId);
              if (targetNote && targetNote.checklist_items) {
                const updatedItems = targetNote.checklist_items.map((i) =>
                  i.id === itemId ? { ...i, checked } : i
                );
                await updateNote(noteId, {
                  checklist_items: updatedItems,
                  body: updatedItems.map((i) => i.text).join('\n'),
                });
              }
            }}
          />
        </main>
      </div>

      {/* 3. Floating Batch Action Bar */}
      <BatchActionBar
        selectedCount={selectedIds.length}
        onClearSelection={clearSelection}
        onBatchPin={handleBatchPin}
        onBatchArchive={handleBatchArchive}
        onBatchDelete={handleBatchDelete}
        onBatchColorChange={handleBatchColor}
      />

      {/* 4. Expanded Note Modal */}
      <NoteModal
        note={modalNote}
        isOpen={Boolean(modalNote)}
        onClose={() => setModalNote(null)}
        onSave={async (id, patch) => {
          await updateNote(id, patch);
        }}
        onTrash={async (id) => {
          await trashNote(id);
        }}
        availableLabels={labels}
        onCreateLabel={(name) => setLabels((l) => [...l, name])}
      />

      {/* 5. Edit Labels Modal */}
      <EditLabelsModal
        isOpen={isEditLabelsOpen}
        onClose={() => setIsEditLabelsOpen(false)}
        labels={labels}
        onCreateLabel={(name) => setLabels((l) => [...l, name])}
        onRenameLabel={(old, neu) =>
          setLabels((l) => l.map((item) => (item === old ? neu : item)))
        }
        onDeleteLabel={(name) =>
          setLabels((l) => l.filter((item) => item !== name))
        }
      />

      {/* 6. Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* 7. 5-Second Undo Toastbar */}
      {lastDeletedNote && (
        <div
          data-testid="undo-toast"
          className="fixed bottom-4 left-6 z-50 px-4 py-2.5 rounded-[6px] bg-[#202124] text-white text-[14px] flex items-center gap-4 shadow-xl border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-140 select-none"
        >
          <span>Note moved to trash</span>
          <button
            type="button"
            className="text-[#8AB4F8] hover:text-white font-medium flex items-center gap-1 cursor-pointer"
            onClick={undoTrash}
          >
            <Undo2 className="w-3.5 h-3.5" /> Undo
          </button>
        </div>
      )}
    </div>
  );
}
