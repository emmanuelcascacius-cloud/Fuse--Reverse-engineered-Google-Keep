import { NextResponse } from 'next/server';
import { serverStore, type SyncPushRequest } from '@/lib/sync/sync-engine';

export async function POST(request: Request) {
  try {
    const body: SyncPushRequest = await request.json();
    const mutations = body.mutations || [];
    const lastSyncedAt = body.last_synced_at;

    const appliedCount = serverStore.applyClientMutations(mutations);
    const serverDelta = serverStore.getServerDelta(lastSyncedAt);

    return NextResponse.json({
      appliedCount,
      serverMutations: serverDelta,
      server_synced_at: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process sync request', details: String(error) },
      { status: 500 }
    );
  }
}

