# Bank Sampah — alur penjualan sederhana (3 November 2026)

## Sasaran layar
Pertahankan navigasi yang sudah ada. Jangan membuat menu tambahan setiap tahap.

1. Setoran: nama warga + jenis + berat. Kepemilikan sampah milik Bank berbeda dari milik warga.
2. Penjualan: pilih kelompok/nomor otomatis; berat per jenis dibaca dari D1. Cetak Lembar Timbang A5 sebelum berangkat, kolom hasil lapak/harga/jumlah kosong. Penyiapan mengunci setoran kelompok.
3. Di lapak: timbang kolektif, tulis di kertas. Setelah input hasil di web, sistem hitung total/selisih; Nota Penjualan dicetak tanpa menunggu pengesahan.
4. Pengesahan internal: pratinjau hak warga dan margin, alasan ketika berat berbeda; saldo baru dikreditkan setelah lunas dan pengurus menyetujui.
5. Riwayat/Laporan: cetak satu penjualan, laporan anggota bulanan atau rentang tanggal PDF/CSV, tanpa menu baru.

## Aturan aman
- Nomor penjualan BSF4-J- + kode kelompok, sama di lembar pra-penjualan dan nota final; ID D1 tetap menjadi identitas unik.
- Penjualan belum lunas tidak boleh mengkredit tabungan; pelunasan dicatat di transaksi asli dengan audit.
- Berat awal setoran tidak ditimpa hasil timbang lapak; selisih dihitung.
- Kategori sama sekali belum dijual tidak dapat disahkan. Stok parsial butuh ledger stok terpisah, bukan dianggap penyusutan.
- Harga warga dari waste_prices.citizen_rate_rp_per_kg, bukan lapak. Daftar kategori termurah dahulu. Saat sistem persentase 50:50, harga warga sebelum penjualan hanya perkiraan.
- Transaksi sah lama tetap di jurnal, pengaturan baru tidak menghitung ulang.

## Batas perubahan keuangan fase berikutnya
- **Harga beli warga nominal tetap**: butuh kebijakan berversi, snapshot per penjualan, pembagian per jenis/warga, audit margin, dan kesepakatan kapan metode berlaku. Jangan memodifikasi rumus lama secara diam-diam; transaksi sah tetap utuh.
- **Setoran milik bank dan stok parsial**: setoran milik bank saat ini dicatat sebagai kas terpisah. Belum aman menggabungkan barangnya di satu lot warga tanpa catatan kepemilikan dan ledger stok. Sisa stok tidak boleh dianggap selisih timbangan.
- **Laporan gabungan admin**: laporan anggota sudah menyediakan filter rentang dan PDF/CSV. Rekap admin lintas periode dan ekspor XLSX butuh backend read-only yang mempertahankan status pembayaran, kewajiban warga, kas dan pembatalan.

## Verifikasi sebelum deploy
Jalankan syntax-check Node, qa/check-bank-sale-flow.cjs, qa/bank-eco-allpages.cjs, qa/verify-unified-grid.cjs, qa/verify-css-ownership.cjs dan uji browser HP/PC seluruh role untuk setoran → lembar → timbang lapak → nota → pelunasan → pengesahan. Jangan membuat transaksi uji pada D1 hidup.
