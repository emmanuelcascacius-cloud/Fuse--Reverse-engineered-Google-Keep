import { describe, it, expect } from 'vitest';
import { getTableColumns } from 'drizzle-orm';
import { users, notes, labels, note_labels, note_attachments } from '@/lib/db/schema';

describe('Database Schema & Drizzle ORM Models (Issue 02)', () => {
  it('validates users table columns', () => {
    const columns = getTableColumns(users);
    expect(columns).toHaveProperty('id');
    expect(columns).toHaveProperty('email');
    expect(columns).toHaveProperty('password_hash');
    expect(columns).toHaveProperty('created_at');
  });

  it('strictly validates that notes table has NO title column', () => {
    const columns = getTableColumns(notes);
    expect(columns).not.toHaveProperty('title');
    expect('title' in columns).toBe(false);
  });

  it('validates all required note columns are present with correct properties', () => {
    const columns = getTableColumns(notes);
    
    expect(columns).toHaveProperty('id');
    expect(columns).toHaveProperty('user_id');
    expect(columns).toHaveProperty('body');
    expect(columns).toHaveProperty('is_checklist');
    expect(columns).toHaveProperty('checklist_items');
    expect(columns).toHaveProperty('color');
    expect(columns).toHaveProperty('source_url');
    expect(columns).toHaveProperty('source_domain');
    expect(columns).toHaveProperty('url_match_scope');
    expect(columns).toHaveProperty('is_pinned');
    expect(columns).toHaveProperty('is_archived');
    expect(columns).toHaveProperty('is_trashed');
    expect(columns).toHaveProperty('position');
    expect(columns).toHaveProperty('trashed_at');
    expect(columns).toHaveProperty('created_at');
    expect(columns).toHaveProperty('updated_at');
    expect(columns).toHaveProperty('deleted_at');
  });

  it('validates labels and junction table columns', () => {
    const labelCols = getTableColumns(labels);
    expect(labelCols).toHaveProperty('id');
    expect(labelCols).toHaveProperty('user_id');
    expect(labelCols).toHaveProperty('name');
    expect(labelCols).toHaveProperty('deleted_at');

    const junctionCols = getTableColumns(note_labels);
    expect(junctionCols).toHaveProperty('note_id');
    expect(junctionCols).toHaveProperty('label_id');
    expect(junctionCols).toHaveProperty('deleted_at');
  });

  it('validates attachments table schema', () => {
    const attachCols = getTableColumns(note_attachments);
    expect(attachCols).toHaveProperty('id');
    expect(attachCols).toHaveProperty('note_id');
    expect(attachCols).toHaveProperty('file_url');
    expect(attachCols).toHaveProperty('mime_type');
  });
});
