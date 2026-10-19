'use client';

import React, { useState, useEffect } from 'react';
import type { LocalNote } from '@/lib/db/indexeddb';
import { getNoteColorClasses, type NoteColorId } from '@/lib/constants/colors';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Checklist } from '@/components/notes/Checklist';
import { ColorStatePicker } from '@/components/palette/ColorStatePicker';
import { NoteLabelPopover } from '@/components/labels/NoteLabelPopover';
import {
  Pin,
  Palette,
  Trash2,
  CheckSquare,
  Globe,
  MoreVertical,
  Tag,
  Link as LinkIcon,
  X,
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
  availableLabels?: string[];
  onCreateLabel?: (name: string) => void;
}

export function NoteModal({
  note,
  isOpen,
  onClose,
  onSave,
  onTrash,
  onArchive: _onArchive,
  availableLabels = ['work', 'personal', 'urgent'],
  onCreateLabel,
}: NoteModalProps) {
  const [bodyText, setBodyText] = useState('');
  const [isChecklist, setIsChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [color, setColor] = useState<NoteColorId>('chalk');
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [labels, setLabels] = useState<string[]>([]);
  const [newItemText, setNewItemText] = useState('');

  // Popover state
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isLabelPopoverOpen, setIsLabelPopoverOpen] = useState(false);
  const [showUrlNotice, setShowUrlNotice] = useState(false);

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
      setIsColorPickerOpen(false);
      setIsMoreMenuOpen(false);
      setIsLabelPopoverOpen(false);
      setShowUrlNotice(false);
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
        if (isColorPickerOpen) {
          setIsColorPickerOpen(false);
          return;
        }
        if (isMoreMenuOpen) {
          setIsMoreMenuOpen(false);
          return;
        }
        if (isLabelPopoverOpen) {
          setIsLabelPopoverOpen(false);
          return;
        }
        handleSaveAndClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isColorPickerOpen, isMoreMenuOpen, isLabelPopoverOpen, handleSaveAndClose]);

  if (!isOpen || !note) {
    return null;
  }

  const colorStyles = getNoteColorClasses(color, isDark);

  const toggleLabel = (labelName: string) => {
    setLabels((prev) =>
      prev.includes(labelName)
        ? prev.filter((l) => l !== labelName)
        : [...prev, labelName]
    );
  };

  const createAndAttachLabel = (name: string) => {
    onCreateLabel?.(name);
    setLabels((prev) => (prev.includes(name) ? prev : [...prev, name]));
  };

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

        {/* Modal Scrollable Body (Strictly NO Title Input, scrollbar-none, NO white dividing lines) */}
        <div className="p-6 pt-5 pb-4 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col gap-3">
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
              className="w-full bg-transparent resize-none text-[16px] leading-[24px] font-sans text-text-primary placeholder:text-text-secondary focus:outline-none min-h-[160px] overflow-x-hidden scrollbar-none"
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
              <div className="flex items-center gap-2.5 py-0.5">
                <span className="w-[18px] h-[18px] rounded-[4px] border border-icon-default/40 flex-shrink-0" />
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

          {/* Attached Labels Chips with delete badge */}
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {labels.map((lbl) => (
                <span
                  key={lbl}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[12px] bg-canvas/60 text-text-secondary text-[11px] font-medium border border-border-hairline/60"
                >
                  <span>#{lbl}</span>
                  <button
                    type="button"
                    aria-label={`Remove label ${lbl}`}
                    className="hover:text-text-primary cursor-pointer"
                    onClick={() => toggleLabel(lbl)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Dummy URL notice */}
          {showUrlNotice && (
            <div className="px-3 py-1.5 rounded-[6px] bg-icon-hover-bg text-text-secondary text-[12px] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" /> URL matching scope: Domain level
              </span>
              <button
                type="button"
                className="hover:text-text-primary"
                onClick={() => setShowUrlNotice(false)}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Toolbar (NO white border-t line, NO archive) */}
        <div className="px-4 py-2 flex items-center justify-between relative">
          <div className="flex items-center gap-1">
            {/* Color Palette (opens full 12-color picker popover) */}
            <div className="relative">
              <button
                type="button"
                aria-label="Change note color"
                className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
                onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
              >
                <Palette className="w-[18px] h-[18px] stroke-[1.75]" />
              </button>

              {isColorPickerOpen && (
                <div className="absolute bottom-10 left-0 z-50">
                  <ColorStatePicker
                    selectedColor={color}
                    onSelectColor={(c) => {
                      setColor(c);
                      setIsColorPickerOpen(false);
                    }}
                    onClose={() => setIsColorPickerOpen(false)}
                  />
                </div>
              )}
            </div>

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

            {/* 3 Dots More Button (Google Keep style) */}
            <div className="relative">
              <button
                type="button"
                aria-label="More options"
                className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
                onClick={() => {
                  setIsMoreMenuOpen(!isMoreMenuOpen);
                  setIsLabelPopoverOpen(false);
                }}
              >
                <MoreVertical className="w-[18px] h-[18px] stroke-[1.75]" />
              </button>

              {/* 3 Dots Menu */}
              {isMoreMenuOpen && (
                <div
                  className="absolute bottom-10 left-0 z-50 w-40 bg-canvas rounded-[8px] border border-border-hairline shadow-xl py-1 select-none animate-in fade-in zoom-in-95 duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-text-primary hover:bg-icon-hover-bg text-left transition-colors cursor-pointer"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setIsLabelPopoverOpen(true);
                    }}
                  >
                    <Tag className="w-4 h-4 text-icon-default" />
                    <span>Add label</span>
                  </button>

                  <button
                    type="button"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-text-primary hover:bg-icon-hover-bg text-left transition-colors cursor-pointer"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setShowUrlNotice(true);
                    }}
                  >
                    <LinkIcon className="w-4 h-4 text-icon-default" />
                    <span>Add URL</span>
                  </button>
                </div>
              )}

              {/* In-context Google Keep Label Popover */}
              <NoteLabelPopover
                isOpen={isLabelPopoverOpen}
                onClose={() => setIsLabelPopoverOpen(false)}
                selectedLabels={labels}
                availableLabels={availableLabels}
                onToggleLabel={toggleLabel}
                onCreateLabel={createAndAttachLabel}
                anchorClassName="bottom-10 left-0"
              />
            </div>

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
