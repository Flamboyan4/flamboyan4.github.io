# Aktivasi operasional Flamboyan 4 — 25 Oktober 2026

## Perbaikan yang sudah masuk branch staging
- Memetakan tombol UI asli Pembukuan ke Worker D1, tidak menggunakan Apps Script: tambah/edit/batal Kas manual baru, catat/bayar Denda, buat/bayar Pinjaman, buat Talangan. Iuran memakai adapter yang sudah ada.
- Memetakan baca D1 Kas manual dengan sumber `INPUT_WEB` hanya jika ID `cash-UUID`, bukan historis `cash:KAS...`. Jurnal historis dan `cash:KAS0011` terlindung dari tombol edit/batal.
- Memetakan Bank Sampah: detail setoran/penjualan, progres admin, batch disahkan. Update kategori album dan progres ke endpoint POST baru dengan role/flag dan audit.
- Memuat JS reader Bank Sampah eksternal terbaru **sebelum** write bridge di shell yang sebenarnya. Sebelum perbaikan, file `live-bank-readonly.js` standalone tidak dimuat oleh `bank-sampah/index.html` karena reader lama ditempel inline.
- Memperbarui versi asset browser. Snapshot `uji-terpadu/` dan `portal-live/` disamakan; perubahan layout utama tidak dilakukan.

## Worker sumber kandidat lokal, belum deployed
File pribadi `worker-terpadu-operasional-teruji.js`; SHA256 `6f913d0d99457c66440d0241fc27e1e64d3f2152cbb4cfff1187ac68c9c59f11`.
Berbasis Worker saldo awal valid yang sebelumnya dideploy, dengan patch:
- Kas Iuran hanya porsi `KAS_LORONG`; Bulanan/Kebersihan/Arisan tetap dialokasikan tanpa memperbesar Kas Warga.
- FK pelunasan Talangan: tulis Kas sebelum transaksi repayment dalam D1.batch atomik.
- Endpoint kategori album dan perkembangan bisa diubah hanya dengan role Admin/Superadmin dan `BANK_WRITE_ENABLED=true`, menggunakan audit_log. Tidak mengubah database historis.
- **Jangan masukkan Worker penuh/backup D1 ke repo publik**.

## Hasil pengujian terisolasi
- **17/17** mock frontend Pembukuan operasi (termasuk pencegahan double POST dan legacy Kas).
- **5/5** verifikasi sumber manual/historis/status BATAL dari D1 ke frontend.
- **4/4** mock Bank D1 detail/progress/final batch.
- **25/25** uji Worker transaksi Pembukuan di clone SQLite asli (Kas/Denda/Pinjaman/Talangan, termasuk izin/role, ledger, idempotensi, FK dan rollback).
- **50/50** uji Iuran/Kas dan 50:50 Bank terhadap clone D1 asli.
- **61/61** uji alur Bank Sampah terhadap clone D1 asli (setoran, penjualan, hak 50:50, pengeluaran, inventaris, pencairan, album, media link, progres edit). Uji penolakan saldo tidak cukup mengembalikan 409, bukan membuat jurnal uang palsu.
- Semua cek akhir SQLite integrity dan FK di masing-masing suite lulus.

## Batas yang belum diloloskan untuk operasi publik
- Semua flags tulis Cloudflare **masih OFF**. Merge frontend hanya memasang adapter, tidak bisa membuat transaksi baru sampai Worker kandidat dan flag dinyalakan oleh pemilik Cloudflare.
- Belum ada hasil live E2E transaksi baru dengan akun Superadmin/Admin setelah pemasangan Worker kandidat.
- Talangan belum memiliki scheduler 14 hari; tetap OFF sampai alur jatuh tempo ditentukan. Pelunasan Kas diuji sebagai transaksi atomik pada clone.
- Pembatalan pengesahan batch Bank Sampah belum memiliki rollback lintas ledger yang aman. Jangan aktifkan secara diam-diam; tombol tetap ditolak.
- Koreksi/hapus Denda dan Pinjaman historis, tanggal Kas lama, Tutup Buku final dan arsip harus tunduk pada prosedur khusus dan tidak disamakan dengan aksi create/pay normal.
- Tidak boleh mengaktifkan semua flags sekaligus atau membuat data uji pada D1 remote tanpa preflight, backup, dan hak akses.

## Gerbang rilis
1. Backup D1 remote baru dan bandingkan kondisi dengan backup yang diuji.
2. Deploy kandidat Worker pada `flamboyan4-terpadu-staging` sambil mempertahankan `DB`, `PHOTOS`, `ALLOWED_ORIGINS` dan auth.
3. Uji GET privasi tiap role, nilai saldo awal Rp794.000 dan saldo akhir kas Rp1.414.500.
4. Nyalakan flag per modul secara bertahap dengan catatan verifikasi; buat pembayaran/transaksi yang sah, muat ulang data, cek kas/ledger dan cetak.
5. Baru setelah semua pass nyatakan **operasional penuh**. Jangan klaim tahap 4 selesai hanya karena frontend ter-merge.
