'use client';

import React, { useState, useEffect } from 'react';
import { normalizeUrl } from './lib/url-utils';
import { NOTE_COLORS, type NoteColorId, getNoteColorClasses } from '@/lib/constants/colors';
import type { LocalNote } from '@/lib/db/indexeddb';
import { Globe, Palette, Pin, Check } from 'lucide-react';

export function ExtensionPopup() {
  const [activeUrl, setActiveUrl] = useState('');
  const [domain, setDomain] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [color, setColor] = useState<NoteColorId>('coral'); // Priority 1 (Red) default
  const [isPinned, setIsPinned] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // In chrome extension environment, query active tab URL
    if (typeof window !== 'undefined' && 'chrome' in window && (window as unknown as { chrome: { tabs?: { query: (q: unknown) => Promise<{ url?: string }[]> } } }).chrome?.tabs) {
      (window as unknown as { chrome: { tabs: { query: (q: unknown) => Promise<{ url?: string }[]> } } }).chrome.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs) => {
          if (tabs[0]?.url) {
            const norm = normalizeUrl(tabs[0].url);
            setActiveUrl(norm.cleanUrl);
            setDomain(norm.sourceDomain);
          }
        })
        .catch(() => {});
    } else {
      // Mock for standalone / dev preview
      const norm = normalizeUrl('https://github.com/fuse/notes');
      setActiveUrl(norm.cleanUrl);
      setDomain(norm.sourceDomain);
    }
  }, []);

  const handleSave = async () => {
    if (!bodyText.trim()) return;

    const newNote: LocalNote = {
      id: typeof crypto !== 'undefined' ? crypto.randomUUID() : 'note-' + Date.now(),
      body: bodyText.trim(),
      is_checklist: false,
      checklist_items: [],
      color,
      source_url: activeUrl,
      source_domain: domain,
      url_match_scope: 'domain',
      is_pinned: isPinned,
      is_archived: false,
      is_trashed: false,
      position: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      labels: ['extension'],
    };

    // Save to storage
    if (typeof window !== 'undefined' && 'chrome' in window && (window as unknown as { chrome: { storage?: { local: { get: (k: string) => Promise<{ fuse_notes?: LocalNote[] }>; set: (d: Record<string, unknown>) => Promise<void> } } } }).chrome?.storage) {
      const storage = (window as unknown as { chrome: { storage: { local: { get: (k: string) => Promise<{ fuse_notes?: LocalNote[] }>; set: (d: Record<string, unknown>) => Promise<void> } } } }).chrome.storage.local;
      const data = await storage.get('fuse_notes');
      const notes = data.fuse_notes || [];
      notes.push(newNote);
      await storage.set({ fuse_notes: notes });
    }

    setIsSaved(true);
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.close) {
        window.close();
      }
    }, 600);
  };

  const colorStyles = getNoteColorClasses(color, false);

  return (
    <div
      data-testid="extension-popup"
      className="w-[320px] p-4 rounded-[8px] flex flex-col gap-3 font-sans select-none border transition-colors duration-150"
      style={{
        backgroundColor: colorStyles.bg,
        borderColor: colorStyles.border,
      }}
    >
      {/* Header: domain chip & pin */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[12px] bg-canvas/80 text-text-primary text-[12px] font-medium border border-border-hairline">
          <Globe className="w-3.5 h-3.5" />
          <span className="truncate max-w-[180px]">{domain || 'webpage'}</span>
        </div>

        <button
          type="button"
          aria-label={isPinned ? 'Unpin note' : 'Pin note'}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:bg-icon-hover-bg ${
            isPinned ? 'text-text-primary' : 'text-icon-default'
          }`}
          onClick={() => setIsPinned(!isPinned)}
        >
          <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Note body (Strictly NO Title input) */}
      <textarea
        data-testid="popup-textarea"
        placeholder={`Take a note on ${domain || 'this page'}...`}
        value={bodyText}
        onChange={(e) => setBodyText(e.target.value)}
        className="w-full bg-transparent resize-none text-[14px] leading-[20px] text-text-primary placeholder:text-text-secondary focus:outline-none min-h-[100px]"
        autoFocus
      />

      {/* Priority Colors: Coral (Red), Storm (Blue), Clay (Black) first */}
      <div className="flex items-center justify-between pt-2 border-t border-border-hairline/40">
        <div className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-icon-default mr-1" />
          {NOTE_COLORS.slice(0, 4).map((c) => (
            <button
              key={c.id}
              type="button"
              data-testid={`popup-color-${c.id}`}
              className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                color === c.id ? 'ring-2 ring-text-primary scale-110' : 'hover:scale-105'
              }`}
              style={{
                backgroundColor: c.light.bg,
                borderColor: c.light.border,
              }}
              title={c.name}
              onClick={() => setColor(c.id)}
            />
          ))}
        </div>

        <button
          type="button"
          data-testid="popup-save-btn"
          className="px-3 py-1 rounded-[4px] bg-text-primary text-canvas text-[13px] font-medium hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1"
          onClick={handleSave}
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5" /> Saved
            </>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </div>
  );
}

