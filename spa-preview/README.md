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

## Tahap 4 — Form operasi Bank Sampah
Setoran, penjualan dan pengajuan pencairan menggunakan adapter asli melalui transport simulasi terisolasi tanpa fetch/penyimpanan. UI menyatakan eksplisit tidak ada transaksi disimpan. Pengesahan, kelola pembayaran, bukti dan pencetakan lengkap belum dimigrasikan. Bukan aktivasi write API.


## Pengujian browser
Di folder spa-preview: `npm install --no-package-lock`, `npx playwright install chromium firefox`, `npm run test:browser`. Tes server lokal memblokir akses eksternal dan menyimulasikan respons API. Memeriksa identitas node navbar, form, history dan nol POST eksternal. Belum merupakan uji sesi atau data produksi.


## Tahap 5 — Pengesahan dan pengelolaan pencairan
- Pengesahan: pratinjau dari endpoint POST /api/admin/reconciliation/preview yang pada sumber Worker hanya membaca dan menghitung; endpoint confirm tetap tidak dikirim ke server. Alokasi, selisih timbang, metode dan saldo hak warga memakai hasil server, validasi konfirmasi diuji melalui transport lokal.
- Pencairan pengelola: uji setujui/tolak/dibayar memakai status dan adapter asli; tidak mengubah status produksi. Form warga memperhitungkan pengajuan aktif dan menolak estimasi saldo jika daftar mencapai batas 100.
- Belum produksi: penyimpanan transaksi, cetak, CRUD dan UI asli tetap pada portal lama. Preview POST hanya boleh ke endpoint baca pengesahan; tidak boleh mengirim POST mutasi.


## Tahap 6 — Sesi bersama
Sesi, login/logout, pembaruan token dan sinkronisasi lintas tab kini menggunakan satu lifecycle. Pergantian portal tidak memanggil login ulang atau membuat ulang dock; perubahan hak akses boleh membangun kembali tombol sesuai peran. Logout/pergantian akun mengosongkan outlet, membatalkan request lama dan memverifikasi sesi sebelum membaca konten baru. Tidak menyimpan password atau token pada browser storage. Belum teruji pada API produksi; pengujian autentikasi memakai mock.


## Notifikasi bersama
Satu tombol permanen membaca tag dokumentasi, tugas Bank Sampah dan (khusus superadmin) ringkasan tugas Pusat Keuangan. Data dibatalkan dan dibersihkan saat sesi berubah. Untuk sementara membuka daftar dokumentasi, bukan viewer foto bertag spesifik, dan tugas treasury masih menggunakan portal asli. Belum mengubah status baca.


## Tahap 7 — Dokumentasi native
Portal Utama dan Bank Sampah menggunakan viewer yang sama, foto asli, daftar album, arsip yang hanya berasal dari album publik, video native dengan proxy MP4 yang sudah ada, serta komentar dan suka dari API yang sama. Bank memakai daftar media album yang difilter tag di server. Aksi suka/komentar hanya dijalankan setelah interaksi pengguna dan pemeriksaan akun; tidak ada transaksi keuangan yang diaktifkan. Upload, tag orang/program, moderasi dan pembukaan foto spesifik dari notifikasi belum dipindahkan. Tes browser menggunakan API tiruan; tidak mengirim komentar/reaksi ke server asli.


## Tahap 8 — Resi JPG
Renderer tiket asli dari `portal-live/transaction-receipts.js` digunakan kembali, dengan dialog dan object URL dikelola lifecycle route. Resi riwayat iuran dan setoran tersedia untuk ID transaksi asli dan nominal terverifikasi. Setoran estimasi tetap berstatus ESTIMASI, transaksi batal dan nominal sah yang null ditolak. Resi belum mengubah status transaksi. Cetak laporan lengkap dan resi denda/pinjaman/talangan belum dipindahkan. Perbaikan dokumentasi: fixture membaca album ID URL-encoded, dan ID foto unggahan mengikuti prefix Worker `f4photo:`.


## Tahap 9 — Form operasional Pembukuan
Input iuran, transaksi kas, pencatatan/pembayaran denda, pencatatan/angsuran pinjaman, dan talangan menggunakan adapter asli dengan simulasi write terisolasi. Validasi membaca data yang diperlukan dari API terautentikasi, tidak mengirim mutasi. Perlindungan draf berlaku pada setiap form. Belum mencakup seluruh edit, batal, rekap/setoran RT, penguncian tahun, cetak dan CRUD produksi.
