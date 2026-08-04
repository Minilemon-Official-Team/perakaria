PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS site_revisions (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('working', 'published', 'archived')),
  data_json TEXT NOT NULL,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TEXT,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_site_revision_working
  ON site_revisions(status) WHERE status = 'working';

CREATE UNIQUE INDEX IF NOT EXISTS uq_site_revision_published
  ON site_revisions(status) WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_site_revision_updated
  ON site_revisions(updated_at DESC);
