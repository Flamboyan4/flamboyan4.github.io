# UJI TERPADU 3 PORTAL — PRATINJAU ANTARMUKA ASLI (TANPA DATABASE)

URL uji: https://flamboyan4.web.id/uji-terpadu/

## Tujuan

Membuktikan struktur dan tampilan tiga website ASLI yang sudah dibangun.
Ini BUKAN migrasi ulang frontend, BUKAN penggantian desain dan BUKAN pengaktifan API.
Semua halaman disimpan terpisah di /uji-terpadu/. Website aktif pada /, /pembukuan/, /banksampah/ tidak diubah.

## Berkas dan sumber asli

- /uji-terpadu/portal/index.html = salinan GitHub main/index.html, hanya disisipkan shim pratinjau dan CSP.
- /uji-terpadu/pembukuan/index.html = salinan GitHub main/pembukuan/index.html versi Build v6.24.0, hanya disisipkan shim pratinjau dan pemutus JSONP lama.
- /uji-terpadu/bank-sampah/index.html = arsip asli Apps Script PortalAkun_v32.html dari Library; tidak direka bentuk ulang. Perlu konfirmasi bahwa v32 adalah versi aplikasi yang terakhir aktif.
- /uji-terpadu/index.html = navigasi luar terpadu, simulasi satu identitas dan peran.

## Struktur terjaga (bukan menu tiruan)

Portal Utama: beranda, informasi kas, arisan, rencana kegiatan, proyek & pembangunan, inventaris, dokumentasi/galeri, notulen/rapat, jersey, kalender, komentar warga, dan saran.

Pembukuan: Input Iuran termasuk pelunasan kekurangan Kas Lorong; Debit/Kredit; Buku Kas (batch); Pinjaman, Talangan, Denda, Import Bulk; Riwayat Iuran/Kas/Batch/Talangan/Denda/Pinjaman; Laporan Kas/Setoran RT/Arisan/Denda/Talangan/Pinjaman/Tutup Buku & Arsip; Ringkasan/Data Rumah/Data Warga/Tarif dan Aturan; cetak, edit, batal dari kode asli.

Bank Sampah: portal publik dan dashboard akun warga/admin; master barang dan tarif; setoran dan riwayat; penjualan; rekonsiliasi dan pengesahan; tabungan/pencairan; kas dan pengeluaran; inventaris; kegiatan/progress, dokumentasi album/foto/video; laporan publik/admin dan cetak; pengelolaan akun dan profil. Modul tambahan pada v32 muncul melalui JavaScript asli sesudah halaman dimuat.

## Simulasi akses (tidak terhubung login)

- Pengunjung: Portal Utama dan Bank Sampah publik.
- Warga: Portal Utama dan Bank Sampah sebagai Warga.
- Admin Bank Sampah: Portal Utama dan Bank Sampah sebagai Admin.
- Superadmin: seluruh portal termasuk Pembukuan.
- Semua akses ini hanyalah **mock untuk pratinjau**. Kode autentikasi nyata D1/Worker tidak diuji.

## Jaminan keamanan preview

- CSP memblokir koneksi network data (connect-src none), pengiriman form (form-action none), dan script JSONP ke Apps Script.
- Pembukuan memotong jembatan JSONP lama dan memakai jawaban contoh lokal.
- Bank Sampah memotong `call(name,...args)` ke `google.script.run` dan memakai jawaban contoh lokal.
- Portal Utama memakai pengganti Firebase/CSV agar tidak meminta data asli.
- fetch POST disimulasikan gagal. Tidak ada pembayaran, penyimpanan, hapus, arsip, atau pengesahan yang dijalankan.
- Gambar statis, CDN library tampilan, atau tautan luar dapat memerlukan koneksi internet biasa; **tidak** untuk membaca database.

## Batasan yang jujur

