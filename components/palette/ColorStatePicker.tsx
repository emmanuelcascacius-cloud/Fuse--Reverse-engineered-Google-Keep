'use client';

import React, { useEffect, useRef } from 'react';
import { NOTE_COLORS, type NoteColorId, getNoteColor } from '@/lib/constants/colors';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Check } from 'lucide-react';

export interface ColorStatePickerProps {
  selectedColor?: NoteColorId;
  onSelectColor: (color: NoteColorId) => void;
  onClose?: () => void;
  isOpen?: boolean;
  className?: string;
}

export function ColorStatePicker({
  selectedColor = 'chalk',
  onSelectColor,
  onClose,
  isOpen = true,
  className = '',
}: ColorStatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  let isDark = false;
  try {
    const themeContext = useTheme();
    isDark = themeContext.resolvedTheme === 'dark';
  } catch {
    isDark = false;
  }

  // Row 1: Coral, Storm, Clay, Chalk, Peach, Sand
  const row1 = NOTE_COLORS.slice(0, 6);
  // Row 2: Mint, Sage, Fog, Dusk, Blossom, Earth
  const row2 = NOTE_COLORS.slice(6, 12);

  // Keyboard shortcuts: Alt+1 (coral), Alt+2 (storm), Alt+3 (clay)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        onSelectColor('coral');
      } else if (e.altKey && e.key === '2') {
        e.preventDefault();
        onSelectColor('storm');
      } else if (e.altKey && e.key === '3') {
        e.preventDefault();
        onSelectColor('clay');
      } else if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onSelectColor, onClose]);

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderSwatch = (colorDef: (typeof NOTE_COLORS)[number]) => {
    const isSelected = selectedColor === colorDef.id;
    const styles = isDark ? colorDef.dark : colorDef.light;

    return (
      <button
        key={colorDef.id}
        type="button"
        data-testid={`color-swatch-${colorDef.id}`}
        aria-label={`${colorDef.name} — ${colorDef.semanticRole}`}
        title={`${colorDef.name} — ${colorDef.semanticRole}`}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer relative ${
          isSelected
            ? 'ring-2 ring-offset-1 ring-[#1A73E8] dark:ring-[#8AB4F8]'
            : 'hover:scale-110'
        } ${
          colorDef.isPrimaryState
            ? 'ring-2 ring-inset ring-white/60 dark:ring-black/60'
            : ''
        }`}
        style={{
          backgroundColor: styles.bg,
          border: `1px solid ${styles.border}`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectColor(colorDef.id);
        }}
      >
        {isSelected && (
          <Check className="w-3.5 h-3.5 stroke-[2.5] text-text-primary" />
        )}
      </button>
    );
  };

  return (
    <div
      ref={containerRef}
      data-testid="color-state-picker-popover"
      className={`p-[8px_12px] rounded-[8px] bg-canvas border border-border-hairline shadow-lg flex flex-col gap-[6px] z-50 select-none animate-in fade-in zoom-in-95 duration-140 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Row 1: Primary States (Coral, Storm, Clay) First, followed by Chalk, Peach, Sand */}
      <div className="flex items-center gap-[6px]">{row1.map(renderSwatch)}</div>

      {/* Row 2: Secondary Palette (Mint, Sage, Fog, Dusk, Blossom, Earth) */}
      <div className="flex items-center gap-[6px]">{row2.map(renderSwatch)}</div>

      {/* Primary State Helper Legend */}
      <div className="mt-1 pt-1.5 border-t border-border-hairline/50 flex items-center justify-between text-[10px] text-text-muted px-0.5">
        <span className="flex items-center gap-1 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D93025]" /> Coral
        </span>
        <span className="flex items-center gap-1 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1A73E8]" /> Storm
        </span>
        <span className="flex items-center gap-1 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5F6368]" /> Clay
        </span>
        <span className="text-text-muted/80">Alt+1/2/3</span>
      </div>
    </div>
  );
}

export function ColorPreviewDot({ colorId }: { colorId: NoteColorId }) {
  const colorDef = getNoteColor(colorId);
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/10"
      style={{ backgroundColor: colorDef.light.bg }}
      title={colorDef.name}
    />
  );
}
