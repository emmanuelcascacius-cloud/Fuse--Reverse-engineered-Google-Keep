import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { ShortcutsModal } from '@/components/modal/ShortcutsModal';

describe('Global Keyboard Shortcuts (Issue 10)', () => {
  it('triggers c, /, j, k, e, #, p, ?, and Escape', () => {
    const onFocusCapture = vi.fn();
    const onFocusSearch = vi.fn();
    const onNext = vi.fn();
    const onPrev = vi.fn();
    const onArchive = vi.fn();
    const onTrash = vi.fn();
    const onPin = vi.fn();
    const onShortcuts = vi.fn();
    const onClear = vi.fn();

    renderHook(() =>
      useGlobalShortcuts({
        notes: [],
        selectedIds: ['note-1', 'note-2'],
        focusedId: null,
        onFocusQuickCapture: onFocusCapture,
        onFocusSearch: onFocusSearch,
        onFocusNext: onNext,
        onFocusPrev: onPrev,
        onArchive: onArchive,
        onTrash: onTrash,
        onTogglePin: onPin,
        onToggleShortcutsModal: onShortcuts,
        onClearSelection: onClear,
      })
    );

    fireEvent.keyDown(window, { key: 'c' });
    expect(onFocusCapture).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: '/' });
    expect(onFocusSearch).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'j' });
    expect(onNext).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'k' });
    expect(onPrev).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'e' });
    expect(onArchive).toHaveBeenCalledWith(['note-1', 'note-2']);

    fireEvent.keyDown(window, { key: '#' });
    expect(onTrash).toHaveBeenCalledWith(['note-1', 'note-2']);

    fireEvent.keyDown(window, { key: 'p' });
    expect(onPin).toHaveBeenCalledWith(['note-1', 'note-2']);

    fireEvent.keyDown(window, { key: '?' });
    expect(onShortcuts).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClear).toHaveBeenCalled();
  });

  it('renders ShortcutsModal cheatsheet correctly', () => {
    render(<ShortcutsModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Keyboard shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Create a new note')).toBeInTheDocument();
    expect(screen.getByText('Focus global search')).toBeInTheDocument();
  });
});
