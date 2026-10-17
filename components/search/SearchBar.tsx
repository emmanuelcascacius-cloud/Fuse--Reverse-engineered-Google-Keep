'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { FacetFilterGrid } from './FacetFilterGrid';
import type { SearchFilters } from '@/lib/search/search-engine';

interface SearchBarProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  availableLabels?: string[];
  availableDomains?: string[];
}

export function SearchBar({
  filters,
  onFilterChange,
  availableLabels = [],
  availableDomains = [],
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showFacets, setShowFacets] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global '/' keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close facets
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowFacets(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    onFilterChange({});
    inputRef.current?.focus();
  };

  const hasActiveContent = Boolean(
    filters.query || filters.color || filters.label || filters.domain || filters.type
  );

  return (
    <div
      ref={containerRef}
      data-testid="search-bar-container"
      className="relative w-full max-w-[720px] mx-auto select-none"
    >
      <div
        className={`flex items-center gap-3 px-4 h-12 rounded-[8px] transition-all duration-150 border ${
          isFocused || showFacets
            ? 'bg-search-focus border-border-hairline shadow-md'
            : 'bg-search border-transparent'
        }`}
      >
        <Search className="w-5 h-5 text-icon-default flex-shrink-0 stroke-[2]" />

        <input
          ref={inputRef}
          data-testid="search-input"
          type="text"
          placeholder="Search notes, checklists, labels, or domains... (Press /)"
          value={filters.query || ''}
          onFocus={() => {
            setIsFocused(true);
            setShowFacets(true);
          }}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => {
            onFilterChange({ ...filters, query: e.target.value });
          }}
          className="flex-1 bg-transparent text-[15px] font-sans text-text-primary placeholder:text-text-secondary focus:outline-none"
        />

        {/* Facet toggle button */}
        <button
          type="button"
          aria-label="Filter facets"
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            showFacets ? 'text-text-primary bg-icon-hover-bg' : 'text-icon-default hover:text-text-primary'
          }`}
          onClick={() => setShowFacets(!showFacets)}
        >
          <SlidersHorizontal className="w-4 h-4 stroke-[1.75]" />
        </button>

        {/* Clear search button */}
        {hasActiveContent && (
          <button
            type="button"
            aria-label="Clear search"
            className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
            onClick={handleClear}
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        )}
      </div>

      {/* Dropdown Facet Filter Grid */}
      {showFacets && (
        <FacetFilterGrid
          availableLabels={availableLabels}
          availableDomains={availableDomains}
          activeFilters={filters}
          onFilterChange={onFilterChange}
          onClose={() => setShowFacets(false)}
        />
      )}
    </div>
  );
}
