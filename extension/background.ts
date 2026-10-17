import { normalizeUrl } from './lib/url-utils';
import type { LocalNote } from '@/lib/db/indexeddb';

// Chrome extension background service worker
declare const chrome: {
  runtime: {
    onInstalled: { addListener: (cb: () => void) => void };
    onMessage: {
      addListener: (
        cb: (message: unknown, sender: unknown, sendResponse: (res: unknown) => void) => void
      ) => void;
    };
  };
  contextMenus: {
    create: (props: { id: string; title: string; contexts: string[] }) => void;
    onClicked: {
      addListener: (
        cb: (info: { selectionText?: string; pageUrl?: string; menuItemId: string }) => void
      ) => void;
    };
  };
  tabs: {
    onUpdated: {
      addListener: (
        cb: (tabId: number, changeInfo: { status?: string; url?: string }, tab: { url?: string }) => void
      ) => void;
    };
    sendMessage: (tabId: number, message: unknown) => Promise<unknown>;
  };
  storage: {
    local: {
      get: (keys: string[] | string | null) => Promise<Record<string, unknown>>;
      set: (items: Record<string, unknown>) => Promise<void>;
    };
  };
};

export function setupExtensionBackground() {
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    return;
  }

  // Install Context Menu
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'fuse-save-selection',
      title: 'Save selection to Fuse',
      contexts: ['selection'],
    });
  });

  // Handle Context Menu clicks
  chrome.contextMenus.onClicked.addListener(async (info) => {
    if (info.menuItemId === 'fuse-save-selection' && info.selectionText) {
      const pageUrl = info.pageUrl || '';
      const { sourceDomain, cleanUrl } = normalizeUrl(pageUrl);

      const newClip: LocalNote = {
        id: typeof crypto !== 'undefined' ? crypto.randomUUID() : 'clip-' + Date.now(),
        body: info.selectionText,
        is_checklist: false,
        checklist_items: [],
        color: 'coral', // Default to Red (Serious/Action) for direct clips
        source_url: cleanUrl,
        source_domain: sourceDomain,
        url_match_scope: 'domain',
        is_pinned: false,
        is_archived: false,
        is_trashed: false,
        position: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        labels: ['clipped'],
      };

      // Store in chrome.storage.local
      const existing = (await chrome.storage.local.get('fuse_notes')) as {
        fuse_notes?: LocalNote[];
      };
      const notesList = existing.fuse_notes || [];
      notesList.push(newClip);
      await chrome.storage.local.set({ fuse_notes: notesList });
    }
  });

  // Active Tab URL Listener: triggers proactive overlay
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      const { sourceDomain } = normalizeUrl(tab.url);

      const data = (await chrome.storage.local.get('fuse_notes')) as {
        fuse_notes?: LocalNote[];
      };
      const allNotes = data.fuse_notes || [];

      const domainNotes = allNotes.filter(
        (n) =>
          !n.is_archived &&
          !n.is_trashed &&
          !n.deleted_at &&
          n.source_domain?.toLowerCase() === sourceDomain.toLowerCase()
      );

      if (domainNotes.length > 0) {
        // Send proactive message to content script
        try {
          await chrome.tabs.sendMessage(tabId, {
            type: 'FUSE_SHOW_CONTEXTUAL_NOTES',
            domain: sourceDomain,
            notes: domainNotes,
          });
        } catch {
          // Tab may not have injected content script yet
        }
      }
    }
  });
}

// Initialize if running in service worker context
if (typeof chrome !== 'undefined' && chrome.runtime?.onInstalled) {
  setupExtensionBackground();
}

