'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Check } from 'lucide-react';

interface NoteLabelPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLabels: string[];
  availableLabels: string[];
  onToggleLabel: (label: string) => void;
  onCreateLabel: (label: string) => void;
  anchorClassName?: string;
}

export function NoteLabelPopover({
  isOpen,
  onClose,
  selectedLabels,
  availableLabels,
  onToggleLabel,
  onCreateLabel,
  anchorClassName = 'top-full mt-1.5 left-0',
}: NoteLabelPopoverProps) {
  const [query, setQuery] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.trim().toLowerCase().replace(/^#/, '');
  const filteredLabels = availableLabels.filter((lbl) =>
    lbl.toLowerCase().includes(normalizedQuery)
  );
  const exactMatch = availableLabels.some(
    (lbl) => lbl.toLowerCase() === normalizedQuery
  );
  const canCreate = normalizedQuery.length > 0 && !exactMatch;

  return (
    <div
      ref={popoverRef}
      data-testid="note-label-popover"
      className={`absolute z-50 w-64 bg-canvas rounded-[8px] border border-border-hairline shadow-2xl py-2 flex flex-col gap-1 select-none animate-in fade-in zoom-in-95 duration-100 ${anchorClassName}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 pb-1 text-[12px] font-medium text-text-secondary">
        Label note
      </div>

      {/* Search / Enter label name */}
      <div className="px-2.5 pb-1">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] bg-icon-hover-bg border border-border-hairline/60">
          <Search className="w-3.5 h-3.5 text-icon-default flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            data-testid="label-popover-input"
            placeholder="Enter label name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (canCreate) {
                  onCreateLabel(normalizedQuery);
                  setQuery('');
                } else if (filteredLabels.length > 0) {
                  onToggleLabel(filteredLabels[0]);
                }
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
            className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-secondary focus:outline-none"
          />
        </div>
      </div>

      {/* Existing Labels List with Google Keep Checkboxes */}
      <div className="max-h-72 overflow-y-auto px-1 flex flex-col gap-0.5 scrollbar-none">
        {filteredLabels.map((lbl) => {
          const isChecked = selectedLabels.includes(lbl);
          return (
            <button
              key={lbl}
              type="button"
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] hover:bg-icon-hover-bg text-left text-[13px] text-text-primary transition-colors cursor-pointer"
              onClick={() => onToggleLabel(lbl)}
            >
              <div
                className={`w-4 h-4 rounded-[3px] border flex items-center justify-center transition-colors flex-shrink-0 ${
                  isChecked
                    ? 'bg-[#1A73E8] border-[#1A73E8] text-white'
                    : 'border-icon-default bg-transparent'
                }`}
              >
                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="truncate flex-1 font-sans">{lbl}</span>
            </button>
          );
        })}

        {/* Option to create new label inline if doesn't exist */}
        {canCreate && (
          <button
            type="button"
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] hover:bg-icon-hover-bg text-left text-[13px] text-text-primary font-medium transition-colors cursor-pointer"
            onClick={() => {
              onCreateLabel(normalizedQuery);
              setQuery('');
            }}
          >
            <Plus className="w-3.5 h-3.5 text-icon-default" />
            <span className="truncate">
              Create &ldquo;<strong className="text-text-primary">{normalizedQuery}</strong>&rdquo;
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

