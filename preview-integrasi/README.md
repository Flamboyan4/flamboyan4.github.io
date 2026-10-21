# Flamboyan 4 — Pratinjau Integrasi
Folder ini bukan pengganti website produksi dan tidak menyentuh halaman utama GitHub Pages.
Setelah direview dan di-merge, pratinjau tersedia di https://flamboyan4.web.id/preview-integrasi/.

Semua halaman menggunakan CSS dan JS bersama: Portal Utama biru/ungu, Bank Sampah hijau, Pembukuan oranye, dan Akun biru.
Pembacaan data menggunakan API v2 Cloudflare Worker STAGING + D1, media melalui R2. Transaksi tulis tetap nonaktif.

Login lintas portal belum dapat berjalan pada domain workers.dev dengan cookie HttpOnly SameSite=Lax.
Sebelum mengaktifkan login, buat Custom Domain Worker api.flamboyan4.web.id dan set API_BASE pada assets/config.js ke https://api.flamboyan4.web.id. Pastikan CORS hanya mengizinkan origin resmi. Jangan gunakan token localStorage.

PENTING: Ini pratinjau integrasi API dasar; bukan pemindahan 51 fungsi Apps Script Bank Sampah, dan belum menggantikan fitur lengkap Pembukuan versi asli. Kode root website dan Pembukuan asli dipertahankan tanpa perubahan.
