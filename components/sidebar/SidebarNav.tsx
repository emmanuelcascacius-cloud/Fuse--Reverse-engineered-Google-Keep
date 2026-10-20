'use client';

import React, { useState } from 'react';
import {
  Lightbulb,
  Tag,
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
  isOpen = false,
}: SidebarNavProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isOpen || isHovered;

  const isNotesActive = currentView === 'notes' && selectedLabel === null;
  const isTrashActive = currentView === 'trash';

  return (
    <div
      className={`flex-shrink-0 relative transition-[width] duration-200 ease-in-out ${
        isOpen ? 'w-[280px]' : 'w-[72px]'
      }`}
    >
      <aside
        data-testid="sidebar-nav"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`absolute top-0 left-0 h-[calc(100vh-64px)] z-40 bg-canvas transition-[width,box-shadow] duration-200 ease-in-out flex flex-col justify-between py-2 select-none overflow-x-hidden overflow-y-auto scrollbar-none border-r border-transparent ${
          isExpanded
            ? 'w-[280px] shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_2px_6px_2px_rgba(60,64,67,0.15)] border-border-hairline/30'
            : 'w-[72px] shadow-none'
        }`}
      >
        <div className="flex flex-col gap-1 w-full">
          {/* Notes Feed Button */}
          <button
            type="button"
            data-testid="nav-notes"
            title={!isExpanded ? 'Notes' : undefined}
            className={`h-12 flex items-center transition-all duration-200 cursor-pointer text-left ${
              isExpanded
                ? 'rounded-r-full pr-4 w-[calc(100%-8px)]'
                : 'rounded-full w-12 mx-auto justify-center'
            } ${
              isNotesActive
                ? 'bg-sidebar-active text-text-primary font-semibold'
                : 'text-text-primary hover:bg-icon-hover-bg'
            }`}
            onClick={() => {
              onSelectView('notes');
              onSelectLabel(null);
            }}
          >
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 stroke-[1.75]" />
            </div>
            <span
              className={`whitespace-nowrap overflow-hidden text-[14px] font-medium transition-all duration-150 ${
                isExpanded
                  ? 'opacity-100 max-w-[180px] ml-3'
                  : 'opacity-0 max-w-0 ml-0 pointer-events-none'
              }`}
            >
              Notes
            </span>
          </button>

          {/* Labels Section */}
          {labels.map((label) => {
            const isLabelActive = currentView === 'notes' && selectedLabel === label;
            return (
              <button
                key={label}
                type="button"
                data-testid={`nav-label-${label}`}
                title={!isExpanded ? label : undefined}
                className={`h-12 flex items-center transition-all duration-200 cursor-pointer text-left ${
                  isExpanded
                    ? 'rounded-r-full pr-4 w-[calc(100%-8px)]'
                    : 'rounded-full w-12 mx-auto justify-center'
                } ${
                  isLabelActive
                    ? 'bg-sidebar-active text-text-primary font-semibold'
                    : 'text-text-primary hover:bg-icon-hover-bg'
                }`}
                onClick={() => {
                  onSelectView('notes');
                  onSelectLabel(label);
                }}
              >
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <Tag className="w-5 h-5 stroke-[1.75]" />
                </div>
                <span
                  className={`whitespace-nowrap overflow-hidden text-[14px] font-medium transition-all duration-150 truncate ${
                    isExpanded
                      ? 'opacity-100 max-w-[180px] ml-3'
                      : 'opacity-0 max-w-0 ml-0 pointer-events-none'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}

          {/* Edit Labels Button */}
          <button
            type="button"
            data-testid="nav-edit-labels"
            title={!isExpanded ? 'Edit labels' : undefined}
            className={`h-12 flex items-center transition-all duration-200 cursor-pointer text-left text-text-primary hover:bg-icon-hover-bg ${
              isExpanded
                ? 'rounded-r-full pr-4 w-[calc(100%-8px)]'
                : 'rounded-full w-12 mx-auto justify-center'
            }`}
            onClick={onOpenEditLabels}
          >
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
              <Edit2 className="w-5 h-5 stroke-[1.75]" />
            </div>
            <span
              className={`whitespace-nowrap overflow-hidden text-[14px] font-medium transition-all duration-150 ${
                isExpanded
                  ? 'opacity-100 max-w-[180px] ml-3'
                  : 'opacity-0 max-w-0 ml-0 pointer-events-none'
              }`}
            >
              Edit labels
            </span>
          </button>

          {/* Trash Button */}
          <button
            type="button"
            data-testid="nav-trash"
            title={!isExpanded ? 'Trash' : undefined}
            className={`h-12 flex items-center transition-all duration-200 cursor-pointer text-left ${
              isExpanded
                ? 'rounded-r-full pr-4 w-[calc(100%-8px)]'
                : 'rounded-full w-12 mx-auto justify-center'
            } ${
              isTrashActive
                ? 'bg-sidebar-active text-text-primary font-semibold'
                : 'text-text-primary hover:bg-icon-hover-bg'
            }`}
            onClick={() => {
              onSelectView('trash');
              onSelectLabel(null);
            }}
          >
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 stroke-[1.75]" />
            </div>
            <span
              className={`whitespace-nowrap overflow-hidden text-[14px] font-medium transition-all duration-150 ${
                isExpanded
                  ? 'opacity-100 max-w-[180px] ml-3'
                  : 'opacity-0 max-w-0 ml-0 pointer-events-none'
              }`}
            >
              Trash
            </span>
          </button>
        </div>
      </aside>
    </div>
  );
}
