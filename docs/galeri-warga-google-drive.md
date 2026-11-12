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

## Hubungkan Google Drive (sekali saja)

Cloudflare Worker tidak dapat menggunakan sesi Google Drive yang tersambung ke ChatGPT. Google mengharuskan situs mempunyai kredensial OAuth sendiri. Tidak ada token yang perlu dikirimkan melalui chat.

**Langkah 1 — Google Cloud (pemilik folder):**

1. Buka [Google Cloud Console — Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com). Pilih atau buat proyek milik pengelola, lalu aktifkan Drive API.
2. Buka [Google Auth Platform](https://console.cloud.google.com/auth/overview), konfigurasi Branding dan Audience. Gunakan akun Google yang memiliki izin menulis ke folder **Upload Warga**.
3. Buka [OAuth Clients](https://console.cloud.google.com/auth/clients). Buat OAuth client bertipe **Web application**. Masukkan `https://developers.google.com/oauthplayground` pada **Authorized redirect URIs**. Simpan **Client ID** dan **Client Secret** hanya di pengelola password atau area rahasia.
4. Jika proyek bertipe **External / Testing**, refresh token untuk scope Drive akan kedaluwarsa setelah **7 hari**. Atur status publikasi sesuai kebijakan/verifikasi Google jika ingin koneksi permanen.

**Langkah 2 — berikan izin akses Drive kepada OAuth Client:**

1. Buka [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
2. Klik roda gigi, pilih **Use your own OAuth credentials**, isi Client ID dan Client Secret yang baru dibuat.
3. Pada daftar API/scope, gunakan `https://www.googleapis.com/auth/drive` karena pengurus perlu memindahkan foto ke album lama, bukan hanya membuat file baru.
4. Tekan **Authorize APIs**, login dengan akun pemilik Drive yang benar, lalu pilih **Exchange authorization code for tokens**.
5. Catat **Refresh token** secara privat. Jangan kirimkan ke ChatGPT, grup WhatsApp, atau file repository.

**Langkah 3 — pasang secret tanpa mengutak-atik kode:**

Buka [Repository secrets (Actions)](https://github.com/Flamboyan4/flamboyan4.github.io/settings/secrets/actions) dan buat tiga rahasia berikut:

| GitHub Actions secret | Nilai |
| --- | --- |
| `GALLERY_DRIVE_CLIENT_ID` | OAuth Client ID |
| `GALLERY_DRIVE_CLIENT_SECRET` | OAuth Client Secret |
| `GALLERY_DRIVE_REFRESH_TOKEN` | Refresh token dari OAuth Playground |

Setelah ketiganya tersimpan, buka [F4 Connect Google Drive Gallery](https://github.com/Flamboyan4/flamboyan4.github.io/actions/workflows/f4-connect-gallery-drive.yml), pilih **Run workflow**. Workflow akan mencoba token Google, memastikan akun tersebut **bisa menambahkan file** ke folder Upload Warga, kemudian memasang hanya tiga secret Galeri ke Cloudflare Worker tanpa mengubah binding D1/R2.

Nilai secret tidak muncul di log. Jika salah satu secret tidak tersedia, workflow hanya melaporkan nama yang kurang dan **tidak mengubah konfigurasi produksi**.

**Langkah 4 — uji upload sungguhan:**

1. Periksa [status API Galeri](https://api.flamboyan4.web.id/api/v2/gallery) dan pastikan `uploadEnabled: true`.
2. Login ke [Dokumentasi](https://flamboyan4.web.id/dokumentasi/), unggah satu foto kecil, lalu periksa di [Upload Warga](https://drive.google.com/drive/folders/1WZ1LoNjK0S1hP14vlgGW1IY7tvYfA8_a).
3. Ulangi dengan banyak foto, reaksi dan komentar. Kemudian coba superadmin memindahkan satu foto ke album tujuan dan pastikan tautan fotonya masih berfungsi.

Bila proses Google mengeluarkan pesan bahwa aplikasi memerlukan verifikasi, ikuti persyaratan dari Google untuk akun dan scope yang digunakan. Jangan membagikan kredensial sebagai jalan pintas.

**Pengamanan:** file baru dibuat dengan izin pembaca publik agar tampil di galeri. Hindari foto pribadi/dokumen identitas; pengurus memiliki kewenangan menyembunyikan dan menghapus foto. Data keuangan dan album Bank Sampah tidak ikut dipindahkan.

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
