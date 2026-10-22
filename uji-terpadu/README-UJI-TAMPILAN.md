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
