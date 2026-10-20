import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useMasonryColumns } from '@/hooks/useMasonryColumns';
import { SidebarNav } from '@/components/sidebar/SidebarNav';
import { NoteModal } from '@/components/modal/NoteModal';
import { QuickCaptureBar } from '@/components/capture/QuickCaptureBar';
import type { LocalNote } from '@/lib/db/indexeddb';

describe('Mobile Responsiveness (iPhone 16, Pixel 9/10, Android Screens)', () => {
  describe('useMasonryColumns Responsive Logic', () => {
    it('returns 2 columns for standard mobile phones (iPhone 16: 393px, Pixel 9/10: 412px)', () => {
      window.innerWidth = 393;

      const { result } = renderHook(() => useMasonryColumns());
      expect(result.current).toBe(2);
    });

    it('returns 1 column for compact screens (< 360px)', () => {
      window.innerWidth = 320;

      const { result } = renderHook(() => useMasonryColumns());
      expect(result.current).toBe(1);
    });
  });

  describe('SidebarNav Mobile Slide-out Drawer', () => {
    it('does not render mobile backdrop or mobile drawer when closed', () => {
      render(
        <SidebarNav
          currentView="notes"
          selectedLabel={null}
          labels={['work']}
          isOpen={false}
          onSelectView={vi.fn()}
          onSelectLabel={vi.fn()}
          onOpenEditLabels={vi.fn()}
        />
      );

      expect(screen.queryByTestId('sidebar-mobile-backdrop')).toBeNull();
      expect(screen.queryByTestId('sidebar-mobile-drawer')).toBeNull();
    });

    it('renders mobile drawer and backdrop when isOpen is true, and fires onCloseMobile on backdrop click', () => {
      const onCloseMobile = vi.fn();
      render(
        <SidebarNav
          currentView="notes"
          selectedLabel={null}
          labels={['work']}
          isOpen={true}
          onCloseMobile={onCloseMobile}
          onSelectView={vi.fn()}
          onSelectLabel={vi.fn()}
          onOpenEditLabels={vi.fn()}
        />
      );

      const backdrop = screen.getByTestId('sidebar-mobile-backdrop');
      const drawer = screen.getByTestId('sidebar-mobile-drawer');
      expect(backdrop).toBeDefined();
      expect(drawer).toBeDefined();

      fireEvent.click(backdrop);
      expect(onCloseMobile).toHaveBeenCalled();
    });

    it('closes mobile drawer when a nav item is selected', () => {
      const onCloseMobile = vi.fn();
      const onSelectView = vi.fn();
      render(
        <SidebarNav
          currentView="notes"
          selectedLabel={null}
          labels={['work']}
          isOpen={true}
          onCloseMobile={onCloseMobile}
          onSelectView={onSelectView}
          onSelectLabel={vi.fn()}
          onOpenEditLabels={vi.fn()}
        />
      );

      const mobileNotesBtn = screen.getByTestId('mobile-nav-notes');
      fireEvent.click(mobileNotesBtn);

      expect(onSelectView).toHaveBeenCalledWith('notes');
      expect(onCloseMobile).toHaveBeenCalled();
    });
  });

  describe('NoteModal Mobile Adaptations', () => {
    const mockNote: LocalNote = {
      id: 'test-note-1',
      user_id: 'user-1',
      body: 'Hello mobile world',
      is_checklist: false,
      checklist_items: [],
      color: 'coral',
      is_pinned: false,
      is_archived: false,
      is_trashed: false,
      position: 1,
      labels: ['mobile'],
      source_domain: null,
      source_url: null,
      url_match_scope: 'domain',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    it('renders responsive full-screen classes and iOS Safari auto-zoom prevention font-size', () => {
      render(
        <NoteModal
          note={mockNote}
          isOpen={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      );

      const content = screen.getByTestId('note-modal-content');
      // Full screen on mobile (w-full h-full sm:h-auto sm:max-w-[600px] sm:max-h-[85vh] rounded-none sm:rounded-[8px])
      expect(content.className).toContain('w-full');
      expect(content.className).toContain('h-full');
      expect(content.className).toContain('sm:h-auto');
      expect(content.className).toContain('rounded-none');
      expect(content.className).toContain('sm:rounded-[8px]');

      // Check textarea has 16px font-size to prevent iOS Safari auto-zoom
      const textarea = screen.getByTestId('modal-textarea');
      expect(textarea.className).toContain('text-[16px]');
    });
  });

  describe('QuickCaptureBar Mobile Input Handling', () => {
    it('sets minimum 16px text size to prevent iOS Safari auto-zoom on mobile', () => {
      render(
        <QuickCaptureBar
          onSaveNote={vi.fn()}
        />
      );

      // Expand capture bar
      fireEvent.click(screen.getByText('Take a note...'));

      const textarea = screen.getByTestId('quick-capture-textarea');
      expect(textarea.className).toContain('text-[16px]');
    });
  });
});
