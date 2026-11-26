# Aturan pengerjaan Flamboyan 4

Instruksi tetap pemilik proyek — 27 November 2026.

- Lakukan perubahan langsung pada source code asli website yang sedang digunakan. Refactor komponen yang ada; jangan membangun kembali portal, halaman, atau fitur sebagai aplikasi duplikat.
- Jangan membuat file/folder/halaman/URL uji coba, preview, demo, simulasi, atau salinan aplikasi yang nantinya membutuhkan migrasi ulang. Jangan menghidupkan kembali `spa-preview`.
- Pengujian harus dilakukan terhadap source code aktual yang akan digunakan. Jalankan pemeriksaan sintaks dan pengujian browser/API secara terisolasi tanpa membuat website uji coba baru, tanpa transaksi percobaan di database warga, dan tanpa menambah pekerjaan migrasi. Branch pengaman boleh digunakan hanya untuk perubahan pada file source asli dengan path yang sama.
- Pertahankan URL portal, desain, fitur, API, database, hak akses, dan logika transaksi yang sudah berjalan. Jangan mengubah lingkup di luar permintaan.
- Untuk SPA, jadikan navbar atas dan menu bawah permanen; hanya isi portal yang berganti. Gunakan source asli, bukan aplikasi pengganti, tanpa iframe dan tanpa sistem legacy tambahan.
- Perbarui CSS yang sudah ada; jangan menumpuk CSS override atau memakai `!important`. Ikon menggunakan SVG.
- Sebelum menyatakan selesai, verifikasi perubahan yang benar-benar tersimpan dan jelaskan secara jujur apa yang belum selesai.
