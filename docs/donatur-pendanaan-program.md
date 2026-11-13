# Fitur Donatur & Pendanaan Program — Flamboyan 4

Status: **cabang pengembangan**, belum diaktifkan pada website atau D1 produksi.

## Tujuan
Setiap perusahaan/organisasi donor memiliki identitas tersendiri dan dapat memeriksa seluruh donasinya, pemakaian dana berikut bukti, serta pembaruan hasil program. Dalam tahap awal satu perusahaan mendapat satu akun, dengan skema keanggotaan yang dapat mendukung beberapa staf pada perusahaan yang sama tanpa berbagi kata sandi.

## Alur operasional

1. Superadmin membuat organisasi dan menghubungkan satu Projek Warga ke pos Pusat Keuangan Terpadu yang telah ada.
2. Superadmin membuat akun perusahaan berperan \`donatur\` (berbeda dari \`anggota\`, \`admin\`, dan \`superadmin\`).
3. Dana disalurkan dan **dicatat hanya di Pusat Keuangan Terpadu**. Setelah jurnal disahkan, pengurus menautkan sejumlah dana kepada organisasi dan program terkait. Donor-link **bukan** transaksi baru dan tidak menaikkan saldo.
4. Pengeluaran dikelola dan disahkan di Pusat Keuangan. Pengurus mengaitkan jurnal pengeluaran yang benar ke donatur, program, nominal alokasi dan nota HTTPS.
5. Perkembangan program diterbitkan untuk dilihat perusahaan yang memiliki donasi masuk untuk program tersebut.
6. Perusahaan login melalui \`/donatur/\`, melihat total donasi, realisasi, sisa, proyek, perkembangan, dan mencetak LPJ dengan \`window.print()\` / Simpan PDF.

## Komponen
- \`donatur/index.html\`, \`donatur/donatur.css\`, \`donatur/donatur.js\`: dashboard donor. **Tidak ada nominal contoh**.
- \`donatur/admin.html\`, \`donatur/admin.css\`, \`donatur/admin.js\`: pengelolaan Superadmin.
- \`/api/donor/dashboard\`: endpoint baca khusus role \`donatur\`. **ID perusahaan selalu diperoleh dari sesi server**, bukan parameter URL.
- \`/api/admin/donors\`: endpoint kelola khusus role \`superadmin\`.
- Migrasi \`cloudflare/migrations/20261113_donatur_pendanaan.sql\`: organisasi, akun anggota organisasi, program, referensi jurnal, perkembangan, audit. Trigger D1 mengunci transaksi agar alokasi tidak melebihi jumlah jurnal, pengeluaran donor tidak melebihi donasi yang ditautkan, tidak menduplikasi dana dan tidak dapat diam-diam dihapus.
- Navigasi Superadmin memiliki tautan Donatur & Pendanaan; nav Portal Utama menampilkan tautan donatur hanya jika role donatur.

## Batasan yang disengaja
- LPJ kini mencetak data dan bukti tautan HTTPS, **bukan** menyalin dokumen dari Google Drive/R2.
- Riwayat dashboard dibatasi 500 baris; bila mencapai batas, ada pesan untuk meminta arsip lengkap. Angka total tetap berasal dari agregasi seluruh riwayat.
- Belum ada pengajuan dana mandiri dari perusahaan, pencairan, workflow persetujuan berlapis, unduh ekspor terstruktur, atau reversal jurnal donor. Hindari data palsu demi demo.
- Pengeluaran tidak otomatis ditetapkan ke donatur: alokasi wajib disahkan Superadmin agar perusahaan hanya melihat bukti yang sudah diperiksa.
- Belum ada uploader media; foto perkembangan dan nota menggunakan URL HTTPS dari penyimpanan yang sudah ada.
- Skema awal \`accounts\` bisa mempunyai CHECK(role) yang **belum mengenal** \`donatur\`. Endpoint secara sengaja menolak pembuatan akun bila pembatasan lama terdeteksi; **jangan** memberi donatur role warga sebagai jalan pintas.

## Langkah aktivasi (urutan wajib)
1. Tinjau constraint/kolom di D1 staging: \`SELECT sql FROM sqlite_master WHERE type='table' AND name='accounts';\` dan \`PRAGMA table_info(accounts);\`. Pastikan role \`donatur\` diizinkan dan \`member_id\` boleh NULL sebelum membuat akun. Jika ada CHECK role, rencanakan migrasi tabel accounts yang menghormati seluruh FK, indeks, sesi dan audit. Jangan mengubah skema akun produksi tanpa verifikasi backup.
2. Uji migrasi donor di D1 **staging**. Migrasi membuat tabel/trigger baru, tidak memodifikasi saldo atau transaksi yang sudah ada.
3. Jalankan pemeriksaan \`python qa/verify-donor-module.py\` dan Node syntax checks; periksa terlebih dahulu workflow CI branch.
4. Deploy Worker baru ke lingkungan **staging** (file \`cloudflare/worker-terpadu-operasional-teruji.js\`). Mengubah file GitHub saja **tidak otomatis mengubah Worker Cloudflare produksi**.
5. Uji unauthorized \`GET /api/donor/dashboard\` (401), akun warga/admin (403), organisasi A tidak dapat melihat transaksi organisasi B, serta pembatasan token login. Uji percobaan mengalokasikan satu jurnal dua kali (409).
6. Uji akun perusahaan pada staging dan penerbitan foto, nota, serta cetak.
7. Setelah audit selesai: backup D1 produksi, migrasi terkontrol, deploy Worker produksi, kemudian merge frontend GitHub Pages. Jika belum siap, **jangan merge frontend sebelum backend**.
8. Verifikasi pengguna warga, pengurus dan superadmin tetap hanya melihat data sesuai role; uji login/logout lintas portal dan versi HP/PC.

## Catatan akuntansi
Data donasi di modul ini adalah **sub-ledger referensi**. Dana kas tetap berasal dari jurnal Pusat Keuangan Terpadu (\`treasury_events\`, \`treasury_entries\`); jangan menambahkan satu donasi sebagai uang baru untuk kedua kalinya. Jurnal yang berjenis \`opening\`, \`move\` atau \`allocation\` tidak boleh dianggap donasi. Besaran tiap donor pada transaksi bersama boleh berbeda, tetapi jumlah alokasinya tidak boleh melampaui jurnal asli.

## Keamanan
Perusahaan tidak dapat mengubah ID organisasi melalui permintaan UI, dan endpoint donor tidak menerima \`organizationId\` dari browser. Seluruh endpoint pengelolaan butuh cookie sesi superadmin dan Origin yang diizinkan. Pembuatan akun memakai PBKDF2-SHA256 yang sudah digunakan Worker dan password awal setidaknya 8 karakter. Password bisa diganti sendiri; perubahan mencabut seluruh sesi terkait melalui API yang sudah ada.

## Pengembangan berikutnya
- Workflow pembatalan/koreksi alokasi dengan jurnal penyesuaian dan audit immutable.
- Bukti/nota dalam media R2 terproteksi dan laporan akhir tertandatangani.
- Penerima laporan ganda per perusahaan dengan hak baca.
- Surat/sertifikat apresiasi dan halaman transparansi publik berizin.
- Peta dampak: hasil fisik, dokumentasi sebelum/sesudah, dan indikator lingkungan.
