-- ============================================================
-- SmartSeason Field Monitoring System — Database Schema
-- ============================================================

-- Enum types
CREATE TYPE user_role AS ENUM ('admin', 'agent');
CREATE TYPE field_stage AS ENUM ('Planted', 'Growing', 'Ready', 'Harvested');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       user_role NOT NULL DEFAULT 'agent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fields table
CREATE TABLE IF NOT EXISTS fields (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(200) NOT NULL,
  crop_type         VARCHAR(100) NOT NULL,
  planting_date     DATE NOT NULL,
  stage             field_stage NOT NULL DEFAULT 'Planted',
  assigned_agent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Field updates / observations table
CREATE TABLE IF NOT EXISTS field_updates (
  id         SERIAL PRIMARY KEY,
  field_id   INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  agent_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  new_stage  field_stage,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
