# Status implementasi spesifikasi 4 Portal Flamboyan 4
Sumber: *Spesifikasi_Alur_4_Portal_Flamboyan4_Revisi_Web.pdf*, 33 halaman, 23 Oktober 2026.

**Lingkup:** branch `main`, hanya folder `uji-terpadu/`. Tidak ada reset/penulisan ulang database D1, tidak ada perubahan Worker aktif, dan portal produksi asli tidak ditimpa.

## Tersimpan sebagai kode
- [x] Utility bar menampilkan **Portal Utama**, **Bank Sampah**, dan hanya untuk Superadmin: **Pembukuan**, **Portal Superadmin**.
- [x] `superadmin/index.html` sebagai portal keempat mandiri, tema biru, sidebar 5 kelompok: Ringkasan Sistem, Akun & Hak Akses, Konten & Publikasi, Data Acuan, Pengaturan & Audit.
- [x] Portal Superadmin memakai ulang `superadmin-editor.js` untuk Project Card, Rencana Kegiatan, Dokumentasi, Inventaris, Banner Slider, Hasil Rapat, Kewajiban Iuran, Tarif Iuran, Aturan Tanggal.
- [x] Data Warga & Rumah di Portal Superadmin memakai API D1 lama yang diketahui: baca, tambah rumah/warga dan edit data.
- [x] Pengaturan Akun bersama (identitas, foto profil, password, hak akses, kembali) overlay sehingga portal/halaman sebelumnya tidak direset.
- [x] Portal Utama: panel Beranda, Projek, Kalender, Pembayaran, Komentar & Saran; menu Keuangan Warga hanya saat login. Fitur asli tetap berada dalam HTML sumber.
- [x] Card proyek Bank Sampah diarahkan ke Uji Terpadu, bukan `/banksampah/` lama.
- [x] Bank Sampah: tombol Publik → Kelola Bank Sampah muncul bagi Admin/Superadmin, tidak tergantung Pengaturan Profil. Tombol Tabungan Saya tetap bagi Anggota.
- [x] Pembukuan asli tetap digunakan untuk transaksi; akses global hanya Superadmin.
- [x] Pemeriksaan statis sintaks JavaScript dan pasangan `<style>` HTML lulus pada tujuh berkas inti.

## Belum dinyatakan selesai / perlu verifikasi
- [ ] Pengelolaan akun lengkap (tambah, nonaktifkan, ubah role, reset aman): daftar akun dibaca, **mutasi menunggu kontrak API yang terverifikasi**. Tidak mengarang endpoint atau melakukan perubahan akun palsu.
- [ ] Log audit, pengaturan sistem dan cadangan/pemulihan: status integrasi terlihat, mutasi/log belum aktif tanpa endpoint audit terverifikasi.
- [ ] Editor Jenis & Harga Sampah lintas portal: mode baca catalog; perubahan harga perlu route tulis aman dan audit.
- [ ] Keuangan Saya: UI Iuran/Arisan/Denda/Pinjaman disediakan tetapi endpoint khusus anggota harus divalidasi dan selalu filter identitas dari sesi.
- [ ] Skenario desktop/HP riil: modal, menu, responsif, keyboard/back/deep link dan login lintas portal.
- [ ] Data nominal, laporan cetak, pengesahan, pembagian hasil 50:50, Tutup Tahun/Arsip dan server-side security perlu diuji sebelum dinyatakan setara aplikasi lama.

## Aturan uji penerimaan
1. Guest: Portal Utama dan Bank Sampah publik, tidak menerima data privat.
2. Anggota: login sekali, data tabungan & keuangan terbatas ID sendiri.
3. Admin: tidak memiliki akses Pembukuan/Superadmin; Bank Publik ↔ Admin berulang tanpa macet.
4. Superadmin: empat portal aktif dan sidebar Portal Superadmin konsisten saat membuka editor.
5. Pengaturan Akun: kembali ke portal/panel sebelumnya; foto, nama, password benar-benar tersimpan.
6. Transaksi: input setoran → jual → rekonsiliasi → sahkan → hak warga/lingkungan tepat; tidak ada data uji palsu.
7. Pembukuan: laporan dan cetak nominal benar; Tutup Tahun mengunci dan arsip tetap terbaca.

**Catatan:** Lulus pemeriksaan sintaks ≠ lulus pengujian integrasi/browser atau keamanan API.