'use client';

import React, { useState } from 'react';
import type { LocalNote } from '@/lib/db/indexeddb';
import { getNoteColorClasses, type NoteColorId } from '@/lib/constants/colors';
import { Checklist } from '@/components/notes/Checklist';
import {
  Globe,
  Plus,
  Minus,
  X,
  Pin,
} from 'lucide-react';

export interface ContextualNoteOverlayProps {
  domain: string;
  notes: LocalNote[];
  onUpdateNote?: (id: string, patch: Partial<LocalNote>) => Promise<void>;
  onCreateNote?: (note: Partial<LocalNote>) => Promise<void>;
  onDismissSession?: () => void;
  defaultExpanded?: boolean;
}

export function ContextualNoteOverlay({
  domain,
  notes,
  onUpdateNote,
  onCreateNote,
  onDismissSession,
  defaultExpanded = true,
}: ContextualNoteOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeNoteIndex, setActiveNoteIndex] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteColor, setNewNoteColor] = useState<NoteColorId>('coral'); // Priority 1 (Red) default

  // Sort notes: Red (coral) first, Blue (storm) second, Black (clay) third
  const priorityOrder: Record<string, number> = {
    coral: 1,
    storm: 2,
    clay: 3,
    chalk: 4,
  };

  const sortedNotes = [...notes].sort((a, b) => {
    const weightA = priorityOrder[a.color] || 10;
    const weightB = priorityOrder[b.color] || 10;
    return weightA - weightB;
  });

  const activeNote = sortedNotes[activeNoteIndex] || sortedNotes[0];

  const handleCreate = async () => {
    if (!newNoteText.trim()) return;

    await onCreateNote?.({
      body: newNoteText.trim(),
      color: newNoteColor,
      source_domain: domain,
      source_url: typeof window !== 'undefined' ? window.location.href : `https://${domain}`,
      url_match_scope: 'domain',
      is_pinned: false,
      is_archived: false,
      is_trashed: false,
      is_checklist: false,
      checklist_items: [],
      labels: ['contextual'],
    });

    setNewNoteText('');
    setIsCreating(false);
  };

  if (!sortedNotes.length && !isCreating) {
    return null;
  }

  // Collapsed Pill State
  if (!isExpanded) {
    const hasCoral = sortedNotes.some((n) => n.color === 'coral');
    const hasStorm = sortedNotes.some((n) => n.color === 'storm');

    return (
      <div
        data-testid="contextual-overlay-pill"
        className="fixed top-4 right-4 z-[2147483646] h-9 px-3 rounded-[18px] bg-canvas border border-border-hairline shadow-lg flex items-center gap-2 cursor-pointer transition-all duration-200 select-none hover:shadow-xl"
        onClick={() => setIsExpanded(true)}
      >
        <Globe className="w-4 h-4 text-text-primary" />
        <span className="text-[12px] font-medium text-text-primary truncate max-w-[120px]">
          {domain}
        </span>
        <span className="text-[11px] font-semibold text-text-muted bg-icon-hover-bg px-1.5 py-0.5 rounded-full">
          {sortedNotes.length}
        </span>
        {/* Priority dots */}
        <div className="flex items-center gap-1">
          {hasCoral && <span className="w-2 h-2 rounded-full bg-[#D93025]" title="Urgent note" />}
          {hasStorm && <span className="w-2 h-2 rounded-full bg-[#1A73E8]" title="Active context" />}
        </div>
      </div>
    );
  }

  // Expanded Rectangular Card State
  const noteColor = isCreating ? newNoteColor : (activeNote?.color || 'chalk');
  const colorStyles = getNoteColorClasses(noteColor, false);

  return (
    <div
      data-testid="contextual-overlay-card"
      className="fixed top-4 right-4 z-[2147483646] w-[280px] rounded-[8px] border shadow-2xl p-3 flex flex-col gap-2.5 font-sans select-none animate-in fade-in slide-in-from-right-4 duration-220 transition-all"
      style={{
        backgroundColor: colorStyles.bg,
        borderColor: colorStyles.border,
      }}
    >
      {/* Header Strip: Domain, Add +, Minimize -, Snooze x */}
      <div className="h-6 flex items-center justify-between text-text-primary border-b border-border-hairline/40 pb-1.5">
        <div className="flex items-center gap-1.5 truncate">
          <Globe className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-[11px] font-semibold truncate max-w-[130px]">
            {domain}
          </span>
          {sortedNotes.length > 1 && !isCreating && (
            <span className="text-[10px] font-medium text-text-muted">
              ({activeNoteIndex + 1}/{sortedNotes.length})
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {/* Add note on this site */}
          <button
            type="button"
            aria-label="Add note on this site"
            className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-icon-hover-bg cursor-pointer"
            onClick={() => setIsCreating(!isCreating)}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Minimize */}
          <button
            type="button"
            aria-label="Minimize overlay"
            className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-icon-hover-bg cursor-pointer"
            onClick={() => setIsExpanded(false)}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Dismiss session */}
          <button
            type="button"
            aria-label="Dismiss session"
            className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-icon-hover-bg cursor-pointer"
            onClick={onDismissSession}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Note Body: Inline Editable or Creator */}
      {isCreating ? (
        <div className="flex flex-col gap-2">
          <textarea
            data-testid="overlay-new-note-textarea"
            placeholder={`New note for ${domain}...`}
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            className="w-full bg-transparent text-[13px] leading-[18px] text-text-primary placeholder:text-text-secondary resize-none focus:outline-none min-h-[70px]"
            autoFocus
          />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className={`w-4 h-4 rounded-full bg-[#F28B82] border border-[#EC695E] ${
                  newNoteColor === 'coral' ? 'ring-2 ring-text-primary' : ''
                }`}
                onClick={() => setNewNoteColor('coral')}
                title="Priority Red"
              />
              <button
                type="button"
                className={`w-4 h-4 rounded-full bg-[#AECBFA] border border-[#8AB4F8] ${
                  newNoteColor === 'storm' ? 'ring-2 ring-text-primary' : ''
                }`}
                onClick={() => setNewNoteColor('storm')}
                title="Priority Blue"
              />
              <button
                type="button"
                className={`w-4 h-4 rounded-full bg-[#E8EAED] border border-[#DADCE0] ${
                  newNoteColor === 'clay' ? 'ring-2 ring-text-primary' : ''
                }`}
                onClick={() => setNewNoteColor('clay')}
                title="Priority Black"
              />
            </div>
            <button
              type="button"
              className="px-2.5 py-0.5 rounded-[4px] bg-text-primary text-canvas text-[11px] font-medium cursor-pointer"
              onClick={handleCreate}
            >
              Save
            </button>
          </div>
        </div>
      ) : activeNote ? (
        <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto">
          {activeNote.is_checklist ? (
            <Checklist
              items={activeNote.checklist_items || []}
              onToggleItem={(itemId, checked) => {
                const updatedItems = (activeNote.checklist_items || []).map((i) =>
                  i.id === itemId ? { ...i, checked } : i
                );
                onUpdateNote?.(activeNote.id, { checklist_items: updatedItems });
              }}
            />
          ) : (
            <textarea
              data-testid="overlay-note-body"
              value={activeNote.body}
              onChange={(e) => {
                onUpdateNote?.(activeNote.id, { body: e.target.value });
              }}
              className="w-full bg-transparent text-[13px] leading-[18px] text-text-primary resize-none focus:outline-none min-h-[60px]"
            />
          )}

          {/* Navigation through multiple notes on this site */}
          {sortedNotes.length > 1 && (
            <div className="flex items-center justify-between pt-1 border-t border-border-hairline/30 text-[10px] text-text-muted">
              <button
                type="button"
                disabled={activeNoteIndex === 0}
                className="disabled:opacity-30 hover:text-text-primary cursor-pointer"
                onClick={() => setActiveNoteIndex((i) => Math.max(0, i - 1))}
              >
                &larr; Prev
              </button>
              <div className="flex items-center gap-1">
                {activeNote.is_pinned && <Pin className="w-2.5 h-2.5 fill-current" />}
                <span>{activeNote.color}</span>
              </div>
              <button
                type="button"
                disabled={activeNoteIndex === sortedNotes.length - 1}
                className="disabled:opacity-30 hover:text-text-primary cursor-pointer"
                onClick={() => setActiveNoteIndex((i) => Math.min(sortedNotes.length - 1, i + 1))}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

