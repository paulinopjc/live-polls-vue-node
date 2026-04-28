import { beforeAll, afterEach, afterAll } from '@jest/globals'
import { pool } from '../src/db/connection'

beforeAll(async () => {
  await pool.query(`
    DROP TABLE IF EXISTS votes;
    DROP TABLE IF EXISTS poll_options;
    DROP TABLE IF EXISTS polls;

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
  `)
})

afterEach(async () => {
  await pool.query('DELETE FROM votes')
  await pool.query('DELETE FROM poll_options')
  await pool.query('DELETE FROM polls')
})

afterAll(async () => {
  await pool.end()
})