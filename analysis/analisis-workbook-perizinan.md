# Analisis workbook dan desain data monitoring perizinan

Sumber: **CONTOH FILE SAMPEL.xlsx**, dibaca dari percakapan **Nitip File Sampel**. Tanggal acuan analisis: **30 September 2026, Asia/Jakarta**. File sumber tidak diubah. Tidak ada perubahan pada aplikasi, kode Laravel, atau migration.

## 1. Ringkasan workbook

**Kesimpulan utama:** sampel merupakan register orang–senjata–dokumen perizinan, bukan jurnal transaksi peminjaman lengkap. Satu baris berisi satu orang, satu identitas senjata, dan beberapa nomor kartu/buku. Jangan menganggap satu baris sebagai satu kejadian penyerahan senjata, atau setiap dokumen sebagai satu transaksi.

| Sheet | Area header/data | Isi | Fungsi yang teramati |
|---|---|---|---|
| SENPI PELURU TAJAM | Header B2:N2; data B3:N5 | 3 baris, 13 kolom | Register kategori peluru tajam |
| SENPI PELURU KARET | Header B2:N2; data B3:N5 | 3 baris, 13 kolom | Register kategori peluru karet |

Seluruh kedua sheet dan seluruh sel terisi diperiksa. Baris 1 dan kolom A tidak berisi data. Tidak ada sheet/baris/kolom tersembunyi, merge cell, formula, error Excel, named range, tabel terstruktur, chart, hyperlink, gambar tertanam, atau objek/file tertanam yang ditemukan.

Ringkasan hasil pembacaan:

- **6 baris register**, dengan 6 nama berbeda dan 6 kandidat identitas aset berbeda. Ini belum membuktikan keunikan orang/aset pada dataset produksi.
- **16 referensi kartu/buku**, semuanya berbeda secara teks mentah.
- **16 sel multiline**, seluruhnya menggunakan LF, dengan total **38 karakter LF**. Tidak ditemukan CRLF atau CR; pemeriksaan XML juga tidak menemukan encoding carriage return `_x000D_` atau `&#13;`.
- **8 token tanggal lengkap**, 1 token periode bulan (`MEI 2007`), dan sejumlah slot tanggal kosong.
- Tidak tersedia NIK/ID orang sumber, ID aset sumber, ID transaksi sumber, jumlah stok, tanggal keluar/kembali, foto, maupun PDF.
- Besaran 1.000 peminjam aktif, tambahan 200/tahun, 4.000 data/tahun, dan sekitar 20 jenis berasal dari konteks pengguna; **bukan hasil hitung workbook**.

## 2. Semua kolom, tipe, dan contoh nilai

Tipe di bawah adalah tipe yang benar-benar tersimpan di Excel. Semua sel menggunakan number format `General`; tanggal bukan Excel date native.

| Kolom | Header Tajam / Karet | Tipe ditemukan | Contoh penting | Interpretasi dan tipe target |
|---|---|---|---|---|
| B | No / NO | Integer | 1, 16, 2627 | Nomor register sumber; simpan VARCHAR, bukan PK |
| C | TAKAH / TAKAH | Teks, integer, kosong | `rof`, `1357` | Makna belum jelas; VARCHAR nullable, pertahankan raw |
| D | TAHUN / TAHUN | Integer | 2001, 2012, 2021 | Tahun register belum terkonfirmasi; SMALLINT, bukan tanggal transaksi |
| E | WILAYAH HUKUM / POLRES | Teks, kosong | Jakarta Selatan, Tangerang Selatan, Jakarta Timur | Wilayah administratif atau yurisdiksi; jangan langsung disamakan dengan domisili |
| F | Nama / NAMA | Teks | `Drs. …`, `IRJEN POL (PURN) …, MBA` | Nama tampilan lengkap VARCHAR; gelar tidak dihapus dari sumber |
| G | Alamat / ALAMAT | Teks | Akhiran `Jaksel`, `Jakarta Selatan`, `Tangerang`; `Rawa Mangun` | Alamat bebas TEXT; kota terstruktur memerlukan verifikasi |
| H | Pekerjaan / PEKERJAAN | Teks | SWASTA, POLRI | VARCHAR; master tambahan belum diperlukan |
| I | Jabatan / JABATAN | Teks, kosong | `Purnawirawan POLRI`, `Dir.Keu. …` | VARCHAR/TEXT; jangan disamakan dengan pekerjaan |
| J | Identitas Senpi / IDENTITAS SENPI | Teks multiline | `PISTOL\nWALTHER \n22\nT.033109` | Satu aset dengan empat atribut; pecah ke kolom terstruktur |
| K | No Kartu / Buku / NO KARTU / BUKU | Teks multiline | `BPSA / 03-D / X / 2021 / Datro` | Satu baris teks = kandidat satu dokumen; child table |
| L | Berlaku S/D / BERLAKU S/D | Teks, multiline, kosong | `\n\n11/09/2016`, `MEI 2007` | DATE nullable + presisi tanggal + raw; pasangkan dengan K |
| M | Keterangan / KETERANGAN | Teks, kosong | `IPDA IQBAL`, `SELESAI DIPERPANJANG 2025` | TEXT; belum cukup untuk membentuk petugas atau event perpanjangan |
| N | STATUS / STATUS | Teks | BELUM DIPERPANJANG, SUDAH DIPERPANJANG, DI GUDANG WASSENDAK | Campuran perpanjangan dan lokasi; raw wajib dipertahankan |

Label header boleh dicocokkan tanpa membedakan kapitalisasi. Namun E pada dua sheet memiliki arti potensial berbeda; perubahan nama header tidak boleh menghapus perbedaan semantik tersebut.

## 3. Temuan kualitas data

### Kelengkapan

Denominator adalah 6 record × 13 kolom = **78 sel data**, tidak termasuk header/gutter. Ada **67 sel terisi dan 11 sel kosong**. Baris kosong di dalam sel dihitung terpisah dalam analisis multiline.

