'use client';

import React, { useState } from 'react';
import {
  Lightbulb,
  Tag,
  Trash2,
  Edit2,
  X,
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
  onCloseMobile?: () => void;
}

export function SidebarNav({
  currentView,
  selectedLabel,
  labels,
  onSelectView,
  onSelectLabel,
  onOpenEditLabels,
  isOpen = false,
  onCloseMobile,
}: SidebarNavProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isOpen || isHovered;

  const isNotesActive = currentView === 'notes' && selectedLabel === null;
  const isTrashActive = currentView === 'trash';

  const handleItemSelect = (action: () => void) => {
    action();
    onCloseMobile?.();
  };

  const renderNavItems = (isMobile = false) => {
    const showExpanded = isMobile || isExpanded;
    const testIdPrefix = isMobile ? 'mobile-' : '';

    return (
      <div className="flex flex-col gap-1 w-full">
        {/* Notes Feed Button */}
        <button
          type="button"
          data-testid={`${testIdPrefix}nav-notes`}
          title={!showExpanded ? 'Notes' : undefined}
          className={`h-12 flex items-center transition-all duration-200 cursor-pointer text-left ${
            showExpanded
              ? 'rounded-r-full pr-4 w-[calc(100%-8px)]'
              : 'rounded-full w-12 mx-auto justify-center'
          } ${
            isNotesActive
              ? 'bg-sidebar-active text-text-primary font-semibold'
              : 'text-text-primary hover:bg-icon-hover-bg'
          }`}
          onClick={() =>
            handleItemSelect(() => {
              onSelectView('notes');
              onSelectLabel(null);
            })
          }
        >
          <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 stroke-[1.75]" />
          </div>
          <span
            className={`whitespace-nowrap overflow-hidden text-[14px] font-medium transition-all duration-150 ${
              showExpanded
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
              data-testid={`${testIdPrefix}nav-label-${label}`}
              title={!showExpanded ? label : undefined}
              className={`h-12 flex items-center transition-all duration-200 cursor-pointer text-left ${
                showExpanded
                  ? 'rounded-r-full pr-4 w-[calc(100%-8px)]'
                  : 'rounded-full w-12 mx-auto justify-center'
              } ${
                isLabelActive
                  ? 'bg-sidebar-active text-text-primary font-semibold'
                  : 'text-text-primary hover:bg-icon-hover-bg'
              }`}
              onClick={() =>
                handleItemSelect(() => {
                  onSelectView('notes');
                  onSelectLabel(label);
                })
              }
            >
              <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                <Tag className="w-5 h-5 stroke-[1.75]" />
              </div>
              <span
                className={`whitespace-nowrap overflow-hidden text-[14px] font-medium transition-all duration-150 truncate ${
                  showExpanded
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
          data-testid={`${testIdPrefix}nav-edit-labels`}
          title={!showExpanded ? 'Edit labels' : undefined}
          className={`h-12 flex items-center transition-all duration-200 cursor-pointer text-left text-text-primary hover:bg-icon-hover-bg ${
            showExpanded
              ? 'rounded-r-full pr-4 w-[calc(100%-8px)]'
              : 'rounded-full w-12 mx-auto justify-center'
          }`}
          onClick={() => handleItemSelect(onOpenEditLabels)}
        >
          <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
            <Edit2 className="w-5 h-5 stroke-[1.75]" />
          </div>
          <span
            className={`whitespace-nowrap overflow-hidden text-[14px] font-medium transition-all duration-150 ${
              showExpanded
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
          data-testid={`${testIdPrefix}nav-trash`}
          title={!showExpanded ? 'Trash' : undefined}
          className={`h-12 flex items-center transition-all duration-200 cursor-pointer text-left ${
            showExpanded
              ? 'rounded-r-full pr-4 w-[calc(100%-8px)]'
              : 'rounded-full w-12 mx-auto justify-center'
          } ${
            isTrashActive
              ? 'bg-sidebar-active text-text-primary font-semibold'
              : 'text-text-primary hover:bg-icon-hover-bg'
          }`}
          onClick={() =>
            handleItemSelect(() => {
              onSelectView('trash');
              onSelectLabel(null);
            })
          }
        >
          <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 stroke-[1.75]" />
          </div>
          <span
            className={`whitespace-nowrap overflow-hidden text-[14px] font-medium transition-all duration-150 ${
              showExpanded
                ? 'opacity-100 max-w-[180px] ml-3'
                : 'opacity-0 max-w-0 ml-0 pointer-events-none'
            }`}
          >
            Trash
          </span>
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Scrim (< md) */}
      {isOpen && (
        <div
          data-testid="sidebar-mobile-backdrop"
          className="fixed inset-0 z-40 bg-black/50 md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        />
      )}

      {/* Desktop Wrapper & Rail (hidden on mobile, taking 0px so mobile notes get 100% width) */}
      <div
        className={`hidden md:block flex-shrink-0 relative transition-[width] duration-200 ease-in-out ${
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
          {renderNavItems(false)}
        </aside>
      </div>

      {/* Mobile Slide-Out Drawer (< md) */}
      {isOpen && (
        <aside
          data-testid="sidebar-mobile-drawer"
          className="fixed top-0 left-0 bottom-0 z-50 w-[280px] max-w-[85vw] bg-canvas shadow-2xl flex flex-col justify-between p-3 select-none overflow-y-auto scrollbar-none transition-transform duration-250 ease-out md:hidden translate-x-0"
        >
          <div className="flex flex-col gap-2">
            {/* Mobile Drawer Header */}
            <div className="flex items-center justify-between pb-2 px-3 border-b border-border-hairline/40 mb-1">
              <span className="text-[16px] font-medium text-text-primary">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                className="w-8 h-8 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg"
                onClick={onCloseMobile}
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
            {renderNavItems(true)}
          </div>
        </aside>
      )}
    </>
  );
}
