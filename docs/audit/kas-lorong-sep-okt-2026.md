# Rekonsiliasi Kas Lorong September–Oktober 2026 (terkonfirmasi)
**Proyek:** Flamboyan 4 — staging, hanya dokumentasi audit  
**Status:** Penjelasan selisih nominal selesai; jurnal asli tidak diubah.  
**Dasar:** Backup D1/Excel, pemeriksaan 24 Oktober 2026, serta konfirmasi pengelola pada percakapan yang sama.

> Dokumen ini sengaja menggunakan ID transaksi, bukan nama/alamat lengkap warga, agar tidak memperluas paparan data pribadi di repository GitHub.

## Aturan operasional yang dikonfirmasi
Pembayaran warga, bulan kewajiban yang dibayar, serta tanggal pencatatan/rekap Kas Lorong tidak harus sama. Pembukuan warga memiliki tiga tahap operasional:
1. Periode utama saat penyetoran ke RT, umumnya tanggal 10.
2. Periode Arisan; waktunya fleksibel dan terdapat pembacaan laporan keuangan.
3. Periode pelunasan terakhir apabila masih ada warga yang belum membayar.

Ketiga **tahap rekap** ini bukan pengganti **bulan kewajiban** iuran. Satu pembayaran dapat melunasi kewajiban beberapa bulan berbeda.

Pengelola mengonfirmasi bahwa pembukuan yang ia kelola **belum mencakup bulan Agustus 2026**. Karena itu, tunggakan Agustus yang diterima belakangan harus dicatat sebagai **penerimaan pelunasan tunggakan lama** pada tanggal penerimaan/pembukuan yang asli, bukan dibuatkan transaksi kas Agustus fiktif.

## Jurnal asli Kas Lorong yang diperiksa
| ID | Tanggal jurnal | Keterangan awal | Masuk |
|---|---|---|---:|
| KAS0012 | 2026-09-05 | Kas September 25 orang | Rp250.000 |
| KAS0013 | 2026-09-10 | Kas September 5 orang | Rp50.000 |
| KAS0015 | 2026-09-13 | Kas September 2 orang | Rp20.000 |
| KAS0017 | 2026-10-03 | Kas Susulan | Rp15.000 |
| KAS0018 | 2026-10-03 | Kas Oktober 20 orang | Rp200.000 |
| KAS0019 | 2026-10-10 | Kas Oktober 13 orang | Rp130.000 |
| **Total** | | | **Rp665.000** |

### Bukti pendukung khusus pembayaran susulan
Pembayaran dengan ID **PAY0031** dan **PAY0062** masing-masing memuat alokasi Kas Lorong Rp10.000 untuk September dan Oktober, dengan tanggal penerimaan tercatat 2026-09-29. Pengelola mengonfirmasi bahwa **KAS0017 Rp15.000** terdiri dari:
- **Rp10.000**: pelunasan Kas Lorong **September**.
- **Rp5.000**: pelunasan sisa **Agustus**, yakni masa sebelum pembukuan pengelola dimulai.

**KAS0017 tidak mencatat pembayaran Oktober.** Tanggal jurnal 2026-10-03 tetap disimpan sebagaimana aslinya, terlepas dari bulan asal kewajiban.

## Rekonsiliasi nominal menurut bulan kewajiban
| Komponen | September | Oktober |
|---|---:|---:|
| Jurnal dengan tanggal di bulan tersebut | Rp320.000 | Rp345.000 |
| Alokasi pembayaran susulan September dari KAS0017 | +Rp10.000 | −Rp10.000 |
| Pelunasan kewajiban Agustus dari KAS0017 | Rp0 | −Rp5.000 |
| **Jurnal yang teratribusikan menurut bulan kewajiban** | **Rp330.000** | **Rp330.000** |
| Alokasi Kas Lorong dari Iuran | Rp330.000 | Rp330.000 |
| **Selisih nominal teratribusikan** | **Rp0** | **Rp0** |

Bukti: total jurnal September–Oktober Rp665.000 = alokasi Kas Lorong untuk September dan Oktober Rp660.000 + pelunasan tunggakan sebelum masa pembukuan Rp5.000.

**Penting:** Selisih nominal telah terjelaskan secara manual, tetapi bukan berarti setiap pembayaran sudah memiliki relasi jurnal individual. Masih diperlukan *crosswalk* bila laporan memakai relasi antara pembayaran, alokasi, dan jurnal.

## Catatan tanggal yang tetap perlu diperiksa
Jurnal **KAS0019 tertanggal 2026-10-10** menyebut rekap 13 orang, sementara dua pembayaran yang dapat masuk ke kelompok tersebut memiliki tanggal pembayaran 2026-10-11 dan 2026-10-12. Ini belum tentu kesalahan nominal dan jangan otomatis mengubah tanggal. Periksa apakah rekap kelompok telah disusun sebelum pelunasan terakhir, atau apakah tanggal jurnal/entry berbeda dari tanggal transaksi individual.

## Aturan pemrosesan laporan / migrasi
1. **Jangan menggandakan 68 penerimaan iuran sebagai jurnal kas baru.** Jurnal kolektif yang sudah ada harus dipetakan lebih dahulu.
2. Bedakan dimensi `bulan_kewajiban`, `tanggal_pembayaran`, `tanggal_jurnal`, dan `tahap_rekap` (RT, Arisan, Pelunasan Akhir).
3. Nilai Rp5.000 tetap menjadi **kas benar-benar diterima pada pembukuan yang ada** dengan label **pelunasan tunggakan pra-periode pengelola**, bukan saldo pembuka atau transaksi Agustus yang direkayasa.
4. Jaga total jurnal Rp665.000; pemetaan bukan menambah Rp5.000 lagi. Jangan mengubah ID, tanggal atau nominal jurnal asli.
5. Laporan tahun penuh tetap **sementara** sampai jurnal kas dan alokasi seluruh kategori telah direkonsiliasi, walaupun khusus selisih Kas Lorong September–Oktober telah terjawab.
6. Bila dibuat tabel pencocokan di D1, buat relasi **read-only / mapping** terlebih dahulu dan baru migrasikan setelah diverifikasi; jangan membebankan mutasi saldo baru ke mapping.
7. Uji akhir laporan dua sudut pandang: (a) **kas diterima menurut tanggal jurnal** dan (b) **iuran per bulan kewajiban**; kedua total dapat berbeda dalam satu bulan tanpa menjadi kesalahan.

**Tidak ada perubahan database, Worker, atau website produksi melalui dokumentasi ini.**
