'use client';

import React from 'react';
import type { ChecklistItem } from '@/lib/db/schema';
import { Check } from 'lucide-react';

interface ChecklistProps {
  items: ChecklistItem[];
  onToggleItem?: (itemId: string, checked: boolean) => void;
  interactive?: boolean;
}

export function Checklist({ items, onToggleItem, interactive = true }: ChecklistProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 w-full text-[14px] leading-[20px] font-body select-none">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-2.5 py-0.5 group cursor-pointer"
          onClick={(e) => {
            if (interactive && onToggleItem) {
              e.stopPropagation();
              onToggleItem(item.id, !item.checked);
            }
          }}
        >
          {/* Google Tasks style checkbox box */}
          <button
            type="button"
            className={`w-[18px] h-[18px] mt-0.5 rounded-[4px] border flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
              item.checked
                ? 'bg-[#1A73E8] border-[#1A73E8] text-white'
                : 'border-icon-default/80 hover:border-text-primary bg-transparent'
            }`}
            aria-label={item.checked ? `Unmark "${item.text}"` : `Mark "${item.text}" as completed`}
            onClick={(e) => {
              if (interactive && onToggleItem) {
                e.stopPropagation();
                onToggleItem(item.id, !item.checked);
              }
            }}
          >
            {item.checked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </button>
          <span
            className={`flex-1 break-words whitespace-pre-wrap transition-colors ${
              item.checked ? 'text-text-secondary line-through' : 'text-text-primary'
            }`}
          >
            {item.text}
          </span>
        </div>
      ))}
    </div>
  );
}