- Belum diuji di browser jarak jauh; verifikasi awal hanya keberadaan semua berkas dan pemeriksaan sintaks adapter.
- Jumlah kartu/tabel dan contoh nama/nilai **BUKAN data warga asli**.
- Grafik dan laporan yang membutuhkan backend mungkin kosong/tampil pesan tidak tersedia.
- Fitur simpan/hapus/cetak/transaksi backend **belum diuji fungsional**, walaupun struktur aslinya ada.
- Portal Bank Sampah memakai arsip v32; belum terbukti sama persis dengan Apps Script yang sekarang berjalan.
- Ini pemeriksaan struktur dan tampilan, bukan bukti kesetaraan data ataupun cutover Cloudflare.

## Rencana setelah persetujuan struktur

Jika tampilan asli dan struktur di atas disetujui, jangan bangun ulang frontend.
Pertahankan ketiga sumber aslinya; ubah hanya pemanggilan data:
- Portal Utama: CSV/Firebase/Apps Script => Workers API
- Pembukuan: JSONP/Apps Script => Workers API
- Bank Sampah: google.script.run => Workers API
- Backend baru memakai D1 dan R2 sesuai desain hybrid, login terpusat dan hak akses nyata.

## Kesepakatan desain lintas percakapan (wajib dipertahankan)

- **Login terpusat**: sebelum login tampil tombol Login yang jelas di **top utility bar kanan atas**, sesudah login satu avatar foto bulat ~40–44px (R2 saat operasional). Klik avatar membuka `Akun Saya`, `Pengaturan Profil`, `Keluar`; tidak ada akun/menu profil duplikat di sidebar.
- **Nav antarportal** menggunakan ikon ringkas dengan judul aksesibel (Portal Utama/Bank Sampah/Pembukuan). Tidak membuat menu tambahan bertele-tele.
- **Hak akses**: Publik melihat konten publik; Warga/Anggota melihat data dan tabungan miliknya dan mengatur profil/password; Admin Bank Sampah mengelola portal Bank Sampah; Superadmin dapat mengelola tiga portal termasuk Pembukuan. Hak akses server nyata **belum diuji** pada versi preview offline.
- **Bank Sampah**: mode publik, anggota, dan admin mempunyai menu & konten berbeda. Akun hanya ada di kanan atas pada shell terpadu.
- **Kalender**: kontrol tanggal/tanggal laporan konsisten menggunakan kalender custom bernuansa ungu. Pada preview ditambahkan `calendar-unified.js` untuk input asli bertipe date/month tanpa menyentuh situs aktif.
- **Portal Utama**: Jadwal Arisan dan Proyek & Pembangunan (Bank Sampah, Gapura, Pemesanan Jersey) adalah bagian wajib. Harus memakai kartu asli yang telah dibangun, bukan direkonstruksi. Pada offline preview baris contoh disuplai oleh `offline-portal.js`; jangan mengaku terhubung live.
- **Portal Utama**: pertahankan kesederhanaan, tidak menambah hero section. Warna arah biru-ungu lembut, tidak terlalu cerah maupun navy gelap.
- **Migrasi sebenarnya**: ganti hanya database & backend serta integrasi lintasportal, bukan redesign. Staging API/D1/R2/Worker yang sudah ada dipertahankan, jangan migrasi ulang data.

## Pembaruan pratinjau setelah feedback 22 Oktober

- URL langsung `/uji-terpadu/pembukuan/`, `/uji-terpadu/portal/`, atau `/uji-terpadu/bank-sampah/` kini diarahkan ke shell bersama agar menu akun terpusat tidak hilang.
- Akun simulasi dipilih melalui tombol Login di kanan atas; sesudah masuk tampil avatar 44px dan menu akun. Ini hanya **mock** tanpa kredensial/database; avatar masih placeholder, bukan foto R2.
- Pembukuan dan Bank Sampah menggunakan satu adapter kalender custom untuk input date/month. Belum dibuktikan kesetaraan sempurna dengan seluruh widget tanggal legacy.
- Portal Utama mempunyai data Arisan dan Proyek/Progres contoh. Riwayat/keuangan tetap tidak diambil dari sumber asli; jangan jadikan contoh sebagai saldo atau data definitif.
- Tidak ada perubahan database atau website produksi. Pemeriksaan ini tetap uji struktur, belum uji fungsional Worker/DB.

