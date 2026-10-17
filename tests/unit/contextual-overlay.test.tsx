import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContextualNoteOverlay } from '@/components/extension/ContextualNoteOverlay';
import { injectContextualOverlay } from '@/extension/content';
import type { LocalNote } from '@/lib/db/indexeddb';

describe('Chrome Extension Contextual Note Overlay (Issue 14)', () => {
  const sampleNotes: LocalNote[] = [
    {
      id: 'note-blue',
      body: 'Active blue research',
      is_checklist: false,
      checklist_items: [],
      color: 'storm', // Priority 2
      source_domain: 'github.com',
      url_match_scope: 'domain',
      is_pinned: false,
      is_archived: false,
      is_trashed: false,
      position: 1,
      created_at: '',
      updated_at: '',
    },
    {
      id: 'note-red',
      body: 'Critical red bug note',
      is_checklist: false,
      checklist_items: [],
      color: 'coral', // Priority 1 (Should sort to top)
      source_domain: 'github.com',
      url_match_scope: 'domain',
      is_pinned: false,
      is_archived: false,
      is_trashed: false,
      position: 2,
      created_at: '',
      updated_at: '',
    },
    {
      id: 'note-black',
      body: 'Neutral black log',
      is_checklist: false,
      checklist_items: [],
      color: 'clay', // Priority 3
      source_domain: 'github.com',
      url_match_scope: 'domain',
      is_pinned: false,
      is_archived: false,
      is_trashed: false,
      position: 3,
      created_at: '',
      updated_at: '',
    },
  ];

  it('proactively surfaces Red (coral) note first due to priority sorting', () => {
    render(<ContextualNoteOverlay domain="github.com" notes={sampleNotes} />);

    // Because coral is Priority 1, its text should be in the active textarea
    const textarea = screen.getByTestId('overlay-note-body');
    expect(textarea).toHaveValue('Critical red bug note');
  });

  it('renders collapsed pill when minimized and toggles back', () => {
    render(
      <ContextualNoteOverlay
        domain="github.com"
        notes={sampleNotes}
        defaultExpanded={false}
      />
    );

    const pill = screen.getByTestId('contextual-overlay-pill');
    expect(pill).toBeInTheDocument();
    expect(screen.getByText('github.com')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // count badge

    // Click pill to expand
    fireEvent.click(pill);
    expect(screen.getByTestId('contextual-overlay-card')).toBeInTheDocument();
  });

  it('allows inline editing and fires onUpdateNote callback', () => {
    const onUpdate = vi.fn();
    render(
      <ContextualNoteOverlay
        domain="github.com"
        notes={sampleNotes}
        onUpdateNote={onUpdate}
      />
    );

    const textarea = screen.getByTestId('overlay-note-body');
    fireEvent.change(textarea, { target: { value: 'Updated inline text' } });

    expect(onUpdate).toHaveBeenCalledWith('note-red', {
      body: 'Updated inline text',
    });
  });

  it('injects isolated Shadow DOM root into document', () => {
    injectContextualOverlay('github.com', sampleNotes);

    const host = document.getElementById('fuse-contextual-root');
    expect(host).not.toBeNull();
    expect(host?.shadowRoot).not.toBeNull();
  });
});