| Kolom | Kosong Tajam | Kosong Karet | Total |
|---|---:|---:|---:|
| TAKAH | 1: C4 | 3: C3:C5 | 4/6 |
| Wilayah/POLRES | 0 | 1: E3 | 1/6 |
| Jabatan | 1: I3 | 0 | 1/6 |
| Berlaku S/D | 1: L3 | 0 | 1/6 |
| Keterangan | 3: M3:M5 | 1: M3 | 4/6 |
| Kolom lainnya | 0 | 0 | 0/6 |

### Duplikasi dan konsistensi

- Tidak ditemukan baris duplikat identik, nama identik, nomor B identik, identitas J identik, atau nomor kartu identik pada enam record. Ukuran sampel terlalu kecil untuk menetapkan salah satunya sebagai unique key global.
- `TAKAH` mencampur angka, teks `rof`, dan kosong. Jangan mengonversinya menjadi integer atau menganggap `rof` salah ketik tanpa penjelasan pemilik data.
- Baris J memuat `WALTHER ` dengan trailing space dan `Walther`. Bentuk pencarian dapat dinormalisasi menjadi `WALTHER`; nilai sumber tetap tersedia.
- Nomor seri memiliki spasi/titik: `L. 018034`, `W.008628.`, `ES.980062.`. Jangan menghapus seluruh tanda baca untuk unique matching sebelum pola resmi disepakati.
- Kaliber memuat `22`, `32`, `9 mm`, `9,4 mm`. Dua pertama tidak menyebut satuan. **Tidak boleh otomatis diartikan 22 mm atau 32 mm, maupun langsung dikonversi ke inci.** Simpan label asli; nilai numerik dan satuan hanya diisi ketika terkonfirmasi.
- Nomor dokumen menggunakan variasi `/`, spasi di sekitar `/`, `DATRO`/`Datro`, kode dengan `-` dan `_`, serta bulan Romawi. `-`, `_`, dan `/` adalah bagian identifier, bukan pemisah antar-record.
- Nilai tanggal lengkap valid jika memakai **DD/MM/YYYY**; tanggal seperti `30/09/2020` mendukung interpretasi tersebut. Nilai `11/09/2016` sendiri ambigu jika dibaca tanpa konvensi ini.
- Tidak ada Excel numeric-date atau formula error; masalah utama adalah tanggal tersimpan sebagai teks, tanggal tidak lengkap, dan pasangan tanggal–dokumen.
- `TAHUN` tidak selalu sama dengan tahun yang tertulis di nomor dokumen: Tajam r5 mencantumkan 2021, sementara nomor dokumen mencakup 2020, 2021, 2023. Simpan sebagai atribut berbeda.
- STATUS masing-masing memiliki 2 record `BELUM DIPERPANJANG`, 2 `SUDAH DIPERPANJANG`, dan 2 `DI GUDANG WASSENDAK`. Ketiganya tidak berada pada satu dimensi status.
- Karet M5 menyatakan selesai diperpanjang 2025, tetapi L5 berisi tanggal 2019/2020. Tajam N5 menyatakan sudah diperpanjang, tetapi tanggal terakhir yang tampak 30/12/2025. Keduanya perlu rekonsiliasi, bukan otomatis dianggap aktif.

Per **30 September 2026**, kedelapan tanggal lengkap telah lewat. Ini hanya membuktikan delapan nilai tanggal tersebut berada di masa lalu; belum membuktikan seluruh peminjam nonaktif, aset tersedia, atau tidak ada dokumen terbaru di sistem lain.

## 4. Multi-line / Embedded List Analysis

Notasi `\n` berikut merepresentasikan LF asli, bukan dua karakter backslash dan n. “Slot” mempertahankan baris kosong; “isi” menghitung baris tidak kosong.

| Sheet | Kolom | Contoh isi | Jumlah dan pola | Interpretasi | Rekomendasi penyimpanan |
|---|---|---|---|---|---|
| Tajam | J Identitas Senpi | `REVOLVER\nNAA\n22\nL. 018034` | 3 sel; semuanya 4 slot/4 isi; 9 LF | Jenis, merek/model, kaliber, nomor seri dari **satu aset** | Kolom pada assets + FK equipment_types; raw TEXT untuk jejak sumber |
| Karet | J IDENTITAS SENPI | `PISTOL\nCZ 83 RG\n9 mm\n208163` | 3 sel; semuanya 4 slot/4 isi; 9 LF | Pola sama; merek vs model belum terpisah jelas | Seperti di atas; bukan empat baris aset |
| Tajam | K No Kartu / Buku | `BPSA / 01 / VI / 2001 / DATRO\nBPSA / MJ-01 / V / 2001\n` | 3 sel; semuanya 3 slot; 1 sel berisi 2 dokumen, 2 sel berisi 3; 6 LF | Daftar 8 kandidat dokumen | Child table permit_documents, dengan source_line_no; raw dipertahankan |
| Karet | K NO KARTU / BUKU | `BPSPK/2487/V/2003/DATRO\nSIPSPK / 4896_c / VII / 2006\n` | 3 sel; semuanya 3 slot; 1 sel berisi 2 dokumen, 2 sel berisi 3; 6 LF | Daftar 8 kandidat dokumen | Child table permit_documents |
| Tajam | L Berlaku S/D | `\n\n11/09/2016` dan `26/10/2021\n30/09/2020\n30/12/2025` | 2 sel multiline; keduanya 3 slot; 1 atau 3 isi; 4 LF. Satu sel lain kosong | Kandidat tanggal per baris dokumen K | Field tanggal pada permit_documents, bukan tabel tanggal lepas |
| Karet | L BERLAKU S/D | `\n\n30/06/2020` dan `05/11/2019\n25/10/2020\n05/04/2020` | 2 sel multiline; keduanya 3 slot; 1 atau 3 isi; 4 LF. L3 berisi satu teks `MEI 2007` | Kandidat tanggal per dokumen; L3 ambigu | Field tanggal/presisi pada permit_documents setelah pasangan terkonfirmasi |

Tidak ditemukan multiline pada kolom lain atau header. Total: J = 6 sel/18 LF; K = 6 sel/12 LF; L = 4 sel/8 LF.

### Hubungan antarbaris yang teramati

