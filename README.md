# PermitTrack — Monitoring & arsip eksternal

Prototype statis responsive untuk memantau pemegang izin, senjata/alat, register, referensi kartu/buku, masa berlaku, kota, lokasi, dan arsip. Proses perizinan dilakukan di sistem lain. Aplikasi ini hanya mencatat dan menampilkan data eksternal.

## Buka lokal
Buka `index.html` langsung di browser modern. Tidak membutuhkan npm, build, backend, database server, atau server lokal. Internet diperlukan untuk font, Chart.js, dan pembacaan Excel melalui SheetJS. Jika CDN tidak tersedia, grafik memiliki ringkasan teks dan tombol **Coba simulasi import** tetap dapat dipakai.

## Login contoh
| Role | Username | Password |
| --- | --- | --- |
| Admin | admin | admin123 |
| Viewer | user | user123 |

Admin dapat import, input/edit register, profil peminjam, aset, alias kota, upload foto/PDF, dan mengelola user. Viewer memiliki navigasi, pencarian, filter, detail, serta akses baca arsip. Semua identitas/nomor senjata/dokumen pada data awal fiktif. Nama kota dipakai sebagai referensi geografis contoh.

## Halaman
Dashboard, Data Monitoring, Detail Register, Peminjam, Detail Peminjam, Senjata/Alat, Detail Aset, Dokumen, Detail Dokumen Eksternal, Lokasi/Gudang, Import Excel, Master Kota, dan Manajemen User.

Dashboard menampilkan jumlah register masuk per bulan, bukan transaksi peminjaman. Status dokumen dihitung dari tanggal masing-masing. Lokasi gudang bukan klaim stok tersedia. Dokumen bertanggal parsial atau kosong tetap ditandai belum lengkap. Peminjam baru hasil import belum dinyatakan aktif; status perlu dilengkapi dari sumber.

## Import prototype
- Download template XLSX atau gunakan **Coba simulasi import**.
- Format .xlsx/.xls/.csv, maksimum 5 MB dan 1.000 baris.
- Seluruh sheet dengan header `NAMA` dan `IDENTITAS SENPI` dibaca; header tidak harus pada baris pertama.
- Identitas senjata: empat baris = jenis, merek/model, kaliber, serial.
- No kartu/buku: satu dokumen per baris. Berlaku s/d: slot tanggal mempertahankan baris kosong, LF/CRLF/CR dikenali.
- Tanggal tunggal untuk beberapa dokumen diblokir sebagai ambigu. Tanggal lengkap dapat memakai DD/MM/YYYY atau YYYY-MM-DD; periode bulan dipertahankan sebagai teks parsial.
- Alias seperti Jaksel dipetakan ke master kota. Mapping kota register dapat dikoreksi pada preview; kota domisili peminjam tidak diisi dari wilayah hukum secara otomatis.
- Duplikat register menggunakan kategori + nomor sumber + tahun + serial sebagai **aturan contoh**, bukan unique key yang sudah disahkan untuk production. Default dilewati; opsi update memperbarui register dan dokumen yang nomor referensinya cocok. Dokumen lama yang tidak ditemukan pada file baru tetap disimpan.
- Peminjam cocok pada nama+alamat; aset cocok pada serial dan identitas. Konflik diblokir. Preview dan ringkasan menunjukkan baris valid, terblokir, dilewati, dan diperbarui.
- Foto JPG/PNG/WebP dan PDF dapat disimpan di browser (maksimum 1 MB per file). Metadata PDF tidak berisi file asli; upload file untuk melihat preview PDF. Tidak ada pembuatan dokumen izin resmi.

## Penyimpanan
Data baru menggunakan localStorage key `permittrack-monitoring-v3`. Data prototype lama dibiarkan terpisah. Session memakai `permittrack-session-v1`. Gunakan data fiktif saja; login/role merupakan simulasi UI. File disimpan sebagai data URL untuk penyimpanan lokal, sehingga kapasitas mengikuti browser. Untuk reset, hapus hanya key monitoring-v3 dan refresh.

## GitHub Pages
Upload hanya `index.html`, `assets/`, dan README ke repository presentasi. Jangan menyertakan workbook sumber atau laporan analisis yang berisi data sumber. Pilih **Settings → Pages → Deploy from a branch → main → / (root)**. Asset memakai relative path dan navigasi hash.

## Struktur
```
index.html
assets/css/app.css
assets/js/data.js
assets/js/app.js
```
Nama aplikasi: `APP_NAME` pada data.js. Palet: variabel `:root` pada app.css, termasuk `--bg`, `--surface`, `--primary`, `--hero-start`, dan `--hero-end`. Tidak ada dependencies baru, automated test, ataupun konfigurasi production.
