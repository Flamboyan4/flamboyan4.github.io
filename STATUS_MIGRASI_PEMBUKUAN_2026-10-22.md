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