J dan K **tidak** dipasangkan menurut indeks baris: J berisi atribut satu aset, K berisi beberapa dokumen aset/register tersebut. Pola ini bukan contoh “alat A → jumlah 2”. Workbook tidak memiliki kolom jumlah.

K dan L memperlihatkan pola pasangan yang kuat, tetapi maknanya tetap perlu dikonfirmasi pemilik sumber:

| Sheet/baris | Slot K | Slot L | Kandidat pairing |
|---|---|---|---|
| Tajam r3 | 2 nomor + 1 slot kosong | Sel kosong | Dua dokumen, keduanya tanpa tanggal diketahui; jangan buat dokumen ketiga kosong |
| Tajam r4 | 3 nomor | kosong, kosong, 11/09/2016 | Tanggal hanya untuk dokumen ke-3: `IKHSA / 1633-B / XII / 2011` |
| Tajam r5 | 3 nomor | 26/10/2021, 30/09/2020, 30/12/2025 | Pasangan 1↔1, 2↔2, 3↔3 |
| Karet r3 | 2 nomor + 1 slot kosong | MEI 2007 | Tidak diketahui apakah untuk nomor pertama, kedua, atau keduanya; tahan pemetaan tanggal |
| Karet r4 | 3 nomor | kosong, kosong, 30/06/2020 | Tanggal hanya untuk dokumen ke-3: `SIPSPK / 3767-U / VIII / 2019` |
| Karet r5 | 3 nomor | 05/11/2019, 25/10/2020, 05/04/2020 | Pasangan 1↔1, 2↔2, 3↔3 |

Contoh hasil interpretasi Tajam r5:

| Dokumen | Kandidat tanggal akhir |
|---|---|
| BPSA / 03-D / X / 2021 / Datro | 2021-10-26 |
| BPSA / MJ-433-D / IX / 2020 | 2020-09-30 |
| IKHSA / 1619-T / X / 2023 | 2025-12-30 |

Jika aturan posisi disepakati, tersedia **8 pasangan tanggal lengkap**, **6 dokumen tanpa tanggal**, dan **2 dokumen dengan atribusi `MEI 2007` belum terselesaikan**. Satu token bulan tersebut tidak boleh digandakan menjadi dua fakta tanggal.

### Aturan parsing multiline

1. Simpan raw cell dan koordinat sebelum normalisasi.
2. Kenali CRLF sebagai satu delimiter, lalu CR dan LF. Jangan melakukan split CR dan LF secara terpisah.
3. Pertahankan leading/trailing/empty slots ketika membandingkan K dan L. **Jangan trim seluruh L sebelum split.**
4. Trim setiap baris hanya setelah posisi ditentukan. Baris kosong tetap memiliki indeks.
5. K kosong + L berisi adalah error pasangan; jangan digeser ke nomor sebelumnya.
6. Daftar K pendek dengan L tunggal tidak boleh di-broadcast otomatis.
7. Bentuk dokumen anak hanya untuk nomor tidak kosong, dengan `source_line_no` sebagai provenance, bukan business key.
8. J wajib mengikuti empat komponen pada sampel; pola berbeda pada data besar menjadi exception, bukan dipaksa empat baris.
9. `MEI 2007` disimpan sebagai raw; setelah atribusi dikonfirmasi, gunakan tahun 2007, bulan 5, `date_precision=month`, dan `valid_until=NULL`. Jangan mengarang tanggal 31 Mei sebagai tanggal persis.

## 5. Entity & relationship

Pemisahan yang direkomendasikan:

- **Master:** peminjam, aset senjata/alat, jenis alat, kota, alias kota, yurisdiksi, lokasi/gudang, user aplikasi.
- **Register monitoring:** hubungan peminjam–aset pada register sumber, konteks tahun/wilayah, serta status mentah. Ini belum otomatis transaksi peminjaman.
- **Dokumen izin eksternal:** beberapa nomor kartu/buku dan periode per register. Aplikasi hanya mencatat dokumen dari luar.
- **Transaksi peminjaman:** header peminjaman dan detail aset, setelah sumber tanggal keluar/kembali tersedia.
- **Inventory/history:** kejadian perpindahan aset dan pengembalian. Stok merupakan agregasi aset yang sudah direkonsiliasi; tidak diturunkan dari status izin.
- **File:** metadata foto/PDF beserta lokasi penyimpanan.
- **Provenance/audit:** batch import, raw baris, hasil validasi, dan perubahan data.

Relasi inti:

- Peminjam 1:N register monitoring; aset 1:N register monitoring sepanjang riwayatnya.
- Register monitoring 1:N dokumen eksternal. Enam baris sampel dapat menghasilkan 16 dokumen anak, bukan 16 peminjaman.
- Peminjam 1:N peminjaman; peminjaman 1:N detail; aset 1:N detail sepanjang waktu.
- Jenis alat 1:N aset. Kategori peluru tajam/karet merupakan klasifikasi sumber, berbeda dari jenis PISTOL/REVOLVER.
- Kota 1:N alamat peminjam/lokasi/snapshot register; yurisdiksi terpisah dari kota.
- Aset 1:N perpindahan lokasi. Audit perubahan bukan pengganti history peminjaman nyata.

## 6. Candidate primary key dan identifier

Gunakan **BIGINT UNSIGNED auto-increment `id`** sebagai surrogate PK. Identifier bisnis disimpan sebagai VARCHAR agar leading zero dan tanda baca tidak hilang.

| Entitas | Kandidat unique identifier | Kelayakan dari sampel |
|---|---|---|
| Peminjam | `(source_system, external_borrower_id)`; borrower_code internal | Tidak ada ID orang sumber; nama/alamat hanya kandidat pencocokan manual |
| Aset | asset_code internal; `(source_system, external_asset_id)` | Tidak ada ID aset sumber; serial + merek/model + jenis/kategori untuk pencocokan kandidat |
| Register | `(source_system, external_record_id)` | Tidak tersedia. `(sheet_category, source_no, source_year)` hanya kandidat, belum layak unique wajib |
| Dokumen | `(source_system, external_document_id)`; nomor normalisasi + jenis/otoritas | Keunikan lintas penerbit dan perpanjangan belum diketahui; jangan unique nomor mentah secara global |
| Peminjaman | `(source_system, external_borrowing_id)` | Tidak tersedia pada workbook |
| Kota | `(code_system, official_code)` | Perlu master eksternal berversi |
| Lokasi | location_code internal | Hanya nama WASSENDAK tersirat; kode belum tersedia |
| Jenis | `(category_code, name_normalized)` | Kandidat sesuai klasifikasi yang disepakati |
| User | username/email | Berasal dari administrasi aplikasi, bukan peminjam |