## Koreksi final UI dari screenshot pengguna (22 Oktober, sore)

- Referensi visual: Magnific — hanya **satu utility bar kecil** di kanan atas konten. Bar lebar dan bar kuning ganda dihapus dari preview. Tidak ada judul portal/nav kedua di atas konten.
- Sidebar **Portal Utama** kiri berisi judul "Portal Utama / Flamboyan 4" dan menu: Beranda, Rapat, Projek, Kalender, Dokumentasi, Inventaris, Pembayaran. Menunya tampak sama dengan gambar rujukan, dengan ikon garis konsisten. Sementara Bank Sampah dan Pembukuan menggunakan sidebar asli masing-masing.
- Toolbar kanan mini: ikon Rumah, Bank Sampah, Pembukuan, lalu Login ketika keluar / avatar bulat ketika masuk. Dropdown avatar: Akun Saya, Pengaturan Profil, Keluar.
- Salinan Portal Utama di preview menyembunyikan header dan **hero lama** supaya konten langsung dimulai dari **banner slider ASLI**, diikuti kas, Jadwal Arisan, Proyek & Pembangunan, dokumentasi dan agenda. Dua gambar pada slider merupakan ilustrasi OFFLINE, bukan banner asli dari Sheet; sumber aslinya tetap dipertahankan pada main/index.html produksi.
- Contoh Jadwal Arisan dan tiga kartu Proyek tetap terlihat. Adaptor CSV contoh dijalankan sesudah pustaka PapaParse, bukan sebelumnya.
- **Rapat** menggunakan salinan HTML sumber dari GitHub main/rapat/index.html, bukan halaman baru. Isinya contoh OFFLINE.
- Pengaturan Bank Sampah tetap mengacu role publik/warga/admin/superadmin; satu akun terpadu adalah mock frontend, bukan keamanan autentikasi nyata.
- Kalender custom pada form data tanggal tetap ada. Semua browser popup default ditargetkan untuk diganti di pratinjau, tidak mengubah website aktif.
- **Jangan ulangi kesalahan** membuat navbar/hero baru atau mengganti struktur asli; migrasi nantinya hanya data & backend, dengan login tunggal lintasportal.

## Koreksi data asli dan ikon: 22 Oktober 2026

- Pengguna mengingatkan bahwa **seluruh Jadwal Arisan asli sudah ada**. Arsip hanya tiga entri contoh yang dibuat sebelumnya adalah kesalahan; ini **dihapus** dari `offline-portal.js`.
- Menggunakan 26 baris lengkap sumber asli **Data Untuk WEB**, tab **Arisan** (gid 53284271), dari **Desember 2025 hingga Januari 2028**, kolom persis `BULAN`, `NAMA & BLOK`, `STATUS`. Sumber `https://docs.google.com/spreadsheets/d/14Yb075WtIcvSH0OVaA7nZh7Dm-nYz-IgdS3502JCIQI/edit`. Ini salinan snapshot untuk pratinjau offline, bukan pembacaan live saat dibuka. Jika data sumber berubah, sinkronkan ulang di tahap migrasi API D1.
- Banner saat preview memakai **3 URL gambar asli** dari tab `Banner WEB` (gid 780113187) sebagai snapshot; hapus banner sintetis. Gambar tetap mungkin bergantung pada izin Google Drive dan bukan akses D1.
- Card proyek mengikuti persis tab **Project Card** (gid 40982005): Bank Sampah Lorong, Gapura, Pemesanan Jersey; urutan/status disalin dari sumber.
- Toolbar kanan sekarang memakai SVG **Lucide resmi** untuk `house`, `recycle`, dan `notebook-tabs`; tidak lagi ikon recycle buatan tangan yang tidak menyerupai referensi.
- Jangan lagi mengganti data yang sudah tersedia dengan contoh yang direka. Untuk preview yang tidak terhubung database, gunakan snapshot data **dari sumber asli** dan tandai salinan offline.

