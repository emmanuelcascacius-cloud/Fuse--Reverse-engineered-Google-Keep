'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  CheckSquare,
  Palette,
  Check,
  MoreVertical,
  Tag,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import type { NoteColorId } from '@/lib/constants/colors';
import { getNoteColorClasses } from '@/lib/constants/colors';
import { useTheme } from '@/components/theme/ThemeProvider';
import { ColorStatePicker } from '@/components/palette/ColorStatePicker';
import { NoteLabelPopover } from '@/components/labels/NoteLabelPopover';
import type { ChecklistItem } from '@/lib/db/schema';
import { generateUUID } from '@/lib/db/notes-repo';

interface QuickCaptureBarProps {
  onSaveNote: (note: {
    body: string;
    is_checklist: boolean;
    checklist_items: ChecklistItem[];
    color: NoteColorId;
    is_pinned: boolean;
    labels: string[];
  }) => Promise<void>;
  onOpenColorPicker?: (e: React.MouseEvent) => void;
  selectedColor?: NoteColorId;
  onColorChange?: (color: NoteColorId) => void;
  availableLabels?: string[];
  onCreateLabel?: (name: string) => void;
}

export function QuickCaptureBar({
  onSaveNote,
  selectedColor = 'chalk',
  onColorChange,
  availableLabels = ['work', 'personal', 'urgent'],
  onCreateLabel,
}: QuickCaptureBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [bodyText, setBodyText] = useState('');
  const [isChecklist, setIsChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [color, setColor] = useState<NoteColorId>(selectedColor);
  const [labels, setLabels] = useState<string[]>([]);

  // Popover state
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isLabelPopoverOpen, setIsLabelPopoverOpen] = useState(false);
  const [showUrlNotice, setShowUrlNotice] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  let isDark = false;
  try {
    const themeContext = useTheme();
    isDark = themeContext.resolvedTheme === 'dark';
  } catch {
    isDark = false;
  }

  const colorStyles = getNoteColorClasses(color, isDark);

  // Sync color with prop if provided
  useEffect(() => {
    setColor(selectedColor);
  }, [selectedColor]);

  // Handle implicit auto-save
  const handleSaveAndReset = React.useCallback(async () => {
    const hasBodyText = bodyText.trim().length > 0;
    const hasChecklistContent =
      checklistItems.some((item) => item.text.trim().length > 0) ||
      newItemText.trim().length > 0;

    const finalItems = [...checklistItems];
    if (newItemText.trim().length > 0) {
      finalItems.push({
        id: generateUUID(),
        text: newItemText.trim(),
        checked: false,
        position: finalItems.length + 1,
      });
    }

    if (hasBodyText || (isChecklist && hasChecklistContent)) {
      await onSaveNote({
        body: isChecklist ? finalItems.map((i) => i.text).join('\n') : bodyText.trim(),
        is_checklist: isChecklist,
        checklist_items: finalItems,
        color,
        is_pinned: false,
        labels,
      });
    }

    // Reset state
    setBodyText('');
    setIsChecklist(false);
    setChecklistItems([]);
    setNewItemText('');
    setColor('chalk');
    setLabels([]);
    setIsColorPickerOpen(false);
    setIsMoreMenuOpen(false);
    setIsLabelPopoverOpen(false);
    setShowUrlNotice(false);
    setIsExpanded(false);
  }, [bodyText, checklistItems, newItemText, isChecklist, color, labels, onSaveNote]);

  // Click-outside listener for implicit auto-save
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleSaveAndReset();
      }
    };

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
        handleSaveAndReset();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded, isColorPickerOpen, isMoreMenuOpen, isLabelPopoverOpen, handleSaveAndReset]);

  // Convert freeform text <-> checklist
  const toggleChecklistMode = () => {
    if (!isChecklist) {
      const lines = bodyText.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0);
      const items: ChecklistItem[] = lines.map((line, idx) => ({
        id: generateUUID(),
        text: line,
        checked: false,
        position: idx + 1,
      }));
      setChecklistItems(items);
      setIsChecklist(true);
    } else {
      const text = checklistItems.map((item) => item.text).join('\n');
      setBodyText(text);
      setIsChecklist(false);
    }
  };

  const handleAddChecklistItem = () => {
    if (newItemText.trim().length === 0) return;
    const newItem: ChecklistItem = {
      id: generateUUID(),
      text: newItemText.trim(),
      checked: false,
      position: checklistItems.length + 1,
    };
    setChecklistItems([...checklistItems, newItem]);
    setNewItemText('');
  };

  const handleToggleCheckItem = (id: string) => {
    setChecklistItems((items) =>
      items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  };

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
      ref={containerRef}
      data-testid="quick-capture-bar"
      className="w-full max-w-[600px] mx-auto my-6 rounded-[8px] border transition-all duration-200 select-none shadow-capture relative overflow-hidden"
      style={{
        backgroundColor: colorStyles.bg,
        borderColor: colorStyles.border,
      }}
    >
      {!isExpanded ? (
        /* Collapsed State: 46px height with clean "Take a note..." */
        <div
          className="h-[46px] px-4 flex items-center cursor-text"
          onClick={() => {
            setIsExpanded(true);
            setTimeout(() => textareaRef.current?.focus(), 50);
          }}
        >
          <span className="text-[15px] font-medium text-text-secondary">
            Take a note...
          </span>
        </div>
      ) : (
        /* Expanded State: strictly NO title field, NO top pin */
        <div className="flex flex-col p-4 pt-3 gap-3 max-h-[60vh] overflow-y-auto scrollbar-none">
          {/* Note Body or Google Tasks-Style Checklist */}
          {!isChecklist ? (
            <textarea
              ref={textareaRef}
              data-testid="quick-capture-textarea"
              placeholder="Take a note..."
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="w-full bg-transparent resize-none text-[15px] leading-[22px] font-sans text-text-primary placeholder:text-text-secondary focus:outline-none min-h-[90px] overflow-x-hidden scrollbar-none"
              autoFocus
            />
          ) : (
            <div className="flex flex-col gap-2">
              {checklistItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2 py-0.5">
                  {/* Google Tasks style clickable checkbox box */}
                  <button
                    type="button"
                    aria-label={item.checked ? 'Mark item as incomplete' : 'Mark item as completed'}
                    className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
                      item.checked
                        ? 'bg-[#1A73E8] border-[#1A73E8] text-white'
                        : 'border-icon-default hover:border-text-primary bg-transparent'
                    }`}
                    onClick={() => handleToggleCheckItem(item.id)}
                  >
                    {item.checked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const updated = [...checklistItems];
                      updated[index].text = e.target.value;
                      setChecklistItems(updated);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const nextId = generateUUID();
                        const updated = [...checklistItems];
                        updated.splice(index + 1, 0, {
                          id: nextId,
                          text: '',
                          checked: false,
                          position: index + 2,
                        });
                        setChecklistItems(updated);
                      } else if (e.key === 'Backspace' && item.text === '' && checklistItems.length > 1) {
                        e.preventDefault();
                        setChecklistItems(checklistItems.filter((_, i) => i !== index));
                      }
                    }}
                    className={`flex-1 bg-transparent text-[14px] focus:outline-none transition-colors ${
                      item.checked ? 'line-through text-text-secondary' : 'text-text-primary'
                    }`}
                  />
                </div>
              ))}

              {/* Seamless new item input without separator line */}
              <div className="flex items-center gap-2 py-0.5">
                <span className="w-[18px] h-[18px] rounded-[4px] border border-icon-default/40 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="List item..."
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                  className="flex-1 bg-transparent text-[14px] text-text-primary placeholder:text-text-secondary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Attached Labels Chips */}
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
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

          {/* Bottom Toolbar */}
          <div className="flex items-center justify-between pt-2 relative">
            <div className="flex items-center gap-1">
              {/* Color Button with full 12-color picker popover */}
              <div className="relative">
                <button
                  type="button"
                  aria-label="Color palette"
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
                        onColorChange?.(c);
                      }}
                      onClose={() => setIsColorPickerOpen(false)}
                    />
                  </div>
                )}
              </div>

              {/* Checklist Toggle — Kept in bottom toolbar */}
              <button
                type="button"
                aria-label="Toggle checklist mode"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:bg-icon-hover-bg ${
                  isChecklist ? 'text-text-primary bg-icon-hover-bg' : 'text-icon-default'
                }`}
                onClick={toggleChecklistMode}
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
            </div>

            {/* Close Button (commits implicit auto-save) */}
            <button
              type="button"
              className="px-4 py-1.5 rounded-[4px] text-[14px] font-medium text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
              onClick={handleSaveAndReset}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
