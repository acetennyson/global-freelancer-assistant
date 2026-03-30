-- Global Freelancer Sync — Supabase Schema
-- Run this in your Supabase SQL editor

-- Clients table (mirrors Notion data)
CREATE TABLE IF NOT EXISTS clients (
  notion_page_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  project TEXT,
  last_update TEXT,
  next_action TEXT,
  send_window TEXT DEFAULT '10:00-14:00',
  last_sync TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs (every action taken in the app)
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGSERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  action TEXT NOT NULL,  -- 'draft_generated' | 'marked_ready' | 'sent' | 'send_now' | 'failed' | 'responded' | 'unresponded'
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON activity_logs (created_at DESC);

-- Enable Realtime on activity_logs (for live feed)
ALTER TABLE activity_logs REPLICA IDENTITY FULL;

-- Draft history per client (all generated drafts)
CREATE TABLE IF NOT EXISTS draft_history (
  id BIGSERIAL PRIMARY KEY,
  notion_page_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  draft TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS draft_history_page_idx ON draft_history (notion_page_id, created_at DESC);

-- Sent history per client (only actually sent messages — used for AI context)
CREATE TABLE IF NOT EXISTS sent_history (
  id BIGSERIAL PRIMARY KEY,
  notion_page_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sent_history_page_idx ON sent_history (notion_page_id, sent_at DESC);
