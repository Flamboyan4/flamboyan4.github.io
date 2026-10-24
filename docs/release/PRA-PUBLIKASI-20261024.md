# Kesiapan Publikasi Flamboyan 4 (24 Oktober 2026)

## Struktur rilis
- Frontend sumber tetap `/uji-terpadu/` (uji dan revisi).
- Frontend produksi dibekukan sebagai snapshot `/portal-live/` (37 aset dari satu source revision).
- Root `index.html` domain `flamboyan4.web.id` menggunakan shell Portal Terpadu, referensi seluruh aset ke `/portal-live/` dan iframe halaman terkait.
- `/banksampah/` menjadi `/#bank-sampah`, `/pembukuan/` menjadi `/#pembukuan`, `/rapat/` menjadi `/#rapat`.
- `CNAME` tidak diubah; Cloudflare Worker API tetap `api.flamboyan4.web.id`.
- Perubahan ini hanya ada di branch `publikasi-flamboyan4-20261024`, PR #3 **Draft**, belum merger.

## Bukti pemeriksaan kode
- Snapshot `/portal-live/` **37 berkas**; seluruh 37 Git blob SHA identik dengan pasangan `/uji-terpadu/` di `main` commit `b828d635ee027392cf7708d01e871d561a134ab6` (verifikasi GitHub 24 Oktober 2026). Termasuk `pull-refresh.js`, jembatan Simpan Iuran, dan revisi frontend terbaru.
- Referensi statis root + 7 HTML panel pada pemeriksaan sebelumnya: 51 referensi file lokal valid. Angka ini tidak menggantikan pemeriksaan browser saat rilis.
- Inline JavaScript root dan panel lulus parsing; dua referensi template JS dinamis (${...}) bukan file.
- Arah redirect 3 URL lama benar dan tidak mengarah ke Apps Script.
- Hasil tes backend lokal candidate D1: 28/28 API; 19/19 form/setoran; 32/32 rekonsiliasi/pencairan; 36/36 pembatalan dan batch; 26/26 pengeluaran/inventaris/media; 7/7 laporan Pembukuan.
- Tes lokal bukan bukti operasi remote Cloudflare.

## **Gerbang wajib sebelum merge PR #3**
1. Backup Worker aktif dan ekspor D1 remote terbaru.
2. Deploy **sekali** kandidat Worker terkini dari paket release, tanpa mengaktifkan satu pun flag write.
3. Uji GET publik API/portal/Bank Sampah dan sesi login anggota; pastikan rincian kas lingkungan ditolak untuk anggota.
4. Uji Superadmin: Bank Sampah, Pembukuan Iuran/Riwayat/Kas/Laporan (RT, Arisan, Denda, Pinjaman, Talangan, Tahunan), Superadmin Akun & Hak Akses; semak nominal dan periode.
5. Pastikan laporan Tahunan `laporanSementara=true`, `bisaDitutup=false`; jangan menekan Tutup Buku.
6. Uji di PC dan HP, galeri/popup, navigasi, cetak PDF dan unduh CSV.
7. Semua percobaan tulis dilakukan dulu pada data/DB terisolasi, **bukan** langsung transaksi nyata. Ketika flag masih false, kegagalan simpan adalah yang diharapkan.
8. Verifikasi dana kas tidak ganda setelah pembayaran baru: sistem iuran Worker membuat jurnal otomatis; jangan mengulang sebagai pemasukan manual.
9. Setelah end-to-end lulus, retarget/merge PR #3 ke `main`, monitor dan dokumentasikan rollback.

## Hambatan yang belum dinyatakan selesai
- Fungsi penulisan Pembukuan **belum dihubungkan seluruhnya** dari form lama; sebagian alur Worker masih dikunci dan perlu pengujian terisolasi.
- PR #5 (`finalisasi-denda-pinjaman-20261024`) terpisah, Draft: adapter Denda/Pinjaman Cash-only telah lulus 13/13 skenario mock pada 24 Oktober (termasuk validasi tanggal riil dan retry idempoten), **bukan bukti pengujian Worker/D1 maupun izin untuk merge**. PR #3 belum menyertakan adapter ini; tetap pertahankan seluruh write flags OFF.
- Pengesahan dan pencairan Bank Sampah belum diuji tulis di Cloudflare.
- Laporan tahunan sementara; kas historis selain Kas Lorong September–Oktober belum direkonsiliasi penuh.
- Domain produksi dan autentikasi browser lengkap belum diuji setelah cutover (karena cutover belum dilakukan).