`No`, `TAKAH`, nama orang, nomor baris Excel, serta nomor urut multiline tidak boleh menjadi PK. Indeks `(batch_id, sheet_name, row_number)` hanya mengidentifikasi baris dalam satu file impor.

## 7. Rekomendasi database schema

Target: relational schema untuk Laravel + MySQL/MariaDB. Ini desain konseptual, bukan migration. Gunakan InnoDB, UTF-8/utf8mb4, FK berindeks, DATE untuk tanggal pasti, timestamp audit konsisten, dan VARCHAR untuk identifier. Kolom opsional harus nullable; unknown bukan false atau nol.

Semua tabel berikut memakai PK `id BIGINT UNSIGNED`, kecuali tabel penghubung yang disebutkan. `created_at`/`updated_at` ditambahkan sesuai kebutuhan. Unique identifier mengikuti bagian 6; jangan menerapkan unique kandidat yang belum terkonfirmasi.

### Master dan akses

| Tabel | Fungsi dan kolom utama | FK | Relasi |
|---|---|---|---|
| users | Akun aplikasi: username, password_hash, name, role (`admin`,`viewer`), is_active | — | 1:N import_batches/files/audit_events sebagai pelaku |
| cities | Master kabupaten/kota: code_system, official_code, name, administrative_type, province_code, province_name, master_version, is_active | — | 1:N borrowers/locations/monitoring_records; 1:N city_aliases |
| city_aliases | Variasi terverifikasi: alias_raw, alias_normalized, context_key, province_hint | city_id → cities | N:1 kota; unique alias+context yang telah disepakati |
| jurisdictions | Yurisdiksi terpisah: code nullable, name, jurisdiction_type, coverage_notes | — | 1:N monitoring_records; jangan paksa 1 kota = 1 POLRES |
| locations | Gudang/lokasi: location_code, name, location_type, address, is_active | city_id → cities nullable | 1:N aset saat ini; sumber/tujuan asset_movements |
| borrowers | Master orang: borrower_code, source_system, external_borrower_id nullable, full_name, name_search, address, occupation, position, activity_status (`active`,`inactive`,`unknown`), status_effective_on nullable | city_id → cities nullable; photo_file_id → files nullable | 1:N monitoring_records/borrowings |
| equipment_types | Jenis: category_code, name, name_normalized; kategori awal berasal dari sheet | — | 1:N assets; PISTOL/REVOLVER adalah jenis yang terlihat |
| assets | Unit fisik: asset_code, source_system, external_asset_id nullable, make_model_raw, make_model_normalized, caliber_label, caliber_value nullable, caliber_unit nullable, serial_raw, serial_match_key nullable, inventory_state (`unknown`,`available`,`in_use`,`maintenance`,`retired`) | equipment_type_id → equipment_types; current_location_id → locations nullable; photo_file_id → files nullable | 1:N register, detail pinjam, mutasi |

Jangan memaksakan pemisahan merek dan model `CZ 83 RG` sebelum referensi produk tersedia. `caliber_value` dapat memakai DECIMAL; `caliber_label` tetap otoritatif sampai unit jelas. Status aktif peminjam harus memiliki definisi sumber sendiri.

### Register dan dokumen eksternal

| Tabel | Fungsi dan kolom utama | FK | Relasi |
|---|---|---|---|
| monitoring_records | Satu register orang–aset: source_system, external_record_id nullable, source_category, source_no, takah_ref, source_year, jurisdiction_raw, borrower_name_snapshot, address_snapshot, occupation_snapshot, position_snapshot, status_raw, renewal_state (`unknown`,`renewed`,`not_renewed`), notes | borrower_id → borrowers; asset_id → assets; jurisdiction_id → jurisdictions nullable; city_id → cities nullable; source_import_row_id → import_rows | N:1 orang/aset; 1:N permit_documents/record_files |
| permit_documents | Nomor kartu/buku dari sistem luar: external_document_id nullable, document_number_raw, document_number_normalized, document_type_code, document_subtype nullable, issuer_raw nullable, valid_from nullable, valid_until nullable, valid_until_year nullable, valid_until_month nullable, date_precision (`day`,`month`,`unknown`), expiry_raw, source_line_no, attribution_status (`confirmed`,`unresolved`) | monitoring_record_id → monitoring_records; supersedes_id → permit_documents nullable; source_import_row_id → import_rows | N:1 register; self-reference riwayat pengganti hanya jika terbukti |

`valid_from` tidak diisi dari TAHUN atau bulan dalam nomor surat. Prefix BPSA/BPSPK/IKHSA/SIPSPK boleh disimpan sebagai kode mentah tanpa mengarang kepanjangan dan kewenangannya. Dua BPSA pada baris yang sama tidak otomatis perpanjangan satu sama lain. Bila tanggal belum dapat dipasangkan, biarkan tanggal terstruktur NULL dan simpan masalahnya pada import_rows; jangan menempelkan tanggal ambigu pada dokumen tertentu.

### Peminjaman, stok, dan history

