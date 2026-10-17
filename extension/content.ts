import React from 'react';
import { createRoot } from 'react-dom/client';
import { ContextualNoteOverlay } from '@/components/extension/ContextualNoteOverlay';
import type { LocalNote } from '@/lib/db/indexeddb';

// Chrome content script for Shadow DOM isolation
declare const chrome: {
  runtime: {
    onMessage: {
      addListener: (
        cb: (message: { type: string; domain: string; notes: LocalNote[] }, sender: unknown, sendResponse: () => void) => void
      ) => void;
    };
  };
};

export function injectContextualOverlay(domain: string, notes: LocalNote[]) {
  // Check if root already exists
  let hostEl = document.getElementById('fuse-contextual-root');
  if (!hostEl) {
    hostEl = document.createElement('div');
    hostEl.id = 'fuse-contextual-root';
    document.body.appendChild(hostEl);
  }

  // Attach Shadow DOM if not already attached
  let shadowRoot = hostEl.shadowRoot;
  if (!shadowRoot) {
    shadowRoot = hostEl.attachShadow({ mode: 'open' });

    // Inject isolated CSS rules
    const style = document.createElement('style');
    style.textContent = `
      :host {
        all: initial;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 2147483646;
      }
      * {
        box-sizing: border-box;
      }
    `;
    shadowRoot.appendChild(style);
  }

  // Create mount container inside shadow DOM
  let mountContainer = shadowRoot.getElementById('fuse-mount-container');
  if (!mountContainer) {
    mountContainer = document.createElement('div');
    mountContainer.id = 'fuse-mount-container';
    shadowRoot.appendChild(mountContainer);
  }

  const root = createRoot(mountContainer);
  root.render(
    React.createElement(ContextualNoteOverlay, {
      domain,
      notes,
      onDismissSession: () => {
        if (hostEl) {
          hostEl.style.display = 'none';
        }
      },
    })
  );
}

// Background service worker listener
if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'FUSE_SHOW_CONTEXTUAL_NOTES') {
      injectContextualOverlay(message.domain, message.notes);
    }
  });
}

