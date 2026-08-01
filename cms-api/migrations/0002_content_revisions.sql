PRAGMA foreign_keys = OFF;

CREATE TABLE content_entries_v2 (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('site_settings','theme_settings','section_settings','hero','about','service','portfolio','client','contact')),
  locale TEXT NOT NULL DEFAULT 'id' CHECK (locale = 'id'),
  slug TEXT NOT NULL,
  data_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_review','published','rejected','archived')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0,1)),
  rejection_reason TEXT,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  approved_by TEXT,
  approved_at TEXT,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);
INSERT INTO content_entries_v2 SELECT * FROM content_entries;
DROP TABLE content_entries;
ALTER TABLE content_entries_v2 RENAME TO content_entries;
CREATE UNIQUE INDEX uq_content_published ON content_entries(content_type, locale, slug) WHERE status = 'published';
CREATE UNIQUE INDEX uq_content_working ON content_entries(content_type, locale, slug) WHERE status IN ('draft','pending_review','rejected');
CREATE INDEX idx_content_public ON content_entries(status, locale, is_visible, content_type, sort_order);
CREATE INDEX idx_content_owner ON content_entries(created_by, status);
PRAGMA foreign_keys = ON;