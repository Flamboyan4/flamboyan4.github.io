# Pusat Keuangan Flamboyan 4 — SOP awal (30 Oktober 2026)

## Dua dimensi wajib
- **Tempat uang**: Cash Kas RT, Cash Bank Sampah, Cash Jersey, Cash masing-masing projek baru, QRIS bersama, Mandiri bersama.
- **Pos/hak dana**: Kas RT/Iuran, Bank Sampah Hak Warga, Bank Sampah Lingkungan, Jersey, dan projek lain.
- QRIS dan Mandiri bisa menyimpan beberapa pos sekaligus. Uang tunai disimpan terpisah menurut program.
- Tabungan warga hasil timbang estimasi **tidak** boleh dibukukan sebagai kas; hanya dana sah atau penerimaan fisik yang sudah ada.

## Aktivasi (satu kali)
1. Masuk Superadmin → Pusat Keuangan.
2. Pilih satu **tanggal batas saldo awal** (disarankan akhir hari sebelumnya). Catat uang fisik dari masing-masing Cash serta QRIS *belum cair* dan Mandiri *sudah masuk bank*, dipecah menurut pos.
3. Transaksi sebelum atau tepat tanggal batas harus masuk saldo awal, tidak boleh dimasukkan lagi dari sumber.
4. Cocokkan total QRIS/Mandiri di portal dengan dashboard penyedia pembayaran/rekening.
5. Klik **Saldo Sudah Cocok** untuk mengunci saldo awal. Setelah dikunci, gunakan mutasi baru; jangan ubah jurnal lama.

## Operasional harian
- **Pindah Tempat**: QRIS → Mandiri, Mandiri → Cash; nominal tidak menambah uang keseluruhan.
- **Pindah Pos**: perpindahan hak atau serah-terima misalnya Bank Sampah lingkungan ke Kas RT. Saldo keseluruhan tidak berubah.
- **Dana Masuk/Keluar** manual hanya untuk transaksi yang belum tercatat di modul sumber dan belum dihubungkan; periksa dahulu untuk mencegah pencatatan ganda.
- Buku Kas yang sudah diposting setelah tanggal batas dapat dipasangkan sebagai Cash Kas RT dengan tombol **Sinkronkan Buku Kas** (25 per proses; ulangi hingga habis). Pembayaran iuran yang belum dibukukan **tidak** ikut.
- Jurnal Bank Sampah setelah tanggal batas dipasangkan satu per satu, dengan memilih lokasi uang sebenarnya (Cash Bank Sampah, QRIS atau Mandiri). Jangan menganggap estimasi setoran sebagai penerimaan.
- Bila nilai/status transaksi asal berubah setelah dipasangkan, Pusat Keuangan menampilkan peringatan. Periksa sebelum membuat koreksi; tidak ada perubahan otomatis pada transaksi sumber.

## Batas fase awal
- Modul sumber yang dibaca: transaksi Buku Kas terposting dan jurnal Bank Sampah berstatus aktif. Pencocokan tidak mengubah kedua sumber tersebut.
- **Jersey lama**, pesanan projek dan jenis transaksi di luar dua jurnal itu **belum disinkron otomatis**. Catat saldo awalnya, dan mutasi setelah batas melalui Pusat Keuangan secara terverifikasi; jangan mencampur dengan Kas RT.
- Tidak ada pemindahan uang bank/QRIS sungguhan oleh website. Ini pencatatan, bukan integrasi perbankan.
- Tidak ada saldo historis yang diimpor otomatis: sumber transaksi lama tetap berada di modul asal dan tidak dihapus.
- Saldo pusat baru dapat dianggap lengkap setelah semua saldo awal disahkan, transaksi sumber yang relevan dipasangkan, dan setiap sumber tanpa jurnal dinilai terpisah.

## Aspek teknis dan keamanan
- Worker menggunakan role **superadmin** pada server untuk seluruh GET/POST Pusat Keuangan. Hak tulis mengikuti `FINANCE_WRITE_ENABLED`.
- Jurnal `treasury_events` / `treasury_entries` bersifat aditif; perpindahan tercatat sebagai debit/kredit berpasangan dalam `D1.batch` atomik.
- Debit divalidasi ulang di dalam transaksi SQLite dan ditolak jika menyebabkan saldo lokasi-pos negatif.
- `request_key` mencegah pengulangan; sumber dipasangkan dengan `source:book:<ID>` atau `source:bank:<ID>`.
- Backup database sebelum menambah fitur lebih lanjut. Tidak perlu menjalankan migrasi data lama berulang.