## Rollback
Catat SHA HEAD `main` tepat sebelum merge PR #3 dan simpan kopi `index.html`, tiga halaman legacy redirect, serta Worker sebelum deploy. Jika pascapublikasi gagal, pulihkan `index.html` + tiga redirect dari commit sebelum merge atau revert merge commit PR #3; folder uji tetap dapat diakses. Jika API gagal, rollback Worker melalui Cloudflare Deployments ke versi sebelumnya, tanpa mengembalikan D1 kecuali terbukti terjadi migrasi salah dan backup tersedia.

**Jangan otomatis mengaktifkan BANK_WRITE_ENABLED/FINANCE_WRITE_ENABLED saat menerbitkan frontend.**

## Kandidat Worker hasil pemeriksaan dua paket ZIP (24 Oktober, lanjutan)
- Kandidat `worker-kandidat-laporan-tahunan-d1-20261024.js` telah dibandingkan secara sumber dengan `worker-privasi-kas-akurat-20261024.js`: versi Tahunan adalah **superset** yang mempertahankan perhitungan kas seluruh baris dan otorisasi Superadmin; menambah endpoint laporan Tahunan read-only.
- Pengujian langsung kandidat revisi berikutnya di SQLite **sintetis**: **16/16** laporan Tahunan/Kas/privasi + batas 1.500 baris, **14/14** Denda/Pinjaman/idempotensi/metode Cash-QRIS-Transfer = **30/30 PASS**; syntax Node dan checksum ZIP tervalidasi. Ini **bukan** uji SQL asli maupun Cloudflare remote.
- Kode kandidat gabungan lokal bertanda SHA-256 `e221c1d18b9f49b4c429ef7ea321a99414e3cbc43f7cc1b0860f295c35623a12` (Worker tahunan + pelestarian metode transaksi Denda/Pinjaman). Kode ada dalam paket rilis lokal, **belum di-GitHub atau Cloudflare**; jangan deploy sebelum diff dengan Worker yang kini aktif.
- PR #5 frontend tetap Cash-only sampai Worker remote yang mendukung semua metode telah terverifikasi. Flag `FINANCE_WRITE_ENABLED`, `DENDA_PINJAMAN_WRITE_ENABLED`, seluruh `BANK_*_WRITE_ENABLED` tetap OFF.
- Backup SQL `flamboyan4-staging-20261024.sql` terindeks dalam Library, tetapi akses raw untuk menguji ulang database asli tidak tersedia; perlu backup/export D1 remote saat gerbang rilis.
- Tidak ada perubahan pada D1, Worker aktif, `main`, atau data historis melalui pemeriksaan ini. **PR #3 tetap Draft**.

## Verifikasi D1 backup nyata (24 Oktober, lanjutan terakhir)
- Pengelola memberikan `worker.js` dan `backup-d1-terbaru.sql` dari Cloudflare. **File privat tidak dikomit.** SQL berhasil dipulihkan ke SQLite lokal: 62 tabel, 21 trigger, `integrity_check = ok`, `foreign_key_check = 0`.
- `worker.js` unggahan hanya 53.595 byte dan menyebut 20 path API; kandidat terbaru 233 KB dan memiliki 79 path. Semua path lama muncul di kandidat, tetapi **cek source deployment Cloudflare yang sesungguhnya wajib** karena kode unggahan tidak menampakkan API v2 yang sebelumnya terlihat dalam UI. Jangan deploy buta.
- Kandidat lama gagal 1 tes Pinjaman terhadap trigger asli: `bookkeeping_loan_repayments.cash_transaction_id` menuntut jurnal kas lebih dulu. Patch memasukkan `bookkeeping_cash_transactions` **sebelum** `bookkeeping_loan_repayments` dalam D1.batch atomik.
- Kandidat revisi SHA-256: `d1aa6dfd879b9199cbf4542eab5424f1be0a5d08250460bb348fb6faab141599`. Paket privat: `PAKET_WORKER_TERVERIFIKASI_D1_ASLI_24OKT2026.zip`. **Tidak tersimpan di repository maupun terdeploy ke Cloudflare.**
- **48/48 pengujian lulus di salinan backup D1**, meliputi public/member/admin/Superadmin, laporan Tahunan sementara, Iuran dengan satu jurnal dan idempotensi, Denda, Pinjaman Cash/QRIS/Transfer, Bank Sampah setoran 1 kg Kardus estimasi Rp1.000, penjualan, konfirmasi 50:50 (termasuk retry), dan integritas. Seluruh transaksi uji hanya dalam database salinan. Pembayaran historis awal tetap 68 dalam backup.
- **Pengujian Cloudflare remote (source, bindings, flags, cookies, HP/PC, PDF/CSV) belum lulus dan belum dicoba menulis D1 remote.** Semua write flags tetap OFF, jangan merge PR #3 atau #5 sampai deploy kandidat tervalidasi dengan flags OFF dan uji end-to-end produksi lulus.

