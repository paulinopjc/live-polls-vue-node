import 'dotenv/config'
import { pool } from './connection'

const schema = `
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
`

async function migrate() {
  try {
    await pool.query(schema)
    console.log('Migration complete.')
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

migrate()