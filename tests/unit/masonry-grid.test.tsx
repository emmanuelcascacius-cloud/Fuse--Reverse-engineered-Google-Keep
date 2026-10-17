import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MasonryGrid } from '@/components/grid/MasonryGrid';
import type { LocalNote } from '@/lib/db/indexeddb';

describe('MasonryGrid Component (Issue 06)', () => {
  const sampleNotes: LocalNote[] = [
    {
      id: 'pinned-1',
      body: 'Pinned Note Body',
      is_checklist: false,
      checklist_items: [],
      color: 'coral',
      url_match_scope: 'domain',
      is_pinned: true,
      is_archived: false,
      is_trashed: false,
      position: 1,
      created_at: '',
      updated_at: '',
    },
    {
      id: 'other-1',
      body: 'Other Note Body 1',
      is_checklist: false,
      checklist_items: [],
      color: 'storm',
      url_match_scope: 'domain',
      is_pinned: false,
      is_archived: false,
      is_trashed: false,
      position: 2,
      created_at: '',
      updated_at: '',
    },
    {
      id: 'other-2',
      body: 'Other Note Body 2',
      is_checklist: false,
      checklist_items: [],
      color: 'clay',
      url_match_scope: 'domain',
      is_pinned: false,
      is_archived: false,
      is_trashed: false,
      position: 3,
      created_at: '',
      updated_at: '',
    },
  ];

  it('renders PINNED and OTHERS section headers when both types exist', () => {
    render(<MasonryGrid notes={sampleNotes} />);
    expect(screen.getByText('PINNED')).toBeInTheDocument();
    expect(screen.getByText('OTHERS')).toBeInTheDocument();
    expect(screen.getByText('Pinned Note Body')).toBeInTheDocument();
    expect(screen.getByText('Other Note Body 1')).toBeInTheDocument();
  });

  it('renders all notes in 240px columns', () => {
    render(<MasonryGrid notes={sampleNotes} />);
    const cards = screen.getAllByTestId('note-card');
    expect(cards).toHaveLength(3);
    cards.forEach((card) => {
      expect(card.className).toContain('w-[240px]');
    });
  });

  it('renders single-column list view when isListView is true', () => {
    render(<MasonryGrid notes={sampleNotes} isListView={true} />);
    const cards = screen.getAllByTestId('note-card');
    expect(cards).toHaveLength(3);
    cards.forEach((card) => {
      expect(card.className).toContain('max-w-[600px]');
    });
  });
});
