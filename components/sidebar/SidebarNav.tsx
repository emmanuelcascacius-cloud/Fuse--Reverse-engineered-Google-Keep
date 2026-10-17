'use client';

import React from 'react';
import {
  Lightbulb,
  Tag,
  Archive,
  Trash2,
  Edit2,
} from 'lucide-react';

export type NavView = 'notes' | 'archive' | 'trash';

interface SidebarNavProps {
  currentView: NavView;
  selectedLabel: string | null;
  labels: string[];
  onSelectView: (view: NavView) => void;
  onSelectLabel: (label: string | null) => void;
  onOpenEditLabels: () => void;
  isOpen?: boolean;
}

export function SidebarNav({
  currentView,
  selectedLabel,
  labels,
  onSelectView,
  onSelectLabel,
  onOpenEditLabels,
  isOpen = true,
}: SidebarNavProps) {
  const isNotesActive = currentView === 'notes' && selectedLabel === null;
  const isArchiveActive = currentView === 'archive';
  const isTrashActive = currentView === 'trash';

  return (
    <aside
      data-testid="sidebar-nav"
      className={`h-[calc(100vh-64px)] w-[280px] flex-shrink-0 flex flex-col justify-between p-3 select-none transition-all duration-200 overflow-y-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="flex flex-col gap-1">
        {/* Notes Feed Button */}
        <button
          type="button"
          data-testid="nav-notes"
          className={`flex items-center gap-4 px-4 py-2.5 rounded-r-full font-medium text-[14px] transition-colors cursor-pointer text-left ${
            isNotesActive
              ? 'bg-sidebar-active text-text-primary font-semibold'
              : 'text-text-primary hover:bg-icon-hover-bg'
          }`}
          onClick={() => {
            onSelectView('notes');
            onSelectLabel(null);
          }}
        >
          <Lightbulb className="w-5 h-5 flex-shrink-0 stroke-[1.75]" />
          <span>Notes</span>
        </button>

        {/* Labels Section */}
        {labels.map((label) => {
          const isLabelActive = currentView === 'notes' && selectedLabel === label;
          return (
            <button
              key={label}
              type="button"
              data-testid={`nav-label-${label}`}
              className={`flex items-center gap-4 px-4 py-2.5 rounded-r-full font-medium text-[14px] transition-colors cursor-pointer text-left ${
                isLabelActive
                  ? 'bg-sidebar-active text-text-primary font-semibold'
                  : 'text-text-primary hover:bg-icon-hover-bg'
              }`}
              onClick={() => {
                onSelectView('notes');
                onSelectLabel(label);
              }}
            >
              <Tag className="w-5 h-5 flex-shrink-0 stroke-[1.75]" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}

        {/* Edit Labels Button */}
        <button
          type="button"
          data-testid="nav-edit-labels"
          className="flex items-center gap-4 px-4 py-2.5 rounded-r-full font-medium text-[14px] text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer text-left"
          onClick={onOpenEditLabels}
        >
          <Edit2 className="w-5 h-5 flex-shrink-0 stroke-[1.75]" />
          <span>Edit labels</span>
        </button>

        {/* Archive Button */}
        <button
          type="button"
          data-testid="nav-archive"
          className={`flex items-center gap-4 px-4 py-2.5 rounded-r-full font-medium text-[14px] transition-colors cursor-pointer text-left ${
            isArchiveActive
              ? 'bg-sidebar-active text-text-primary font-semibold'
              : 'text-text-primary hover:bg-icon-hover-bg'
          }`}
          onClick={() => {
            onSelectView('archive');
            onSelectLabel(null);
          }}
        >
          <Archive className="w-5 h-5 flex-shrink-0 stroke-[1.75]" />
          <span>Archive</span>
        </button>

        {/* Trash Button */}
        <button
          type="button"
          data-testid="nav-trash"
          className={`flex items-center gap-4 px-4 py-2.5 rounded-r-full font-medium text-[14px] transition-colors cursor-pointer text-left ${
            isTrashActive
              ? 'bg-sidebar-active text-text-primary font-semibold'
              : 'text-text-primary hover:bg-icon-hover-bg'
          }`}
          onClick={() => {
            onSelectView('trash');
            onSelectLabel(null);
          }}
        >
          <Trash2 className="w-5 h-5 flex-shrink-0 stroke-[1.75]" />
          <span>Trash</span>
        </button>
      </div>
    </aside>
  );
}

