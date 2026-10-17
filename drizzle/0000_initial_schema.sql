-- Enable UUID and Trigram extensions for fast search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Notes Table (No title column — body-only design)
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL DEFAULT '',
    is_checklist BOOLEAN NOT NULL DEFAULT FALSE,
    checklist_items JSONB DEFAULT '[]'::jsonb,
    color VARCHAR(32) NOT NULL DEFAULT 'chalk',
    source_url TEXT,
    source_domain VARCHAR(255),
    url_match_scope VARCHAR(16) NOT NULL DEFAULT 'domain',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    is_trashed BOOLEAN NOT NULL DEFAULT FALSE,
    position DOUBLE PRECISION NOT NULL DEFAULT 0,
    trashed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 3. Labels Table
CREATE TABLE IF NOT EXISTS labels (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (user_id, name)
);

-- 4. Note <-> Labels Junction Table
CREATE TABLE IF NOT EXISTS note_labels (
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    PRIMARY KEY (note_id, label_id)
);

-- 5. Attachments Table (Images / Media)
CREATE TABLE IF NOT EXISTS note_attachments (
    id UUID PRIMARY KEY,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Offline Delta Sync, Proactive Domain Lookup & Instant Search
CREATE INDEX IF NOT EXISTS idx_notes_user_updated ON notes (user_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_notes_user_domain ON notes (user_id, source_domain) WHERE is_archived = FALSE AND is_trashed = FALSE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notes_user_color ON notes (user_id, color) WHERE is_trashed = FALSE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_labels_user_updated ON labels (user_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_notes_body_trgm ON notes USING GIN (body gin_trgm_ops);
