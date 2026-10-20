'use client';

import { useState, useEffect } from 'react';
import type { LocalNote } from '@/lib/db/indexeddb';

export const CARD_WIDTH = 240;
export const GAP = 16;
export const CONTAINER_PADDING_X = 48; // 24px each side

export function calculateColumnCount(viewportWidth: number, sidebarWidth = 0): number {
  const availableWidth = viewportWidth - sidebarWidth - CONTAINER_PADDING_X;
  if (availableWidth <= 0) return 1;
  const count = Math.floor(availableWidth / (CARD_WIDTH + GAP));
  return Math.max(1, count);
}

// Estimate card height based on body text length, checklist items, labels, and domain chips
export function estimateCardHeight(note: LocalNote): number {
  let height = 60; // min-height base (padding + toolbar)

  if (note.is_checklist) {
    const itemCount = note.checklist_items ? note.checklist_items.length : 0;
    height += itemCount * 24 + 16;
  } else {
    const textLength = note.body ? note.body.length : 0;
    const lineBreaks = note.body ? note.body.split(/\r\n|\r|\n/).length : 1;

    if (textLength <= 35) {
      height += lineBreaks * 28 + 12;
    } else if (textLength <= 90) {
      height += lineBreaks * 24 + 16;
    } else {
      const estimatedLines = Math.min(14, Math.max(lineBreaks, Math.ceil(textLength / 35)));
      height += estimatedLines * 20 + 20;
    }
  }

  if ((note.labels && note.labels.length > 0) || note.source_domain) {
    height += 28;
  }

  height += 36; // Hover toolbar height
  return Math.min(380, Math.max(60, height));
}

// Shortest-column-first greedy bin packing
export function binPackCards(notes: LocalNote[], numColumns: number): LocalNote[][] {
  const columns: LocalNote[][] = Array.from({ length: numColumns }, () => []);
  const columnHeights = new Array(numColumns).fill(0);

  for (const note of notes) {
    // Find column with minimum current cumulative height
    let minIndex = 0;
    let minHeight = columnHeights[0];

    for (let c = 1; c < numColumns; c++) {
      if (columnHeights[c] < minHeight) {
        minHeight = columnHeights[c];
        minIndex = c;
      }
    }

    columns[minIndex].push(note);
    columnHeights[minIndex] += estimateCardHeight(note) + GAP;
  }

  return columns;
}

export function useMasonryColumns(sidebarWidth = 280) {
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    const update = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        const isMobile = width < 768;
        const effectiveSidebar = isMobile ? 0 : sidebarWidth;

        if (width < 640) {
          // Phone screens (iPhone 16, Pixel 9/10): Google Keep displays 2 columns in grid view
          setColumns(width >= 360 ? 2 : 1);
        } else {
          setColumns(calculateColumnCount(width, effectiveSidebar));
        }
      }
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [sidebarWidth]);

  return columns;
}

