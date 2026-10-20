'use client';

import React from 'react';
import type { LocalNote } from '@/lib/db/indexeddb';
import { NoteCard, type NoteCardProps } from '@/components/notes/NoteCard';
import { binPackCards, useMasonryColumns } from '@/hooks/useMasonryColumns';

interface MasonryGridProps {
  notes: LocalNote[];
  isListView?: boolean;
  selectedIds?: string[];
  onSelect?: NoteCardProps['onSelect'];
  onClickNote?: NoteCardProps['onClick'];
  onPin?: NoteCardProps['onPin'];
  onArchive?: NoteCardProps['onArchive'];
  onTrash?: NoteCardProps['onTrash'];
  onColorChange?: NoteCardProps['onColorChange'];
  onToggleChecklistItem?: NoteCardProps['onToggleChecklistItem'];
  sidebarWidth?: number;
}

export function MasonryGrid({
  notes,
  isListView = false,
  selectedIds = [],
  onSelect,
  onClickNote,
  onPin,
  onArchive,
  onTrash,
  onColorChange,
  onToggleChecklistItem,
  sidebarWidth = 280,
}: MasonryGridProps) {
  const numColumns = useMasonryColumns(sidebarWidth);

  const pinnedNotes = notes.filter((n) => n.is_pinned);
  const otherNotes = notes.filter((n) => !n.is_pinned);
  const hasSections = pinnedNotes.length > 0 && otherNotes.length > 0;

  const renderSection = (sectionNotes: LocalNote[], title?: string) => {
    if (sectionNotes.length === 0) return null;

    if (isListView) {
      return (
        <div className="w-full flex flex-col items-center gap-3 sm:gap-4 px-2 sm:px-0">
          {title && (
            <div className="w-full max-w-[600px] text-[11px] font-medium tracking-[0.08em] uppercase text-text-secondary px-2 sm:px-4 mt-4 sm:mt-6 mb-1 sm:mb-2">
              {title}
            </div>
          )}
          <div className="w-full flex flex-col items-center gap-3 sm:gap-4">
            {sectionNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isListView={true}
                isSelected={selectedIds.includes(note.id)}
                onSelect={onSelect}
                onClick={onClickNote}
                onPin={onPin}
                onArchive={onArchive}
                onTrash={onTrash}
                onColorChange={onColorChange}
                onToggleChecklistItem={onToggleChecklistItem}
              />
            ))}
          </div>
        </div>
      );
    }

    const packedColumns = binPackCards(sectionNotes, numColumns);

    return (
      <div className="w-full flex flex-col items-center">
        {title && (
          <div className="w-full max-w-full text-[11px] font-medium tracking-[0.08em] uppercase text-text-secondary px-2 sm:px-4 mt-4 sm:mt-6 mb-1 sm:mb-2 text-left">
            {title}
          </div>
        )}
        <div
          className="flex justify-center gap-2 sm:gap-4 w-full px-1 sm:px-0"
          data-testid="masonry-columns-container"
        >
          {packedColumns.map((colNotes, colIndex) => (
            <div
              key={colIndex}
              data-testid={`masonry-column-${colIndex}`}
              className="flex flex-col gap-2 sm:gap-4 flex-1 min-w-0 sm:flex-initial sm:w-[240px]"
            >
              {colNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isListView={false}
                  isSelected={selectedIds.includes(note.id)}
                  onSelect={onSelect}
                  onClick={onClickNote}
                  onPin={onPin}
                  onArchive={onArchive}
                  onTrash={onTrash}
                  onColorChange={onColorChange}
                  onToggleChecklistItem={onToggleChecklistItem}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (notes.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col items-center gap-6">
      {hasSections ? (
        <>
          {renderSection(pinnedNotes, 'PINNED')}
          {renderSection(otherNotes, 'OTHERS')}
        </>
      ) : (
        renderSection(notes)
      )}
    </div>
  );
}

