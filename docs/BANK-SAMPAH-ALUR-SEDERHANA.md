# Bank Sampah Flamboyan 4 — alur operasional dan pekerjaan backend

**Kesepakatan UX final:** lihat [Keputusan 3 Tahap (3 November 2026)](./bank-sampah-alur-sederhana-20261103.md). Dokumen ini tidak boleh dipakai untuk menghidupkan kembali lima tahap, nota kedua, atau dock pengelola.

## Alur pengurus — 3 tahap
1. **Siapkan Penjualan**: nomor tunggal dari kelompok, rekap stok otomatis, cetak lembar A5, alokasi stok dikunci.
2. **Timbang & Jual di Lapak**: input tangan berat, tarif, jumlah, pembayaran dan tanda tangan kedua pihak pada **lembar yang sama**. Lembar itu bukti fisik; tidak ada nota/serah terima terpisah.
3. **Input Hasil & Selesaikan**: kembali ke nomor sama; masukkan hasil riil. Simpan transaksi, periksa selisih/pembayaran dan sahkan hak warga dalam konteks yang sama ketika semua syarat terpenuhi.

Riwayat boleh mencetak **laporan internal read-only satu transaksi**, bukan dokumen jual bertanda tangan baru. Laporan admin mendukung per bulan dan rentang tanggal; warga hanya riwayatnya sendiri.

## Kewajiban backend yang belum selesai (issue #81)
- Bedakan **setoran sampah milik warga** dan **setoran fisik milik Bank**; milik Bank bukan otomatis uang masuk dan hak Bank 100% dari penjualannya.
- Penjualan kolektif dari stok warga dan Bank harus mempertahankan jejak kepemilikan tanpa mengulang input jenis/berat awal.
- D1 memerlukan stok per pemilik per jenis dengan alokasi terkunci, **sisa stok** terpisah dari **selisih timbang**, pencegahan jual dua kali dan jurnal koreksi.
- Metode pembagian berversi: `percentage` (contoh historis 50:50) dan `fixed_buy_price` (berat sah per jenis × harga beli warga). Setiap aturan memiliki ID, tanggal berlaku, tarif per jenis dan snapshot transaksi; aturan lama yang sudah dipakai tidak boleh ditimpa.
- Status bayar lapak: belum bayar, sebagian, lunas; piutang terpisah dari kas. Hak warga baru bisa dikreditkan setelah lunas dan sah.
- Pengesahan harus atomik, idempoten, berbasis D1, tidak mengubah transaksi sah lama. Koreksi setelah sah memakai jurnal audit.
- Harga yang ditampilkan di akun warga adalah harga beli warga (atau estimasi bila metode persentase), dikelompokkan per kategori dan termurah lebih dulu; harga jual lapak tidak bocor.
- Cetak laporan per transaksi dan e-statement per bulan/rentang tanggal, tabel rapi, PDF dan CSV.

## Kriteria uji wajib sebelum migrasi/aktivasi backend
1. Tiga warga dan stok milik Bank → satu nomor penjualan → satu lembar bertanda tangan → input hasil → satu laporan digital, **tanpa nota kedua**.
2. Stok belum terjual disimpan; selisih hasil timbang dilaporkan berbeda; tidak ada double sell.
3. Pembayaran 0/sebagian/lunas memisahkan piutang, kas diterima dan hak warga sah.
4. Pengesahan dua kali tidak menambah saldo; pengesahan gagal tidak memutasi sebagian.
5. Mengganti 50:50 menjadi harga beli tetap hanya mempengaruhi transaksi baru; histori tidak berubah.
6. Semua izin divalidasi oleh server; peran anggota tidak bisa membaca margin atau akun lain.
7. PC/HP responsif, grid simetris, scroll normal, satu menu slide pengelola tanpa dock, tidak ada CSS bertumpuk atau deklarasi `!important` baru.

**Status:** PR #82–84 menyelesaikan UX 3 tahap dan cetak laporan internal. Perhitungan dan stok campuran masih menunggu implementasi backend serta uji D1 staging; jangan klaim produksi sudah menggunakannya.
