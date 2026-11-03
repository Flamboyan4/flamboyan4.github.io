# Pedoman CSS Flamboyan 4 — satu pemilik per komponen

Tujuan: setiap perubahan tema/layout mengubah **aturan sumber yang sudah ada**, bukan membuat `<style>` baru atau override di akhir stylesheet. Jangan menghapus fitur, aturan autentikasi, atau aturan cetak demi mengurangi jumlah CSS.

## Pemilik gaya

| Komponen | File utama |
|---|---|
| Grid, kontrol seragam, topbar/sidebar terpadu | `portal-live/direct-shell.css` |
| Portal Utama: gaya kartu/agenda/keuangan publik | `portal-live/portal-polish.css`, `portal-live/home-base.css` |
| Penyesuaian Portal Utama yang belum dipindahkan | `portal-live/home-overrides.css` (migrasikan bertahap ke pemilik komponen) |
| Bank Sampah: halaman, form, navigasi | `portal-live/bank-eco-pages.css` |
| Bank Sampah: beranda dan indikator | `portal-live/bank-eco-dashboard.css` |
| Bank Sampah: tabungan, laporan, petunjuk anggota | `portal-live/bank-member-polish.css` |
| Gaya bersama lama Bank Sampah/Superadmin | `portal-live/modern-portals.css` (migrasikan bertahap setelah verifikasi) |
| Dokumentasi dan inventaris | `portal-live/dokumentasi/site.css` |
| Pusat Keuangan | `portal-live/treasury-center.css` |
| Komponen akun terpadu | `portal-live/unified-account.css` |
| Pembukuan | `pembukuan/index.html` (blok inline legacy yang tersisa; pertahankan media/print) |

## Aturan pengerjaan

1. Cari selector dan file pemiliknya sebelum mengedit. **Ubah deklarasi yang sudah ada di lokasi asal**. Hindari menambah selector sama di akhir file, stylesheet override baru, atau `!important` baru.
2. Bila aturan lama sudah dipastikan tertimpa oleh selector, konteks `@media` dan prioritas yang sama, hapus deklarasi mati dari sumbernya. Jangan menghapus fallback atau aturan lintas breakpoint tanpa pembuktian.
3. Pisahkan konteks `@media screen`, `@media print`, dan kelas role (`member`, `admin`, `public`). Selector sama pada konteks berbeda **bukan otomatis duplikasi**.
4. **Jangan mengubah** aturan `[hidden]`, startup/auth guard, dialog `inert`, navigasi akses, atau style cetak tanpa pengujian khusus. Kunci akses harus selalu ditegakkan di backend.
5. Jalankan `node qa/verify-unified-grid.cjs`, `node qa/verify-css-ownership.cjs`, `node qa/bank-eco-allpages.cjs`, dan smoke browser PC/tablet/HP. Lanjutkan uji peran sesudah login dan PDF/print.
6. Jika perlu komponen CSS baru, buat selector baru **pada stylesheet pemilik**, bukan `<style id="fix-...">` tambahan. Perubahan CSS yang benar perlu menurunkan atau mempertahankan jumlah pengulangan selector dalam media scope yang sama.

## Status konsolidasi 3 November 2026

- CSS HTML Pembukuan awalnya 61 blok, Bank Sampah 19 blok. Blok bersebelahan telah digabung tanpa mengubah urutan cascade, sambil menjaga style yang dibutuhkan oleh JavaScript/startup/print.
- Deklarasi duplikat identik telah dikurangi pada HTML serta stylesheet bersama. Audit mencegah penambahan prioritas paksa dan bertambahnya selector ganda tanpa disadari.
- Masih ada CSS lama yang efektif pada kondisi tertentu. Pembersihan lanjutan harus didasarkan pada computed style lintas role dan media, bukan penghapusan `!important` massal.
