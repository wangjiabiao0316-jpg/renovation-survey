-- ============================================================
-- 装修需求问卷 · 数据库建表
-- ============================================================

-- 启用 uuid 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 设计师 ──
CREATE TABLE designers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 默认设计师账号（密码需在应用层 bcrypt hash 后插入）
-- INSERT INTO designers (email, password_hash, name) VALUES ('designer@example.com', '<bcrypt_hash>', '设计师');

-- ── 客户 ──
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  designer_id UUID NOT NULL REFERENCES designers(id),
  phone TEXT NOT NULL,
  name TEXT DEFAULT '',
  password_hash TEXT,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'started', 'submitted')),
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_designer ON clients(designer_id);
CREATE INDEX idx_clients_token ON clients(token);
CREATE INDEX idx_clients_phone ON clients(phone);

-- ── 客户答案 ──
CREATE TABLE client_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  section TEXT NOT NULL,
  value_json JSONB DEFAULT 'null'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, question_key)
);

CREATE INDEX idx_answers_client ON client_answers(client_id);

-- ── 家庭成员 ──
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT '',
  age_group TEXT NOT NULL DEFAULT '',
  daily_state TEXT NOT NULL DEFAULT '',
  time_at_home TEXT NOT NULL DEFAULT '',
  activities TEXT[] DEFAULT '{}',
  special_needs TEXT DEFAULT ''
);

CREATE INDEX idx_members_client ON family_members(client_id);

-- ── 问题自定义（设计师微调问题文字、添加参考图） ──
CREATE TABLE question_customizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id TEXT NOT NULL,
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  custom_label TEXT,
  custom_hint TEXT,
  image_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (question_id, designer_id)
);

CREATE INDEX idx_customizations_designer ON question_customizations(designer_id);

-- ── Storage Bucket（需在 Supabase Dashboard 手动创建） ──
-- Bucket name: images
-- Public access: ON
-- Policy: INSERT authenticated only, SELECT public
