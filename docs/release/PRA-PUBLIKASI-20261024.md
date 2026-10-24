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
