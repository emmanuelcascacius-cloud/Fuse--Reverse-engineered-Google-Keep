import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/sync/sync-engine';
import type { LocalNote } from '@/lib/db/indexeddb';

export async function GET() {
  const notes = serverStore.getAllNotes().filter((n) => !n.is_trashed && !n.deleted_at);
  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  try {
    const body: Partial<LocalNote> = await request.json();

    // STRICT VALIDATION: ensure no title field
    if ('title' in body) {
      return NextResponse.json(
        { error: 'Invalid payload: Notes have no title column in Fuse' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newNote: LocalNote = {
      id: body.id || (typeof crypto !== 'undefined' ? crypto.randomUUID() : 'note-' + Date.now()),
      body: body.body || '',
      is_checklist: body.is_checklist || false,
      checklist_items: body.checklist_items || [],
      color: body.color || 'chalk',
      source_url: body.source_url || null,
      source_domain: body.source_domain || null,
      url_match_scope: body.url_match_scope || 'domain',
      is_pinned: body.is_pinned || false,
      is_archived: body.is_archived || false,
      is_trashed: false,
      position: body.position || Date.now(),
      created_at: now,
      updated_at: now,
      deleted_at: null,
      labels: body.labels || [],
    };

    serverStore.applyClientMutations([
      {
        entity_type: 'note',
        entity_id: newNote.id,
        operation: 'CREATE',
        payload: newNote as unknown as Record<string, unknown>,
        created_at: now,
      },
    ]);

    return NextResponse.json({ note: newNote }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create note', details: String(error) },
      { status: 500 }
    );
  }
}