## Koreksi wajib dari screenshot 17.36 WIB, 22 Oktober 2026

- Ukuran menu Portal Utama harus **sekelas sidebar Bank Sampah**: font 14px/700, tinggi tombol sekitar 47px, ikon garis 19px, padding dan kontras jelas. Warna tetap violet terang/bersih seperti Pembukuan, tanpa highlight navy gelap.
- Semua halaman menggunakan **utility bar kecil menyatu dengan konten** tanpa garis bawah/pemisah, bukan navbar terpisah. Sidebar kiri dimulai **paling atas sejajar utility bar**.
- Untuk Bank Sampah desktop, sidebar publik/admin asli tetap digunakan. Perbaikan layout: iframe mulai di y=0, utility bar diposisikan x=244px pada area konten; konten Bank Sampah diberi padding-top 56px, sidebar mulai y=0. Jangan menurunkan sidebar 56px di bawah utility bar.
- **Ikon Pembukuan hanya muncul jika login sebagai SUPERADMIN.** Untuk pengunjung, warga, dan admin Bank Sampah, tombol/icon Pembukuan tidak sekadar disabled: **harus tidak ditampilkan sama sekali**. Setelah logout dari Pembukuan kembali ke portal publik.
- Pilihan role login di preview tetap simulasi; backend Worker auth yang sebenarnya nanti harus menegakkan hak akses secara server-side.

## Perbaikan layout berdasar screenshot 17:48, 22 Oktober 2026

- Sidebar Pembukuan semula tampak turun karena iframe mulai pada `y=56px`, padahal sidebar sendiri sudah fixed ke atas viewport iframe. Diperbaiki **hanya desktop (min-width 1024px)**: iframe mulai y=0 seperti Bank Sampah; main diberi padding atas 80px untuk utility bar. Tablet/HP tetap mengikuti drawer asli.
- Judul sidebar Pembukuan diganti dari `Menu Pembukuan` menjadi **Pembukuan**, subjudul **Flamboyan 4**.
- Utility bar seluruh preview **transparan di posisi awal**, dan menjadi putih semi-solid dengan blur halus jika konten scroll lebih dari 12px. Tidak ada navbar kedua, garis pemisah atau background solid permanen.
- Tombol **Kembali ke Atas** (panah atas) menggunakan satu kontrol shell baru untuk **Bank Sampah dan Pembukuan**; muncul jika posisi scroll >250px. Portal Utama tetap memakai tombol kembali atas asli; Bank Sampah v31 native disembunyikan khusus preview agar tidak ganda.
- Deteksi scroll berasal dari child iframe same-origin melalui listener; tidak ada akses data Cloudflare/Apps Script.
- Hak akses preview tetap: ikon Pembukuan hanya muncul untuk superadmin. Tidak ada perubahan kode produksi/D1/Worker.
- Belum diverifikasi visual langsung di browser, hanya pemeriksaan source terbaru dan sintaks JavaScript.


## Koreksi Dokumentasi / Sidebar / Logo (22 Oktober)

