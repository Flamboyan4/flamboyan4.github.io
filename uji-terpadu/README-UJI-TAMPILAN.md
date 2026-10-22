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
