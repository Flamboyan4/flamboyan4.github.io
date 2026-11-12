# Galeri Warga — Google Drive dan Cloudflare D1

## Status implementasi (12 November 2026)

- Frontend: halaman Dokumentasi, unggah foto satu atau banyak, reaksi, komentar, bagikan, panel superadmin, dan Cerita Warga di Beranda.
- Backend: Worker API `/api/v2/gallery`, `/social`, `/upload`, `/album`, `/react`, `/comment`, `/report`, dan `/admin`.
- Database: tabel `f4_gallery_*` pada D1. Migrasi idempoten: `cloudflare/migrations/20261112_galeri_warga.sql`.
- Penyimpanan: Google Drive (tidak menggunakan R2 untuk unggahan komunitas).
- **Upload tidak dapat diaktifkan tanpa OAuth Google Drive yang sah.** API publik menyertakan `uploadEnabled: false` jika binding OAuth belum lengkap.

## Folder yang sudah diverifikasi (13 November 2026)

- Folder induk: **Kegiatan Flamboyan IV**, ID `1Vfc92ToG71v2QfibvFz4p5s2d-_bMp-3`
- Subfolder **Upload Warga** sudah dibuat di dalam folder induk dan diverifikasi, ID `1WZ1LoNjK0S1hP14vlgGW1IY7tvYfA8_a`
- Kode Worker memiliki kedua ID sebagai konstanta non-rahasia; binding `GALLERY_UPLOAD_FOLDER_ID` adalah *opsional* untuk mengganti folder target bila suatu saat dipindahkan.
- Subfolder lain seperti CCTV, Draft Rapat, atau Inventaris **tidak otomatis dipublikasikan** sebagai album. Hanya album Dokumentasi yang aktif dan diizinkan publik melalui D1 yang digunakan.
- ChatGPT memiliki koneksi Google Drive atas izin pemilik folder, tetapi koneksi ini **tidak otomatis menyediakan OAuth Worker**. Jangan memasukkan token Google ke GitHub atau frontend.

## Konfigurasi yang diperlukan

Gunakan akun Google Drive pengelola, bukan token dari pengguna situs. Folder **Upload Warga** sudah dibuat. Tidak perlu membuat folder baru atau memindahkan album lama. Konfigurasikan rahasia pada Cloudflare Worker `flamboyan4-terpadu-staging`:

| Binding | Jenis | Kegunaan |
| --- | --- | --- |
| `GALLERY_DRIVE_CLIENT_ID` | Secret | Google OAuth client ID |
| `GALLERY_DRIVE_CLIENT_SECRET` | Secret | Google OAuth client secret |
| `GALLERY_DRIVE_REFRESH_TOKEN` | Secret | Token refresh akun pengelola dengan izin Drive yang sesuai |
| `GALLERY_UPLOAD_FOLDER_ID` | Variable opsional | Override ID folder Upload Warga; sudah memiliki ID default yang diverifikasi |

Jangan menaruh client secret atau refresh token di source code, GitHub, atau frontend. Gunakan OAuth yang telah diberi persetujuan oleh pemilik akun. Karena superadmin dapat memindahkan foto ke album Drive yang sudah ada, izin OAuth harus meliputi folder tujuan yang dikelola. Scope yang diperlukan dapat mencakup akses Google Drive penuh, sehingga sebaiknya gunakan akun khusus pengelola galeri.

**Penting:** file baru otomatis diberikan izin `anyone:reader` oleh Worker supaya foto di galeri publik dapat dilihat. Hindari mengunggah foto rahasia atau identitas pribadi. Penyetoran file oleh warga dianggap persetujuan untuk publikasi dan konten dapat dilaporkan untuk segera disembunyikan.

## Aturan penyimpanan dan moderasi

1. Warga memilih album yang sudah ada atau membuat album baru. Foto boleh satu atau massal (maksimal 12 per kiriman, 40 per jam).
2. Seluruh file fisik masuk ke folder **Upload Warga**; identitas album tujuan dicatat di D1. Foto langsung terlihat di portal tanpa menunggu persetujuan.
3. Superadmin dapat meninjau, menyembunyikan, memindahkan, atau membuang foto. Saat dipindahkan, Worker memperbarui parent folder Drive dan tautan D1.
4. Album buatan warga awalnya berupa album logis di D1. Saat superadmin mulai mengelola pemindahan ke album tersebut, Worker membuat folder Drive yang sesuai.
5. Reaksi, komentar, dan tautan foto melekat pada ID D1. Memindahkan foto tidak menghapus interaksi.

## Verifikasi

Setelah OAuth dibuat, buka `https://api.flamboyan4.web.id/api/v2/gallery` dan pastikan `uploadEnabled:true`.
Lalu login sebagai warga di `https://flamboyan4.web.id/dokumentasi/` dan unggah satu JPG kecil; pastikan tampil di daftar album dan ada file pada Drive Upload Warga. Ulangi dengan beberapa foto, komentar, reaksi, bagikan link album/foto dari browser baru, dan pindahkan satu foto sebagai superadmin.

GitHub Actions `F4 Community Gallery Integration` melakukan pemeriksaan sintaks dan API publik. Alur unggah yang membutuhkan akun OAuth **tidak** dapat diuji sebelum binding Drive terpasang.
