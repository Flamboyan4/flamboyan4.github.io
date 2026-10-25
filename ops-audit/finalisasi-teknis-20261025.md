# Flamboyan 4 — Bukti Finalisasi Teknis, 25 Oktober 2026

## Yang telah berhasil diuji dan dipublikasikan

- Halaman utama, Bank Sampah, uji terpadu, dan seluruh file JavaScript lokal pada rute pemeriksaan: **HTTP 200**. Alamat `/bank-sampah/` yang semula 404 sudah diperbaiki melalui PR #18.
- Cloudflare Worker `flamboyan4-terpadu-staging` terhubung D1 `flamboyan4-staging` dan R2 `PHOTOS`.
- Backend Bank Sampah mencakup setoran, draft penjualan, pengesahan 50:50, pengeluaran, pencairan; flag pencairan diaktifkan dalam deployment `aab1690f-5f0b-4cb9-8f80-25f7f05ab429`, tanpa mengubah transaksi D1.
- **32/32 pengujian lokal** terhadap salinan terbaru D1 telah lulus: autentikasi, Kas input/edit/batal, setoran, penjualan, rekonsiliasi 50:50, idempotensi, pencairan, pengeluaran, Talangan 14 hari, pelunasan, audit saldo, dan prasyarat tutup tahun.
- Transaksi uji untuk sistem live terdahulu telah dipulihkan; verifikasi D1 sesudah pembersihan: 63 tabel, 0 relasi bermasalah pada enam pemeriksaan, 68 pembayaran iuran, 8 denda, 18 transaksi kas, 3 setoran Bank Sampah, 2 penjualan.
- Kontrol akses publik/anggota/admin/superadmin telah melewati pengujian autentikasi dan penolakan akses yang tidak sah.

## Yang **tidak** boleh diklaim selesai

1. **Tutup Buku/Tutup Tahun & Arsip**: endpoint pemeriksaan dan baca arsip ada, tetapi belum ada bukti operasi penutupan/arsip tulis yang lulus, dan tidak boleh menutup tahun 2026 tanpa rekonsiliasi dan pengesahan.
2. **Edit, batal atau hapus Iuran**: beberapa aksi frontend belum mempunyai endpoint D1 yang aman; transaksi historis terkunci harus dipertahankan.
3. **Pembatalan pengesahan Bank Sampah**: reversal lintas alokasi, tabungan dan kas belum tersedia secara atomik; UI secara sengaja menolak fungsi itu.
4. **Pembayaran Iuran warga dengan Talangan aktif**: bridge mencegah otomatisasi yang dapat menghasilkan jurnal ganda. Talangan dapat dicatat dan dilunasi melalui API, tetapi integrasi alokasi Iuran–Talangan belum diklaim sempurna.
5. **Uji browser penuh PC/HP dan laporan cetak**: HTTP serta skrip lulus, tetapi uji interaktif, posisi popup, dan hasil cetak belum diverifikasi secara visual.

## Link bukti

- 32 pengujian finansial: https://github.com/Flamboyan4/flamboyan4.github.io/actions/runs/40148471857
- Pengaktifan pencairan Bank Sampah: https://github.com/Flamboyan4/flamboyan4.github.io/actions/runs/40148318056
- Pengecekan halaman publik dan skrip: https://github.com/Flamboyan4/flamboyan4.github.io/actions/runs/40148718664
- 8 pengujian Kas aktif: https://github.com/Flamboyan4/flamboyan4.github.io/actions/runs/40129053392
- 7 pengujian Iuran aktif: https://github.com/Flamboyan4/flamboyan4.github.io/actions/runs/40143430840
- 8 pengujian setoran dan penjualan draft: https://github.com/Flamboyan4/flamboyan4.github.io/actions/runs/40143281371
- Pemeriksaan integritas D1 pascapembersihan: https://github.com/Flamboyan4/flamboyan4.github.io/actions/runs/40144421523

Pengujian regresi masa depan: buka **GitHub Actions → Flamboyan 4 - Full Isolated Finance Regression → Run workflow**. Itu mengekspor D1 secara **read-only** ke salinan lokal yang dibuang setelah job selesai dan tidak membuat transaksi di database warga.

**Prinsip:** jangan reset D1, jangan migrasi ulang transaksi historis, dan jangan membuka fungsi penutupan tahun tanpa audit lengkap.
