-- Bank Sampah: bring over ORIGINAL Excel progress photos only if no newer photo exists.
-- Safe, idempotent and non-financial; deliberately no UPDATE or DELETE.
INSERT INTO bank_progress_photos(progress_id,photo_url)
SELECT id,'https://drive.google.com/file/d/1DcqPvQpQx_nQEPsCXlbJz-YETZ0iypep/view?usp=sharing'
FROM progress_entries WHERE title='Pembersihan & Persiapan Drop Point'
AND NOT EXISTS (SELECT 1 FROM bank_progress_photos p WHERE p.progress_id=progress_entries.id);

INSERT INTO bank_progress_photos(progress_id,photo_url)
SELECT id,'https://drive.google.com/file/d/18Rk5vlyNAu59yJGUVCf-z4dPU5KATWxv/view?usp=sharing'
FROM progress_entries WHERE title='Pembuatan Wadah Drop Point'
AND NOT EXISTS (SELECT 1 FROM bank_progress_photos p WHERE p.progress_id=progress_entries.id);

INSERT INTO bank_progress_photos(progress_id,photo_url)
SELECT id,'https://drive.google.com/file/d/1ilO6D5UVfyoEhm8M5MEggJPhEEGttJnY/view?usp=sharing'
FROM progress_entries WHERE title='Perancangan Alur Kerja dan Administrasi Bank Sampah'
AND NOT EXISTS (SELECT 1 FROM bank_progress_photos p WHERE p.progress_id=progress_entries.id);
