'use client';

import React, { useState } from 'react';
import {
  Pin,
  Palette,
  Archive,
  Trash2,
  X,
} from 'lucide-react';
import type { NoteColorId } from '@/lib/constants/colors';
import { ColorStatePicker } from '@/components/palette/ColorStatePicker';

interface BatchActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBatchPin: () => void;
  onBatchArchive: () => void;
  onBatchDelete: () => void;
  onBatchColorChange: (color: NoteColorId) => void;
}

export function BatchActionBar({
  selectedCount,
  onClearSelection,
  onBatchPin,
  onBatchArchive,
  onBatchDelete,
  onBatchColorChange,
}: BatchActionBarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div
      data-testid="batch-action-bar"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-40 w-full max-w-[560px] h-12 rounded-[8px] bg-canvas border border-border-hairline shadow-lg px-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-140 select-none"
    >
      {/* Left: Close and count */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Clear selection"
          className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
          onClick={onClearSelection}
        >
          <X className="w-5 h-5 stroke-[2]" />
        </button>
        <span className="text-[14px] font-medium text-text-primary">
          {selectedCount} selected
        </span>
      </div>

      {/* Right: Batch Actions */}
      <div className="flex items-center gap-1 relative">
        {/* Batch Pin */}
        <button
          type="button"
          aria-label="Batch pin"
          className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
          onClick={onBatchPin}
        >
          <Pin className="w-[18px] h-[18px] stroke-[1.75]" />
        </button>

        {/* Batch Color */}
        <button
          type="button"
          aria-label="Batch change color"
          className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
          onClick={() => setShowColorPicker(!showColorPicker)}
        >
          <Palette className="w-[18px] h-[18px] stroke-[1.75]" />
        </button>

        {showColorPicker && (
          <div className="absolute top-10 right-0 z-50">
            <ColorStatePicker
              onSelectColor={(color) => {
                onBatchColorChange(color);
                setShowColorPicker(false);
              }}
              onClose={() => setShowColorPicker(false)}
            />
          </div>
        )}

        {/* Batch Archive */}
        <button
          type="button"
          aria-label="Batch archive"
          className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
          onClick={onBatchArchive}
        >
          <Archive className="w-[18px] h-[18px] stroke-[1.75]" />
        </button>

        {/* Batch Delete */}
        <button
          type="button"
          aria-label="Batch delete"
          className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
          onClick={onBatchDelete}
        >
          <Trash2 className="w-[18px] h-[18px] stroke-[1.75]" />
        </button>
      </div>
    </div>
  );
}
