import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '@/components/search/SearchBar';

describe('SearchBar Component (Issue 11)', () => {
  it('renders input, fires query changes, and displays clear button when active', () => {
    const onFilterChange = vi.fn();
    render(
      <SearchBar
        filters={{ query: 'initial' }}
        onFilterChange={onFilterChange}
        availableLabels={['work']}
        availableDomains={['github.com']}
      />
    );

    const input = screen.getByTestId('search-input');
    expect(input).toHaveValue('initial');

    fireEvent.change(input, { target: { value: 'updated' } });
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'updated' })
    );

    const clearBtn = screen.getByLabelText('Clear search');
    fireEvent.click(clearBtn);
    expect(onFilterChange).toHaveBeenCalledWith({});
  });

  it('toggles FacetFilterGrid when clicking filter button', () => {
    render(
      <SearchBar
        filters={{}}
        onFilterChange={vi.fn()}
        availableLabels={['react', 'node']}
        availableDomains={['github.com']}
      />
    );

    const filterBtn = screen.getByLabelText('Filter facets');
    fireEvent.click(filterBtn);

    expect(screen.getByTestId('facet-filter-grid')).toBeInTheDocument();
    expect(screen.getByText('TYPES')).toBeInTheDocument();
    expect(screen.getByText('COLORS (PRIORITY STATES FIRST)')).toBeInTheDocument();
  });
});
