# Pusat Keuangan Flamboyan 4 — SOP awal (30 Oktober 2026)

## Dua dimensi wajib
- **Tempat uang**: Cash Kas Lorong, Cash Bank Sampah, Cash Jersey, Cash masing-masing projek baru, QRIS bersama, Mandiri bersama.
- **Pos/hak dana**: Kas Lorong (Humas), Bank Sampah Hak Warga, Bank Sampah Lingkungan, Jersey, dan projek lain.
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
- **Pindah Pos**: perpindahan hak atau serah-terima misalnya Bank Sampah lingkungan ke Kas Lorong. Saldo keseluruhan tidak berubah.
- **Dana Masuk/Keluar** manual hanya untuk transaksi yang belum tercatat di modul sumber dan belum dihubungkan; periksa dahulu untuk mencegah pencatatan ganda.
- Jurnal Kas Lorong yang sudah diposting setelah tanggal batas dapat dipasangkan sebagai Cash Kas Lorong dengan tombol **Sinkronkan Buku Kas** (25 per proses; ulangi hingga habis). Pembayaran iuran yang belum dibukukan **tidak** ikut.
- Jurnal Bank Sampah setelah tanggal batas dipasangkan satu per satu, dengan memilih lokasi uang sebenarnya (Cash Bank Sampah, QRIS atau Mandiri). Jangan menganggap estimasi setoran sebagai penerimaan.
- Bila nilai/status transaksi asal berubah setelah dipasangkan, Pusat Keuangan menampilkan peringatan. Periksa sebelum membuat koreksi; tidak ada perubahan otomatis pada transaksi sumber.

## Batas fase awal
- Modul sumber yang dibaca: transaksi Buku Kas terposting dan jurnal Bank Sampah berstatus aktif. Pencocokan tidak mengubah kedua sumber tersebut.
- **Jersey lama**, pesanan projek dan jenis transaksi di luar dua jurnal itu **belum disinkron otomatis**. Catat saldo awalnya, dan mutasi setelah batas melalui Pusat Keuangan secara terverifikasi; jangan mencampur dengan Kas Lorong.
- Tidak ada pemindahan uang bank/QRIS sungguhan oleh website. Ini pencatatan, bukan integrasi perbankan.
- Tidak ada saldo historis yang diimpor otomatis: sumber transaksi lama tetap berada di modul asal dan tidak dihapus.
- Saldo pusat baru dapat dianggap lengkap setelah semua saldo awal disahkan, transaksi sumber yang relevan dipasangkan, dan setiap sumber tanpa jurnal dinilai terpisah.

## Aspek teknis dan keamanan
- Worker menggunakan role **superadmin** pada server untuk seluruh GET/POST Pusat Keuangan. Hak tulis mengikuti `FINANCE_WRITE_ENABLED`.
- Jurnal `treasury_events` / `treasury_entries` bersifat aditif; perpindahan tercatat sebagai debit/kredit berpasangan dalam `D1.batch` atomik.
- Debit divalidasi ulang di dalam transaksi SQLite dan ditolak jika menyebabkan saldo lokasi-pos negatif.
- `request_key` mencegah pengulangan; sumber dipasangkan dengan `source:book:<ID>` atau `source:bank:<ID>`.
- Backup database sebelum menambah fitur lebih lanjut. Tidak perlu menjalankan migrasi data lama berulang.

## Batas kepemilikan dana iuran
- Pembukuan Iuran mencatat tiga pos: **Kas Lorong**, **Setoran RT** (Iuran RT dan Kebersihan), dan **Arisan**.
- Pusat Keuangan Humas hanya mengakui **Kas Lorong yang sudah masuk jurnal kas**, beserta denda dan pemasukan/pengeluaran lain yang memang dikelola Humas.
- Setoran RT dan Arisan **tidak** dihitung sebagai saldo Kas Lorong dan **tidak** disinkron melalui tombol Kas Lorong, meskipun dibayar dalam satu transaksi warga.
- Metode pembayaran QRIS/Mandiri pada transaksi warga tidak otomatis berarti seluruh uang itu milik Humas. Catat hanya porsi dan penerimaan yang benar-benar dikuasai dan telah dibukukan.
- ID internal historis `kas_rt` / `cash:kas_rt` sementara dipertahankan untuk integritas mutasi D1 lama. Label yang terlihat pengguna dan tercetak adalah **Kas Lorong**; jangan mengganti ID tanpa migrasi tervalidasi.

