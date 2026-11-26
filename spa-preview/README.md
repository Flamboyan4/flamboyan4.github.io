# Persistent app shell — tahap 1 (branch uji, bukan produksi)
- `index.html`: header/dock permanen dan outlet. Tanpa iframe.
- `router.js`: lifecycle mount/dispose, pembatalan permintaan lama, role guard, Back/Forward, konten lama tetap terlihat hingga modul baru siap.
- `app.js`: modul ringkasan asli dari API Cloudflare untuk Portal Utama, Bank Sampah, Pembukuan, Superadmin. Dua terakhir memerlukan sesi superadmin. Tidak melakukan transaksi atau perubahan data. Semua form operasional masih ditautkan ke portal asli. Jalankan pada origin yang diizinkan CORS/cookie; belum diuji di browser.
- Tidak mengganti portal produksi. Jangan merge sebelum modul lengkap dan pengujian browser.

Langkah migrasi: ubah script global setiap portal menjadi modul dengan lifecycle; pindahkan tampilan dan fungsi operasional tanpa mengubah validasi/endpoint; satukan session, notifikasi, profil, routing URL canonical, dan scroll restoration; uji semua role, Back/Forward, refresh, logout, transaksi tunggal dan form belum disimpan. Pastikan node header/dock identik saat berpindah portal. Baru aktifkan di main.

## Tahap 2 — Bank Sampah
Sembilan rute SPA: beranda, riwayat, laporan, pencairan, setoran, penjualan, tabungan, debit/kredit, harga barang. Modul baru memakai API baca yang ditemukan di bridge asli. Form setoran hanya menguji payload (warga aktif, katalog aktif, tanggal valid, berat dalam gram, ID canonical, request key). Tidak ada POST, penjualan/pengesahan/pencairan tetap diproses di portal asli. Daftar 300 baris ditandai bukan laporan lengkap. Saldo anggota disembunyikan default. Rute dibatasi role; router menjaga draf uji yang belum diperiksa. Tidak ada migrasi fitur produksi atau perubahan main. Uji browser/endpoint aktual belum dilakukan.