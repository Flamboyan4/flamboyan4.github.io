# SOP Iuran dan Kas setelah migrasi Cloudflare D1

**Status:** aturan rilis; belum mengaktifkan penulisan produksi.

## Empat dimensi yang tidak boleh dicampur
- **Tanggal diterima:** kapan uang fisik/QR/rekening diterima dari warga.
- **Bulan kewajiban:** bulan yang dilunasi, bisa berbeda dan lebih dari satu bulan dalam satu pembayaran.
- **Tanggal jurnal kas:** kapan penerimaan masuk pada pembukuan kas.
- **Tahap rekap:** setoran RT (sekitar tanggal 10), laporan Arisan (fleksibel), dan rekap pelunasan terakhir.

Tanggal rekap tidak boleh mengubah bulan kewajiban secara otomatis. Untuk pelunasan Agustus sebelum masa pembukuan, gunakan keterangan *pelunasan tunggakan pra-pembukuan* pada tanggal penerimaan yang sebenarnya, bukan transaksi Agustus buatan.

## Penting: jangan menduplikasi kas
- Pada database migrasi, transaksi kas kategori Kas Lorong telah direkap kolektif. Hubungan antara kas dan pembayaran lama tidak selalu 1:1. Jangan membuat ulang 68 jurnal kas dari pembayaran historis.
- Endpoint Worker **POST /api/bookkeeping/iuran** untuk pembayaran **baru** sudah membuat:
  1. satu baris `bookkeeping_payments`;
  2. alokasi per bulan/komponen dalam `bookkeeping_payment_allocations`;
  3. **satu baris `bookkeeping_cash_transactions` berelasi `source_payment_id`**;
  4. jejak audit serta request key idempoten.
- Karena itu, untuk pembayaran **baru yang disimpan melalui menu Iuran**, **jangan membuat penerimaan kedua secara manual di Kas** untuk uang yang sama.
- Periode setoran RT/Arisan/Pelunasan Akhir digunakan untuk laporan dan rekonsiliasi, **bukan pengulangan pemasukan**.

## Aturan aktivasi
1. Tunda `FINANCE_WRITE_ENABLED` dan `IURAN_WRITE_ENABLED` sampai antarmuka input telah terbukti menghasilkan alokasi yang persis sesuai uang diterima, termasuk kekurangan Kas Lorong, pembayaran lintas bulan, dan cicilan tunggakan.
2. Sistem input harus menolak transaksi saat jumlah dialokasikan tidak sama dengan uang diterima.
3. Kunci idempoten wajib stabil pada percobaan ulang, dan berbeda untuk transaksi baru.
4. Tahun yang terkunci tidak dapat ditambahi transaksi atau dialokasikan ulang.
5. Talangan aktif harus direkonsiliasi sebelum mengaktifkan pencatatan iuran yang terkait; jangan menyatakan lunas secara otomatis tanpa jurnal penggantian talangan.
6. Setelah pengujian tulis di lingkungan terisolasi lulus, backup D1 Cloudflare remote lagi dan aktifkan fitur secara bertahap.
7. Laporan Tahunan tetap berlabel **Rekap Sementara** sampai rekonsiliasi semua kategori selesai dan pengelola menyetujui hasilnya.

## Bukti yang sudah ada
Kas Lorong September dan Oktober 2026 telah direkonsiliasi menjadi Rp330.000 per bulan setelah mengatribusikan KAS0017 (Rp15.000) sebesar Rp10.000 untuk tunggakan September dan Rp5.000 untuk tunggakan Agustus pra-pembukuan. Jurnal total tetap Rp665.000. Lihat `docs/audit/kas-lorong-sep-okt-2026.md`.

**Dokumen ini bukan perintah SQL atau izin untuk mengubah saldo.**