## Antarmuka ringkas (30 Oktober 2026)
- Kalender dibuka dengan urutan **Minggu–Sabtu**, bukan Senin–Minggu.
- Sebelum pengesahan hanya ada satu formulir tanggal dan tabel saldo per program: **Cash**, **QRIS**, **Mandiri**. Kolom kosong berarti Rp0.
- Isi Cash sesuai uang tunai di masing-masing program, QRIS hanya saldo belum cair, dan Mandiri saldo yang sudah masuk bank. Total QRIS/Mandiri dapat terbagi kepemilikannya ke beberapa program.
- Pilih **Simpan Saldo Awal** untuk menyimpan semua nilai sekaligus. Sebelum disahkan, revisi nominal yang keliru dapat disimpan sebagai selisih jurnal sehingga audit tetap utuh; tanggal pembuka tidak bisa diubah sesudah isian pertama tersimpan.
- Setelah memeriksa total dan posisi, pilih **Sahkan Saldo**. Angka pembuka akan terkunci; transaksi berikutnya masuk di **Mutasi Dana**.
- Jika telah ada data saldo awal atau perbedaan tanggal dari versi lama, verifikasi riwayat dan jangan sahkan angka yang belum cocok.

## Tampilan setelah saldo awal disahkan — 30 Oktober 2026
- Riwayat transaksi menampilkan **satu baris per kegiatan**. Perpindahan QRIS ke Cash adalah satu kejadian (tempat asal dan tujuan), bukan dua pemasukan/pengeluaran.
- Semua penyesuaian saldo pembuka sebelum pengesahan **tetap tersimpan di jurnal dan audit** tetapi tidak muncul sebagai pengeluaran/penerimaan biasa. Pengurus dapat melihat ringkasan **Saldo awal** final berdasarkan penjumlahan seluruh jurnal opening.
- Form **Catat Mutasi Dana** dalam panel ringkas yang bisa dibuka ketika diperlukan. Panel Cocokkan Transaksi Portal disembunyikan jika tidak ada transaksi menunggu dan tidak ada peringatan.
- **Cetak Laporan** membuat dokumen tersendiri sesuai gaya Pembukuan: kop logo, alamat, 3 ringkasan, rincian program, rincian transaksi, garis tabel hitam, dan pengesahan. Tidak mencetak navigasi Superadmin atau semua kartu di layar.
- File `portal-live/treasury-center.css` menjadi satu sumber style antarmuka Pusat Keuangan, tanpa tumpukan aturan cetak maupun override `!important`; cetak mengandung style terisolasi di dokumen iframe.
- Laporan mencakup seluruh riwayat yang dimuat (maksimum 800 baris jurnal). Cetak diblokir jika data riwayat belum lengkap agar laporan tidak terpotong tanpa diketahui.

## Pembaruan: otomatis terdeteksi, ditinjau lalu disahkan (30 Oktober 2026)
- **Pusat Keuangan adalah layar pengawasan**. Sumber transaksi tetap masing-masing modul. Sistem membaca transaksi baru setiap membuka halaman; bila terbuka, memeriksa perubahan setiap sekitar 45 detik. Tidak menambah saldo secara diam-diam.
- Bagian **Menunggu Pemeriksaan** memuat: jurnal Kas Lorong yang sudah dibukukan (termasuk denda/donasi umum dan pemasukan lain yang memang dikelola Humas); jurnal Bank Sampah aktif yang sudah sah; kontribusi program penggalangan dana dengan tanggal kontribusi; serta **kenaikan pembayaran baru** Jersey/pesanan barang yang dicatat lewat editor Superadmin setelah saldo awal disahkan.
- Sumber dari Jersey lama tanpa **tanggal penerimaan** tidak diimpor sebagai pemasukan baru. Kenaikan pembayaran yang tersimpan baru membentuk observasi sementara; verifikasi penerimaan sebenarnya sebelum pengesahan.
- Review per baris: cocokkan nominal dan program, pilih **Cash per program**, **QRIS belum cair**, atau **Mandiri** yang sudah masuk. Klik **Periksa & Sahkan**; setelah disahkan barulah mutasi dibuat dalam jurnal dan saldo/print bertambah atau berkurang.
- Untuk transaksi **sehari dengan tanggal saldo awal**, harus memastikan uang belum termasuk di saldo pembuka. Yang sudah termasuk dapat diberi status **Sudah Tercakup**, dengan alasan dan jejak audit. Status itu bisa dipulihkan; transaksi asli tidak dihapus.
- Kotak pos tidak lagi harus terbatas empat bawaan. Program penggalangan atau pemesanan baru otomatis punya pos. Superadmin dapat **Tambah Pos Dana** untuk keperluan lain (mis. Donasi Gapura) dengan hak uang terpisah. Donasi umum yang masuk jurnal Kas Lorong tetap menjadi kas Humas dengan kategori Donasi, bukan secara otomatis dipindah ke pos khusus.
- Rekening QRIS/Mandiri dipakai bersama antarprogram, sedangkan Cash per program terpisah. **QRIS yang sudah cair ke Mandiri tidak boleh dihitung dua kali**; pencairan QRIS → Mandiri adalah Pindah Tempat, bukan pemasukan baru.
- Transaksi yang telah disahkan tetapi sumbernya diubah/dibatalkan memerlukan audit/koreksi; pengesahan pusat tidak mengedit buku asal. Jangan membuat entri manual kedua untuk sumber yang sama.
- Untuk penerimaan yang tidak memiliki catatan transaksi asal, **Catat Mutasi Dana** tetap tersedia sebagai pengecualian; keterangan wajib menyebut asal dan peruntukan.
- **Batasan yang masih berlaku:** tidak ada koneksi real-time ke bank/penyedia QRIS; “otomatis terdeteksi” berarti setelah pencatatan di modul, bukan dana fisik langsung dibaca dari rekening. Pembayaran campuran tidak ditebak lokasinya. Dataset Jersey lama yang tidak memiliki tanggal penerimaan wajib ditinjau manual; peristiwa baru setelah fitur dipasang saja yang dideteksi.
- Untuk sumber yang diedit/dibatalkan sesudah pengesahan, mutasi lama tidak diam-diam diubah. Perubahan itu harus diperiksa dan dikoreksi dengan transaksi baru atau prosedur audit.

