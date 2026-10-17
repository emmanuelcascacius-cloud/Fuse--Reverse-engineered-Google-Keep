'use client';

import React, { useState, useEffect } from 'react';
import type { LocalNote } from '@/lib/db/indexeddb';
import { getNoteColorClasses, type NoteColorId } from '@/lib/constants/colors';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Checklist } from '@/components/notes/Checklist';
import {
  Pin,
  Palette,
  Tag,
  Archive,
  Trash2,
  CheckSquare,
  Globe,
} from 'lucide-react';
import type { ChecklistItem } from '@/lib/db/schema';
import { generateUUID } from '@/lib/db/notes-repo';

interface NoteModalProps {
  note: LocalNote | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, patch: Partial<LocalNote>) => Promise<void>;
  onTrash?: (id: string) => Promise<void>;
  onArchive?: (id: string, is_archived: boolean) => Promise<void>;
}

export function NoteModal({
  note,
  isOpen,
  onClose,
  onSave,
  onTrash,
  onArchive,
}: NoteModalProps) {
  const [bodyText, setBodyText] = useState('');
  const [isChecklist, setIsChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [color, setColor] = useState<NoteColorId>('chalk');
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [labels, setLabels] = useState<string[]>([]);
  const [newItemText, setNewItemText] = useState('');

  let isDark = false;
  try {
    const themeContext = useTheme();
    isDark = themeContext.resolvedTheme === 'dark';
  } catch {
    isDark = false;
  }

  // Populate state when note changes
  useEffect(() => {
    if (note) {
      setBodyText(note.body || '');
      setIsChecklist(note.is_checklist);
      setChecklistItems(note.checklist_items || []);
      setColor(note.color);
      setIsPinned(note.is_pinned);
      setIsArchived(note.is_archived);
      setLabels(note.labels || []);
      setNewItemText('');
    }
  }, [note]);

  // Implicit auto-save on close
  const handleSaveAndClose = React.useCallback(async () => {
    if (!note) {
      onClose();
      return;
    }

    const finalItems = [...checklistItems];
    if (newItemText.trim().length > 0) {
      finalItems.push({
        id: generateUUID(),
        text: newItemText.trim(),
        checked: false,
        position: finalItems.length + 1,
      });
    }

    const finalBody = isChecklist
      ? finalItems.map((i) => i.text).join('\n')
      : bodyText;

    await onSave(note.id, {
      body: finalBody,
      is_checklist: isChecklist,
      checklist_items: finalItems,
      color,
      is_pinned: isPinned,
      is_archived: isArchived,
      labels,
    });

    onClose();
  }, [note, checklistItems, newItemText, isChecklist, bodyText, onSave, color, isPinned, isArchived, labels, onClose]);

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSaveAndClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleSaveAndClose]);

  if (!isOpen || !note) {
    return null;
  }

  const colorStyles = getNoteColorClasses(color, isDark);

  return (
    <div
      data-testid="note-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[1px] animate-fade-in"
      onClick={handleSaveAndClose}
    >
      <div
        data-testid="note-modal-content"
        className="w-full max-w-[600px] max-h-[85vh] rounded-[8px] border shadow-2xl flex flex-col overflow-hidden relative"
        style={{
          backgroundColor: colorStyles.bg,
          borderColor: colorStyles.border,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Pin Button */}
        <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
          <button
            type="button"
            aria-label={isPinned ? 'Unpin note' : 'Pin note'}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:bg-icon-hover-bg ${
              isPinned ? 'text-text-primary' : 'text-icon-default'
            }`}
            onClick={() => setIsPinned(!isPinned)}
          >
            <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Modal Scrollable Body (Strictly NO Title Input) */}
        <div className="p-6 pt-5 pb-4 flex-1 overflow-y-auto flex flex-col gap-3">
          {/* Domain Chip if linked */}
          {note.source_domain && (
            <div className="flex items-center gap-1.5 text-text-muted text-[12px] font-medium">
              <Globe className="w-3.5 h-3.5" />
              <span>Linked to: {note.source_domain}</span>
            </div>
          )}

          {!isChecklist ? (
            <textarea
              data-testid="modal-textarea"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Note..."
              className="w-full bg-transparent resize-none text-[16px] leading-[24px] font-sans text-text-primary placeholder:text-text-secondary focus:outline-none min-h-[160px]"
              autoFocus
            />
          ) : (
            <div className="flex flex-col gap-2">
              <Checklist
                items={checklistItems}
                onToggleItem={(itemId, checked) => {
                  setChecklistItems((items) =>
                    items.map((i) => (i.id === itemId ? { ...i, checked } : i))
                  );
                }}
              />
              <div className="flex items-center gap-2 pt-2 border-t border-border-hairline/40">
                <input
                  type="text"
                  placeholder="List item..."
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newItemText.trim()) {
                      e.preventDefault();
                      setChecklistItems((items) => [
                        ...items,
                        {
                          id: generateUUID(),
                          text: newItemText.trim(),
                          checked: false,
                          position: items.length + 1,
                        },
                      ]);
                      setNewItemText('');
                    }
                  }}
                  className="flex-1 bg-transparent text-[14px] text-text-primary placeholder:text-text-secondary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Labels Row */}
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {labels.map((lbl) => (
                <span
                  key={lbl}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[12px] bg-canvas/60 text-text-secondary text-[11px] font-medium border border-border-hairline/60"
                >
                  #{lbl}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Toolbar */}
        <div className="px-4 py-2 border-t border-border-hairline/40 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Color Palette */}
            <button
              type="button"
              aria-label="Change note color"
              className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
              onClick={() => {
                const nextColor =
                  color === 'chalk' ? 'coral' : color === 'coral' ? 'storm' : color === 'storm' ? 'clay' : 'chalk';
                setColor(nextColor);
              }}
            >
              <Palette className="w-[18px] h-[18px] stroke-[1.75]" />
            </button>

            {/* Checklist Toggle */}
            <button
              type="button"
              aria-label="Toggle checkboxes"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:bg-icon-hover-bg ${
                isChecklist ? 'text-text-primary bg-icon-hover-bg' : 'text-icon-default'
              }`}
              onClick={() => {
                if (!isChecklist) {
                  const lines = bodyText.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0);
                  setChecklistItems(
                    lines.map((text, idx) => ({
                      id: generateUUID(),
                      text,
                      checked: false,
                      position: idx + 1,
                    }))
                  );
                  setIsChecklist(true);
                } else {
                  setBodyText(checklistItems.map((i) => i.text).join('\n'));
                  setIsChecklist(false);
                }
              }}
            >
              <CheckSquare className="w-[18px] h-[18px] stroke-[1.75]" />
            </button>

            {/* Label Button */}
            <button
              type="button"
              aria-label="Add label"
              className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
              onClick={() => {
                const newLabel = prompt('Label name:');
                if (newLabel && newLabel.trim()) {
                  setLabels([...labels, newLabel.trim().replace(/^#/, '')]);
                }
              }}
            >
              <Tag className="w-[18px] h-[18px] stroke-[1.75]" />
            </button>

            {/* Archive Button */}
            <button
              type="button"
              aria-label={isArchived ? 'Unarchive note' : 'Archive note'}
              className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
              onClick={() => {
                setIsArchived(!isArchived);
                onArchive?.(note.id, !isArchived);
              }}
            >
              <Archive className="w-[18px] h-[18px] stroke-[1.75]" />
            </button>

            {/* Delete / Trash Button */}
            <button
              type="button"
              aria-label="Delete note"
              className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
              onClick={async () => {
                await onTrash?.(note.id);
                onClose();
              }}
            >
              <Trash2 className="w-[18px] h-[18px] stroke-[1.75]" />
            </button>
          </div>

          {/* Close Button */}
          <button
            type="button"
            className="px-4 py-1.5 rounded-[4px] text-[14px] font-medium text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
            onClick={handleSaveAndClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
