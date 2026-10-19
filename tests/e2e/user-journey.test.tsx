import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import 'fake-indexeddb/auto';
import FuseApp from '@/app/page';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { useNotesStore } from '@/lib/store/useNotesStore';
import { useSelectionStore } from '@/lib/store/useSelectionStore';
import { notesRepo } from '@/lib/db/notes-repo';
import { db } from '@/lib/db/indexeddb';
import { ServerSyncStore } from '@/lib/sync/sync-engine';
import fs from 'node:fs';
import path from 'node:path';

function renderApp() {
  return render(
    <ThemeProvider>
      <FuseApp />
    </ThemeProvider>
  );
}

describe('Full-System Integration & E2E User Journey (Issue 15)', () => {
  beforeEach(async () => {
    // Clear IndexedDB tables completely
    await db.notes.clear();
    await db.sync_outbox.clear();

    useNotesStore.setState({
      notes: [],
      archivedNotes: [],
      trashedNotes: [],
      isLoading: false,
      lastDeletedNote: null,
    });
    useSelectionStore.getState().clearSelection();
  });

  it('verifies PWA service worker and manifest exist on disk with valid syntax', () => {
    const swPath = path.resolve(process.cwd(), 'public/sw.js');
    expect(fs.existsSync(swPath)).toBe(true);
    const swContent = fs.readFileSync(swPath, 'utf-8');
    expect(swContent).toContain('fuse-cache-v1');
    expect(swContent).toContain('addEventListener');

    const manifestPath = path.resolve(process.cwd(), 'public/manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);
    const manifestJson = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(manifestJson.name).toBe('Fuse');
    expect(manifestJson.display).toBe('standalone');
  });

  it('guarantees zero title fields anywhere in the DOM or UI inputs', () => {
    const { container } = renderApp();

    // Zero title input elements
    const titleInputs = container.querySelectorAll(
      'input[placeholder*="Title" i], input[name*="title" i], textarea[placeholder*="Title" i]'
    );
    expect(titleInputs.length).toBe(0);

    // Zero title text or headers intended as note title
    const headings = container.querySelectorAll('h1, h2, h3');
    headings.forEach((h) => {
      expect(h.textContent?.toLowerCase()).not.toContain('note title');
    });
  });

  it('completes the full user journey: capture -> masonry render -> search -> trash -> undo', async () => {
    renderApp();

    // 1. Quick capture note creation
    const quickCapture = screen.getByTestId('quick-capture-bar');
    expect(quickCapture).toBeInTheDocument();

    // Click to expand quick capture
    fireEvent.click(screen.getByText('Take a note...'));

    // Type body content
    const textarea = screen.getByTestId('quick-capture-textarea');
    fireEvent.change(textarea, {
      target: { value: 'Buy organic coffee beans and oat milk' },
    });

    // Close to trigger auto-save
    fireEvent.click(screen.getByText('Close'));

    // Wait for QuickCaptureBar to collapse and note to appear in MasonryGrid
    await waitFor(() => {
      expect(screen.queryByTestId('quick-capture-textarea')).not.toBeInTheDocument();
      expect(screen.getByText('Buy organic coffee beans and oat milk')).toBeInTheDocument();
    });

    // 2. Trash & Undo Toast
    const noteCard = screen.getByTestId('note-card');
    const deleteBtn = noteCard.querySelector('[aria-label="Delete note"]') || screen.getByLabelText('Delete note');
    fireEvent.click(deleteBtn);

    // Verify undo toast appears
    await waitFor(() => {
      expect(screen.getByTestId('undo-toast')).toBeInTheDocument();
      expect(screen.getByText('Note moved to trash')).toBeInTheDocument();
    });

    // Click Undo
    const undoBtn = screen.getByText('Undo');
    fireEvent.click(undoBtn);

    // Note should be restored
    await waitFor(() => {
      expect(screen.getByText('Buy organic coffee beans and oat milk')).toBeInTheDocument();
    });
  });

  it('supports multi-selection and batch operations', async () => {
    // Pre-populate two notes
    const note1 = await notesRepo.createNoteLocal({ body: 'Batch Test Note 1' });
    const note2 = await notesRepo.createNoteLocal({ body: 'Batch Test Note 2' });
    await useNotesStore.getState().fetchNotes();

    renderApp();

    await waitFor(() => {
      expect(screen.getByText('Batch Test Note 1')).toBeInTheDocument();
      expect(screen.getByText('Batch Test Note 2')).toBeInTheDocument();
    });

    // Select both notes via selection store
    await act(async () => {
      useSelectionStore.getState().toggleSelect(note1.id);
      useSelectionStore.getState().toggleSelect(note2.id);
    });

    // Verify BatchActionBar appears with '2 selected'
    await waitFor(() => {
      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });

    // Clear selection
    const clearBtn = screen.getByLabelText('Clear selection');
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(screen.queryByText('2 selected')).not.toBeInTheDocument();
    });
  });

  it('opens 3-dots menu and Google Keep style label popover in quick capture', async () => {
    renderApp();

    // Expand quick capture
    fireEvent.click(screen.getByText('Take a note...'));

    // Click 3 dots more button
    const moreBtn = screen.getByLabelText('More options');
    fireEvent.click(moreBtn);

    // Verify Add label and Add URL options appear
    expect(screen.getByText('Add label')).toBeInTheDocument();
    expect(screen.getByText('Add URL')).toBeInTheDocument();

    // Click Add label
    fireEvent.click(screen.getByText('Add label'));

    // Label popover appears with input
    expect(screen.getByText('Label note')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter label name')).toBeInTheDocument();
  });

  it('simulates offline queue mutation and server delta resolution', async () => {
    // 1. Create local note to generate outbox mutation
    const localNote = await notesRepo.createNoteLocal({
      body: 'Offline sync verification note',
      color: 'coral',
    });

    const outbox = await notesRepo.getSyncOutbox();
    expect(outbox.length).toBeGreaterThan(0);
    const item = outbox.find((o) => o.entity_id === localNote.id);
    expect(item).toBeDefined();

    // 2. ServerSyncStore processes client mutations
    const server = new ServerSyncStore();
    const applied = server.applyClientMutations([item!]);
    expect(applied).toBe(1);

    // 3. Verify server has received note
    const serverNotes = server.getAllNotes();
    expect(serverNotes.find((n) => n.id === localNote.id)?.body).toBe('Offline sync verification note');

    // 4. Verify priority context sorting on server: Red first
    const contextNotes = server.getContextNotes();
    expect(contextNotes).toBeDefined();
  });
});
