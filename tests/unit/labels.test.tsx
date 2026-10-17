import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditLabelsModal } from '@/components/labels/EditLabelsModal';
import { SidebarNav } from '@/components/sidebar/SidebarNav';
import { LabelAutocomplete } from '@/components/editor/LabelAutocomplete';

describe('Labels System & Sidebar Navigation (Issue 09)', () => {
  describe('EditLabelsModal', () => {
    it('creates new label on enter or confirm', () => {
      const onCreate = vi.fn();
      render(
        <EditLabelsModal
          isOpen={true}
          onClose={vi.fn()}
          labels={['work', 'personal']}
          onCreateLabel={onCreate}
          onRenameLabel={vi.fn()}
          onDeleteLabel={vi.fn()}
        />
      );

      const input = screen.getByTestId('create-label-input');
      fireEvent.change(input, { target: { value: 'urgent' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onCreate).toHaveBeenCalledWith('urgent');
    });

    it('renames and deletes existing label', () => {
      const onDelete = vi.fn();
      const onRename = vi.fn();

      render(
        <EditLabelsModal
          isOpen={true}
          onClose={vi.fn()}
          labels={['work']}
          onCreateLabel={vi.fn()}
          onRenameLabel={onRename}
          onDeleteLabel={onDelete}
        />
      );

      // Delete
      fireEvent.click(screen.getByLabelText('Delete label work'));
      expect(onDelete).toHaveBeenCalledWith('work');

      // Start rename
      fireEvent.click(screen.getByLabelText('Rename label work'));
      const renameInput = screen.getByDisplayValue('work');
      fireEvent.change(renameInput, { target: { value: 'work-projects' } });
      fireEvent.click(screen.getByLabelText('Save label rename'));

      expect(onRename).toHaveBeenCalledWith('work', 'work-projects');
    });
  });

  describe('SidebarNav', () => {
    it('renders navigation items and applies active class', () => {
      const onSelectView = vi.fn();
      const onSelectLabel = vi.fn();
      const onOpenEditLabels = vi.fn();

      render(
        <SidebarNav
          currentView="notes"
          selectedLabel={null}
          labels={['ideas']}
          onSelectView={onSelectView}
          onSelectLabel={onSelectLabel}
          onOpenEditLabels={onOpenEditLabels}
        />
      );

      const notesBtn = screen.getByTestId('nav-notes');
      expect(notesBtn.className).toContain('bg-sidebar-active');

      // Click ideas label
      fireEvent.click(screen.getByTestId('nav-label-ideas'));
      expect(onSelectView).toHaveBeenCalledWith('notes');
      expect(onSelectLabel).toHaveBeenCalledWith('ideas');

      // Click edit labels
      fireEvent.click(screen.getByTestId('nav-edit-labels'));
      expect(onOpenEditLabels).toHaveBeenCalled();
    });
  });

  describe('LabelAutocomplete', () => {
    it('selects existing label and emits onAddLabel', () => {
      const onAdd = vi.fn();
      render(
        <LabelAutocomplete
          availableLabels={['bug', 'feature']}
          selectedLabels={[]}
          onAddLabel={onAdd}
          onRemoveLabel={vi.fn()}
        />
      );

      const input = screen.getByTestId('label-autocomplete-input');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'bu' } });

      fireEvent.click(screen.getByText('bug'));
      expect(onAdd).toHaveBeenCalledWith('bug');
    });
  });
});
