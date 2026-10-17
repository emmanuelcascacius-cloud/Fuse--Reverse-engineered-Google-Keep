import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExtensionPopup } from '@/extension/popup';

describe('Chrome Extension Web Clipper & Popup (Issue 13)', () => {
  it('strictly contains NO title field in the extension popup', () => {
    const { container } = render(<ExtensionPopup />);
    expect(container.querySelectorAll('input[placeholder*="Title"]').length).toBe(0);
    expect(container.querySelectorAll('h1, h2, h3').length).toBe(0);
  });

  it('renders domain chip and priority color swatches', () => {
    render(<ExtensionPopup />);
    expect(screen.getByText('github.com')).toBeInTheDocument();

    // Priority color swatches (Coral, Storm, Clay)
    expect(screen.getByTestId('popup-color-coral')).toBeInTheDocument();
    expect(screen.getByTestId('popup-color-storm')).toBeInTheDocument();
    expect(screen.getByTestId('popup-color-clay')).toBeInTheDocument();
  });

  it('selects priority color and types note body', () => {
    render(<ExtensionPopup />);
    const textarea = screen.getByTestId('popup-textarea');
    fireEvent.change(textarea, { target: { value: 'Important finding on github' } });
    expect(textarea).toHaveValue('Important finding on github');

    fireEvent.click(screen.getByTestId('popup-color-storm'));
    fireEvent.click(screen.getByTestId('popup-save-btn'));
    expect(screen.getByText(/Saved/i)).toBeInTheDocument();
  });
});
