import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/sync/sync-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json(
        { error: 'Missing domain parameter' },
        { status: 400 }
      );
    }

    const notes = serverStore.getContextNotes(domain);
    return NextResponse.json({
      domain,
      count: notes.length,
      notes,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to query context notes', details: String(error) },
      { status: 500 }
    );
  }
}

