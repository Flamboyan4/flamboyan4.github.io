# Bank Sampah Flamboyan 4 — Alur Operasional Sederhana

Status: rancangan implementasi; jangan mengganti perilaku keuangan produksi tanpa migrasi dan uji.

## Prinsip UX
- Tidak menambah menu utama. Pengurus menggunakan Setoran, Penjualan, Riwayat, Laporan; pemeriksaan dan pengesahan berada pada konteks penjualan.
- Nomor penjualan dibuat sekali, dipakai lembar timbang, simpan hasil lapak, nota, laporan dan pengesahan.
- Data jenis dan berat awal berasal dari setoran (warga dan bank), sehingga tidak dimasukkan ulang saat jual.
- Pengguna HP tidak memerlukan printer di lapak; lembar timbang boleh dicetak sebelum berangkat dan diisi tangan.
- Pengurus hanya memasukkan berat hasil lapak, harga, pembayaran dan alasan koreksi jika perlu. Harga lapak terdahulu adalah nilai saran yang dapat diubah.
- Nota penjualan berbeda dari bukti pengesahan saldo warga. Nota dapat dibuat setelah transaksi lapak tersimpan, tanpa menunggu pengesahan tabungan.

## Status transaksi
1. **Disiapkan:** server membuat nomor jual dan mengunci alokasi stok terpilih untuk mencegah penjualan ganda; lembar lapak bisa dicetak.
2. **Terjual / pembayaran belum lunas, sebagian, lunas:** catat berat dan tarif lapak, nominal diterima, piutang, serta nomor bukti lapak; nota penjualan tersedia dan punya nomor revisi jika dikoreksi.
3. **Perlu pemeriksaan:** sistem mendeteksi selisih berat per jenis, stok belum terjual, pembayaran kurang, kepemilikan warga vs bank, dan risiko harga beli melebihi jual. Hasil otomatis ditampilkan tanpa langkah tambahan.
4. **Disahkan:** hanya setelah aturan alokasi selisih dan stok lengkap; buat snapshot perhitungan hak warga dan kas bank serta mutasi buku besar atomik dan idempoten. Perubahan selanjutnya harus melalui jurnal koreksi.

## Perhitungan
- Penjualan kolektif dihitung per jenis dan disimpan terpisah dari kepemilikan warga/bank.
- Jangan anggap seluruh beda berat sebagai selisih jika sebagian stok sengaja belum dijual. Simpan kuantitas dialokasikan, terjual, sisa stok dan selisih timbang.
- Untuk selisih yang tidak diketahui penyebabnya, sediakan koreksi proporsional dengan konfirmasi eksplisit. Berat setoran awal tidak diubah.
- Metode bagi hasil **percentage**: hak warga = nilai realisasi bagian warga × persen warga; bagian bank/lingkungan = sisanya.
- Metode **fixed_buy_price**: hak warga = berat dasar sah × harga beli warga per jenis; selisih dari nilai realisasi menjadi margin/kerugian bank. Peringatkan bila margin negatif, jangan batasi secara diam-diam.
- Setoran milik bank tidak dikenai bagi hasil warga; penerimaannya masuk 100% ke kas bank dan harus dipisah secara akuntansi dari kewajiban tabungan warga.
- Status pembayaran lapak dan status pembagian hasil adalah dua dimensi yang berbeda. Bedakan piutang jual, uang diterima dan saldo warga yang boleh dicairkan.

## Aturan harga berversi
- Simpan aturan sebagai `rule_id`, `method`, `effective_from`, `effective_until` dan tarif per jenis; tidak boleh mengedit aturan yang sudah dipakai.
- Saat penjualan disiapkan, ikat ke versi tarif tertentu. Jika perlu memilih versi lain sebelum sah, wajib tindakan eksplisit dan jejak audit.
- Saat pengesahan, simpan snapshot metode, tarif, berat alokasi, hak warga, hak bank dan jumlah transaksi.
- Perubahan aturan masa depan tidak boleh menghitung ulang saldo dan transaksi sah terdahulu.
- API akun warga hanya menyajikan `priceRpPerKg` untuk warga (berlabel *estimasi* jika persentase; *harga beli* jika tetap), kategori, satuan dan tanggal berlaku; jangan mengirim harga lapak/margin.

## Riwayat dan e-Statement
- Detail per nomor penjualan: lembar timbang, nota lapak, laporan hasil dan pengesahan, tanpa membuat transaksi baru.
- Laporan warga: setoran milik sendiri, hak sah, mutasi/pencairan dan saldo berjalan; jangan menampilkan data warga lain.
- Laporan pengurus: per transaksi, per bulan dan rentang tanggal, ekspor PDF dan Excel yang bersumber dari buku besar yang sama.
- Ringkasan laporan memisahkan uang masuk, piutang lapak, kas milik bank, kewajiban tabungan warga dan stok.
- PDF A5 untuk lembar timbang/nota; tabel laporan dengan kolom konsisten di setiap halaman, header berulang, nomor halaman dan periode.
- Transaksi salah yang sudah tercetak harus diluruskan dengan revisi bernomor, bukan menimpa nota terdahulu.

## Batasan implementasi saat ini
Repository GitHub Pages yang terhubung terutama berisi frontend. Perubahan pada Cloudflare Worker/D1 wajib diinspeksi dan dikerjakan bersama perubahan frontend sebelum alur diaktifkan. Jangan memperkenalkan penyimpanan lokal pengganti D1, CSS override bertumpuk, maupun deklarasi !important baru.

## Pengujian penerimaan wajib
- Setoran 3 warga dan stok milik bank → 1 penjualan kolektif dengan nomor tetap.
- Siapkan dan cetak lembar kosong → pilih nomor sama → isi hasil lapak → cetak nota sebelum sah.
- Selisih berat vs stok tidak terjual ditangani berbeda; stok tidak bisa dijual ganda.
- Status belum bayar, sebagian, dan lunas menghasilkan saldo kas dan piutang yang benar.
- Pengesahan dua kali tidak membuat mutasi ganda.
- Ubah 50:50 menjadi harga tetap → semua transaksi lama dan saldo tidak berubah.
- Warga hanya melihat tarif warga dan transaksi sendiri; pengurus melihat data operasional.
- Uji HP/PC, scroll normal, fokus input, tabel/cetak PDF dan tidak ada !important baru.
