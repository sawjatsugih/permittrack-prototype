<<<<<<< HEAD
# permittrack-prototype
=======
# PermitTrack

Prototype monitoring izin penggunaan alat. HTML5, CSS3, vanilla JavaScript; tanpa backend, npm, atau build.

## Jalankan
Buka `index.html` langsung di browser modern. Internet diperlukan untuk font, Chart.js, dan SheetJS melalui CDN. Jika Chart.js tidak tersedia, ringkasan status dan grafik batang sederhana tetap tampil. Parsing Excel memerlukan SheetJS; template CSV tetap dapat diunduh saat library tidak tersedia.

## Akun demo
| Role | Username | Password |
| --- | --- | --- |
| Admin | admin | admin123 |
| General User | user | user123 |

Admin dapat menambah/mengedit izin, mengimpor Excel, menyetujui/menolak permohonan, mencetak PDF, dan mengelola user. General User dapat melihat dashboard, mencari/filter izin, membaca detail dan preview dokumen.

## GitHub Pages
1. Upload `index.html`, folder `assets`, dan README ini ke root repository GitHub.
2. Buka **Settings → Pages → Build and deployment**.
3. Pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu **Save**.
4. Buka URL GitHub Pages yang ditampilkan setelah deployment selesai.

Seluruh asset lokal memakai relative path dan navigasi memakai hash routing, sehingga aman untuk URL project GitHub Pages. Tidak membutuhkan konfigurasi server.

## Data dan alur demo
- 20 izin contoh dengan tanggal relatif terhadap hari pertama dibuka.
- Semua data dan akun disimpan di `localStorage`; session login di `sessionStorage`.
- Active: approved dengan sisa >30 hari. Expiring Soon: approved dengan sisa 0–30 hari. Expired: approved dan tanggal akhir terlewati. Pending/Rejected mengikuti keputusan approval.
- Edit izin mengembalikan status ke Pending agar perubahan dapat ditinjau ulang. Riwayat sebelumnya tetap tersimpan.
- Impor mendukung .xlsx/.xls/.csv, sheet pertama, maksimal 5 MB dan 1.000 baris. Unduh template untuk header: `equipment,type,applicant,unit,start,end,notes`. Tanggal format YYYY-MM-DD atau date cell Excel. Hanya baris valid yang diimpor.
- Preview A4 memakai browser print; pilih Save as PDF untuk menyimpan dokumen.
- Untuk mengganti nama aplikasi, ubah `APP_NAME` di `assets/js/data.js` dan title/metadata di `index.html`.
- Untuk mereset demo, hapus key `permittrack-data-v1` pada Local Storage browser, lalu refresh. Data file lokal dan URL GitHub Pages merupakan penyimpanan terpisah.

Login dan pembatasan role merupakan simulasi UI untuk presentasi; password demo disimpan terbuka di browser. Gunakan data fiktif saja. Tidak ada backend, database server, API, automated test, atau konfigurasi production.

## Struktur
```
index.html
assets/css/app.css
assets/js/data.js
assets/js/app.js
README.md
```
>>>>>>> 5791635 (Initial PermitTrack prototype)
