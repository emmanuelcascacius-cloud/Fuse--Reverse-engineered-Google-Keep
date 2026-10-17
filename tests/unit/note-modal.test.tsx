import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NoteModal } from '@/components/modal/NoteModal';
import type { LocalNote } from '@/lib/db/indexeddb';

describe('NoteModal Component (Issue 07)', () => {
  const sampleNote: LocalNote = {
    id: 'note-modal-test',
    body: 'Initial modal content',
    is_checklist: false,
    checklist_items: [],
    color: 'storm',
    url_match_scope: 'domain',
    is_pinned: false,
    is_archived: false,
    is_trashed: false,
    position: 1,
    created_at: '',
    updated_at: '',
  };

  it('strictly contains NO title field in the modal DOM', () => {
    const { container } = render(
      <NoteModal
        note={sampleNote}
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(container.querySelectorAll('input[placeholder*="Title"]').length).toBe(0);
    expect(container.querySelectorAll('h1, h2, h3').length).toBe(0);
  });

  it('renders modal with note body text when open', () => {
    render(
      <NoteModal
        note={sampleNote}
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const textarea = screen.getByTestId('modal-textarea');
    expect(textarea).toHaveValue('Initial modal content');
  });

  it('saves edits and calls onClose when clicking Close', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <NoteModal
        note={sampleNote}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    );

    const textarea = screen.getByTestId('modal-textarea');
    fireEvent.change(textarea, { target: { value: 'Edited modal content' } });

    fireEvent.click(screen.getByText('Close'));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        'note-modal-test',
        expect.objectContaining({
          body: 'Edited modal content',
        })
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('triggers auto-save on clicking backdrop scrim', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <NoteModal
        note={sampleNote}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    );

    const backdrop = screen.getByTestId('note-modal-backdrop');
    fireEvent.click(backdrop);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
