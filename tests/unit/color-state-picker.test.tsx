import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorStatePicker } from '@/components/palette/ColorStatePicker';

describe('Priority State ColorStatePicker Component (Issue 08)', () => {
  it('renders all 12 swatches in 2 rows of 6 with Priority States first', () => {
    render(<ColorStatePicker onSelectColor={vi.fn()} />);

    const swatches = screen.getAllByRole('button');
    // 12 swatches in the grid
    expect(swatches).toHaveLength(12);

    // Verify ordering: indices 0, 1, 2 must be Coral, Storm, Clay
    expect(swatches[0]).toHaveAttribute('data-testid', 'color-swatch-coral');
    expect(swatches[1]).toHaveAttribute('data-testid', 'color-swatch-storm');
    expect(swatches[2]).toHaveAttribute('data-testid', 'color-swatch-clay');
    expect(swatches[3]).toHaveAttribute('data-testid', 'color-swatch-chalk');
    expect(swatches[4]).toHaveAttribute('data-testid', 'color-swatch-peach');
    expect(swatches[5]).toHaveAttribute('data-testid', 'color-swatch-sand');
  });

  it('verifies semantic tooltips on primary states', () => {
    render(<ColorStatePicker onSelectColor={vi.fn()} />);

    const coralSwatch = screen.getByTestId('color-swatch-coral');
    expect(coralSwatch.getAttribute('title')).toContain('Serious / Urgent / Blocker');

    const stormSwatch = screen.getByTestId('color-swatch-storm');
    expect(stormSwatch.getAttribute('title')).toContain('Active / Deep Work / Context');

    const claySwatch = screen.getByTestId('color-swatch-clay');
    expect(claySwatch.getAttribute('title')).toContain('Serious Neutral / Vault / Log');
  });

  it('selects color and fires onSelectColor callback', () => {
    const onSelect = vi.fn();
    render(<ColorStatePicker onSelectColor={onSelect} selectedColor="chalk" />);

    fireEvent.click(screen.getByTestId('color-swatch-coral'));
    expect(onSelect).toHaveBeenCalledWith('coral');

    fireEvent.click(screen.getByTestId('color-swatch-storm'));
    expect(onSelect).toHaveBeenCalledWith('storm');
  });

  it('supports Alt+1, Alt+2, Alt+3 keyboard shortcuts', () => {
    const onSelect = vi.fn();
    render(<ColorStatePicker onSelectColor={onSelect} />);

    fireEvent.keyDown(window, { key: '1', altKey: true });
    expect(onSelect).toHaveBeenCalledWith('coral');

    fireEvent.keyDown(window, { key: '2', altKey: true });
    expect(onSelect).toHaveBeenCalledWith('storm');

    fireEvent.keyDown(window, { key: '3', altKey: true });
    expect(onSelect).toHaveBeenCalledWith('clay');
  });
});
