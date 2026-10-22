# Status migrasi Pembukuan — 22 Oktober 2026 (STAGING)

Sudah dilakukan:
- D1 staging operator sudah berisi 33 riwayat penghuni, 4 tarif, 2 inventaris Bank Sampah, 3 progres, dan 487 source maps.
- Frontend read-only dikomit ke integrasi-3portal-staging dan main/uji-integrasi saja, bukan portal aktif.
- Sumber D1 ditambahkan ke UI: tarif iuran, pembayar, sisa kewajiban, audit jurnal, audit tutup buku dan kesiapan denda.
- Spreadsheet Administrasi Warga dibandingkan dengan pemetaan D1: 34 pembayar (33 warga dan 1 lembaga), ID/nama/rumah/status sesuai.
- SQL tambahan 34 kewajiban iuran disiapkan, **belum diimpor online**. Simulasi idempotent, 68 pembayaran, 68 alokasi, 18 kas, 8 denda tidak berubah.
- Worker staging baseline 21 Okt salah merujuk households.block_code/house_number; kolom sebenarnya adalah house_code. Payer list juga keliru mengecualikan lembaga.
- Patch Worker fail-closed sudah disiapkan di paket unduhan; **belum deploy**.
- Preflight sebelumnya HTTP 500 jika tabel bookkeeping_dp_cash_links dan bookkeeping_fine_payments tidak ada. Patch memberikan status BLOKIR_SKEMA tanpa menganggap saldo akhir sudah benar.
- Lokal: 29 tes Worker utama dan 10 tes khusus Pembukuan lulus; belum verifikasi Worker online.

Sisa tindakan:
1. Impor SQL kewajiban 34 baris ke D1 staging lalu cek jumlah unit 33/32/33/26.
2. Patch Worker lokal HANYA jika SHA256 cocok dengan versi baseline, backup lalu deploy hanya Worker staging.
3. Flags FINANCE_WRITE_ENABLED dan IURAN_WRITE_ENABLED tetap false.
4. Jangan tutup buku sampai jurnal, schema Denda/Pinjaman, saldo awal dan arsip terverifikasi.
5. Selanjutnya Bank Sampah (rekonsiliasi/penjualan/tabungan) dan Portal Utama (penggantian Apps Script dan Firebase yang aman).

Jangan unggah ekspor D1 berisi data pribadi ke repositori publik.
## Update 22 Okt 2026 — setelah operator deploy Worker dan D1
- D1 online terverifikasi dari screenshot operator: 34 kewajiban, satuan 33/32/33/26.
- Worker staging `flamboyan4-terpadu-staging` berhasil dideploy; seluruh flag transaksi tetap false.
- Halaman `/uji-integrasi/pembukuan/` dari screenshot operator: Input Iuran memuat data, Riwayat Iuran menampilkan 68 pembayaran.
- Frontend: modul tambahan `finance-period-report.js` untuk laporan kas per bulan dan `finance-audit-reports.js` untuk Denda, Pinjaman, Talangan, Audit Rekonsiliasi, hanya di branch staging dan main/uji-integrasi.
- Salinan database lokal rekonstruksi: 68 pembayaran aktif senilai Rp6.710.000; 68 TANPA tautan kas individual (`source_payment_id`), 0 selisih alokasi, 18 jurnal kas (total debit Rp1.814.000/kredit Rp319.500). Hubungan jurnal historis belum disahkan dan tidak boleh dibuat otomatis.
- Periode Oktober pada salinan yang diaudit: 12 jurnal aktif, debit Rp673.000/kredit Rp229.500, selisih periode Rp443.500 (bukan saldo akhir).
- Denda 8, tagihan Rp160.000, rekap dibayar Rp80.000. Pinjaman 0 di D1. Talangan 1, pokok Rp45.000, ringkasan pelunasan Rp45.000.
- Pengujian baru 9 dari 9 endpoint Worker terhadap rekonstruksi lokal PASS, termasuk read-only auth; UI modul baru belum dibuktikan melalui browser.
- Masih BLOKIR pencatatan baru/tutup buku: verifikasi tautan kas gabungan, saldo awal, arsip tahunan, dan aturan transaksi; tidak menggandakan jurnal historis.
- Perubahan frontend main HANYA di bawah `uji-integrasi/`, bukan halaman produksi.