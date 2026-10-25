-- Bank Sampah photo URLs for progress records. Additive only; no historical rows touched.
CREATE TABLE IF NOT EXISTS bank_progress_photos (
  progress_id TEXT PRIMARY KEY,
  photo_url TEXT NOT NULL CHECK (photo_url LIKE 'https://%'),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (progress_id) REFERENCES progress_entries(id) ON DELETE CASCADE
);
