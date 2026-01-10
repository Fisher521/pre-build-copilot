-- ================================================
-- Pre-build Copilot Database Schema
-- Run this SQL in your Supabase SQL Editor
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. Conversations Table
-- ================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Conversation state (legacy, kept for backward compatibility)
  current_layer INT DEFAULT 1 CHECK (current_layer BETWEEN 1 AND 3),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),

  -- Evaluation Schema (JSONB) - new schema-based state management
  schema_data JSONB DEFAULT '{}',
  -- Example: { "idea": {...}, "user": {...}, "mvp": {...}, "_meta": {...} }

  -- Project info (extracted from conversation)
  project_name VARCHAR(200),
  project_description TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Migration: Add schema_data column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'schema_data'
  ) THEN
    ALTER TABLE conversations ADD COLUMN schema_data JSONB DEFAULT '{}';
  END IF;
END $$;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);

-- ================================================
-- 2. Messages Table
-- ================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

  -- Message content
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Metadata (JSON format, stores choices, etc.)
  metadata JSONB DEFAULT '{}',
  -- Example: { "type": "choices", "choices": [...], "selectedChoice": "1" }

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- ================================================
-- 3. Briefs Table
-- ================================================
CREATE TABLE IF NOT EXISTS briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

  -- Project basic info
  project_name VARCHAR(200) NOT NULL,
  project_description TEXT,

  -- Market analysis (JSONB)
  market_analysis JSONB DEFAULT '{}',
  -- Example: { "competitors": [...], "differentiators": [...] }

  -- Tech stack (JSONB)
  tech_stack JSONB DEFAULT '{}',
  -- Example: { "recommended": "Next.js + Supabase", "alternatives": [...], "reasoning": "..." }

  -- Cost estimate (JSONB)
  cost_estimate JSONB DEFAULT '{}',
  -- Example: { "development": {...}, "monthly_operating": {...} }

  -- Timeline estimate (JSONB)
  timeline_estimate JSONB DEFAULT '{}',
  -- Example: { "optimistic": 7, "normal": 14, "pessimistic": 21, "unit": "days" }

  -- Learning resources (JSONB)
  learning_resources JSONB DEFAULT '[]',
  -- Example: [{ "title": "Next.js Docs", "url": "...", "type": "documentation" }]

  -- Risks (JSONB)
  risks JSONB DEFAULT '[]',
  -- Example: [{ "type": "technical", "description": "...", "mitigation": "..." }]

  -- Full Markdown content
  markdown_content TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_briefs_conversation_id ON briefs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_briefs_created_at ON briefs(created_at DESC);

-- ================================================
-- 4. Auto-update updated_at Trigger
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to conversations
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to briefs
DROP TRIGGER IF EXISTS update_briefs_updated_at ON briefs;
CREATE TRIGGER update_briefs_updated_at
  BEFORE UPDATE ON briefs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- 5. Row Level Security (RLS) Policies
-- ================================================

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can only access their own conversations
-- For MVP without auth, allow all access
CREATE POLICY "Allow all access to conversations" ON conversations
  FOR ALL USING (true);

-- Messages: Users can access messages in their conversations
CREATE POLICY "Allow all access to messages" ON messages
  FOR ALL USING (true);

-- Briefs: Users can access briefs in their conversations
CREATE POLICY "Allow all access to briefs" ON briefs
  FOR ALL USING (true);

-- ================================================
-- Note: For production, replace the above policies with:
--
-- CREATE POLICY "Users can access own conversations" ON conversations
--   FOR ALL USING (auth.uid() = user_id);
--
-- CREATE POLICY "Users can access messages in own conversations" ON messages
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM conversations
--       WHERE conversations.id = messages.conversation_id
--       AND conversations.user_id = auth.uid()
--     )
--   );
-- ================================================