## KOREKSI IDENTITAS DEPLOYMENT — Worker asli diterima (24 Oktober, 21.21 WIB)
- Screenshot Cloudflare yang **benar**: Worker `flamboyan4-terpadu-staging` (bukan `flamboyan4-api-staging`), versi **`e77c471e`**, Ready, trafik **100%**. Screenshot deployment sebelumnya `e82ce231` adalah milik Worker **LAIN** dan **tidak boleh** dipakai untuk deploy backend Portal Terpadu.
- File unggahan terbaru `worker(1).js` sebesar 230.463 byte (SHA-256 `30cf8de41a88e0afb817a210db073c20608aaab5f5eb4a0e548736204b1bc2df`) **memang memiliki 33 kemunculan path `/api/v2/`**. Diskrepansi source sebelumnya dijelaskan oleh tertukarnya Worker. Screenshot saja tidak membuktikan bahwa bytes file Edit Code persis sama dengan deployment `e77c471e`; verifikasi versi di Cloudflare jika tersedia.
- Perbandingan baris dengan source kandidat D1 `d1aa6dfd879b9199cbf4542eab5424f1be0a5d08250460bb348fb6faab141599`: **98,19% kesamaan baris**. Delta patch 8 hunk menambah laporan Tahunan, membetulkan agregat Kas lebih dari 1.500 baris, mempertahankan metode Cash/QRIS/Transfer, dan memperbaiki urutan FK angsuran Pinjaman. Patch telah diaplikasikan ulang tanpa fuzz (setelah normalisasi CRLF→LF) dan menghasilkan **source kandidat identik byte-per-byte**.
- Pengujian ulang A/B langsung pada salinan database D1 autentik: source dari Worker benar `41/47`, kandidat `48/48`. Baseline gagal enam pemeriksaan (endpoint Tahunan dan kontrol akses endpoint tersebut, label QRIS/Transfer, dan FK angsuran). Dua respons `503` pada pengujian kandidat adalah penolakan **sengaja** karena flags OFF.
- Paket rilis privat khusus versi ini: `PAKET_PATCH_WORKER_TERPADU_e77c471e_24OKT2026.zip`. Source Worker, patch, manifest, tes; **tidak memuat backup SQL pribadi**. Jangan commit Worker/SQL ke repo publik.
- **Belum deploy.** Langkah berikutnya verifikasi Cloudflare Domains (domain `api.flamboyan4.web.id` mengarah ke Worker ini), Bindings `DB` / `PHOTOS`, dan konfigurasi flag write OFF. Tidak ada mutasi Cloudflare D1 atau merge PR #3/#5.

