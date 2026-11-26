# Persistent app shell — tahap 1 (branch uji, bukan produksi)
- `index.html`: header/dock permanen dan outlet. Tanpa iframe.
- `router.js`: lifecycle mount/dispose, pembatalan permintaan lama, role guard, Back/Forward, konten lama tetap terlihat hingga modul baru siap.
- `app.js`: modul ringkasan asli dari API Cloudflare untuk Portal Utama, Bank Sampah, Pembukuan, Superadmin. Dua terakhir memerlukan sesi superadmin. Tidak melakukan transaksi atau perubahan data. Semua form operasional masih ditautkan ke portal asli. Jalankan pada origin yang diizinkan CORS/cookie; belum diuji di browser.
- Tidak mengganti portal produksi. Jangan merge sebelum modul lengkap dan pengujian browser.

Langkah migrasi: ubah script global setiap portal menjadi modul dengan lifecycle; pindahkan tampilan dan fungsi operasional tanpa mengubah validasi/endpoint; satukan session, notifikasi, profil, routing URL canonical, dan scroll restoration; uji semua role, Back/Forward, refresh, logout, transaksi tunggal dan form belum disimpan. Pastikan node header/dock identik saat berpindah portal. Baru aktifkan di main.

## Tahap 2 — Bank Sampah
Sembilan rute SPA: beranda, riwayat, laporan, pencairan, setoran, penjualan, tabungan, debit/kredit, harga barang. Modul baru memakai API baca yang ditemukan di bridge asli. Form setoran hanya menguji payload (warga aktif, katalog aktif, tanggal valid, berat dalam gram, ID canonical, request key). Tidak ada POST, penjualan/pengesahan/pencairan tetap diproses di portal asli. Daftar 300 baris ditandai bukan laporan lengkap. Saldo anggota disembunyikan default. Rute dibatasi role; router menjaga draf uji yang belum diperiksa. Tidak ada migrasi fitur produksi atau perubahan main. Uji browser/endpoint aktual belum dilakukan.

## Tahap 3 — modul Pembukuan, Portal Utama, Superadmin, dan layanan transaksi
- 31 rute total: 9 Bank Sampah, 11 Pembukuan, 6 Portal Utama, 5 Superadmin. Baca data dari endpoint asli, bukan data contoh.
- Input superadmin tetap satu label/ikon; saat di Pembukuan membuka rute input iuran, saat di Bank Sampah membuka input setoran; di tempat lain pilihan popover. Semua navigasi dock di preview memakai router.
- `book-reader.js` mengekstrak pemetaan baca Pembukuan asli (tanpa koreksi tanggal/POST). `transactions.js` mengekstrak tiga adapter transaksi asli, dengan transport injeksi, role guard, penyimpanan request key per akun dan penulisan dinonaktifkan default. Tidak memindahkan otomatis aktivasi/reset akun. Algoritme alokasi iuran tetap mengikuti bridge asli, termasuk pemeriksaan talangan dan denda; verifikasi ulang tarif/desember terhadap API diperlukan.
- `book.js` memakai alokasi iuran asli untuk pratinjau; belum menyimpan. `community.js` menampilkan daftar dasar agenda, dokumentasi, inventaris, rapat, arisan, warga, akun, projek, dan status layanan jadwal. CRUD, media viewer, pembayaran, nota/cetak, penyuntingan dan seluruh desain asli belum mencapai parity.
- Router membatalkan rute lama, menjaga draf dan mengunci interaksi konten selama loading. Tombol dock tidak dibuat ulang saat routing. Tes logika dengan transport tiruan tidak menjalankan API produksi.
- **Belum siap deploy.** Uji browser dan staging dengan DB terisolasi, migrasi UI asli dan transaksi end-to-end tetap merupakan syarat sebelum merge. `main` tidak diubah.