- Sidebar **Portal Utama > Dokumentasi/Inventaris** sekarang menuju salinan halaman dokumentasi yang SUDAH PERNAH DIBUAT dari `uji-integrasi/dokumentasi/index.html`, berlokasi `/uji-terpadu/dokumentasi/`. Kedua tab bisa berpindah tanpa keluar dari shell, dan daftar album maupun inventaris memiliki scroll mandiri. Komponen modal galeri foto/video lama dari `uji-integrasi/assets/media-viewer.js` dipakai kembali.
- Snapshot arsip **Data Untuk WEB** Google Sheets: 8 album dokumentasi, 5 barang inventaris (Terpal, Cangkul, Garpu, Pengki Bangunan, Dispenser Es). Foto Dispenser Es memakai URL foto asli. Semua album menampilkan tautan folder asli pada galeri.
- **Batas yang belum tuntas:** daftar file foto/video di dalam folder album tidak bisa diambil melalui Google Drive connector sekarang. JANGAN menampilkan 30 media palsu! Dialog album menyediakan tautan asli, galeri penuh masih belum setara sampai daftar media berhasil dimigrasi.
- Sidebar Bank Sampah PUBLIK dan ADMIN pada layar desktop kini `position:fixed` terhadap viewport aplikasi, top=0, lebar 244px dan scroll sendiri jika menunya panjang. Hanya konten utama yang ikut scroll; tidak membiarkan judul/menu ikut bergeser.
- Sidebar Pembukuan memakai gaya menu sama: 14px tebal, item ~47px, highlight violet muda, dan logo di header. **Tidak mengganti menu atau fungsi aslinya**.
- Logo bunga Flamboyan 4 asli dipakai di sidebar Portal Utama, header Pembukuan, header Bank Sampah (sudah dari HTML asli), dan favicon seluruh HTML di `/uji-terpadu/`. URL gambar mengikuti `v16LogoURL` dari kode Bank Sampah asli: `https://lh3.googleusercontent.com/d/1UdHmAbx4mjey0SvhFJ5ipBwfOB0aErZ8`; user juga memberi file PNG logo sebagai referensi.
- Progres publik Bank Sampah kini memakai **2 deskripsi dan foto asli** dari tab `Progress Bank Sampah` di database Sheets lama, tanpa panggilan DB saat membuka demo. Kartu project Portal Utama membaca snapshot foto yang sama.
- Staging preview offline tidak boleh dianggap bukti migrasi data, login, gallery file-by-file, atau operasi Worker telah selesai. Main website aktif, D1, Worker tidak disentuh.

## KEPUTUSAN PRIORITAS BARU — 22 Oktober 2026 (Malam)

Pengguna menetapkan bahwa pekerjaan migrasi database/Cloudflare ditunda. **Prioritas pertama: ketiga portal asli berjalan dengan semua menu, fungsi, dan data lama.** Spreadsheet/Apps Script boleh dan sebaiknya digunakan kembali terlebih dahulu. Setelah situs lengkap dan sesuai kesepakatan, baru kerjakan migrasi D1/Workers, tanpa membuat ulang UI.

**Bank Sampah:** Uji Terpadu previously used offline-bank.js mocked backend and login, which led to missing admin/anggota pages and broken report data. As temporary *functional restoration*, the bank navigation link in `uji-terpadu/index.html` now goes to the **actual Bank Sampah Apps Script production app**: `https://script.google.com/macros/s/AKfycbzkOIyAXui0PtTccwi7m-PGMNLv-2ERD7r21edDmgUK579_-YI3p3sr5SJ0Ld2x7wZU/exec`. Direct `#bank-sampah` hash from shell routes there as well. This is not one integrated login; existing Apps Script login remains. Do not claim it is a finished unified system. The old uji-terpadu/bank-sampah standalone file may still exist but is not the canonical functioning frontend.

**Next steps:** inspect the full original production HTML/UI of Portal Utama and Pembukuan and keep their original backend sources. Decide the safest direct source for each within the integrated shell; don't claim live data while using mocked adapters. Establish actual role-based centralized login only after functionality is intact. **No D1 reimport, no new mock dashboards, no Worker deployment as part of visual restoration.**

## STATUS AKTUAL INTEGRASI UNTUK PENGUJIAN — 22 Oktober 2026 (Malam)

Pengguna meminta menghubungkan data dan akun yang **sudah tersedia** agar dapat menguji portal asli di GitHub. Ini mengubah prioritas sebelumnya yang hanya meminta tampilan. Jangan kembali ke Apps Script atau membuat dashboard tiruan baru.

### Sudah dipasang di /uji-terpadu/

