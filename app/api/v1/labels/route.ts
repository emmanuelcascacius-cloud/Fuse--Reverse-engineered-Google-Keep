import { NextResponse } from 'next/server';

// In-memory labels server store
const labelsSet = new Set<string>(['personal', 'work', 'ideas', 'reading']);

export async function GET() {
  return NextResponse.json({ labels: Array.from(labelsSet) });
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid label name' }, { status: 400 });
    }

    const trimmed = name.trim().replace(/^#/, '');
    labelsSet.add(trimmed);
    return NextResponse.json({ label: trimmed }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create label', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { name } = await request.json();
    if (name) {
      labelsSet.delete(name);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete label', details: String(error) }, { status: 500 });
  }
}