| Tabel | Fungsi dan kolom utama | FK | Relasi |
|---|---|---|---|
| borrowings | Kejadian peminjaman yang benar-benar tercatat: source_system, external_borrowing_id, reference_no, recorded_on nullable, started_on nullable, planned_end_on nullable, notes | borrower_id → borrowers; city_id → cities nullable; source_import_row_id → import_rows nullable | 1:N borrowing_items |
| borrowing_items | Detail aset: issued_at nullable, returned_at nullable, return_condition nullable | borrowing_id → borrowings; asset_id → assets; monitoring_record_id → monitoring_records nullable; issued_from_location_id/returned_to_location_id → locations nullable | N:1 header/aset; unique borrowing_id+asset_id jika satu aset hanya sekali per header |
| asset_movements | History fisik: movement_kind, occurred_at nullable, observed_at, source_reference, notes | asset_id → assets; from_location_id/to_location_id → locations nullable; borrowing_item_id → borrowing_items nullable; source_import_row_id → import_rows nullable | N:1 aset; lokasi sumber/tujuan dan detail pinjam opsional |
| audit_events | Jejak perubahan aplikasi: action, changed_at, before_values, after_values, reason | actor_id → users; borrower_id/asset_id/monitoring_record_id/borrowing_id/permit_document_id → tabel masing-masing nullable; import_batch_id → import_batches nullable | Tepat satu target utama per event; ini audit data, bukan event penggunaan fisik |

**Jangan mengisi borrowings, borrowing_items, atau mutasi keluar/kembali dari keenam baris ini secara otomatis.** Tanggal dan bukti kejadian fisiknya tidak tersedia. `DI GUDANG WASSENDAK` adalah observasi lokasi pada sumber tanpa tanggal kejadian, bukan bukti stok bebas pakai.

Untuk aset bernomor seri, satu baris assets = satu unit; stok tersedia/dipakai dihitung dari keadaan aset yang telah direkonsiliasi. Tidak perlu tabel saldo duplikat sebagai sumber kebenaran kedua. Jika nanti ada alat tanpa nomor seri yang dikelola dalam jumlah, tambahkan stock_items dan stock_movements berbasis kuantitas sebagai perluasan tersendiri; kebutuhan tersebut belum dapat dibuktikan oleh sampel.

### File dan import

| Tabel | Fungsi dan kolom utama | FK | Relasi |
|---|---|---|---|
| files | Metadata penyimpanan: storage_disk, object_key/path, original_name, mime_type, byte_size, sha256, uploaded_at | uploaded_by → users | Dirujuk oleh foto peminjam/aset, batch impor, dan record_files |
| record_files | Lampiran register/perjanjian: purpose, caption | monitoring_record_id → monitoring_records; file_id → files; permit_document_id → permit_documents nullable | N:M register–file; dokumen opsional harus milik register yang sama; unique record+file+purpose |
| import_batches | Satu proses impor: file_hash, source_system, imported_at, parser_version, mapping_version, mode, status, row counters | source_file_id → files; imported_by → users | 1:N import_rows; simpan percobaan ulang tanpa memaksa hash file unique global |
| import_rows | Raw dan hasil staging: sheet_name, row_number, raw_cells, parsed_payload, normalized_hash, match_decisions, validation_errors, outcome | batch_id → import_batches | Unique batch+sheet+row; dirujuk record/dokumen/kejadian yang dihasilkan |

Payload JSON dipakai untuk staging dan audit, bukan menggantikan kolom relasional inti. Foto utama satu per peminjam/aset cukup untuk kebutuhan yang disebutkan; jika diperlukan galeri, buat borrower_files dan asset_files dengan FK eksplisit. Jangan menaruh daftar file dipisahkan koma di satu kolom.

Untuk volume yang disebutkan, mulailah dengan database relasional biasa, indeks pada FK, nomor sumber, serial, tanggal akhir, kota, dan tanggal transaksi. Ini rekomendasi desain, bukan hasil benchmark; belum ada kebutuhan terukur untuk partitioning atau arsitektur terdistribusi.

## 8. Mapping Excel → database

Tiap nilai mentah juga disimpan di `import_rows.raw_cells`, termasuk huruf kolom, tipe sel, dan newline. Mapping berikut adalah kandidat hasil normalisasi, dengan penanda yang perlu konfirmasi.

| Excel | Target | Transformasi / syarat |
|---|---|---|
| Nama sheet | monitoring_records.source_category; equipment_types.category_code | Peluru tajam/karet; jangan disamakan dengan jenis PISTOL/REVOLVER |
| B No/NO | monitoring_records.source_no | Simpan string; bukan PK |
| C TAKAH | monitoring_records.takah_ref | String nullable; jangan konversi `rof` |
| D TAHUN | monitoring_records.source_year | Integer; bukan tanggal pinjam |
| E WILAYAH HUKUM/POLRES | monitoring_records.jurisdiction_raw | Simpan apa adanya |
| E setelah validasi yurisdiksi | monitoring_records.jurisdiction_id → jurisdictions.id | Mapping manual/reference yang disepakati |
| E setelah validasi arti kota | monitoring_records.city_id → cities.id | Hanya jika benar merupakan kota register; bukan otomatis borrowers.city_id |
| F Nama/NAMA | borrowers.full_name; monitoring_records.borrower_name_snapshot | Cocokkan orang dahulu; gelar tetap dipertahankan |
| G Alamat/ALAMAT | borrowers.address; monitoring_records.address_snapshot | Kota alamat harus dikonfirmasi terpisah; jangan timpa alamat master dari record lama otomatis |
| H Pekerjaan/PEKERJAAN | borrowers.occupation; monitoring_records.occupation_snapshot | Trim/standardisasi label dengan raw tetap ada |
| I Jabatan/JABATAN | borrowers.position; monitoring_records.position_snapshot | Nullable; tidak otomatis menjadi master jabatan |
| J baris 1 | equipment_types.name → assets.equipment_type_id | PISTOL/REVOLVER; mapping kamus terverifikasi |
| J baris 2 | assets.make_model_raw; assets.make_model_normalized | Trim dan case-fold untuk pencarian; merek/model belum dipisah |
| J baris 3 | assets.caliber_label; caliber_value/caliber_unit bila jelas | `9,4 mm` → 9.4 + mm; `22`/`32` tetap label dengan unit unknown |
| J baris 4 | assets.serial_raw; assets.serial_match_key bila valid | Preserve titik, prefix, leading zero; matching konservatif |
| K setiap baris tidak kosong | permit_documents.document_number_raw/normalized, document_type_code, source_line_no | Bentuk satu child per nomor; prefix hanya kode, tidak ada penerbitan izin |
| L slot sejajar dengan K | permit_documents.valid_until, date_precision, expiry_raw | DD/MM/YYYY; mapping posisi harus dikonfirmasi |
| L `MEI 2007` | import_rows.parsed_payload + validation_errors | Belum diarahkan ke dokumen tertentu; setelah atribusi jelas isi year/month dan precision=month |
| M Keterangan/KETERANGAN | monitoring_records.notes | TEXT; pernyataan perpanjangan tidak mengubah tanggal tanpa bukti |
| N STATUS | monitoring_records.status_raw | Selalu dipertahankan |
| N `SUDAH/BELUM DIPERPANJANG` | monitoring_records.renewal_state | renewed/not_renewed; bukan active/expired |
| N `DI GUDANG WASSENDAK` | Kandidat locations.name dan assets.current_location_id | Perlu verifikasi master lokasi dan kebaruan observasi; inventory_state belum otomatis available |
| Koordinat workbook | import_rows.sheet_name/row_number/raw_cells | Provenance, bukan ID bisnis |

