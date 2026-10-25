# Status finalisasi Flamboyan 4 — 25 Oktober 2026

**Jangan menandai proyek selesai 100% sebelum semua jalur keuangan dan cetak lulus uji positif.** Catatan ini hanya merangkum status yang benar-benar terverifikasi.

## Terpasang pada website utama dan Worker
- Frontend GitHub Pages `main` telah menerima PR #11 (bridge kas Bank Sampah), #12 (validasi tanggal WIB), #13 (workflow release lama manual-only), #14 (akun anggota, password awal 1234 dan reset), #15 (status tahun/daftar arsip/detail arsip dari D1), #16 (status tahun tidak dianggap terbuka bila request gagal).
- Worker aktif: `flamboyan4-terpadu-staging`. Deployment terverifikasi terakhir `0811e5ba-7106-4438-91f3-bb016271f1a6`, hasil audit remote 2026-10-25 07:30 WIB.
- Binding D1 `DB` dan R2 `PHOTOS` masih terpasang.
- Flag ON: `AUTH_ENABLED`, `FINANCE_WRITE_ENABLED`, `MANUAL_CASH_WRITE_ENABLED`, `IURAN_WRITE_ENABLED`, `DENDA_PINJAMAN_WRITE_ENABLED`, `TALANGAN_WRITE_ENABLED`, `PORTAL_WRITE_ENABLED`, `BANK_WRITE_ENABLED`, `SALE_DRAFT_ENABLED`, `BANK_CANCEL_WRITE_ENABLED`, `BANK_INVENTORY_WRITE_ENABLED`, `BANK_MEDIA_WRITE_ENABLED`, `BANK_RECONCILIATION_WRITE_ENABLED`, `BANK_EXPENSE_WRITE_ENABLED`.
- Flag OFF: `BANK_PAYOUT_WRITE_ENABLED`, `RECONCILIATION_CONFIRM_ENABLED`. Yang terakhir tidak dipakai oleh endpoint pengesahan baru; endpoint baru memakai `BANK_RECONCILIATION_WRITE_ENABLED`.

## Bukti uji langsung yang lulus
- Kas: 8/8 operasi simpan, idempotensi, edit, baca ulang, batal dengan D1 dikembalikan ke baseline. GitHub Actions #40129053392.
- Iuran: 7/7, pembayar sintetis dan alokasi Kas Lorong, data uji dibersihkan. #40143430840.
- Setoran + draft penjualan Bank Sampah: 8/8, idempotensi dan cancel serta cleanup. #40143281371.
- Hak akses anggota/admin/superadmin/publik dan permintaan invalid tanpa mutasi: lulus. #40128408546, #40128769212.
- Reset akun anggota (tanpa mengganti password warga selama tes): 4/4 peran lulus, sesi sementara dibersihkan. #40145769222.
- Browser Chromium: 10/10 halaman/ukuran PC+HP, tanpa pageerror, print media aktif. #40146677848. Ini belum menggantikan verifikasi print seluruh laporan dengan data admin.
- Audit D1 pasca QA: 63 tabel, 0 relasi orphan yang diuji; 68 pembayaran iuran, 8 denda, 18 kas, 3 setoran, 2 penjualan. #40144421523 dan audit remote #40146983453.
- Denda/Pinjaman: 13/13 operasi bisnis sintetis berhasil, cleanup awal terganjal immutable triggers; dua pembayar uji dan jurnalnya kemudian sudah dibersihkan dalam batch atomik, empat trigger dipulihkan. #40144357155.
- Talangan lama: satu pelunasan tanpa tautan jurnal kas historis; jumlah ledger cocok, tetapi **jangan buat jurnal duplikat**. Audit #40146288066.

## Masih HARUS diselesaikan sebelum 100%
1. Pencairan hak tabungan warga (flag `BANK_PAYOUT_WRITE_ENABLED` masih OFF). Rekonsiliasi 50:50 sudah diaktifkan tetapi **belum ada satu transaksi pengesahan positif yang diverifikasi live dengan pembacaan ulang kas dan hak tabungan**. D1 masih 0 alokasi hasil dan 0 jurnal kas Bank Sampah.
2. Pembukuan Iuran: edit/batal/hapus historis; batch/setor Kas RT, kekurangan Kas Lorong dan sinkronisasi Talangan; pembatalan yang memerlukan reversal D1 dengan aturan audit.
3. Tutup Buku/Tutup Tahun: pembacaan status dan arsip selesai, tetapi pembuatan arsip dan penutupan tahun resmi belum didukung secara end-to-end. Jangan menutup tahun 2026 secara otomatis.
4. Bank Sampah: pembatalan *setelah* pengesahan memerlukan reversal atomik lintas tabungan dan kas, masih diblokir secara sengaja. Pengeluaran aktif namun jalur transaksi positif saldo riil belum diverifikasi.
5. Final UAT terautentikasi pada PC/HP dan laporan cetak tiap jenis menggunakan data nyata, termasuk warna header print.

## Larangan pengulangan pekerjaan
- Jangan reset atau impor ulang D1, jangan mengulang KAS0020.
- Jangan membuat ulang saldo awal Rp794.000 sebagai transaksi duplikat. Saldo historis 2026 sebelumnya cocok Rp1.414.500.
- Jangan mengklaim semua fitur lulus hanya dari flag ON atau smoke public.
