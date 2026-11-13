# Donatur & Pendanaan Program — Flamboyan 4

Status: **cabang pengembangan**, belum dipasang ke database dan Worker produksi.

## Keputusan desain
**Satu akun = satu donatur.** Donatur bisa perorangan atau perusahaan, tetapi tidak ada entitas organisasi, departemen, user staf, atau keanggotaan bertingkat.

Superadmin cukup mengisi nama donatur, username, dan password. Kontak dan email bersifat opsional. Setelah login, donatur melihat seluruh bantuan dan LPJ milik **akun itu sendiri**.

## Alur
1. Superadmin membuat akun Donatur (peran sesi \`donatur\`) dan nama serta kontak pada tabel \`donor_accounts\`. Tidak ada tabel profil terpisah.
2. Program dipilih dari Projek Warga dan dikaitkan ke pos Pusat Keuangan Terpadu yang sudah ada (\`donor_programs\`).
3. Transaksi pemasukan/pengeluaran **dicatat dan disahkan di Pusat Keuangan Terpadu**, bukan di modul Donatur.
4. Superadmin memilih jurnal yang sudah disahkan, akun donatur, program, nominal, dan tautan bukti. Referensi saja (\`donor_finance_links\`); tidak menambah jurnal atau saldo baru.
5. Superadmin menerbitkan informasi perkembangan per program. Hanya donatur yang punya donasi masuk pada program itu yang dapat melihat perkembangannya.
6. Donatur masuk lewat \`/donatur/\`, melihat total donasi, penggunaan dana, sisa dana, rincian bukti, progres, dan mencetak laporan.

## Akses dan akuntansi
- Endpoint \`GET /api/donor/dashboard\` menerima role \`donatur\`, kemudian mendapatkan donor ID **hanya dari cookie sesi server**. Tidak menerima akun donatur dari URL.
- Endpoint \`/api/admin/donors\` hanya untuk \`superadmin\`; aksi penulisan memeriksa Origin.
- Donatur tidak bisa mengakses endpoint warga, Bank Sampah, Pembukuan, atau Superadmin yang sebelumnya hanya mewajibkan sesi login.
- SQL trigger membatasi alokasi per jurnal dan pos dana agar tidak melebihi transaksi sumber; pengeluaran donatur tidak boleh melebihi penerimaannya dalam program.
- Pembatalan/koreksi alokasi harus punya workflow audit baru. Penulisan versi pertama menolak \`UPDATE\` dan \`DELETE\` pada tautan alokasi.
- Penampil LPJ mendukung cetak/Simpan PDF menggunakan browser; bukti dan foto saat ini berupa tautan HTTPS, belum upload terproteksi.

## File penting
- \`cloudflare/migrations/20261113_donatur_pendanaan.sql\`: kredensial dan sesi donatur terpisah, profil, relasi program-jurnal, progres, audit.
- \`cloudflare/worker-terpadu-operasional-teruji.js\`: API dan pembatasan server.
- \`donatur/index.html\`, \`donatur/donatur.css\`, \`donatur/donatur.js\`: dashboard donatur.
- \`donatur/admin.html\`, \`donatur/admin.css\`, \`donatur/admin.js\`: pengaturan Superadmin.
- \`qa/verify-donor-module.py\`: test tanpa dana asli.
- \`.github/workflows/donor-module-checks.yml\`: pemeriksaan CI.

## Langkah aktivasi aman
1. Verifikasi binding Worker dan database D1 staging melalui pemeriksaan read-only. Pembatasan \`accounts.role\` lama **tidak diubah**: login, sesi, dan profil donatur menggunakan tabel \`donor_accounts\`, \`donor_sessions\`, dan \`donor_accounts\` yang ditambahkan tanpa merombak akun warga.
2. Terapkan migrasi Donatur di **D1 staging**. Jangan masukkan data contoh ke produksi.
3. Jalankan \`python qa/verify-donor-module.py\`, pengecekan syntax Node, serta uji akses API (401 tanpa login, 403 untuk role warga/admin, terisolasi antar donatur).
4. Deploy Worker staging **secara terpisah**; perubahan file GitHub tidak otomatis memperbarui Worker Cloudflare.
5. Uji dua akun donatur, transaksi bersama, bukti pengeluaran, LPJ PDF, dan login/logout HP/PC.
6. Setelah review serta backup D1, baru pertimbangkan migrasi Worker dan merge tampilan produksi.

## Di luar cakupan tahap pertama
Akun staf perusahaan, struktur organisasi, donor multi-login, perintah transfer bank, pengajuan dana otomatis, pembatalan/koreksi jurnal donor, foto unggah langsung, maupun laporan bertandatangan digital. Fokus: **cek donasi, uang dipakai apa, bukti, dan perkembangan program.**