Tidak ada mapping sumber yang sah untuk: borrowers.activity_status, tanggal awal izin, tanggal transaksi keluar/kembali, stok tersedia, foto, PDF, atau ID unik eksternal. Biarkan unknown/NULL atau kumpulkan sumber tambahan.

## 9. Rekomendasi master kota

### Nilai yang benar-benar ditemukan

| Lokasi sumber | Variasi / frekuensi | Penanganan |
|---|---|---|
| E kedua sheet | Jakarta Selatan: 3; Tangerang Selatan: 1; Jakarta Timur: 1; kosong: 1 | Tiga label wilayah unik; pastikan dahulu E berarti kota atau yurisdiksi |
| Alamat Tajam G4 | `Jaksel` | Kandidat alias Jakarta Selatan; dapat diverifikasi dengan E4 |
| Alamat Tajam G5 | `Tangerang`, disertai Kedaung/Pamulang; E5 `Tangerang Selatan` | Ambigu jika hanya memakai kata Tangerang; jangan samakan dengan Kota/Kabupaten Tangerang otomatis |
| Alamat Karet G3 | `Rawa Mangun`; E3 kosong | Kandidat lokasi administratif perlu diverifikasi; bukan nama kota yang eksplisit |
| Alamat Karet G5 | `Keby. Baru`, `Jakarta Selatan` | Singkatan kecamatan tidak dimasukkan sebagai alias kota |

Rekomendasi:

