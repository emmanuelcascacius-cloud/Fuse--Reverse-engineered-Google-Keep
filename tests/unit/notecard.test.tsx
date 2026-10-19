import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteCard } from '@/components/notes/NoteCard';
import type { LocalNote } from '@/lib/db/indexeddb';

describe('Rectangular NoteCard Component (Issue 05)', () => {
  const baseNote: LocalNote = {
    id: 'note-123',
    body: 'Short thought',
    is_checklist: false,
    checklist_items: [],
    color: 'coral', // Priority 1 (Red)
    source_domain: 'github.com',
    source_url: 'https://github.com/fuse/repo',
    url_match_scope: 'domain',
    is_pinned: false,
    is_archived: false,
    is_trashed: false,
    position: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    labels: ['bug', 'urgent'],
  };

  it('strictly contains NO title element anywhere in the card DOM', () => {
    const { container } = render(<NoteCard note={baseNote} />);
    
    // Check there is no heading or input or label with title
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    expect(headings.length).toBe(0);

    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBe(0);

    const titleAttrs = container.querySelectorAll('[name="title"], [placeholder*="Title"]');
    expect(titleAttrs.length).toBe(0);
  });

  it('renders 240px rectangular geometry by default and applies Priority Red (coral) color', () => {
    render(<NoteCard note={baseNote} />);
    const card = screen.getByTestId('note-card');
    
    expect(card.className).toContain('w-[240px]');
    expect(card.className).toContain('min-h-[60px]');
    expect(card.className).toContain('max-h-[380px]');
    expect(card.className).toContain('rounded-[8px]');
    expect(card.getAttribute('data-color')).toBe('coral');
  });

  it('renders 600px max width in list view mode', () => {
    render(<NoteCard note={baseNote} isListView={true} />);
    const card = screen.getByTestId('note-card');
    expect(card.className).toContain('max-w-[600px]');
  });

  it('scales typography according to body length (Micro Note = 22px)', () => {
    render(<NoteCard note={baseNote} />); // "Short thought" = 13 chars <= 35
    const bodyParagraph = screen.getByText('Short thought');
    expect(bodyParagraph.className).toContain('text-[22px]');
    expect(bodyParagraph.className).toContain('leading-[28px]');
  });

  it('renders domain chip and label tags', () => {
    render(<NoteCard note={baseNote} />);
    expect(screen.getByText('github.com')).toBeInTheDocument();
    expect(screen.getByText('bug')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('triggers pin and trash callbacks', () => {
    const onPin = vi.fn();
    const onTrash = vi.fn();

    render(
      <NoteCard
        note={baseNote}
        onPin={onPin}
        onTrash={onTrash}
      />
    );

    fireEvent.click(screen.getByLabelText('Pin note'));
    expect(onPin).toHaveBeenCalledWith('note-123', true);

    fireEvent.click(screen.getByLabelText('Delete note'));
    expect(onTrash).toHaveBeenCalledWith('note-123');
  });

  it('renders interactive checklist if is_checklist is true', () => {
    const checklistNote: LocalNote = {
      ...baseNote,
      is_checklist: true,
      checklist_items: [
        { id: 'item-1', text: 'Step 1: First item', checked: false, position: 1 },
        { id: 'item-2', text: 'Step 2: Completed item', checked: true, position: 2 },
      ],
    };

    render(<NoteCard note={checklistNote} />);
    expect(screen.getByText('Step 1: First item')).toBeInTheDocument();
    expect(screen.getByText('Step 2: Completed item')).toBeInTheDocument();
  });
});

