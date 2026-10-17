import { describe, it, expect } from 'vitest';
import { filterNotes, highlightText } from '@/lib/search/search-engine';
import type { LocalNote } from '@/lib/db/indexeddb';

describe('Instant Client-Side Search Engine (Issue 11)', () => {
  const sampleNotes: LocalNote[] = [
    {
      id: '1',
      body: 'Red urgent bug note',
      is_checklist: false,
      checklist_items: [],
      color: 'coral',
      source_domain: 'github.com',
      url_match_scope: 'domain',
      is_pinned: false,
      is_archived: false,
      is_trashed: false,
      position: 1,
      created_at: '',
      updated_at: '',
      labels: ['bug', 'frontend'],
    },
    {
      id: '2',
      body: 'Blue deep work architecture note',
      is_checklist: false,
      checklist_items: [],
      color: 'storm',
      source_domain: 'notion.so',
      url_match_scope: 'domain',
      is_pinned: false,
      is_archived: false,
      is_trashed: false,
      position: 2,
      created_at: '',
      updated_at: '',
      labels: ['architecture'],
    },
    {
      id: '3',
      body: 'Grocery list',
      is_checklist: true,
      checklist_items: [
        { id: 'i1', text: 'Apples', checked: false, position: 1 },
        { id: 'i2', text: 'Oranges', checked: true, position: 2 },
      ],
      color: 'chalk',
      url_match_scope: 'domain',
      is_pinned: false,
      is_archived: false,
      is_trashed: false,
      position: 3,
      created_at: '',
      updated_at: '',
    },
  ];

  it('searches across body text and checklist items', () => {
    const bugResults = filterNotes(sampleNotes, { query: 'bug' });
    expect(bugResults).toHaveLength(1);
    expect(bugResults[0].id).toBe('1');

    const appleResults = filterNotes(sampleNotes, { query: 'apples' });
    expect(appleResults).toHaveLength(1);
    expect(appleResults[0].id).toBe('3');
  });

  it('filters by color state with priority states', () => {
    const coralResults = filterNotes(sampleNotes, { color: 'coral' });
    expect(coralResults).toHaveLength(1);
    expect(coralResults[0].id).toBe('1');

    const stormResults = filterNotes(sampleNotes, { color: 'storm' });
    expect(stormResults).toHaveLength(1);
    expect(stormResults[0].id).toBe('2');
  });

  it('filters by labels and domains', () => {
    const labelResults = filterNotes(sampleNotes, { label: 'frontend' });
    expect(labelResults).toHaveLength(1);
    expect(labelResults[0].id).toBe('1');

    const domainResults = filterNotes(sampleNotes, { domain: 'github.com' });
    expect(domainResults).toHaveLength(1);
    expect(domainResults[0].id).toBe('1');
  });

  it('filters by note type (checklist vs text)', () => {
    const checklistResults = filterNotes(sampleNotes, { type: 'checklist' });
    expect(checklistResults).toHaveLength(1);
    expect(checklistResults[0].id).toBe('3');

    const textResults = filterNotes(sampleNotes, { type: 'text' });
    expect(textResults).toHaveLength(2);
  });

  it('calculates highlight segments with matched flags', () => {
    const segments = highlightText('Fix bug in auth service', 'bug');
    expect(segments).toEqual([
      { text: 'Fix ', isMatch: false },
      { text: 'bug', isMatch: true },
      { text: ' in auth service', isMatch: false },
    ]);
  });
});
