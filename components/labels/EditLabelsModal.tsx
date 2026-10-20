'use client';

import React, { useState } from 'react';
import { Check, Trash2, Edit2, Plus, X } from 'lucide-react';

interface EditLabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  labels: string[];
  onCreateLabel: (name: string) => void;
  onRenameLabel: (oldName: string, newName: string) => void;
  onDeleteLabel: (name: string) => void;
}

export function EditLabelsModal({
  isOpen,
  onClose,
  labels,
  onCreateLabel,
  onRenameLabel,
  onDeleteLabel,
}: EditLabelsModalProps) {
  const [newLabelText, setNewLabelText] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    const trimmed = newLabelText.trim().replace(/^#/, '');
    if (trimmed && !labels.includes(trimmed)) {
      onCreateLabel(trimmed);
      setNewLabelText('');
    }
  };

  const handleSaveRename = (index: number) => {
    const oldName = labels[index];
    const trimmed = editingText.trim().replace(/^#/, '');
    if (trimmed && trimmed !== oldName) {
      onRenameLabel(oldName, trimmed);
    }
    setEditingIndex(null);
  };

  return (
    <div
      data-testid="edit-labels-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[1px] animate-fade-in"
      onClick={onClose}
    >
      <div
        data-testid="edit-labels-modal-content"
        className="w-full max-w-[340px] rounded-[8px] bg-canvas border border-border-hairline shadow-2xl flex flex-col overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 pb-2 flex items-center justify-between">
          <h2 className="text-[16px] font-medium text-text-primary">Edit labels</h2>
          <button
            type="button"
            aria-label="Close"
            className="w-7 h-7 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary hover:bg-icon-hover-bg transition-colors"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Create New Label Row */}
        <div className="p-3 border-b border-border-hairline/40 flex items-center gap-2">
          <button
            type="button"
            aria-label="Create label"
            className="w-7 h-7 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary cursor-pointer"
            onClick={handleCreate}
          >
            <Plus className="w-4 h-4" />
          </button>
          <input
            type="text"
            data-testid="create-label-input"
            placeholder="Create new label..."
            value={newLabelText}
            onChange={(e) => setNewLabelText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreate();
              }
            }}
            className="flex-1 bg-transparent text-[16px] sm:text-[14px] text-text-primary placeholder:text-text-secondary focus:outline-none"
          />
          {newLabelText.trim().length > 0 && (
            <button
              type="button"
              aria-label="Confirm create"
              className="w-7 h-7 rounded-full flex items-center justify-center text-icon-default hover:text-text-primary cursor-pointer"
              onClick={handleCreate}
            >
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Existing Labels List */}
        <div className="max-h-[300px] overflow-y-auto p-2 flex flex-col gap-1">
          {labels.map((label, index) => (
            <div
              key={label}
              data-testid={`label-row-${label}`}
              className="flex items-center gap-2 px-2 py-1.5 rounded-[4px] hover:bg-icon-hover-bg group transition-colors"
            >
              <button
                type="button"
                aria-label={`Delete label ${label}`}
                className="w-6 h-6 flex items-center justify-center text-icon-default hover:text-[#D93025] cursor-pointer"
                onClick={() => onDeleteLabel(label)}
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {editingIndex === index ? (
                <div className="flex-1 flex items-center gap-1">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(index);
                      if (e.key === 'Escape') setEditingIndex(null);
                    }}
                    autoFocus
                    className="flex-1 bg-transparent border-b border-text-primary text-[16px] sm:text-[14px] text-text-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Save label rename"
                    onClick={() => handleSaveRename(index)}
                    className="w-6 h-6 flex items-center justify-center text-text-primary"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <span className="flex-1 text-[14px] text-text-primary truncate font-sans">
                  {label}
                </span>
              )}

              {editingIndex !== index && (
                <button
                  type="button"
                  aria-label={`Rename label ${label}`}
                  className="w-6 h-6 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center text-icon-default hover:text-text-primary cursor-pointer transition-opacity"
                  onClick={() => {
                    setEditingIndex(index);
                    setEditingText(label);
                  }}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Done Button */}
        <div className="p-3 border-t border-border-hairline/60 flex justify-end">
          <button
            type="button"
            className="px-4 py-1.5 rounded-[4px] text-[14px] font-medium text-text-primary hover:bg-icon-hover-bg transition-colors cursor-pointer"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

