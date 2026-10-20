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
  const [isClosing, setIsClosing] = useState(false);

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
      setIsClosing(false);
      setIsColorPickerOpen(false);
      setIsMoreMenuOpen(false);
      setIsLabelPopoverOpen(false);
      setShowUrlNotice(false);
    }
  }, [note]);

  // Implicit auto-save on close with Google Keep compression physics
  const handleSaveAndClose = React.useCallback(async () => {
    if (!note) {
      onClose();
      return;
    }

    setIsClosing(true);

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

    // Trigger save asynchronously in background so DB write doesn't stutter the animation
    const savePromise = onSave(note.id, {
      body: finalBody,
      is_checklist: isChecklist,
      checklist_items: finalItems,
      color,
      is_pinned: isPinned,
      is_archived: isArchived,
      labels,
    }).catch(console.error);

    // Wait for the smooth compression animation before unmounting
    setTimeout(async () => {
      await savePromise;
      setIsClosing(false);
      onClose();
    }, 180);
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
      className={`fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 ${
        isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
      }`}
      onClick={handleSaveAndClose}
    >
      <div
        data-testid="note-modal-content"
        className={`w-full h-full sm:h-auto sm:max-w-[600px] sm:max-h-[85vh] rounded-none sm:rounded-[8px] border-0 sm:border shadow-2xl flex flex-col relative ${
          isClosing ? 'animate-keep-collapse' : 'animate-keep-expand'
        }`}
        style={{
          backgroundColor: colorStyles.bg,
          borderColor: colorStyles.border,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Pin Button */}
        <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] sm:top-3 right-3 flex items-center gap-1 z-10">
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
        <div className="p-4 sm:p-6 pt-[max(1.25rem,env(safe-area-inset-top))] sm:pt-5 pb-3 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col gap-3">
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
                  className="flex-1 bg-transparent text-[16px] sm:text-[14px] text-text-primary placeholder:text-text-secondary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Attached Labels Chips (Google Keep aesthetic: clean rounded pill, no hash, no X, black outline for high contrast on color) */}
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {labels.map((lbl) => (
                <span
                  key={lbl}
                  className="inline-flex items-center px-3 py-1 rounded-[14px] bg-black/[0.05] text-text-primary text-[12px] font-medium leading-[16px] border border-black/50 select-none"
                >
                  {lbl}
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

        {/* Bottom Toolbar (NO white border-t line, NO archive, overflow-visible for clean popovers) */}
        <div className="px-4 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-2 flex items-center justify-between relative overflow-visible z-20">
          <div className="flex items-center gap-1">
            {/* Color Palette (opens full 12-color picker popover floating UPWARDS) */}
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
                <div className="absolute bottom-full mb-2 left-0 z-50">
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

              {/* 3 Dots Menu — Floating cleanly above toolbar */}
              {isMoreMenuOpen && (
                <div
                  className="absolute bottom-full mb-2 left-0 z-50 w-44 bg-canvas rounded-[8px] border border-border-hairline shadow-2xl py-1 select-none animate-in fade-in zoom-in-95 duration-100"
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

              {/* In-context Google Keep Label Popover — Floating cleanly above toolbar, zero slopping */}
              <NoteLabelPopover
                isOpen={isLabelPopoverOpen}
                onClose={() => setIsLabelPopoverOpen(false)}
                selectedLabels={labels}
                availableLabels={availableLabels}
                onToggleLabel={toggleLabel}
                onCreateLabel={createAndAttachLabel}
                anchorClassName="bottom-full mb-2 left-0"
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