## Deteksi saldo Bank Sampah yang sudah disahkan
- Setelah penjualan disahkan, Bank Sampah menulis beberapa baris `waste_cash_ledger` dengan `fund_position` sebenarnya: `tabungan_warga`, `operasional`, `kas_lorong`, dan `cadangan` (hanya baris berjumlah positif).
- Pusat Keuangan harus membaca semuanya, bukan hanya `tabungan_warga`. Pemetaan:
  - `tabungan_warga` → Bank Sampah — Hak Warga;
  - `operasional` dan warisan `lingkungan` → Bank Sampah — Kas Pengelola;
  - `kas_lorong` → Bank Sampah — Bagian Kas Lorong, **belum** otomatis masuk Cash Humas; perlu pemindahan pos/tempat setelah penyerahan uang;
  - `cadangan` → Bank Sampah — Cadangan.
- Untuk penjualan yang dicatat bertanggal lama tetapi **baru disahkan sesudah Pusat Keuangan aktif**, tanggal pengesahan batch menjadi tanggal *usulan posting* di Pusat Keuangan; tanggal asli penjualan tetap ditampilkan sebagai referensi. Ini untuk menghindari hilangnya transaksi akibat tanggal penjualan lebih lama dari tanggal saldo awal.
- Penjualan yang **sudah disahkan sebelum saldo awal** tidak langsung dibukukan sebagai pemasukan baru. Angka netonya tetap terlihat pada bagian **Saldo sumber Bank Sampah**, sehingga bisa dibandingkan dengan posisi pusat. Jika belum masuk saldo awal, lakukan pemeriksaan/koreksi tercatat; jangan mengimpor ulang secara otomatis.
- Modul sumber Bank Sampah tetap pemilik data rinci; Pusat Keuangan hanya mengusulkan untuk diperiksa. Pilih lokasi Cash Bank Sampah, QRIS bersama, atau Mandiri bersama sesuai fisik uang lalu **Periksa & Sahkan**. Jangan masukkan dana berulang.

## Sahkan saldo Bank Sampah yang sudah tercatat di sumber
- **Periksa Dana → Saldo Bank Sampah** menampilkan saldo sumber dan saldo pusat per pos; pengurus memilih Cash/QRIS/Mandiri lalu tombol **Sahkan Rp…** sesuai selisih positif.
- Saldo sumber dapat berasal dari transaksi sebelum saldo awal; pengesahan hanya dilakukan **jika uang benar-benar belum dimasukkan dalam saldo awal dan berada pada tempat yang dipilih**. Tidak ada pengesahan otomatis.
- Backend membandingkan saldo sumber dan pusat secara atomik, lalu menyimpan selisih dalam satu jurnal. Semua ID transaksi Bank Sampah sumber saat itu ditandai dalam `treasury_bank_source_coverage` agar tidak bisa disahkan kembali per transaksi.
- Jika transaksi sumber berubah atau hilang setelah disahkan, dashboard memberi peringatan audit. Bila posisi pusat sudah dipindahkan dan tidak ada sumber baru, tombol **Sahkan** tidak ditawarkan lagi meskipun nominal sumber berbeda.
- **Pindah Dana** dipakai untuk QRIS → Mandiri, Mandiri → Cash, antarprogram, atau penyesuaian manual khusus; pemindahan tidak membuat pemasukan baru.
