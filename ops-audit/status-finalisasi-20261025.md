# Status finalisasi Flamboyan 4 — 25 Oktober 2026

Dokumen ini mencatat bukti yang telah ada dan celah yang **belum selesai**. Jangan mengartikan flag aktif sebagai bukti seluruh tombol berhasil.

## Terpasang di sistem aktif
- Frontend GitHub Pages branch `main`.
- Backend Worker `flamboyan4-terpadu-staging` / D1 `flamboyan4-staging` / binding R2 `PHOTOS`.
- PR #11: koreksi bridge Bank Sampah (fund positions, posting, akun). Merged ke main.
- PR #12: tanggal transaksi Denda/Pinjaman/Talangan dibandingkan dengan tanggal WIB. Merged ke main. Deployment terverifikasi `95b165d9-de40-46c6-9a6c-4888acd68f9d`.
- PR #13: workflow release lama dijadikan manual-only untuk menghilangkan kegagalan preflight otomatis saat flag transaksi memang sudah aktif.

## Bukti uji langsung dan pembersihan
- Kas: 8/8 uji simpan, duplikat, edit, baca ulang, batal lulus; D1 kembali ke baseline. Run 40129053392.
- Iuran: 7/7 uji dengan pembayar sintetis, alokasi Kas Lorong, reload, dan idempotensi lulus; D1 dipulihkan. Run 40143430840.
- Bank Sampah: 8/8 uji setoran, idempotensi, draft penjualan, pembatalan lulus; D1 dipulihkan. Run 40143281371.
- Denda/Pinjaman: ke-13 langkah operasi bisnis pada tes sintetis berhasil, tetapi tesnya diberi status incomplete karena trigger immutability mencegah cleanup standar. Trigger dan seluruh data QA kemudian dipulihkan melalui batch cleanup atomik. Run 40144357155.
- Cleanup QA: 0 pembayar QA, 0 kas QA, keempat trigger immutability tetap terpasang; sesi QA kedaluwarsa: 2 menjadi 0. Run 40144556671.
- Pemeriksaan D1 pasca-cleanup: 63 tabel, 0 relasi orphan pada enam pemeriksaan, 68 pembayaran Iuran, 8 Denda, 18 Kas, 3 setoran Bank Sampah, 2 penjualan. Run 40144421523.
- Uji hak akses: publik, anggota, admin, superadmin; role-read dan negative-write guard lulus. Run 40128408546, 40128769212.

## Flag operasi yang terverifikasi aktif
- FINANCE_WRITE_ENABLED
- MANUAL_CASH_WRITE_ENABLED
- IURAN_WRITE_ENABLED
- DENDA_PINJAMAN_WRITE_ENABLED
- BANK_WRITE_ENABLED
- SALE_DRAFT_ENABLED
- BANK_CANCEL_WRITE_ENABLED
- BANK_INVENTORY_WRITE_ENABLED
- BANK_MEDIA_WRITE_ENABLED

## Fungsi yang masih belum lulus penerimaan
1. Pembukuan: edit/batal/hapus Iuran baru, pembatalan pembayaran Denda/Pinjaman, Talangan dengan aturan 14 hari, batch/setor Kas RT, Tutup Buku dan arsip.
2. Bank Sampah: rekonsiliasi dan pengesahan pembagian 50:50, pengeluaran, pencairan tabungan, pembatalan pengesahan lintas ledger, serta reset akun anggota yang sudah aktif.
3. Portal Utama: penulisan konten masih flag OFF; jalur album lawas memanggil Apps Script.
4. Uji regresi browser PC/HP dan cetak seluruh jenis laporan belum dibuktikan selesai.

**Jangan menyatakan proyek operasional penuh sampai pekerjaan di atas diselesaikan dan diuji.** Jangan reset D1, koreksi ulang KAS0020 atau menganggap saldo historis Rp1.414.500 sebagai transaksi baru.
