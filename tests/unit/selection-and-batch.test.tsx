import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BatchActionBar } from '@/components/toolbar/BatchActionBar';
import { useSelectionStore } from '@/lib/store/useSelectionStore';

describe('Multi-Select Batch Actions (Issue 10)', () => {
  it('manages selection store accurately', () => {
    const store = useSelectionStore.getState();
    store.clearSelection();

    store.toggleSelect('note-1');
    expect(useSelectionStore.getState().selectedIds).toContain('note-1');

    store.toggleSelect('note-2');
    expect(useSelectionStore.getState().selectedIds).toEqual(['note-1', 'note-2']);

    store.toggleSelect('note-1');
    expect(useSelectionStore.getState().selectedIds).toEqual(['note-2']);

    store.clearSelection();
    expect(useSelectionStore.getState().selectedIds).toEqual([]);
  });

  it('renders BatchActionBar with selection count and fires batch callbacks', () => {
    const onClear = vi.fn();
    const onPin = vi.fn();
    const onArchive = vi.fn();
    const onDelete = vi.fn();
    const onColor = vi.fn();

    render(
      <BatchActionBar
        selectedCount={3}
        onClearSelection={onClear}
        onBatchPin={onPin}
        onBatchArchive={onArchive}
        onBatchDelete={onDelete}
        onBatchColorChange={onColor}
      />
    );

    expect(screen.getByText('3 selected')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Batch pin'));
    expect(onPin).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Batch archive'));
    expect(onArchive).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Batch delete'));
    expect(onDelete).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Clear selection'));
    expect(onClear).toHaveBeenCalled();
  });
});

