# Website Operasional Flamboyan 4

**Sumber kode resmi:** branch `main` repository `Flamboyan4/flamboyan4.github.io`.

**Alamat publik:** https://flamboyan4.web.id

## Struktur utama

- `index.html`: **satu-satunya** shell navigasi dan login bersama di domain utama.
- `portal-live/index.html`: pengalihan kompatibilitas ke root, bukan salinan shell kedua.
- `portal-live/`: frontend operasional Portal Utama, Pembukuan, Bank Sampah, Rapat, Dokumentasi, Inventaris, dan Superadmin beserta aset yang digunakan langsung.
- `cloudflare/worker-terpadu-operasional-teruji.js`: API autentikasi dan operasional di Cloudflare Workers.
- `cloudflare/migrations/`: catatan skema/migrasi D1, **bukan** sumber data transaksi hidup.
- `.github/workflows/`: deployment Workers, pemeriksaan website aktif, dan regresi otomatis.
- `qa/`: skrip pemeriksaan terisolasi (bukan website uji publik).
- `docs/`: SOP dan catatan penting operasional.
- `bank-sampah/`, `banksampah/`, `pembukuan/`, `rapat/`, dan file alias terkait: penerusan URL lama yang masih mungkin disimpan warga.

## Arsitektur

- **Frontend**: GitHub Pages, kode utama di `main`.
- **API/Auth**: Cloudflare Workers melalui `api.flamboyan4.web.id`.
- **Database**: Cloudflare D1.
- **Berkas profil**: Cloudflare R2.
- **Obrolan Warga**: Firebase Realtime Database (`komentar_warga`) — **jangan pindahkan ke D1**.

## Revisi ke depan

Edit file sebenarnya di `index.html` atau `portal-live/` dan commit ke **`main`**. Jangan membuat folder `uji-integrasi`, `uji-terpadu`, atau salinan portal paralel. Gunakan `qa/` dan workflow pemeriksaan otomatis untuk regresi, tanpa membuat transaksi fiktif pada data produksi.

Jika menyunting berkas frontend yang memakai parameter `?v=`, perbarui versi referensi pada shell yang aktif agar cache browser memuat perbaikan. Jaga saldo, riwayat transaksi, D1, R2, dan Firebase tetap utuh.
