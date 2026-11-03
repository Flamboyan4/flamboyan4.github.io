# Bank Sampah Flamboyan 4 — keputusan FINAL alur 3 tahap (3 November 2026)

## Prinsip
Website harus mudah digunakan pengurus dan warga. **Tepat tiga tahap bisnis**, bukan lima menu/langkah. Nomor penjualan tidak berubah selama satu transaksi. Input sekali; kalkulasi otomatis. Beranda pengelola memiliki dua tombol utama **Catat Setoran** dan **Catat Penjualan**, delapan akses cepat, dan **tidak memiliki bottom navigation**. Menu slide pengelola berisi enam kategori. Anggota tetap memiliki bottom navigation sendiri.

## Tiga tahap penjualan
1. **Siapkan Penjualan** — pilih kelompok setoran, sistem menghitung stok warga serta milik Bank per jenis, memberi nomor penjualan, mengunci alokasi, dan mencetak Lembar Timbang & Jual A5. Kolom hasil lapak, harga, total dan tanda tangan dibiarkan untuk diisi.
2. **Timbang & Jual di Lapak** — pengurus/lapak mengisi hasil timbang aktual, harga per kg, jumlah, pembayaran, lalu **kedua pihak menandatangani lembar yang sama**. Ini **satu-satunya bukti fisik transaksi**. Tidak ada nota kedua setelah pengurus pulang.
3. **Input Hasil & Selesaikan** — pada nomor yang sama masukkan angka dari lembar, status pembayaran, lampiran bukti jika ada; sistem periksa selisih timbang vs stok tak terjual, piutang, hak warga dan hak Bank. Pemeriksaan dan pengesahan ada di dalam transaksi yang sama, bukan menu/tahap keempat.

## Perbedaan dokumen
- **Lembar Timbang & Jual** (dicetak sebelum ke lapak) menjadi bukti asli setelah ditandatangani. Tidak diterbitkan ulang sebagai nota.
- **Laporan Transaksi Penjualan** (di Riwayat → Lihat Rincian → Cetak Laporan) adalah cetak read-only internal dari D1, **tanpa tanda tangan**, bukan bukti serah terima.
- Laporan gabungan bulanan / beberapa bulan serta e-statement anggota tetap berada pada Laporan masing-masing, dengan hak akses sesuai peran.

## Pengelola HP
- **Tidak ada dock bawah**; tidak boleh diganti dock dua atau tiga tombol.
- Dua aksi utama selalu focal: **Catat Setoran**, **Catat Penjualan**.
- **Akses Cepat 4×2:** Cek & Sahkan; Riwayat; Keuangan; Pencairan; Harga Barang; Data Anggota; Dokumentasi; Laporan.
- Hamburger membuka menu slide enam kategori: Beranda, Setoran, Penjualan, Keuangan, Pengelolaan, Laporan. Submenu di tab masing-masing, jangan ulang ke slide.
- Laman selain Beranda memiliki tombol kembali panah. PC tetap sidebar kiri; anggota tetap dock 5 tombol.

## Status implementasi (3 Nov 2026)
- **Frontend PR #82, #83, #84:** alur 3 tahap tanpa nota ganda, input hasil lapak wajib manual, dock pengelola dihilangkan, navigasi pendukung dan laporan internal per penjualan.
- **Backend issue #81 BELUM tuntas:** kepemilikan stok campuran, ledger sisa stok, dan harga beli tetap berversi belum diimplementasikan ke pengesahan Worker/D1. Jangan menyatakan selesai atau mengubah jurnal hidup sampai staging/QA benar-benar lulus.