## Konfirmasi screenshot Cloudflare Settings & Domains (24 Oktober, 21.31 WIB)
- Screenshot **Domains** `flamboyan4-terpadu-staging`: Custom Domain `api.flamboyan4.web.id` terdaftar dengan zone `flamboyan4.web.id`. Workers.dev production juga aktif. Ini menutup blocker *identifikasi domain/Worker*.
- Screenshot **Settings → Bindings**: `DB` adalah D1 `flamboyan4-staging`; `PHOTOS` adalah R2 `flamboyan4-profile-images-staging`. Ini menutup blocker *identifikasi binding*.
- Screenshot **Variables and secrets**: `AUTH_ENABLED=true`; `BANK_WRITE_ENABLED`, `DENDA_PINJAMAN_WRITE_ENABLED`, `FINANCE_WRITE_ENABLED`, `IURAN_WRITE_ENABLED`, `MANUAL_CASH_WRITE_ENABLED`, `PORTAL_WRITE_ENABLED`, `RECONCILIATION_CONF...`, `SALE_DRAFT_ENABLED`, `TALANGAN_WRITE_ENABLED`, `ACCOUNTING_RULES_AP...` semuanya `false` yang terlihat. `ALLOWED_ORIGINS` ada tetapi nilainya terpotong screenshot; jangan menganggap seluruh isinya sudah diperiksa. Flag write lain yang tidak tampil harus dicek lewat GET features setelah deploy atau dipertahankan default false; jangan secara sengaja mengaktifkan.
- Paket `PAKET_PATCH_WORKER_TERPADU_e77c471e_24OKT2026.zip` diekstrak kembali dan pengujian Node 22 + salinan D1 dari `backup-d1-terbaru.sql` **48/48 PASS**; SHA kandidat `d1aa6dfd879b9199cbf4542eab5424f1be0a5d08250460bb348fb6faab141599`; pemeriksaan sintaks Node juga lulus.
- **Siap memasuki deploy tahap 1 (user lewat Cloudflare UI)** ke **Worker sama**, tanpa mengubah binding, variables, domain, D1, atau R2. Ini **bukan** bukti bahwa deploy telah dijalankan. Setelah deploy wajib GET `/api/health`, GET `/api/v2/system/features`, GET portal/bank umum; API privasi tahunan hanya setelah login Superadmin dan pengujian pengguna lain tidak dapat mengaksesnya. **Jangan mengaktifkan writes atau merge PR #3/#5 sebelum smoke test remote lulus**.

## Screenshot smoke-test Cloudflare API, 24 Oktober 2026 pukul 21.36 WIB
- Pengelola menunjukkan respons `GET https://api.flamboyan4.web.id/api/health`: `ok:true`, `service:"flamboyan4-api"`, `mode:"migration-preview"`; **PASS konektivitas**.
- Pengelola menunjukkan respons `GET https://api.flamboyan4.web.id/api/v2/system/features`: `ok:true`, `api:"v2"`, `frontend:"github-pages"`, `storage:"d1+r2"`; delapan status penulisan (`bankWrites`, `bookkeepingWrites`, `bankReconciliationWrites`, `bankCancellationWrites`, `bankExpenseWrites`, `bankInventoryWrites`, `bankMediaWrites`, `bankPayoutWrites`) `false`. Screenshot hanya membuktikan field yang tampil, bukan seluruh konfigurasi backend.
- **Jangan tandai deploy kandidat selesai hanya dari kedua GET ini**, karena hasilnya mungkin sama pada versi Worker sebelumnya. Belum ada screenshot **Version ID baru**. Periksa GET `/api/bookkeeping/reports/yearly?year=2026` tanpa sesi: kandidat semestinya `401` (atau `200` jika login Superadmin), sementara baseline lama `404`. Lanjutkan verifikasi otorisasi Anggota/Admin dan GET halaman publik sebelum merge.
- Tidak ada penulisan atau reset database dan tidak ada merge PR #3/#5 pada tahap ini.

## Smoke test endpoint Tahunan — screenshot 24 Oktober 2026 pukul 21.39 WIB
- Browser berhasil memanggil `GET https://api.flamboyan4.web.id/api/bookkeeping/reports/yearly?year=2026` dan menerima JSON `{"ok":false,"error":"Akses tidak diizinkan."}`; ini merupakan **403 role-denied** pada kandidat baru untuk sesi valid tanpa peran Superadmin. `requireRole()` milik kandidat membedakan `401` tanpa sesi dari `403` sesi tidak berhak.
- Endpoint ini **tidak ada** pada `worker(1).js` (baseline source), yang akan mengembalikan `404 Endpoint belum tersedia.`; oleh karena itu respons screenshot konsisten dengan kode kandidat yang telah aktif. **Belum cukup untuk membuktikan SHA/deployment version terbaru dan laporan Tahunan berhasil untuk Superadmin**.
- Hindari menguji dengan membagikan kredensial atau token; lanjutkan dengan screenshot **Deployments → Active deployment Version ID terbaru**, serta uji halaman dan data melalui sesi web Superadmin yang sah. Delapan flag write Bank Sampah sebelumnya masih OFF menurut screenshot; finance flags OFF menurut Settings.
