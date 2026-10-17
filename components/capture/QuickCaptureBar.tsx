'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CheckSquare, Pin, Palette, Tag, Archive } from 'lucide-react';
import type { NoteColorId } from '@/lib/constants/colors';
import { getNoteColorClasses } from '@/lib/constants/colors';
import { useTheme } from '@/components/theme/ThemeProvider';
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
}

export function QuickCaptureBar({
  onSaveNote,
  selectedColor = 'chalk',
  onColorChange,
}: QuickCaptureBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [bodyText, setBodyText] = useState('');
  const [isChecklist, setIsChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [color, setColor] = useState<NoteColorId>(selectedColor);
  const [labels, setLabels] = useState<string[]>([]);

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
        is_pinned: isPinned,
        labels,
      });
    }

    // Reset state
    setBodyText('');
    setIsChecklist(false);
    setChecklistItems([]);
    setNewItemText('');
    setIsPinned(false);
    setColor('chalk');
    setLabels([]);
    setIsExpanded(false);
  }, [bodyText, checklistItems, newItemText, isChecklist, color, isPinned, labels, onSaveNote]);

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
        handleSaveAndReset();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded, handleSaveAndReset]);

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
        /* Collapsed State: 46px height */
        <div
          className="h-[46px] px-4 flex items-center justify-between cursor-text"
          onClick={() => {
            setIsExpanded(true);
            setTimeout(() => textareaRef.current?.focus(), 50);
          }}
        >
          <span className="text-[15px] font-medium text-text-secondary">
            Take a note...
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="New checklist note"
              className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsChecklist(true);
                setIsExpanded(true);
              }}
            >
              <CheckSquare className="w-5 h-5 stroke-[1.75]" />
            </button>
          </div>
        </div>
      ) : (
        /* Expanded State: strictly NO title field */
        <div className="flex flex-col p-4 pt-3 gap-3 max-h-[60vh] overflow-y-auto">
          {/* Top Actions: Pin */}
          <div className="flex justify-end items-center">
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

          {/* Note Body or Checklist Items */}
          {!isChecklist ? (
            <textarea
              ref={textareaRef}
              data-testid="quick-capture-textarea"
              placeholder="Take a note..."
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="w-full bg-transparent resize-none text-[15px] leading-[22px] font-sans text-text-primary placeholder:text-text-secondary focus:outline-none min-h-[90px]"
              autoFocus
            />
          ) : (
            <div className="flex flex-col gap-2">
              {checklistItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-[3px] border border-icon-default" />
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const updated = [...checklistItems];
                      updated[index].text = e.target.value;
                      setChecklistItems(updated);
                    }}
                    className="flex-1 bg-transparent text-[14px] text-text-primary focus:outline-none"
                  />
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1 border-t border-border-hairline/40">
                <span className="w-4 h-4 rounded-[3px] border border-dashed border-icon-default" />
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

          {/* Bottom Toolbar */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1">
              {/* Color Button */}
              <button
                type="button"
                aria-label="Color palette"
                className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
                onClick={() => {
                  const nextColor = color === 'chalk' ? 'coral' : color === 'coral' ? 'storm' : color === 'storm' ? 'clay' : 'chalk';
                  setColor(nextColor);
                  onColorChange?.(nextColor);
                }}
              >
                <Palette className="w-[18px] h-[18px] stroke-[1.75]" />
              </button>

              {/* Checklist Toggle */}
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

              {/* Label Button */}
              <button
                type="button"
                aria-label="Add label"
                className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
                onClick={() => {
                  const label = prompt('Add label name:');
                  if (label && label.trim().length > 0) {
                    setLabels([...labels, label.trim().replace(/^#/, '')]);
                  }
                }}
              >
                <Tag className="w-[18px] h-[18px] stroke-[1.75]" />
              </button>

              {/* Archive Button */}
              <button
                type="button"
                aria-label="Archive"
                className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
              >
                <Archive className="w-[18px] h-[18px] stroke-[1.75]" />
              </button>
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