1. Pilih satu sistem kode administratif sebagai master, misalnya **Kemendagri**, dengan versi/sumber data tercatat. Jangan membuat kode sendiri dari urutan Excel.
2. Pisahkan `id` internal dari `official_code`. Bila integrasi membutuhkan kode BPS, gunakan crosswalk yang memiliki versi; jangan menganggap kode identik. BPS menyediakan halaman [relasi kode Wilkerstat dan kode Kemendagri](https://sig.bps.go.id/bridging-kode/index); halaman tersebut menyebut referensi tahun 2020, sehingga bukan daftar terbaru siap impor.
3. Kandidat nama baku: Jakarta Selatan, Jakarta Timur, Tangerang Selatan dengan tipe wilayah dan provinsi dari master resmi yang dipilih. Kode numeriknya **belum ditetapkan** dalam analisis ini.
4. `city_aliases` menyimpan alias terverifikasi, misalnya `jaksel`, dengan konteks sumber. Jangan menjadikan `Tangerang` alias global untuk Tangerang Selatan.
5. `borrowers.city_id` mereferensikan kota alamat saat ini; `monitoring_records.city_id` menyimpan kota register yang relevan saat record dicatat; `borrowings.city_id` menyimpan konteks kota transaksi bila tersedia; `locations.city_id` untuk lokasi gudang.
6. Perubahan domisili master tidak boleh mengubah snapshot kota/alamat record historis.
7. `jurisdiction_id` tetap terpisah. Jika cakupan POLRES lintas kota perlu dimodelkan, tambah tabel jurisdiction_cities setelah ada data cakupan; belum perlu diisi dari sampel.
8. Exact match pada alias yang terverifikasi boleh otomatis. Fuzzy match hanya saran untuk admin; ambigu dan kosong masuk daftar unresolved.

## 10. File, bukan blob database

| Jenis | Penyimpanan | Referensi database |
|---|---|---|
| Foto peminjam | File/object storage privat | borrowers.photo_file_id → files |
| Foto senjata/alat | File/object storage privat | assets.photo_file_id → files |
| PDF perjanjian/dokumen | File/object storage privat | record_files → files; opsional kaitkan ke permit_documents |
| Excel sumber import | Arsip file privat yang tidak ditimpa | import_batches.source_file_id → files |

Database menyimpan object key, nama asli, MIME, ukuran, checksum, dan pengunggah; bukan binary BLOB atau base64. Gunakan nama penyimpanan internal yang tidak bertabrakan dan akses file melalui otorisasi aplikasi. Validasi konten file, bukan hanya ekstensi. Metadata nomor dokumen tetap ada di permit_documents walaupun PDF-nya belum tersedia. Tidak ada file foto/PDF yang dapat diekstrak dari sampel ini.

## 11. Field dashboard dan definisinya

Tentukan unit hitung secara eksplisit agar JOIN ke dokumen/detail tidak menggandakan KPI.

| KPI | Field / dasar hitung | Yang bisa dinyatakan dari sampel |
|---|---|---|
| Total data register | COUNT monitoring_records.id | 6 baris sumber; setelah dedup identitas yang terkonfirmasi |
| Total dokumen | COUNT permit_documents.id | 16 kandidat referensi kartu/buku; KPI terpisah dari register |
| Peminjam aktif | COUNT DISTINCT borrowers.id dengan activity_status=active | Belum diketahui; 6 nama berbeda bukan bukti 6 peminjam aktif |
| Jumlah alat/senjata | COUNT DISTINCT assets.id | 6 kandidat aset; 4 PISTOL dan 2 REVOLVER sebelum verifikasi identitas |
| Jumlah jenis | COUNT DISTINCT equipment_type_id pada definisi jenis yang dipilih | Dua label jenis terlihat; kategori tajam/karet terpisah |
| Stok tersedia | Aset inventory_state=available berdasarkan rekonsiliasi fisik | Tidak tersedia; 2 status gudang tidak cukup |
| Stok digunakan | Aset inventory_state=in_use konsisten dengan detail issued/not returned | Tidak tersedia; jangan hitung dari izin aktif |
| Data berdasarkan kota | monitoring_records.city_id; metrik peminjam gunakan borrowers.city_id | Label E: 3 Jakarta Selatan, 1 Tangerang Selatan, 1 Jakarta Timur, 1 unknown; masih perlu validasi arti wilayah |
| Periode masih aktif | valid_from ≤ tanggal acuan ≤ valid_until, dokumen relevan dan tidak digantikan | Start date dan aturan dokumen otoritatif belum ada; belum dapat dihitung sebagai status izin keseluruhan |
| Hampir habis | Dokumen aktif dengan 0 ≤ sisa hari ≤ ambang konfigurasi | Rekomendasi awal ambang 30 hari, perlu persetujuan definisi bisnis |
| Expired | Dokumen otoritatif valid_until < tanggal acuan | 8 tanggal lengkap telah lewat; belum sama dengan 6 izin expired |
| Transaksi per bulan | borrowings.recorded_on atau started_on yang definisinya disepakati | Tidak bisa dihitung; TAHUN dan tahun nomor surat bukan pengganti tanggal transaksi |
| Volume import per bulan | import_batches.imported_at | Bisa dihitung setelah sistem berjalan; jangan dilabeli transaksi per bulan |

Status waktu sebaiknya dihitung saat query: belum mulai, aktif, hampir habis, expired, atau unknown. `valid_from` kosong hanya mendukung label “tanggal akhir belum lewat”, bukan kepastian aktif. Untuk tanggal parsial bulan, tampilkan periode parsial; jangan menghitung sisa hari persis. Untuk status keseluruhan register dengan beberapa dokumen, tentukan terlebih dahulu dokumen mana yang wajib/relevan dan bagaimana supersession berlaku; jangan sekadar mengambil tanggal terbesar.

## 12. Data ambigu dan keputusan yang diperlukan

1. Apakah orang dalam register benar-benar peminjam, pemegang izin, pemilik, atau penanggung jawab? Nama tabel borrowers mengikuti konteks pengguna, bukan pembuktian dari header.
2. Apa makna TAKAH dan nilai `rof`? Apakah unik per orang, berkas, atau kategori?
3. Apakah No di-reset per tahun/sheet, dan apakah baris lama dapat berganti nomor saat diekspor ulang?
4. TAHUN adalah tahun pendaftaran, dokumen, atau arsip?
5. Apakah WILAYAH HUKUM dan POLRES menyimpan kota administratif, unit kepolisian, atau cakupan wilayah?
6. Apakah empat baris J selalu berurutan jenis–merek/model–kaliber–serial pada file lengkap? Apa satuan `22` dan `32`?
7. Apakah baris K dan L memang berpasangan menurut posisi? Karet r3 `MEI 2007` milik dokumen mana?
8. Apakah beberapa nomor BPSA/BPSPK merupakan jenis dokumen berbeda atau riwayat dokumen pengganti? Mana yang menentukan masa berlaku penggunaan?
9. Apakah status perpanjangan merupakan keadaan terbaru, catatan historis, atau flag administratif? Apa dokumen baru yang mendasari Karet M5?
10. Apakah WASSENDAK satu gudang atau nama fungsi dengan beberapa lokasi? Apakah aset di sana tersedia, dititipkan, ditahan, atau dalam perawatan?
11. Apa definisi peminjam aktif? Terdaftar aktif, punya transaksi terbuka, atau punya dokumen berlaku? Ketiganya menghasilkan KPI berbeda.
12. Angka 4.000 data/tahun merujuk register, dokumen, transaksi, atau perpanjangan?
13. Adakah export lain untuk ID peminjam/aset/transaksi, tanggal mulai/selesai, keluar/kembali, stok awal, dan perubahan status?
14. Bagaimana foto/PDF dicocokkan ke orang/aset/register? Apakah tersedia ID atau manifest dari sistem asal?
15. Apakah file import merupakan snapshot penuh atau tambahan/perubahan saja? Bagaimana penanda record dibatalkan/dihapus oleh sumber?

Keputusan-keputusan tersebut tidak menghalangi pembuatan staging/raw archive, tetapi membatasi auto-merge, penetapan status aktif, dan pengisian transaksi/history produksi.

## 13. Flow import Excel yang aman

Flow ini adalah validasi kualitas import oleh admin, **bukan approval perizinan**.

1. **Terima dan arsipkan sumber.** Validasi format, ukuran, struktur workbook, dan akses admin. Simpan file utuh, hash, nama, source_system, parser_version, mapping_version, dan waktu impor. Tetapkan batas baris/file yang sesuai operasional; jangan percaya ekstensi saja.
2. **Deteksi struktur.** Kenali dua kategori sheet, header baris 2 dan data mulai baris 3. Terima variasi kapitalisasi yang sudah dikenal. Sheet/header yang tidak dikenal ditampilkan untuk mapping; jangan diam-diam dilewati. Jangan menjalankan macro atau formula dari file.
3. **Staging tanpa mengubah master.** Simpan raw_cells termasuk tipe, koordinat, LF/CRLF/CR, baris kosong, dan nilai asli. Bentuk parsed_payload terpisah. Abaikan baris benar-benar kosong, bukan baris yang hanya sebagian kosong.
4. **Parse J, K, L sesuai struktur.** J empat atribut; K daftar dokumen; L daftar tanggal yang mempertahankan slot. Blok pasangan tidak jelas dan jangan broadcast tanggal tunggal. Untuk sampel, aturan positional K/L perlu dikonfirmasi sekali dan dicatat sebagai mapping_version.
5. **Validasi field.** Nama dan identitas aset wajib sesuai kebijakan minimum. Tanggal DMY harus valid kalender; unknown boleh NULL. Periksa valid_from/valid_until jika keduanya ada. Tahun register dan tahun nomor dokumen yang berbeda adalah warning, bukan otomatis error. Kaliber tidak jelas dan nomor ambigu masuk review.
6. **Mapping kota/yurisdiksi.** Exact master/alias terverifikasi dahulu; kota vs POLRES jangan dicampur. Kandidat fuzzy dan nilai kosong ditampilkan untuk penyelesaian. Simpan pilihan admin agar re-import memakai mapping yang sama.
7. **Mapping peminjam.** Utamakan ID sumber. Jika belum ada, tampilkan kandidat nama normalisasi + alamat + atribut pendukung. Jangan otomatis merge karena nama sama, atau membuat orang baru hanya karena gelar/alamat berbeda. Keputusan link/create ditulis dalam match_decisions.
8. **Mapping aset.** Utamakan ID sumber/asset_code. Gunakan serial + tipe/kategori + merek/model sebagai kandidat; jangan menghapus titik/leading zero sembarangan. Perbedaan kaliber/unit dan serial menjadi exception. Link ke existing asset sebelum menambahkan record baru.
9. **Deteksi duplikat.** Bedakan file identik, row identik, orang/aset yang sama, dokumen sama, dan kejadian peminjaman baru. Hash row adalah detektor kesamaan isi, bukan pengganti ID bisnis. Pengulangan orang/aset pada transaksi lain bukan duplikat yang harus dibuang.
10. **Preview hasil.** Sajikan jumlah rows read, valid, warning, blocked, unchanged, new records, updates, serta jumlah dokumen anak. Satu baris sumber menjadi beberapa dokumen ditampilkan jelas agar 6 baris tidak disalahartikan sebagai 16 transaksi.
11. **Laporan error.** Setiap error memiliki sheet, row, cell, line_no, raw_value, error_code, severity, candidate target, dan tindakan yang diperlukan. Contoh: Karet L3 `AMBIGUOUS_DATE_PAIRING`; Tajam J5 baris 3 `CALIBER_UNIT_UNKNOWN`; Karet M5/L5 `RENEWAL_DATE_CONFLICT`. Kode ini adalah rancangan, bukan hasil sistem yang sudah diimplementasikan.
12. **Commit atomik.** Simpan satu aggregate register bersama dokumen anaknya dalam satu transaksi database setelah mapping selesai. Jangan menyimpan sebagian dokumen dari row yang pasangan datanya gagal. Baris lain yang valid boleh diproses jika mode partial-import dipilih secara eksplisit; rekap blocked rows tetap terlihat.
13. **Re-import idempotent.** File identik dengan parser/mapping sama menjadi no-op terlapor. Jika parser/mapping berubah, lakukan reprocess terkontrol dengan diff. Baris identik di file berbeda menjadi unchanged setelah matching. Baris berubah tidak otomatis menjadi orang/aset baru; cari ID sumber atau mapping terdahulu. Identitas yang tidak dapat dicocokkan masuk konflik, bukan auto-insert.
14. **Koreksi dan histori.** Koreksi field pada dokumen yang sama dibuat sebagai perubahan ter-audit. Dokumen pengganti/perpanjangan baru menjadi record baru jika bukti identitas penggantinya jelas. Jangan menghapus dokumen lama atau menyimpulkan supersession hanya dari urutan list. Perubahan alamat dari arsip lama tidak boleh menimpa master terbaru tanpa aturan sumber otoritatif.
15. **Record hilang dari file.** Tidak otomatis berarti delete, nonaktif, atau dikembalikan. Snapshot penuh vs delta harus eksplisit; rekonsiliasi kehilangan record dilakukan terpisah dengan bukti.
16. **Rekonsiliasi pascaimport.** Cocokkan jumlah source rows dan detail documents; simpan batch summary dan audit. Untuk sampel: ekspektasi 6 register kandidat dan 16 referensi dokumen, dengan exception tanggal/kota/identifier tetap terlihat.

## 14. Langkah implementasi berikutnya

1. Konfirmasikan definisi satu baris, identifier, arti wilayah, struktur multiline, jenis dokumen, dan aturan masa berlaku dengan pemilik sistem sumber.
2. Minta export tambahan yang memuat ID stabil, history transaksi keluar/kembali, stok awal/lokasi, dan referensi foto/PDF. Sampel sekarang belum cukup untuk membentuk seluruh KPI operasional.
3. Tetapkan kamus data dan mapping master kota/yurisdiksi, jenis alat, serta status. Pilih versi master resmi yang akan digunakan.
4. Validasi rancangan dengan file lebih besar yang mencakup peminjam berulang, aset berulang, pergantian alamat, perpanjangan, tanggal parsial, dan konflik identifier.
5. Finalisasi schema dan aturan import setelah ambiguitas inti terjawab. Implementasi Laravel/migration merupakan tahap berikutnya, belum dilakukan.
6. Pada tahap implementasi UI yang terpisah, sesuaikan prototype menjadi monitoring-only: hapus konsep approval/reject dan penerbitan izin. Tampilan dokumen nanti merepresentasikan arsip dari sistem lain, bukan bukti izin yang diterbitkan aplikasi ini. Prototype saat ini tidak diubah dalam pekerjaan analisis ini.

## Referensi pemeriksaan

- Seluruh workbook: kedua sheet B2:N5.
- Struktur multiline: kedua sheet J3:L5.
- Nilai kota/yurisdiksi dan alamat: kedua sheet E3:G5.
- Konflik catatan/perpanjangan: Karet L5:N5; Tajam L5:N5.
- Metadata file: SHA-256 `ff7892004af00fb7d82f75642dbdbe0972b0e0292defaad995ccd2db2445fb14`.
- Referensi eksternal hanya digunakan untuk rekomendasi sistem kode wilayah: [BPS, bridging kode Wilkerstat–Kemendagri](https://sig.bps.go.id/bridging-kode/index). Tidak ada data pribadi workbook yang dikirim untuk pencarian web.