- **Popup asli**: index.html saat iframe membuka modal mendeteksi dialog via MutationObserver lalu mengangkat iframe full-screen di atas top utility/sidebar. Mode kembali normal saat dialog ditutup. Belum diverifikasi browser langsung.
- **Login**: index.html dan buka-portal-github-20261022.html kini identik. Pemilih role palsu sudah **dihapus**; form username/password memakai POST `https://api.flamboyan4.web.id/api/auth/login`, sesi GET `/api/v2/auth/session`, keluar POST `/api/auth/logout`. Role dari session.account.role; superadmin-only bookkeeping icon.
- **Profil**: GET/POST `/api/member/profile`, foto GET/POST `/api/member/avatar` ke R2; tabungan GET `/api/member/savings`. Avatar dari R2 dimuat otomatis bila `profile.hasPhoto`. Status hanya berhasil ketika Worker benar-benar menjawab.
- **Bank Sampah**: menambah `live-bank-readonly.js` pada HTML asli dan mengizinkan CSP untuk API Cloudflare. GET D1 `/api/v2/public/bank`, `/api/v2/public/bank/album/:id`, `/api/v2/public/bank/report`, `/api/member/savings`, `/api/v2/admin/bank/catalog`. Menerjemahkan data ke komponen lama untuk publik/tabungan/katalog. Data yang tidak memiliki mapping terverifikasi **tidak boleh diisi angka palsu**.
- **Pembukuan**: `live-book-readonly.js` membaca GET `/api/bookkeeping/iuran/payers`, `/api/bookkeeping/iuran/tariffs`, `/api/bookkeeping/iuran/history`, `/api/bookkeeping/cash`, `/api/bookkeeping/denda`, `/api/bookkeeping/pinjaman`, `/api/bookkeeping/talangan`. Hanya data pembayar terdaftar D1 (belum semua master rumah). Baris pembayaran historis dikunci dari edit; aksi tulis belum aktif.
- **Pengaman**: `offline-common.js` meneruskan hanya GET ke API Cloudflare, mencegah write Apps Script/legacy. Semua endpoint tulis keuangan tetap tunduk flag Worker. Tidak ada D1 diimpor ulang atau Worker dideploy dalam tahap ini.

### Belum selesai dan TIDAK BOLEH DIKLAIM SIAP

1. Semua API endpoint **belum terverifikasi online** karena permintaan dari lingkungan kerja ini gagal mengakses domain API (tidak membuktikan domain down bagi pengguna). Browser login dan data harus diuji langsung.
2. Formulir bank: setoran, jual, rekonsiliasi, pengesahan, kas, pencairan, administrasi akun, edit/hapus data, laporan admin lengkap masih perlu mapping schema/request Worker; tidak boleh diklaim menyimpan data.
3. Pembukuan: banyak form pembayaran/kas/denda/pinjaman/talangan/batch, laporan lengkap dan tutup buku belum punya endpoint tulis yang disetujui. Tidak ada write financial staging saat feature flags masih false.
4. Portal Utama masih memakai salinan data arsip Google Sheets untuk beberapa komponen (arisan, banner, dokumentasi, proyek, inventaris); kartu kas belum sepenuhnya bersumber dari D1. Data D1 dan data snapshot jangan disatukan diam-diam menjadi saldo akhir.
5. Album media Google Drive belum migrasi semua file individual; galeri lama di uji sebagian memakai sumber folder.

### Catatan akses

- URL utama `https://flamboyan4.web.id/uji-terpadu/` dan alamat lama `https://flamboyan4.web.id/uji-terpadu/buka-portal-github-20261022.html` **harus terus disinkronkan**. Jika salah satu diubah lagi, sinkronkan kembali; perubahan hanya di /uji-terpadu/.
- Login dan data mungkin gagal apabila Custom Domain `api.flamboyan4.web.id` belum aktif atau cookie/CORS tidak cocok; tampilkan kesalahan yang sebenarnya, bukan simulasi sukses.
