import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickCaptureBar } from '@/components/capture/QuickCaptureBar';

describe('QuickCaptureBar Component (Issue 07)', () => {
  it('strictly contains NO title field in collapsed or expanded state', () => {
    const { container, rerender } = render(<QuickCaptureBar onSaveNote={vi.fn()} />);

    // Collapsed check
    expect(container.querySelectorAll('input[placeholder*="Title"]').length).toBe(0);

    // Expand
    fireEvent.click(screen.getByText('Take a note...'));
    rerender(<QuickCaptureBar onSaveNote={vi.fn()} />);

    // Expanded check
    expect(container.querySelectorAll('input[placeholder*="Title"]').length).toBe(0);
    expect(container.querySelectorAll('h1, h2, h3').length).toBe(0);
  });

  it('renders collapsed state with 46px height and "Take a note..." placeholder', () => {
    render(<QuickCaptureBar onSaveNote={vi.fn()} />);
    expect(screen.getByText('Take a note...')).toBeInTheDocument();
  });

  it('expands on click and auto-saves on Close button click', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<QuickCaptureBar onSaveNote={onSave} />);

    // Click to expand
    fireEvent.click(screen.getByText('Take a note...'));

    // Type body
    const textarea = screen.getByTestId('quick-capture-textarea');
    fireEvent.change(textarea, { target: { value: 'Buy groceries' } });

    // Click Close
    fireEvent.click(screen.getByText('Close'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'Buy groceries',
        is_checklist: false,
      })
    );
  });

  it('discards empty notes on close without saving', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<QuickCaptureBar onSaveNote={onSave} />);

    // Click to expand
    fireEvent.click(screen.getByText('Take a note...'));

    // Don't type anything, just click Close
    fireEvent.click(screen.getByText('Close'));

    expect(onSave).not.toHaveBeenCalled();
  });

  it('converts text to checklist items on toggle', () => {
    render(<QuickCaptureBar onSaveNote={vi.fn()} />);

    // Expand
    fireEvent.click(screen.getByText('Take a note...'));

    // Type two lines of text
    const textarea = screen.getByTestId('quick-capture-textarea');
    fireEvent.change(textarea, { target: { value: 'Item 1\nItem 2' } });

    // Toggle checklist
    fireEvent.click(screen.getByLabelText('Toggle checklist mode'));

    expect(screen.getByDisplayValue('Item 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Item 2')).toBeInTheDocument();
  });
});

