'use client';

import { useEffect } from 'react';
import type { LocalNote } from '@/lib/db/indexeddb';

interface GlobalShortcutsOptions {
  notes: LocalNote[];
  selectedIds: string[];
  focusedId: string | null;
  onFocusNext: () => void;
  onFocusPrev: () => void;
  onFocusQuickCapture: () => void;
  onFocusSearch: () => void;
  onArchive: (ids: string[]) => void;
  onTrash: (ids: string[]) => void;
  onTogglePin: (ids: string[]) => void;
  onToggleShortcutsModal: () => void;
  onClearSelection: () => void;
  enabled?: boolean;
}

export function useGlobalShortcuts({
  selectedIds,
  focusedId,
  onFocusNext,
  onFocusPrev,
  onFocusQuickCapture,
  onFocusSearch,
  onArchive,
  onTrash,
  onTogglePin,
  onToggleShortcutsModal,
  onClearSelection,
  enabled = true,
}: GlobalShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when user is typing in input or textarea
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (isInput) return;

      const targetIds = selectedIds.length > 0 ? selectedIds : focusedId ? [focusedId] : [];

      switch (e.key) {
        case 'c':
          e.preventDefault();
          onFocusQuickCapture();
          break;
        case '/':
          e.preventDefault();
          onFocusSearch();
          break;
        case 'j':
          e.preventDefault();
          onFocusNext();
          break;
        case 'k':
          e.preventDefault();
          onFocusPrev();
          break;
        case 'e':
          if (targetIds.length > 0) {
            e.preventDefault();
            onArchive(targetIds);
          }
          break;
        case '#':
        case 'Delete':
          if (targetIds.length > 0) {
            e.preventDefault();
            onTrash(targetIds);
          }
          break;
        case 'p':
          if (targetIds.length > 0) {
            e.preventDefault();
            onTogglePin(targetIds);
          }
          break;
        case '?':
          e.preventDefault();
          onToggleShortcutsModal();
          break;
        case 'Escape':
          onClearSelection();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    selectedIds,
    focusedId,
    onFocusNext,
    onFocusPrev,
    onFocusQuickCapture,
    onFocusSearch,
    onArchive,
    onTrash,
    onTogglePin,
    onToggleShortcutsModal,
    onClearSelection,
  ]);
}

