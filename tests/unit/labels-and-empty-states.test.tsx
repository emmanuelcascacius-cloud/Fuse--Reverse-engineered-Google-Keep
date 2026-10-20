import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import FuseApp from '@/app/page';

describe('Labels View & Google Keep Minimal Empty States', () => {
  it('renders "Notes you add appear here" empty state when no notes exist on the main feed', async () => {
    await act(async () => {
      render(<FuseApp />);
    });

    // Should render the Google Keep empty notes state
    const emptyNotes = await screen.findByTestId('empty-notes-state');
    expect(emptyNotes).toBeDefined();
    expect(screen.getByText('Notes you add appear here')).toBeDefined();

    // Should NOT have any "Viewing label:" text
    expect(screen.queryByText(/Viewing label:/i)).toBeNull();
  });

  it('renders QuickCaptureBar at the top of the feed', async () => {
    await act(async () => {
      render(<FuseApp />);
    });

    const captureBar = screen.getByTestId('quick-capture-bar');
    expect(captureBar).toBeDefined();
    expect(screen.getByText('Take a note...')).toBeDefined();
  });

  it('navigating to a label view renders QuickCaptureBar and "No notes with this label yet" empty state', async () => {
    await act(async () => {
      render(<FuseApp />);
    });

    // Click label "ideas" from sidebar
    const ideasBtn = screen.getByTestId('nav-label-ideas');
    await act(async () => {
      fireEvent.click(ideasBtn);
    });

    // Should still have QuickCaptureBar on top of the label view
    const captureBar = screen.getByTestId('quick-capture-bar');
    expect(captureBar).toBeDefined();

    // Should NOT show any "Viewing label:" header
    expect(screen.queryByText(/Viewing label:/i)).toBeNull();

    // Should show Google Keep label empty state
    const emptyLabel = screen.getByTestId('empty-label-state');
    expect(emptyLabel).toBeDefined();
    expect(screen.getByText('No notes with this label yet')).toBeDefined();
  });

  it('renders Google Keep header with Fuse brand, search bar, refresh button, and settings', async () => {
    await act(async () => {
      render(<FuseApp />);
    });

    // Fuse brand name without logo
    expect(screen.getByText('Fuse')).toBeDefined();

    // Search input
    const searchInput = screen.getByTestId('search-input') as HTMLInputElement;
    expect(searchInput).toBeDefined();
    expect(searchInput.placeholder).toBe('Search');

    // Type in search bar
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'nonexistent-query-xyz' } });
    });
    expect(searchInput.value).toBe('nonexistent-query-xyz');

    // Empty search state shows "No matching results"
    expect(screen.getByText('No matching results')).toBeDefined();

    // Clear button clears search input
    const clearBtn = screen.getByLabelText('Clear search');
    await act(async () => {
      fireEvent.click(clearBtn);
    });
    expect(searchInput.value).toBe('');

    // Refresh button exists and can be clicked
    const refreshBtn = screen.getByLabelText('Refresh');
    expect(refreshBtn).toBeDefined();
    await act(async () => {
      fireEvent.click(refreshBtn);
    });

    // Settings button exists
    const settingsBtn = screen.getByLabelText('Settings');
    expect(settingsBtn).toBeDefined();
  });
});
