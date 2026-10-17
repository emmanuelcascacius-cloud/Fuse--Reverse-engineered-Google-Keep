'use client';

import React, { useState } from 'react';
import type { ChecklistItem } from '@/lib/db/schema';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';

interface ChecklistProps {
  items: ChecklistItem[];
  onToggleItem?: (itemId: string, checked: boolean) => void;
  interactive?: boolean;
}

export function Checklist({ items, onToggleItem, interactive = true }: ChecklistProps) {
  const [showCompleted, setShowCompleted] = useState(false);

  const activeItems = items.filter((item) => !item.checked);
  const completedItems = items.filter((item) => item.checked);

  return (
    <div className="flex flex-col gap-1 w-full text-[14px] leading-[20px] font-body select-none">
      {/* Active Items */}
      {activeItems.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-2 py-0.5 group"
          onClick={(e) => {
            if (interactive && onToggleItem) {
              e.stopPropagation();
              onToggleItem(item.id, true);
            }
          }}
        >
          <button
            type="button"
            className="w-4 h-4 mt-0.5 rounded-[3px] border border-icon-default flex items-center justify-center hover:border-text-primary transition-colors cursor-pointer"
            aria-label={`Mark "${item.text}" as completed`}
          >
            {item.checked && <Check className="w-3 h-3 text-text-primary" />}
          </button>
          <span className="flex-1 text-text-primary break-words whitespace-pre-wrap">
            {item.text}
          </span>
        </div>
      ))}

      {/* Completed Items Section */}
      {completedItems.length > 0 && (
        <div className="mt-2 pt-1 border-t border-border-hairline/50">
          <button
            type="button"
            className="flex items-center gap-1.5 py-1 text-[12px] font-medium text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setShowCompleted(!showCompleted);
            }}
          >
            {showCompleted ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            <span>
              {completedItems.length} checked {completedItems.length === 1 ? 'item' : 'items'}
            </span>
          </button>

          {showCompleted && (
            <div className="flex flex-col gap-1 pl-1 mt-1">
              {completedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-2 py-0.5 group"
                  onClick={(e) => {
                    if (interactive && onToggleItem) {
                      e.stopPropagation();
                      onToggleItem(item.id, false);
                    }
                  }}
                >
                  <button
                    type="button"
                    className="w-4 h-4 mt-0.5 rounded-[3px] bg-icon-default/20 border border-icon-default flex items-center justify-center cursor-pointer"
                    aria-label={`Unmark "${item.text}"`}
                  >
                    <Check className="w-3 h-3 text-text-secondary" />
                  </button>
                  <span className="flex-1 text-text-secondary line-through break-words whitespace-pre-wrap">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

