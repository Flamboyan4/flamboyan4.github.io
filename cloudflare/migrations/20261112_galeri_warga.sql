-- Galeri Warga Flamboyan 4: idempoten. Dilakukan juga saat akses awal Worker
-- agar frontend tidak bergantung pada migrasi manual.
-- Foto lama tetap dikelola portal_documentation dan Google Drive.
CREATE TABLE IF NOT EXISTS f4_gallery_albums (
 id TEXT PRIMARY KEY,
 title TEXT NOT NULL,
 description TEXT NOT NULL DEFAULT '',
 created_by TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'aktif',
 drive_folder_id TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS f4_gallery_photos (
 id TEXT PRIMARY KEY,
 album_ref TEXT NOT NULL,
 drive_file_id TEXT NOT NULL UNIQUE,
 drive_folder_id TEXT NOT NULL,
 uploader_id TEXT NOT NULL,
 filename TEXT NOT NULL,
 caption TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'baru',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_f4_gallery_photos_album
 ON f4_gallery_photos(album_ref,status,created_at);
CREATE TABLE IF NOT EXISTS f4_gallery_reactions (
 target_type TEXT NOT NULL,
 target_id TEXT NOT NULL,
 account_id TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(target_type,target_id,account_id)
);
CREATE TABLE IF NOT EXISTS f4_gallery_comments (
 id TEXT PRIMARY KEY,
 target_type TEXT NOT NULL,
 target_id TEXT NOT NULL,
 account_id TEXT NOT NULL,
 message TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'aktif',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_f4_gallery_comments_target
 ON f4_gallery_comments(target_type,target_id,status,created_at);
CREATE TABLE IF NOT EXISTS f4_gallery_reports (
 id TEXT PRIMARY KEY,
 target_type TEXT NOT NULL,
 target_id TEXT NOT NULL,
 account_id TEXT NOT NULL,
 reason TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
