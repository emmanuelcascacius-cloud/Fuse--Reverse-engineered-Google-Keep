'use client';

import React from 'react';
import type { LocalNote } from '@/lib/db/indexeddb';
import { getNoteColorClasses } from '@/lib/constants/colors';
import { getTypographyProfile } from '@/lib/typography';
import { Checklist } from './Checklist';
import { useTheme } from '@/components/theme/ThemeProvider';
import {
  Pin,
  Palette,
  Tag,
  Archive,
  Trash2,
  Check,
  Globe,
} from 'lucide-react';

export interface NoteCardProps {
  note: LocalNote;
  isListView?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, e: React.MouseEvent) => void;
  onClick?: (note: LocalNote) => void;
  onPin?: (id: string, is_pinned: boolean) => void;
  onArchive?: (id: string, is_archived: boolean) => void;
  onTrash?: (id: string) => void;
  onColorChange?: (id: string, e: React.MouseEvent) => void;
  onToggleChecklistItem?: (noteId: string, itemId: string, checked: boolean) => void;
}

export function NoteCard({
  note,
  isListView = false,
  isSelected = false,
  onSelect,
  onClick,
  onPin,
  onArchive,
  onTrash,
  onColorChange,
  onToggleChecklistItem,
}: NoteCardProps) {
  let isDark = false;
  try {
    const themeContext = useTheme();
    isDark = themeContext.resolvedTheme === 'dark';
  } catch {
    // Fallback if rendered outside ThemeProvider (e.g. in tests)
    isDark = false;
  }

  const colorStyles = getNoteColorClasses(note.color, isDark);
  const typography = getTypographyProfile(note.body);

  return (
    <div
      role="article"
      data-testid="note-card"
      data-note-id={note.id}
      data-color={note.color}
      className={`relative group rounded-[8px] transition-shadow duration-140 cursor-default select-none flex flex-col justify-between overflow-hidden overflow-x-hidden overflow-y-hidden scrollbar-none border ${
        isListView ? 'w-full max-w-[600px]' : 'w-[240px]'
      } min-h-[60px] max-h-[380px] hover:shadow-card-hover-light dark:hover:shadow-card-hover-dark`}
      style={{
        backgroundColor: colorStyles.bg,
        borderColor: colorStyles.border,
      }}
      onClick={() => onClick?.(note)}
    >
      {/* Top-Left Selection Checkmark Badge */}
      <button
        type="button"
        aria-label={isSelected ? 'Deselect note' : 'Select note'}
        className={`absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-120 z-20 cursor-pointer ${
          isSelected
            ? 'opacity-100 scale-100 bg-text-primary text-canvas'
            : 'opacity-0 scale-80 group-hover:opacity-100 group-hover:scale-100 bg-canvas/90 text-text-primary border border-border-hairline shadow-sm'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(note.id, e);
        }}
      >
        <Check className="w-3 h-3 stroke-[2.5]" />
      </button>

      {/* Top-Right Pin Button */}
      <button
        type="button"
        aria-label={note.is_pinned ? 'Unpin note' : 'Pin note'}
        className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-opacity duration-140 z-10 cursor-pointer hover:bg-icon-hover-bg ${
          note.is_pinned ? 'opacity-100 text-text-primary' : 'opacity-0 group-hover:opacity-100 text-icon-default'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onPin?.(note.id, !note.is_pinned);
        }}
      >
        <Pin className={`w-4 h-4 ${note.is_pinned ? 'fill-current' : ''}`} />
      </button>

      {/* Main Body Container (Strictly NO Title) */}
      <div className="px-4 pt-3 pb-3 flex-1 flex flex-col overflow-x-hidden overflow-y-hidden scrollbar-none">
        {note.is_checklist ? (
          <Checklist
            items={note.checklist_items || []}
            onToggleItem={(itemId, checked) =>
              onToggleChecklistItem?.(note.id, itemId, checked)
            }
          />
        ) : (
          <p
            className={`font-sans text-text-primary font-normal whitespace-pre-wrap break-words ${typography.fontSizeClass} ${typography.lineHeightClass} ${typography.letterSpacingClass} ${typography.lineClampClass || ''}`}
          >
            {note.body}
          </p>
        )}
      </div>

      {/* Label and Domain Chips Row */}
      {((note.labels && note.labels.length > 0) || note.source_domain) && (
        <div className="px-4 py-1 pb-2 flex flex-wrap gap-1.5 items-center">
          {note.source_domain && (
            <span
              title={`Source: ${note.source_url || note.source_domain}`}
              className="inline-flex items-center gap-1 max-w-[160px] truncate px-2 py-0.5 rounded-[12px] bg-canvas/60 text-text-muted text-[11px] font-medium leading-[16px] border border-border-hairline/60"
            >
              <Globe className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{note.source_domain}</span>
            </span>
          )}
          {note.labels?.map((label) => (
            <span
              key={label}
              className="inline-block max-w-[160px] truncate px-2 py-0.5 rounded-[12px] bg-canvas/60 text-text-secondary text-[11px] font-medium leading-[16px] border border-border-hairline/60"
            >
              #{label}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Hover Action Toolbar (Opacity 0 at rest, 1 on hover/focus) */}
      <div className="h-9 px-2 pb-1 flex items-center justify-between opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-140 ease-out z-10">
        <div className="flex items-center gap-0.5">
          {/* Color Palette Button */}
          <button
            type="button"
            aria-label="Change note color"
            className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onColorChange?.(note.id, e);
            }}
          >
            <Palette className="w-[18px] h-[18px] stroke-[1.75]" />
          </button>

          {/* Label Button */}
          <button
            type="button"
            aria-label="Add or edit labels"
            className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(note);
            }}
          >
            <Tag className="w-[18px] h-[18px] stroke-[1.75]" />
          </button>

          {/* Archive Button */}
          <button
            type="button"
            aria-label={note.is_archived ? 'Unarchive note' : 'Archive note'}
            className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onArchive?.(note.id, !note.is_archived);
            }}
          >
            <Archive className="w-[18px] h-[18px] stroke-[1.75]" />
          </button>

          {/* Trash Button */}
          <button
            type="button"
            aria-label="Delete note"
            className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onTrash?.(note.id);
            }}
          >
            <Trash2 className="w-[18px] h-[18px] stroke-[1.75]" />
          </button>
        </div>
      </div>
    </div>
  );
}

