'use client';

import React, { useState } from 'react';
import { Tag, Plus } from 'lucide-react';

interface LabelAutocompleteProps {
  availableLabels: string[];
  selectedLabels: string[];
  onAddLabel: (label: string) => void;
  onRemoveLabel: (label: string) => void;
  className?: string;
}

export function LabelAutocomplete({
  availableLabels,
  selectedLabels,
  onAddLabel,
  onRemoveLabel,
  className = '',
}: LabelAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = availableLabels.filter(
    (l) => l.toLowerCase().includes(query.toLowerCase()) && !selectedLabels.includes(l)
  );

  const handleSelect = (label: string) => {
    onAddLabel(label);
    setQuery('');
    setIsOpen(false);
  };

  const handleCreate = () => {
    const trimmed = query.trim().replace(/^#/, '');
    if (trimmed) {
      onAddLabel(trimmed);
      setQuery('');
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative flex flex-col gap-2 ${className}`}>
      {/* Selected Labels Chips */}
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {selectedLabels.map((lbl) => (
            <span
              key={lbl}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[12px] bg-canvas/80 text-text-secondary text-[11px] font-medium border border-border-hairline"
            >
              #{lbl}
              <button
                type="button"
                className="w-3.5 h-3.5 rounded-full hover:bg-icon-hover-bg flex items-center justify-center text-text-muted hover:text-text-primary ml-0.5 cursor-pointer"
                onClick={() => onRemoveLabel(lbl)}
                aria-label={`Remove label ${lbl}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input Trigger */}
      <div className="flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5 text-icon-default" />
        <input
          type="text"
          data-testid="label-autocomplete-input"
          placeholder="Add #label..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (filtered.length > 0) {
                handleSelect(filtered[0]);
              } else {
                handleCreate();
              }
            }
          }}
          className="bg-transparent text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none w-32"
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (query.trim() || filtered.length > 0) && (
        <div
          data-testid="label-autocomplete-dropdown"
          className="absolute top-full left-0 mt-1 w-48 rounded-[8px] bg-canvas border border-border-hairline shadow-lg p-1 z-30 flex flex-col gap-0.5"
        >
          {filtered.map((label) => (
            <button
              key={label}
              type="button"
              className="flex items-center gap-2 px-2.5 py-1.5 text-left text-[12px] text-text-primary hover:bg-icon-hover-bg rounded-[4px] cursor-pointer"
              onClick={() => handleSelect(label)}
            >
              <Tag className="w-3 h-3 text-icon-default" />
              <span>{label}</span>
            </button>
          ))}

          {query.trim() && !availableLabels.includes(query.trim()) && (
            <button
              type="button"
              className="flex items-center gap-2 px-2.5 py-1.5 text-left text-[12px] text-text-primary hover:bg-icon-hover-bg rounded-[4px] cursor-pointer border-t border-border-hairline/40 pt-1.5"
              onClick={handleCreate}
            >
              <Plus className="w-3 h-3 text-icon-default" />
              <span>Create &quot;{query.trim()}&quot;</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

