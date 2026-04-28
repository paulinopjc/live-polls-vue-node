import 'dotenv/config'
import { pool } from './connection'

async function migrate() {
  try {
    // Core tables (existing)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS polls (
        id          TEXT PRIMARY KEY,
        question    TEXT NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS poll_options (
        id          SERIAL PRIMARY KEY,
        poll_id     TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
        label       TEXT NOT NULL,
        position    INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS votes (
        id          SERIAL PRIMARY KEY,
        poll_id     TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
        option_id   INTEGER NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
        session_id  TEXT NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (poll_id, session_id)
      );

      CREATE INDEX IF NOT EXISTS idx_options_poll ON poll_options(poll_id);
      CREATE INDEX IF NOT EXISTS idx_votes_poll ON votes(poll_id);
    `)

    // Users table (new)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        name        TEXT NOT NULL,
        email       TEXT NOT NULL UNIQUE,
        role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
        google_sub  TEXT,
        is_active   BOOLEAN NOT NULL DEFAULT true,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)

    // Add user_id and status to polls (safe: IF NOT EXISTS)
    // Using DO block to handle "column already exists" gracefully
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'polls' AND column_name = 'user_id'
        ) THEN
          ALTER TABLE polls ADD COLUMN user_id INTEGER REFERENCES users(id);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'polls' AND column_name = 'status'
        ) THEN
          ALTER TABLE polls ADD COLUMN status TEXT NOT NULL DEFAULT 'approved'
            CHECK (status IN ('pending', 'approved', 'denied'));
        END IF;
      END
      $$;
    `)

    // Seed admin
    await pool.query(`
      INSERT INTO users (name, email, role)
      VALUES ('Paulino Awino', 'paulino.coderias@gmail.com', 'admin')
      ON CONFLICT (email) DO NOTHING;
    `)

    console.log('Migration complete.')
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

migrate()
