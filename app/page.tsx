'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNotesStore } from '@/lib/store/useNotesStore';
import { useSelectionStore } from '@/lib/store/useSelectionStore';
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
  LayoutGrid,
  List,
  Undo2,
  Search,
  RotateCw,
  Settings,
  X,
} from 'lucide-react';

export default function FuseApp() {
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

  // Navigation & View State (Sidebar defaults to collapsed hoverable rail like Google Keep)
  const [currentView, setCurrentView] = useState<NavView>('notes');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  // Search & Refresh state
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [filters] = useState<{
    query?: string;
    color?: NoteColorId | null;
    label?: string | null;
    domain?: string | null;
    type?: 'checklist' | 'text' | 'url' | null;
  }>({});

  // Winding refresh action (like Google Keep loading animation on session/nav)
  const triggerRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchNotes();
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 650);
    }
  }, [fetchNotes]);

  // Auto-refresh when opening new session, changing view, or switching labels
  useEffect(() => {
    triggerRefresh();
  }, [currentView, selectedLabel, triggerRefresh]);

  // Auto-sync any labels from existing notes into the sidebar labels list
  useEffect(() => {
    const allNotes = [...notes, ...archivedNotes, ...trashedNotes];
    const noteLabels = new Set<string>();
    for (const n of allNotes) {
      if (n.labels && Array.isArray(n.labels)) {
        for (const l of n.labels) {
          const trimmed = l.trim();
          if (trimmed) noteLabels.add(trimmed);
        }
      }
    }
    if (noteLabels.size > 0) {
      setLabels((prev) => {
        const combined = new Set(prev);
        let added = false;
        noteLabels.forEach((lbl) => {
          if (!combined.has(lbl)) {
            combined.add(lbl);
            added = true;
          }
        });
        return added ? Array.from(combined) : prev;
      });
    }
  }, [notes, archivedNotes, trashedNotes]);

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
      query: searchQuery.trim() || undefined,
      label: selectedLabel || filters.label,
    };
    return filterNotes(currentDataset, mergedFilters);
  }, [currentDataset, filters, searchQuery, selectedLabel]);

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
      <header className="h-14 sm:h-16 px-2 sm:px-4 border-b border-border-hairline flex items-center justify-between sticky top-0 z-30 bg-header backdrop-blur-md gap-2 sm:gap-4">
        {/* Left: Hamburger Menu + Brand "Fuse" (No logo, clean Inter/sans font) */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            type="button"
            aria-label="Toggle navigation drawer"
            className="w-10 h-10 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="w-5 h-5 stroke-[2]" />
          </button>
          <span className="text-[20px] sm:text-[22px] font-sans font-medium text-text-primary tracking-tight select-none pl-1">
            Fuse
          </span>
        </div>

        {/* Center: Search Bar (Google Keep style) */}
        <div className="flex-1 max-w-[720px] mx-1 sm:mx-4 min-w-0">
          <div className="w-full h-10 sm:h-12 bg-[#F1F3F4] rounded-[8px] flex items-center px-3 sm:px-4 transition-all focus-within:bg-white focus-within:shadow-[0_1px_1px_0_rgba(65,69,73,0.3),0_1px_3px_1px_rgba(65,69,73,0.15)] border border-transparent">
            <Search className="w-5 h-5 text-[#5f6368] flex-shrink-0" />
            <input
              type="text"
              data-testid="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent border-none text-[16px] text-text-primary placeholder:text-[#5f6368] focus:outline-none ml-2.5 sm:ml-3"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#5f6368] hover:text-text-primary hover:bg-black/5 flex-shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions (Refresh with auto-winding, View Toggle, Settings) */}
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          {/* Refresh button with winding animation */}
          <button
            type="button"
            aria-label="Refresh"
            title="Refresh"
            disabled={isRefreshing}
            className="w-10 h-10 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
            onClick={() => triggerRefresh()}
          >
            <RotateCw
              className={`w-5 h-5 stroke-[1.75] transition-transform ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
          </button>

          {/* Grid / List View Toggle */}
          <button
            type="button"
            aria-label={isListView ? 'Switch to grid view' : 'Switch to list view'}
            title={isListView ? 'Grid view' : 'List view'}
            className="w-10 h-10 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
            onClick={() => setIsListView(!isListView)}
          >
            {isListView ? (
              <LayoutGrid className="w-5 h-5 stroke-[1.75]" />
            ) : (
              <List className="w-5 h-5 stroke-[1.75]" />
            )}
          </button>

          {/* Settings button */}
          <button
            type="button"
            aria-label="Settings"
            title="Settings"
            className="w-10 h-10 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
          >
            <Settings className="w-5 h-5 stroke-[1.75]" />
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
          onCloseMobile={() => setIsSidebarOpen(false)}
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
        <main className="flex-1 overflow-y-auto px-2 sm:px-4 pb-16 flex flex-col">
          {/* Quick Capture Bar (Shown on notes view and on every label view) */}
          {currentView === 'notes' && (
            <QuickCaptureBar
              key={selectedLabel || 'all-notes'}
              defaultLabels={selectedLabel ? [selectedLabel] : []}
              onSaveNote={async (noteData) => {
                const finalLabels =
                  selectedLabel && !noteData.labels.includes(selectedLabel)
                    ? [...noteData.labels, selectedLabel]
                    : noteData.labels;

                await createNote({
                  ...noteData,
                  labels: finalLabels,
                });

                if (finalLabels.length > 0) {
                  setLabels((prev) => {
                    const combined = new Set(prev);
                    finalLabels.forEach((l) => combined.add(l));
                    return Array.from(combined);
                  });
                }
              }}
              availableLabels={labels}
              onCreateLabel={(name) => {
                const trimmed = name.trim();
                if (trimmed) {
                  setLabels((l) => (l.includes(trimmed) ? l : [...l, trimmed]));
                }
              }}
            />
          )}

          {/* Masonry / List Card Grid OR Google Keep Minimal Empty States */}
          {displayedNotes.length > 0 ? (
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
          ) : (
            /* Google Keep Empty States (Centered beneath QuickCaptureBar) */
            <div className="flex-1 flex flex-col items-center justify-center pt-20 pb-16 select-none text-center">
              {searchQuery.trim() ? (
                /* Empty Search Results State */
                <div data-testid="empty-search-state" className="flex flex-col items-center gap-4">
                  <Search className="w-16 h-16 text-[#dadce0] stroke-[1.5]" />
                  <p className="text-[20px] sm:text-[22px] text-[#5f6368] font-normal font-sans">
                    No matching results
                  </p>
                </div>
              ) : currentView === 'notes' && selectedLabel ? (
                /* Empty Label View: "No notes with this label yet" with Google Keep tag icon */
                <div data-testid="empty-label-state" className="flex flex-col items-center gap-6">
                  <svg
                    className="w-28 h-20 text-[#c8c8c8]"
                    viewBox="0 0 160 110"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M32 24H94L136 55L94 86H32C25.3726 86 20 80.6274 20 74V36C20 29.3726 25.3726 24 32 24Z"
                      stroke="currentColor"
                      strokeWidth="11"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-[20px] sm:text-[22px] text-[#5f6368] font-normal font-sans">
                    No notes with this label yet
                  </p>
                </div>
              ) : currentView === 'notes' ? (
                /* Empty Notes View: "Notes you add appear here" with Google Keep lightbulb icon */
                <div data-testid="empty-notes-state" className="flex flex-col items-center gap-6">
                  <svg
                    className="w-24 h-32 text-[#dadce0]"
                    viewBox="0 0 120 150"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M38 92V80C26.9543 72.8249 20 60.8354 20 48C20 25.9086 37.9086 8 60 8C82.0914 8 100 25.9086 100 48C100 60.8354 93.0457 72.8249 82 80V92"
                      stroke="currentColor"
                      strokeWidth="11"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M44 114H76"
                      stroke="currentColor"
                      strokeWidth="11"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p className="text-[20px] sm:text-[22px] text-[#5f6368] font-normal font-sans">
                    Notes you add appear here
                  </p>
                </div>
              ) : currentView === 'archive' ? (
                /* Empty Archive View */
                <div data-testid="empty-archive-state" className="flex flex-col items-center gap-6">
                  <svg
                    className="w-24 h-24 text-[#dadce0]"
                    viewBox="0 0 120 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="16"
                      y="24"
                      width="88"
                      height="24"
                      rx="6"
                      stroke="currentColor"
                      strokeWidth="10"
                    />
                    <path
                      d="M26 48V88C26 94.6274 31.3726 100 38 100H82C88.6274 100 94 94.6274 94 88V48"
                      stroke="currentColor"
                      strokeWidth="10"
                    />
                    <path
                      d="M48 64H72"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p className="text-[20px] sm:text-[22px] text-[#5f6368] font-normal font-sans">
                    Your archived notes appear here
                  </p>
                </div>
              ) : (
                /* Empty Trash View */
                <div data-testid="empty-trash-state" className="flex flex-col items-center gap-6">
                  <svg
                    className="w-24 h-28 text-[#dadce0]"
                    viewBox="0 0 120 130"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 36H98"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                    <path
                      d="M44 36V22C44 18.6863 46.6863 16 50 16H70C73.3137 16 76 18.6863 76 22V36"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M30 36L38 106C38.5 112 43.5 116 49.5 116H70.5C76.5 116 81.5 112 82 106L90 36"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-[20px] sm:text-[22px] text-[#5f6368] font-normal font-sans">
                    No notes in Trash
                  </p>
                </div>
              )}
            </div>
          )}
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
          if (patch.labels && patch.labels.length > 0) {
            setLabels((prev) => {
              const combined = new Set(prev);
              patch.labels!.forEach((l) => combined.add(l));
              return Array.from(combined);
            });
          }
        }}
        onTrash={async (id) => {
          await trashNote(id);
        }}
        availableLabels={labels}
        onCreateLabel={(name) => {
          const trimmed = name.trim();
          if (trimmed) {
            setLabels((l) => (l.includes(trimmed) ? l : [...l, trimmed]));
          }
        }}
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
          className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-6 sm:translate-x-0 w-[calc(100%-32px)] max-w-sm sm:max-w-md z-50 px-4 py-2.5 rounded-[6px] bg-[#202124] text-white text-[14px] flex items-center justify-between shadow-xl border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-140 select-none"
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
