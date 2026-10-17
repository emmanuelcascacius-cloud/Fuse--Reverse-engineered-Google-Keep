'use client';

import React from 'react';
import { NOTE_COLORS, type NoteColorId } from '@/lib/constants/colors';
import { CheckSquare, FileText, Globe, Tag, X } from 'lucide-react';
import type { SearchFilters } from '@/lib/search/search-engine';

interface FacetFilterGridProps {
  availableLabels: string[];
  availableDomains: string[];
  activeFilters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  onClose?: () => void;
}

export function FacetFilterGrid({
  availableLabels,
  availableDomains,
  activeFilters,
  onFilterChange,
  onClose,
}: FacetFilterGridProps) {
  // Row 1 & 2 colors with Priority State colors first
  const primaryColors = NOTE_COLORS.slice(0, 3); // coral, storm, clay
  const otherColors = NOTE_COLORS.slice(3, 12);

  const handleColorClick = (colorId: NoteColorId) => {
    onFilterChange({
      ...activeFilters,
      color: activeFilters.color === colorId ? null : colorId,
    });
  };

  const handleTypeClick = (type: 'checklist' | 'text' | 'url') => {
    onFilterChange({
      ...activeFilters,
      type: activeFilters.type === type ? null : type,
    });
  };

  const handleLabelClick = (label: string) => {
    onFilterChange({
      ...activeFilters,
      label: activeFilters.label === label ? null : label,
    });
  };

  const handleDomainClick = (domain: string) => {
    onFilterChange({
      ...activeFilters,
      domain: activeFilters.domain === domain ? null : domain,
    });
  };

  const hasActiveFilters = Boolean(
    activeFilters.color || activeFilters.label || activeFilters.domain || activeFilters.type
  );

  return (
    <div
      data-testid="facet-filter-grid"
      className="absolute top-full left-0 right-0 mt-2 p-4 rounded-[8px] bg-canvas border border-border-hairline shadow-xl z-30 flex flex-col gap-4 select-none animate-in fade-in slide-from-top-1 duration-140 max-h-[75vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-border-hairline/60 pb-2">
        <span className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
          Filter notes by
        </span>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              className="text-[12px] text-text-muted hover:text-text-primary flex items-center gap-1 cursor-pointer"
              onClick={() => {
                onFilterChange({ query: activeFilters.query });
              }}
            >
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
          {onClose && (
            <button
              type="button"
              aria-label="Close filters"
              className="w-6 h-6 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg cursor-pointer"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 1. Types Section */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-text-muted">TYPES</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[16px] text-[12px] font-medium border transition-colors cursor-pointer ${
              activeFilters.type === 'checklist'
                ? 'bg-sidebar-active border-text-primary text-text-primary'
                : 'border-border-hairline text-text-secondary hover:bg-icon-hover-bg'
            }`}
            onClick={() => handleTypeClick('checklist')}
          >
            <CheckSquare className="w-3.5 h-3.5" /> Checklists
          </button>

          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[16px] text-[12px] font-medium border transition-colors cursor-pointer ${
              activeFilters.type === 'text'
                ? 'bg-sidebar-active border-text-primary text-text-primary'
                : 'border-border-hairline text-text-secondary hover:bg-icon-hover-bg'
            }`}
            onClick={() => handleTypeClick('text')}
          >
            <FileText className="w-3.5 h-3.5" /> Plain Notes
          </button>

          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[16px] text-[12px] font-medium border transition-colors cursor-pointer ${
              activeFilters.type === 'url'
                ? 'bg-sidebar-active border-text-primary text-text-primary'
                : 'border-border-hairline text-text-secondary hover:bg-icon-hover-bg'
            }`}
            onClick={() => handleTypeClick('url')}
          >
            <Globe className="w-3.5 h-3.5" /> Web Clips & Links
          </button>
        </div>
      </div>

      {/* 2. Colors Section (Priority States Ordered First) */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-text-muted">
          COLORS (PRIORITY STATES FIRST)
        </span>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Primary States */}
          {primaryColors.map((col) => (
            <button
              key={col.id}
              type="button"
              data-testid={`filter-color-${col.id}`}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
                activeFilters.color === col.id
                  ? 'ring-2 ring-offset-1 ring-[#1A73E8]'
                  : 'hover:scale-110'
              }`}
              style={{
                backgroundColor: col.light.bg,
                border: `1px solid ${col.light.border}`,
              }}
              title={col.semanticRole}
              onClick={() => handleColorClick(col.id)}
            />
          ))}

          <span className="w-px h-5 bg-border-hairline mx-1" />

          {/* Secondary Colors */}
          {otherColors.map((col) => (
            <button
              key={col.id}
              type="button"
              data-testid={`filter-color-${col.id}`}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
                activeFilters.color === col.id
                  ? 'ring-2 ring-offset-1 ring-[#1A73E8]'
                  : 'hover:scale-110'
              }`}
              style={{
                backgroundColor: col.light.bg,
                border: `1px solid ${col.light.border}`,
              }}
              title={col.name}
              onClick={() => handleColorClick(col.id)}
            />
          ))}
        </div>
      </div>

      {/* 3. Labels Section */}
      {availableLabels.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-text-muted">LABELS</span>
          <div className="flex flex-wrap gap-1.5">
            {availableLabels.map((label) => (
              <button
                key={label}
                type="button"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-[12px] text-[12px] font-medium border transition-colors cursor-pointer ${
                  activeFilters.label === label
                    ? 'bg-sidebar-active border-text-primary text-text-primary'
                    : 'border-border-hairline text-text-secondary hover:bg-icon-hover-bg'
                }`}
                onClick={() => handleLabelClick(label)}
              >
                <Tag className="w-3 h-3" /> #{label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Domains Section */}
      {availableDomains.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-text-muted">WEBSITES</span>
          <div className="flex flex-wrap gap-1.5">
            {availableDomains.map((domain) => (
              <button
                key={domain}
                type="button"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-[12px] text-[12px] font-medium border transition-colors cursor-pointer ${
                  activeFilters.domain === domain
                    ? 'bg-sidebar-active border-text-primary text-text-primary'
                    : 'border-border-hairline text-text-secondary hover:bg-icon-hover-bg'
                }`}
                onClick={() => handleDomainClick(domain)}
              >
                <Globe className="w-3 h-3" /> {domain}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
