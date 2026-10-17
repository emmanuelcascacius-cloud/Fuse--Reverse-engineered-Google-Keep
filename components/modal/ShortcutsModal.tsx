'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'c', description: 'Create a new note' },
    { key: '/', description: 'Focus global search' },
    { key: 'j / k', description: 'Navigate next / previous note' },
    { key: 'e', description: 'Archive focused or selected note(s)' },
    { key: '# or Del', description: 'Delete focused or selected note(s)' },
    { key: 'p', description: 'Pin / unpin focused or selected note(s)' },
    { key: 'Alt+1', description: 'Set Priority Red (Coral — Urgent/Serious)' },
    { key: 'Alt+2', description: 'Set Priority Blue (Storm — Active/Context)' },
    { key: 'Alt+3', description: 'Set Priority Black (Clay — Vault/Log)' },
    { key: '?', description: 'Open keyboard shortcuts' },
    { key: 'Esc', description: 'Close modal / clear selection' },
  ];

  return (
    <div
      data-testid="shortcuts-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[1px] animate-fade-in"
      onClick={onClose}
    >
      <div
        data-testid="shortcuts-modal-content"
        className="w-full max-w-[420px] rounded-[8px] bg-canvas border border-border-hairline shadow-2xl p-6 select-none flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-hairline/60 pb-3">
          <h2 className="text-[16px] font-medium text-text-primary">Keyboard shortcuts</h2>
          <button
            type="button"
            aria-label="Close"
            className="w-7 h-7 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between text-[13px] py-1 border-b border-border-hairline/20"
            >
              <span className="text-text-secondary">{sc.description}</span>
              <kbd className="px-2 py-0.5 rounded-[4px] bg-icon-hover-bg border border-border-hairline font-mono text-[11px] font-semibold text-text-primary">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

