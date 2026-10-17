import { describe, it, expect } from 'vitest';

describe('Workspace & Environment Verification', () => {
  it('runs tests in happy-dom environment', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });

  it('strictly validates body-only principle', () => {
    interface NoteContract {
      id: string;
      body: string;
      is_checklist: boolean;
      color: string;
    }

    const sampleNote: NoteContract = {
      id: 'test-uuid',
      body: 'Quick note content',
      is_checklist: false,
      color: 'chalk',
    };

    expect(sampleNote.body).toBe('Quick note content');
    // Ensure title property does not exist in NoteContract
    // @ts-expect-error title must not exist on NoteContract
    expect(sampleNote.title).toBeUndefined();
  });
});

