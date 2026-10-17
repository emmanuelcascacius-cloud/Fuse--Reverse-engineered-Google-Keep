import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PostgreSQL Migration & Index Integrity (Issue 02)', () => {
  const sqlContent = fs.readFileSync(
    path.resolve(process.cwd(), 'drizzle/0000_initial_schema.sql'),
    'utf-8'
  );

  it('contains extensions for pgcrypto and pg_trgm', () => {
    expect(sqlContent).toContain('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    expect(sqlContent).toContain('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');
  });

  it('strictly ensures no title column in notes table DDL', () => {
    const notesTableMatch = sqlContent.match(/CREATE TABLE IF NOT EXISTS notes \(([\s\S]*?)\);/);
    expect(notesTableMatch).toBeTruthy();
    const tableBody = notesTableMatch ? notesTableMatch[1] : '';
    expect(tableBody).not.toMatch(/\btitle\b/i);
    expect(tableBody).toContain('body TEXT NOT NULL');
    expect(tableBody).toContain('is_checklist BOOLEAN');
    expect(tableBody).toContain('source_domain VARCHAR(255)');
  });

  it('contains required partial and trigram indexes', () => {
    expect(sqlContent).toContain('CREATE INDEX IF NOT EXISTS idx_notes_user_updated ON notes (user_id, updated_at)');
    expect(sqlContent).toContain('CREATE INDEX IF NOT EXISTS idx_notes_user_domain ON notes (user_id, source_domain)');
    expect(sqlContent).toContain('WHERE is_archived = FALSE AND is_trashed = FALSE AND deleted_at IS NULL');
    expect(sqlContent).toContain('CREATE INDEX IF NOT EXISTS idx_notes_user_color ON notes (user_id, color)');
    expect(sqlContent).toContain('WHERE is_trashed = FALSE AND deleted_at IS NULL');
    expect(sqlContent).toContain('CREATE INDEX IF NOT EXISTS idx_notes_body_trgm ON notes USING GIN (body gin_trgm_ops)');
  });
});

