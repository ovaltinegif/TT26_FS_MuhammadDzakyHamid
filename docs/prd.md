# SmartWarehouse

**Product Requirements Document** — Aplikasi Admin Pengelolaan Perangkat Sensor Suhu & Kelembapan

| Item | Keterangan |
| --- | --- |
| Kode Tes | TT26-05-FS |
| Pemilik / Peserta | Muhammad Dzaky Hamid |
| Posisi | Junior Fullstack Engineer — Program Magang TaggIoT 2026 |
| Perusahaan | PT Teknologi Tata Data (TaggIoT), Semarang |
| Klien (fiktif) | PT Dingin Segar Logistik — cold storage, Semarang |
| Repository | `TT26_FS_MuhammadDzakyHamid` (GitHub: ovaltinegif) |
| Versi / Status | 1.0 — Draf siap dikerjakan |
| Tanggal | 31 Oktober 2026 |
| Dokumen rujukan | • Tes Teknis TT26-05-FS (Junior Fullstack Engineer)<br>• Job Description JD-MAG26-05-FS |

**Riwayat dokumen**

| Versi | Tanggal | Penyusun | Perubahan |
| --- | --- | --- | --- |
| 1.0 | 31 Okt 2026 | Muhammad Dzaky Hamid | Draf awal PRD berdasarkan soal tes teknis dan job description. |

## Daftar Isi

- [1. Ringkasan Produk](#1-ringkasan-produk)
- [2. Latar Belakang, Tujuan, dan Sasaran Keberhasilan](#2-latar-belakang-tujuan-dan-sasaran-keberhasilan)
- [3. Pengguna dan Aktor](#3-pengguna-dan-aktor)
- [4. Ruang Lingkup](#4-ruang-lingkup)
- [5. Aturan Bisnis](#5-aturan-bisnis)
- [6. Kebutuhan Fungsional](#6-kebutuhan-fungsional)
- [7. Spesifikasi Use Case UC-FS-01](#7-spesifikasi-use-case-uc-fs-01)
- [8. Kebutuhan Non-Fungsional](#8-kebutuhan-non-fungsional)
- [9. Tech Stack](#9-tech-stack)
- [10. Arsitektur dan Struktur Proyek](#10-arsitektur-dan-struktur-proyek)
- [11. Desain Database](#11-desain-database)
- [12. Spesifikasi REST API](#12-spesifikasi-rest-api)
- [13. Spesifikasi Antarmuka (Frontend)](#13-spesifikasi-antarmuka-frontend)
- [14. Data Contoh (Seeder)](#14-data-contoh-seeder)
- [15. Kriteria Penerimaan](#15-kriteria-penerimaan)
- [16. Rencana Pengerjaan dan Panduan Presentasi](#16-rencana-pengerjaan-dan-panduan-presentasi)
- [17. Asumsi, Risiko, dan Pertanyaan Terbuka](#17-asumsi-risiko-dan-pertanyaan-terbuka)
- [18. Hasil yang Dikumpulkan](#18-hasil-yang-dikumpulkan)
- [19. Starter Prompt](#19-starter-prompt)
- [Lampiran A. Keterkaitan dengan Job Description](#lampiran-a-keterkaitan-dengan-job-description)
- [Lampiran B. Aspek Penilaian dan Pemenuhannya](#lampiran-b-aspek-penilaian-dan-pemenuhannya)

## 1. Ringkasan Produk

**SmartWarehouse** adalah aplikasi web fullstack untuk proyek pilot TaggIoT bagi klien fiktif PT Dingin Segar Logistik. Aplikasi ini memberi **Admin IT** satu tempat untuk mengelola data perangkat sensor suhu dan kelembapan (ESP32 + DHT22) serta melihat pembacaan terbarunya. Aplikasi dibangun dengan Laravel (PHP), MySQL, dan frontend HTML, CSS, JavaScript yang memakai Fetch API.

| Item | Keterangan |
| --- | --- |
| Masalah | Data perangkat sensor di dua gudang belum punya alat kelola yang sederhana, dan pembacaan terbaru tiap perangkat belum mudah dilihat. |
| Solusi | Aplikasi admin dengan CRUD perangkat, endpoint penerima pembacaan sensor, dan panel detail berisi 10 pembacaan terakhir. |
| Pengguna utama | Admin IT. |
| Keluaran utama | REST API 6 endpoint, skema database (migration), seeder, antarmuka web, README, dan koleksi Postman. |
| Bentuk tes | Studi kasus take-home, lalu presentasi hasil 15 menit (10 menit presentasi + 5 menit tanya jawab). |
| Waktu pengerjaan | 3 × 24 jam sejak soal diterima (estimasi kerja efektif 4–6 jam). Tingkat kesulitan: dasar. |

## 2. Latar Belakang, Tujuan, dan Sasaran Keberhasilan

### 2.1 Latar belakang

TaggIoT menjalankan proyek pilot SmartWarehouse untuk PT Dingin Segar Logistik, perusahaan cold storage di Semarang. Klien memiliki dua gudang: **Gudang A** untuk produk beku dan **Gudang B** untuk produk segar. Di tiap gudang terpasang sensor suhu dan kelembapan berbasis ESP32 + DHT22 yang mengirim data setiap 5 menit ke server TaggIoT. Data ditampilkan pada dashboard web, dan sistem mengirim peringatan kepada Supervisor Gudang bila kondisi berada di luar batas aman.

Untuk kebutuhan tim, diperlukan **aplikasi admin sederhana** yang dipakai Admin IT untuk mengelola data perangkat sensor dan melihat pembacaan terbaru dari setiap perangkat. Seluruh nama perusahaan, orang, dan data dalam studi kasus ini bersifat fiktif.

### 2.2 Tujuan produk

- Admin IT dapat menambah, mengubah, dan menghapus perangkat sensor dengan data yang tervalidasi.
- Admin IT dapat melihat 10 pembacaan suhu dan kelembapan terakhir dari setiap perangkat, terbaru di atas.
- Sistem dapat menerima dan menyimpan pembacaan sensor melalui endpoint HTTP.
- Data di antarmuka selalu konsisten dengan data di database.

### 2.3 Tujuan pembelajaran (sesuai tes dan job description)

Tes ini mengukur kemampuan dasar membangun aplikasi web fullstack: REST API, database, antarmuka yang terhubung ke API, dan validasi data. Hasilnya juga menjadi dasar pendampingan mentor selama magang.

### 2.4 Sasaran keberhasilan

| No | Indikator | Target |
| :---: | --- | --- |
| S1 | Endpoint sesuai spesifikasi (6 dari 6) dengan kode status benar | 100% |
| S2 | Skenario validasi: format kode salah → 400, kode duplikat → 409, perangkat tidak ada → 404 | Semua lulus |
| S3 | Frontend memakai data dari API dan ter-update langsung setelah tambah/ubah/hapus | Semua lulus |
| S4 | Seeder menghasilkan minimal 3 perangkat dan 10 pembacaan per perangkat | 3 × 10 data |
| S5 | Proyek berjalan dari clone baru hanya dengan mengikuti README | Tanpa langkah tambahan |
| S6 | Peserta mampu menjelaskan setiap keputusan teknis saat presentasi | 10 menit + 5 menit tanya jawab |

## 3. Pengguna dan Aktor

| Aktor | Peran | Kebutuhan terhadap aplikasi | Dalam lingkup? |
| --- | --- | --- | --- |
| **Admin IT** | Pengguna utama aplikasi admin | • Melihat daftar perangkat<br>• Menambah, mengubah, menghapus perangkat<br>• Melihat 10 pembacaan terakhir | Ya |
| **Perangkat sensor (ESP32 + DHT22)** | Pengirim data | • Mengirim suhu dan kelembapan setiap 5 menit ke POST /api/readings<br>• Dalam tes disimulasikan lewat curl/Postman dan seeder | Ya (endpoint penerima) |
| **Supervisor Gudang** | Penerima peringatan | Menerima peringatan bila kondisi di luar batas aman. | Tidak (konteks sistem besar) |

## 4. Ruang Lingkup

### 4.1 Dalam lingkup (wajib)

- CRUD perangkat sensor (tabel `devices`).
- Penyimpanan dan pengambilan pembacaan sensor (tabel `readings`).
- Enam endpoint REST API beserta validasi dan kode status HTTP yang tepat.
- Frontend HTML + CSS + JavaScript (Fetch API): daftar, form tambah/ubah, hapus dengan konfirmasi, panel detail pembacaan.
- Migration dan seeder Laravel (minimal 3 perangkat dan 10 pembacaan per perangkat).
- README, koleksi Postman (atau daftar curl), dan screenshot.

### 4.2 Di luar lingkup

Bagian berikut adalah konteks sistem SmartWarehouse yang lebih besar, tetapi tidak diminta pada tes ini:

- Autentikasi dan otorisasi pengguna (login, role).
- Penerimaan data lewat MQTT atau WebSocket.
- Notifikasi peringatan (email/WhatsApp) ke Supervisor Gudang.
- Dashboard grafik, deteksi kondisi di luar batas aman, dan deteksi sensor offline.
- Deployment ke server production.

### 4.3 Nilai tambah (opsional)

Dikerjakan hanya bila semua tugas utama sudah lulus pemeriksaan:

- Docker Compose untuk menjalankan aplikasi dan database.
- Pagination dan pencarian perangkat.
- Test otomatis untuk endpoint.

## 5. Aturan Bisnis

| Gudang | Jenis Produk | Batas Suhu Aman | Batas Kelembapan Aman |
| :---: | --- | --- | --- |
| A | Produk beku | -25°C s/d -15°C | 40% – 80% |
| B | Produk segar | 0°C s/d 8°C | 40% – 80% |

| ID | Aturan |
| :---: | --- |
| BR-01 | Batas aman bersifat **inklusif** (suhu 8,0°C di Gudang B masih aman). |
| BR-02 | Sensor mengirim data setiap **5 menit**. |
| BR-03 | Sensor dianggap **offline** bila tidak mengirim data lebih dari **15 menit**. |
| BR-04 | Kode perangkat wajib unik dan berformat `SNS-[A/B][2 digit]`, misalnya `SNS-A01`. |
| BR-05 | Gudang hanya bernilai `A` atau `B`. |
| BR-06 | Kelembapan berada pada rentang 0–100 (%). |
| BR-07 | Sebuah pembacaan selalu milik satu perangkat. Bila perangkat dihapus, pembacaannya ikut terhapus (tidak ada data yatim). |
| BR-08 | Penghapusan perangkat harus dikonfirmasi Admin terlebih dahulu (alur alternatif A3). |

> **Catatan:** BR-01 sampai BR-03 menjadi acuan data seeder dan konteks produk. Penandaan status aman/offline di antarmuka tidak diminta pada tes ini.

## 6. Kebutuhan Fungsional

| ID | Kebutuhan | Prioritas | Rujukan |
| :---: | --- | :---: | --- |
| FR-01 | Sistem menampilkan tabel daftar perangkat berisi kode, nama, gudang, dan status aktif, yang datanya diambil dari `GET /api/devices`. | Wajib | UC-FS-01 langkah 1–2 |
| FR-02 | Admin dapat menambah perangkat melalui form; sistem memvalidasi lalu menyimpan lewat `POST /api/devices` dan tabel diperbarui. | Wajib | UC-FS-01 langkah 3–4 |
| FR-03 | Admin dapat mengubah perangkat melalui form; sistem menyimpan lewat `PUT /api/devices/:id`. | Wajib | Tugas 3 |
| FR-04 | Admin dapat menghapus perangkat; sistem meminta konfirmasi sebelum memanggil `DELETE /api/devices/:id`. | Wajib | Alur A3 |
| FR-05 | Admin dapat memilih perangkat untuk melihat 10 pembacaan suhu dan kelembapan terakhir (terbaru di atas) dari `GET /api/devices/:id/readings?limit=10`. | Wajib | UC-FS-01 langkah 5–6 |
| FR-06 | Sistem menerima pembacaan sensor lewat `POST /api/readings` dan menyimpannya ke database. | Wajib | Spesifikasi endpoint |
| FR-07 | Sistem memvalidasi input dan menampilkan pesan error per field (kode kosong/format salah, gudang bukan A/B, dan sebagainya). | Wajib | Alur A1 |
| FR-08 | Sistem menolak kode perangkat yang sudah terdaftar dengan pesan "Kode perangkat sudah digunakan" (HTTP 409). | Wajib | Alur A2 |
| FR-09 | Antarmuka ter-update langsung setelah tambah, ubah, atau hapus tanpa muat ulang halaman manual. | Wajib | Checklist §7 |
| FR-10 | Seeder mengisi minimal 3 perangkat dan 10 pembacaan per perangkat. | Wajib | Tugas 4 |
| FR-11 | Tersedia README (teknologi, instalasi, endpoint, contoh request) dan koleksi Postman atau daftar curl. | Wajib | Tugas 5, §8 |
| FO-01 | Docker Compose untuk aplikasi + database. | Opsional | Nilai tambah |
| FO-02 | Pagination dan pencarian perangkat. | Opsional | Nilai tambah |
| FO-03 | Test otomatis untuk endpoint. | Opsional | Nilai tambah |

## 7. Spesifikasi Use Case UC-FS-01

| Item | Keterangan |
| --- | --- |
| ID Use Case | UC-FS-01 |
| Nama | Mengelola Perangkat Sensor dan Melihat Pembacaan |
| Aktor | Admin IT |
| Deskripsi | Admin menambah, mengubah, dan menghapus perangkat, serta melihat 10 pembacaan terakhir dari sebuah perangkat. |
| Prasyarat | Aplikasi dan database sudah berjalan di lingkungan lokal. |
| Kondisi akhir | Data perangkat tersimpan di database dan tampil konsisten di antarmuka. |

#### Alur utama

1. Admin membuka halaman Daftar Perangkat.
2. Sistem menampilkan tabel perangkat (kode, nama, gudang, status aktif).
3. Admin mengisi form Tambah Perangkat lalu menekan Simpan.
4. Sistem memvalidasi dan menyimpan perangkat baru, lalu tabel diperbarui.
5. Admin memilih salah satu perangkat untuk melihat detail.
6. Sistem menampilkan 10 pembacaan suhu dan kelembapan terakhir dari perangkat tersebut.

#### Alur alternatif

| ID | Kondisi | Respons sistem |
| :---: | --- | --- |
| A1 | Data tidak valid (kode kosong/format salah, gudang bukan A/B) | Sistem menampilkan pesan error per field (HTTP 400). |
| A2 | Kode perangkat sudah terdaftar | Sistem menolak dengan pesan "Kode perangkat sudah digunakan" (HTTP 409). |
| A3 | Admin menghapus perangkat | Sistem meminta konfirmasi sebelum menghapus. |

#### Alur tambahan (diturunkan dari Tugas 3)

Soal mewajibkan form ubah dan tombol hapus, tetapi alur utama use case hanya menyebut tambah dan lihat detail. Dua alur berikut dilengkapi agar sesuai dengan Tugas 3:

| ID | Alur | Langkah |
| :---: | --- | --- |
| U1 | Ubah perangkat | 1. Admin menekan Ubah pada baris perangkat; form terisi data saat ini.<br>2. Admin mengubah data lalu menekan Simpan.<br>3. Sistem memvalidasi (kode tidak boleh bentrok dengan perangkat lain), menyimpan, dan memperbarui tabel. |
| U2 | Hapus perangkat | 1. Admin menekan Hapus; sistem menampilkan konfirmasi.<br>2. Bila Admin setuju, sistem memanggil DELETE dan memperbarui tabel; panel detail ditutup jika menampilkan perangkat yang sama.<br>3. Bila Admin batal, tidak ada perubahan data. |

## 8. Kebutuhan Non-Fungsional

| Aspek | Kebutuhan |
| --- | --- |
| **Kinerja** | Query pembacaan terbaru memakai indeks komposit `(device_id, created_at)` agar tetap cepat saat data bertambah. Daftar perangkat diambil dalam satu query. |
| **Keamanan** | • Validasi dilakukan di backend (satu sumber kebenaran); frontend hanya menampilkan pesan dari API.<br>• Query lewat Eloquent (parameter terikat) dan `$fillable` untuk mencegah mass assignment.<br>• Frontend merender teks dengan `textContent` agar aman dari XSS.<br>• Tidak ada kredensial di repository: `.env` tidak di-commit, `.env.example` tanpa password asli. |
| **Keandalan** | Kode status HTTP konsisten dengan spesifikasi dan semua error berformat JSON `{"message": "..."}`, termasuk untuk request tanpa header `Accept`. |
| **Integritas data** | Foreign key `readings.device_id` dengan `ON DELETE CASCADE`; kode perangkat unik di level database (bukan hanya di aplikasi). |
| **Keterpeliharaan** | Struktur rapi: route, controller, form request, model, migration, dan seeder dipisah. Kode mudah dijelaskan saat presentasi. |
| **Portabilitas** | Dapat dijalankan dari clone baru dengan langkah di README: `composer install`, salin `.env`, buat database, `php artisan migrate --seed`, `php artisan serve`. |
| **Kegunaan (usability)** | Pesan error per field, konfirmasi sebelum hapus, status loading, dan tampilan kosong yang jelas. Tampilan rapi dan dapat dipakai di layar laptop maupun ponsel. |
| **Kompatibilitas** | Peramban modern (Chrome, Edge, Firefox versi terbaru). PHP ≥ 8.2 (sesuaikan dengan `composer.json`), MySQL ≥ 8.0. |
| **Dokumentasi** | README lengkap, koleksi Postman atau daftar curl, dan screenshot halaman utama serta detail perangkat. |

## 9. Tech Stack

| Lapisan | Teknologi | Peran dalam proyek |
| --- | --- | --- |
| **Backend / REST API** | **Laravel (PHP)** | Routing `/api/*`, controller, form request, model Eloquent, penanganan error JSON. |
| **Database** | **MySQL** (≥ 8.0, charset utf8mb4) | Menyimpan tabel `devices` dan `readings`. |
| **Skema database** | **Laravel Migration** | Membuat dan mengubah skema secara terversi dan dapat diulang (`migrate:fresh`). |
| **Data awal** | **Laravel Seeder** | Mengisi 3 perangkat dan 10 pembacaan per perangkat. |
| **Frontend** | **HTML, CSS, JavaScript** | Halaman admin tunggal di folder `public/`, tanpa framework JavaScript. |
| **Komunikasi data** | **Fetch API** | Frontend memanggil REST API dengan JSON (`GET`, `POST`, `PUT`, `DELETE`). |
| **Alat bantu** | Composer, Git & GitHub, Postman / curl, DBeaver atau TablePlus, VS Code | Pengembangan, pengujian API, dan pemeriksaan database. |

#### Alasan pemilihan dan batasan

- Laravel menyediakan migration, seeder, Eloquent, dan validasi bawaan sehingga cocok dengan tuntutan tes dan job description (migrasi, seeder, REST API, validasi).
- MySQL termasuk database relasional yang diminta pada kualifikasi posisi (MySQL/PostgreSQL).
- Frontend HTML + CSS + JavaScript murni menjaga proyek kecil dan memudahkan penjelasan alur Fetch API saat presentasi.
- Tidak dipakai pada tes ini: framework JavaScript, Sanctum/autentikasi, antrean (queue), dan cache.

## 10. Arsitektur dan Struktur Proyek

### 10.1 Alur permintaan

```
Browser (public/index.html + app.js)
    |  fetch() -> JSON
    v
routes/api.php
    v
Controller (DeviceController, ReadingController)
    v
Form Request (validasi)  -->  400 bila tidak valid
    v
Model Eloquent (Device, Reading)
    v
MySQL (devices 1 --- N readings)
```

### 10.2 Struktur folder

```
TT26_FS_MuhammadDzakyHamid/
+-- README.md
+-- postman/                     # koleksi Postman (.json)
+-- docs/screenshots/            # halaman utama & detail perangkat
+-- laravel/
    +-- app/
    |   +-- Http/Controllers/    # DeviceController, ReadingController
    |   +-- Http/Requests/       # form request (validasi)
    |   +-- Models/              # Device, Reading
    +-- bootstrap/app.php        # registrasi api.php & handler error JSON
    +-- database/
    |   +-- migrations/          # devices, readings
    |   +-- seeders/             # DeviceSeeder, DatabaseSeeder
    +-- public/                  # index.html, style.css, app.js
    +-- routes/                  # api.php, web.php
    +-- .env.example
```

> **Catatan:** Struktur ini mengikuti kerangka Laravel yang sudah ada di repository. Jika README ingin menyederhanakan, pastikan path di README sesuai dengan folder aktual.

## 11. Desain Database

Relasi **one-to-many**: satu perangkat (`devices`) memiliki banyak pembacaan (`readings`). Pada notasi Chen: entitas DEVICE dan READING dihubungkan relasi "memiliki" berkardinalitas 1 : N, dengan partisipasi total di sisi READING. Diagram Chen tersedia pada berkas `erd-chen-smartwarehouse.xml`.

### 11.1 Tabel devices

| Kolom | Tipe | Constraint | Keterangan |
| --- | --- | --- | --- |
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Identitas perangkat. |
| `kode` | VARCHAR(10) | UNIQUE, NOT NULL | Format `SNS-[A/B][2 digit]`. |
| `nama` | VARCHAR(50) | NOT NULL | Nama perangkat. |
| `gudang` | ENUM('A','B') | NOT NULL | Lokasi gudang. |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Status aktif perangkat. |
| `created_at`, `updated_at` | TIMESTAMP | NULL | Jejak waktu Laravel. |

### 11.2 Tabel readings

| Kolom | Tipe | Constraint | Keterangan |
| --- | --- | --- | --- |
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Identitas pembacaan. |
| `device_id` | BIGINT UNSIGNED | FK → `devices.id`, NOT NULL, ON DELETE CASCADE | Perangkat pengirim. |
| `suhu` | DECIMAL(5,2) | NOT NULL | Suhu dalam °C. |
| `kelembapan` | DECIMAL(5,2) | NOT NULL | Kelembapan dalam % (0–100). |
| `created_at`, `updated_at` | TIMESTAMP | NULL | `created_at` berfungsi sebagai waktu pembacaan. |

**Indeks:** komposit `(device_id, created_at)` untuk mempercepat query "N pembacaan terbaru per perangkat".

### 11.3 Cuplikan migration

```
// 2024_01_01_000001_create_devices_table.php
Schema::create('devices', function (Blueprint $table) {
    $table->id();
    $table->string('kode', 10)->unique();
    $table->string('nama', 50);
    $table->enum('gudang', ['A', 'B']);
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});

// 2024_01_01_000002_create_readings_table.php
Schema::create('readings', function (Blueprint $table) {
    $table->id();
    $table->foreignId('device_id')->constrained('devices')->onDelete('cascade');
    $table->decimal('suhu', 5, 2);
    $table->decimal('kelembapan', 5, 2);
    $table->timestamps();
    $table->index(['device_id', 'created_at']);
});
```

Migration `devices` harus berjalan sebelum `readings` (urutan nama berkas), karena `readings` memiliki foreign key ke `devices`. Kedua migration wajib memiliki `down()` yang menghapus tabelnya.

> **Catatan:** Tabel bawaan Laravel (`users`, `sessions`, `password_reset_tokens`, `cache`, `jobs`) tidak berelasi dengan domain ini dan tidak dimasukkan ke ERD.

## 12. Spesifikasi REST API

### 12.1 Konvensi umum

- **Base URL:** `http://127.0.0.1:8000/api`.
- **Format:** seluruh request dan respons berupa JSON. Frontend dan curl mengirim `Accept: application/json` dan `Content-Type: application/json`; server tetap membalas JSON walau header `Accept` tidak ada.
- **Waktu:** zona waktu aplikasi `Asia/Jakarta` (`APP_TIMEZONE`).
- **Autentikasi:** tidak ada pada tes ini (lihat asumsi A-04).

### 12.2 Daftar endpoint

| Method | Endpoint | Fungsi | Respons sukses |
| :---: | --- | --- | --- |
| GET | `/api/devices` | Daftar semua perangkat | 200 + array perangkat |
| POST | `/api/devices` | Tambah perangkat | 201 + perangkat baru |
| PUT | `/api/devices/:id` | Ubah perangkat | 200 + perangkat terbaru |
| DELETE | `/api/devices/:id` | Hapus perangkat | 204 (tanpa body) |
| POST | `/api/readings` | Simpan pembacaan sensor | 201 + data pembacaan |
| GET | `/api/devices/:id/readings?limit=10` | Pembacaan terbaru perangkat | 200 + array (terbaru di atas) |

### 12.3 Aturan validasi

| Endpoint | Field | Aturan |
| --- | --- | --- |
| `/api/devices` (POST, PUT) | `kode` | Wajib, unik, format `SNS-[A/B][2 digit]` (regex `^SNS-[AB][0-9]{2}$`), contoh `SNS-A01`. |
|  | `nama` | Wajib, maksimal 50 karakter. |
|  | `gudang` | Wajib, hanya `A` atau `B`. |
|  | `is_active` | Opsional, boolean; default `true` (asumsi A-01). |
| `/api/readings` (POST) | `device_id` | Wajib, bilangan bulat, harus merujuk perangkat yang ada (jika tidak ada → 404). |
|  | `suhu` | Wajib, angka (muat pada DECIMAL(5,2): -999,99 s/d 999,99). |
|  | `kelembapan` | Wajib, angka, rentang 0–100. |
| `/api/devices/:id/readings` (GET) | `limit` | Opsional, bilangan bulat 1–100, default 10 (asumsi A-03). |

### 12.4 Format error dan kode status

```
{ "message": "Pesan kesalahan" }

// khusus 400, ditambah rincian per field (asumsi A-02):
{
  "message": "Data tidak valid.",
  "errors": { "kode": ["Format kode harus SNS-[A/B][2 digit], contoh SNS-A01."] }
}
```

| Status | Kondisi | Pesan contoh |
| :---: | --- | --- |
| 400 | Data tidak valid (bukan 422 bawaan Laravel) | Data tidak valid. |
| 404 | Perangkat tidak ditemukan | Perangkat tidak ditemukan |
| 409 | Kode perangkat duplikat | Kode perangkat sudah digunakan |

### 12.5 Urutan pemeriksaan

| Endpoint | Urutan |
| --- | --- |
| **POST `/api/devices`** | 1) Validasi format → 400. 2) Cek kode duplikat → 409. 3) Simpan → 201. |
| **PUT `/api/devices/:id`** | 1) Perangkat ada? bila tidak → 404. 2) Validasi format → 400. 3) Kode bentrok dengan perangkat **lain** → 409 (kode milik sendiri boleh). 4) Simpan → 200. |
| **DELETE `/api/devices/:id`** | 1) Perangkat ada? bila tidak → 404. 2) Hapus (pembacaan ikut terhapus) → 204. |
| **POST `/api/readings`** | 1) Validasi `device_id`, `suhu`, `kelembapan` → 400. 2) Perangkat ada? bila tidak → 404. 3) Simpan → 201. |
| **GET `/api/devices/:id/readings`** | 1) Perangkat ada? bila tidak → 404. 2) Validasi `limit` → 400. 3) Urutkan `created_at` DESC (tie-break `id` DESC), ambil `limit` → 200. |

> **Perhatian:** Karena `kode` unik di database, tangkap juga `UniqueConstraintViolationException` untuk kasus dua request bersamaan, lalu kembalikan 409 yang sama.

### 12.6 Contoh request dan respons

#### POST /api/devices → 201

```
curl -X POST http://127.0.0.1:8000/api/devices \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"kode":"SNS-A01","nama":"Sensor Freezer Utama","gudang":"A"}'

{ "id": 1, "kode": "SNS-A01", "nama": "Sensor Freezer Utama", "gudang": "A", "is_active": true }
```

#### POST /api/devices → 400 dan 409

```
# 400 - data tidak valid
curl -X POST http://127.0.0.1:8000/api/devices -H "Content-Type: application/json" \
  -H "Accept: application/json" -d '{"kode":"ABC","nama":"","gudang":"C"}'

# 409 - kode duplikat
curl -X POST http://127.0.0.1:8000/api/devices -H "Content-Type: application/json" \
  -H "Accept: application/json" -d '{"kode":"SNS-A01","nama":"Duplikat","gudang":"A"}'
{ "message": "Kode perangkat sudah digunakan" }
```

#### PUT dan DELETE

```
curl -X PUT http://127.0.0.1:8000/api/devices/1 -H "Content-Type: application/json" \
  -H "Accept: application/json" -d '{"kode":"SNS-A01","nama":"Sensor Freezer 1","gudang":"A"}'
# 200 + perangkat terbaru

curl -X DELETE http://127.0.0.1:8000/api/devices/1 -H "Accept: application/json"
# 204 No Content
```

#### POST /api/readings → 201

```
curl -X POST http://127.0.0.1:8000/api/readings -H "Content-Type: application/json" \
  -H "Accept: application/json" -d '{"device_id":1,"suhu":4.5,"kelembapan":70}'

{ "id": 31, "device_id": 1, "suhu": 4.5, "kelembapan": 70, "created_at": "2026-10-31T09:15:00+07:00" }
```

#### GET /api/devices/:id/readings?limit=10 → 200

```
curl "http://127.0.0.1:8000/api/devices/1/readings?limit=10"

[
  { "id": 10, "device_id": 1, "suhu": -18.5, "kelembapan": 62.3, "created_at": "2026-10-31T09:10:00+07:00" },
  { "id": 9,  "device_id": 1, "suhu": -19.1, "kelembapan": 60.8, "created_at": "2026-10-31T09:05:00+07:00" }
  // ... total 10 item, terbaru di atas
]
```

Nilai `suhu` dan `kelembapan` dikembalikan sebagai **angka** (bukan string) agar mudah dipakai JavaScript.

## 13. Spesifikasi Antarmuka (Frontend)

Satu halaman admin di `public/index.html` (dengan `style.css` dan `app.js`), disajikan oleh Laravel pada route `/`. Seluruh data berasal dari API; tidak ada data statis.

### 13.1 Tata letak

```
+---------------------------------------------------------------+
|  SmartWarehouse - Admin Perangkat Sensor      [+ Tambah]      |
+---------------------------------------------------------------+
|  Daftar Perangkat                                             |
|  Kode     | Nama                   | Gudang | Status | Aksi    |
|  SNS-A01  | Sensor Freezer Utama   |   A    | Aktif  | D U H   |
|  SNS-A02  | Sensor Freezer Cadang. |   A    | Aktif  | D U H   |
|  SNS-B01  | Sensor Chiller Segar   |   B    | Aktif  | D U H   |
+---------------------------------------------------------------+
|  Detail: SNS-A01 - 10 pembacaan terakhir                      |
|  Waktu            | Suhu (C) | Kelembapan (%)                 |
|  31/10 09:10      |  -18,5   |  62,3        (terbaru di atas) |
+---------------------------------------------------------------+
   D = Detail, U = Ubah, H = Hapus
```

### 13.2 Komponen dan perilaku

| Komponen | Perilaku |
| --- | --- |
| **Tabel daftar perangkat** | Kolom: kode, nama, gudang, status aktif, aksi (Detail / Ubah / Hapus). Dimuat dari `GET /api/devices`. Tampilan kosong bila belum ada data. |
| **Form tambah/ubah** | Field: kode, nama, gudang (pilihan A/B), status aktif. Mode ubah terisi data perangkat. Saat Simpan: `POST` (tambah) atau `PUT` (ubah). Pesan error 400/409 tampil di bawah field terkait atau di atas form. |
| **Tombol hapus** | Menampilkan konfirmasi ("Hapus perangkat SNS-A01 beserta seluruh pembacaannya?"). Hanya bila disetujui, memanggil `DELETE`; setelah sukses tabel diperbarui. |
| **Panel detail pembacaan** | Memanggil `GET /api/devices/:id/readings?limit=10`; menampilkan waktu, suhu (°C), kelembapan (%) dengan urutan terbaru di atas. Menampilkan status loading, kosong ("Belum ada pembacaan"), dan error. |
| **Pembaruan otomatis** | Setelah tambah, ubah, atau hapus berhasil, tabel dimuat ulang dari API tanpa reload halaman. Jika perangkat yang dihapus sedang dibuka di panel detail, panel ditutup. |

### 13.3 Ketentuan teknis JavaScript

- Satu fungsi `request(path, { method, body })` mengirim header JSON, mengurai respons, menangani `204` tanpa body, dan melempar objek error berisi `status`, `message`, dan `errors`.
- Render memakai `textContent`/`createElement`, bukan `innerHTML` dari data pengguna (cegah XSS).
- Tombol dinonaktifkan selama request berjalan untuk mencegah klik ganda.
- Format waktu pembacaan memakai zona waktu lokal (WIB) dan format Indonesia.

## 14. Data Contoh (Seeder)

`php artisan migrate --seed` menjalankan `DatabaseSeeder` yang memanggil `DeviceSeeder`. Nilai pembacaan mengikuti rentang aman masing-masing gudang.

| Kode | Nama | Gudang | Rentang suhu | Pembacaan |
| --- | --- | --- | --- | :---: |
| `SNS-A01` | Sensor Freezer Utama | A (beku) | -25 s/d -15°C | 10 |
| `SNS-A02` | Sensor Freezer Cadangan | A (beku) | -25 s/d -15°C | 10 |
| `SNS-B01` | Sensor Chiller Produk Segar | B (segar) | 0 s/d 8°C | 10 |

- Kelembapan seluruh data berada pada 40–80%.
- Setiap perangkat memiliki 10 pembacaan berjarak 5 menit (`created_at` mundur dari waktu seeding), sesuai interval sensor.
- Seeder dapat diulang dengan `php artisan migrate:fresh --seed` tanpa error.
- Verifikasi: 3 baris di `devices` dan 30 baris di `readings`.

## 15. Kriteria Penerimaan

Daftar ini menurunkan checklist mandiri pada soal (§7) menjadi skenario uji yang konkret.

| ID | Skenario uji | Hasil yang diharapkan |
| :---: | --- | --- |
| AC-01 | `GET /api/devices` setelah seeding | 200, array 3 perangkat. |
| AC-02 | `POST /api/devices` dengan data valid | 201 + perangkat baru; muncul di tabel frontend. |
| AC-03 | `POST /api/devices` dengan `kode` "ABC", `nama` kosong, `gudang` "C" | 400, pesan error per field. |
| AC-04 | `POST /api/devices` dengan `kode` yang sudah ada | 409, "Kode perangkat sudah digunakan". |
| AC-05 | `POST /api/devices` dengan `nama` 51 karakter | 400. |
| AC-06 | `PUT /api/devices/:id` valid; id tidak ada; kode milik perangkat lain | 200; 404; 409. |
| AC-07 | `DELETE /api/devices/:id` valid; id tidak ada | 204 dan pembacaan ikut terhapus; 404. |
| AC-08 | `POST /api/readings` valid | 201 + data pembacaan. |
| AC-09 | `POST /api/readings` dengan `kelembapan` 101, `suhu` "abc", atau `device_id` 999 | 400; 400; 404. |
| AC-10 | `GET /api/devices/:id/readings?limit=10` | 200, 10 item, urut dari yang terbaru. |
| AC-11 | Frontend: tambah, ubah, hapus | Tabel langsung ter-update tanpa reload manual; data berasal dari API. |
| AC-12 | Frontend: tombol hapus | Konfirmasi muncul; batal = tidak ada perubahan. |
| AC-13 | Clone baru, ikuti README | Aplikasi berjalan tanpa langkah tambahan; `migrate:fresh --seed` bersih. |
| AC-14 | Repository publik | Nama folder/repo `TT26_FS_MuhammadDzakyHamid`; ada Postman/curl dan screenshot di README. |

## 16. Rencana Pengerjaan dan Panduan Presentasi

### 16.1 Tahapan kerja

| Tahap | Pekerjaan | Estimasi | Keluaran |
| :---: | --- | :---: | --- |
| 0 | Baca soal; ajukan pertanyaan di grup WhatsApp **maksimal 1 × 24 jam** setelah soal diterima; catat asumsi | 0,25 jam | Daftar asumsi |
| 1 | Setup proyek Laravel, `.env`, database MySQL | 0,5 jam | Aplikasi berjalan lokal |
| 2 | Migration, model, seeder | 0,75 jam | Skema dan data contoh |
| 3 | REST API 6 endpoint, validasi, handler error | 1,5 jam | API lulus AC-01 s/d AC-10 |
| 4 | Frontend (daftar, form, hapus, detail) | 1,25 jam | UI lulus AC-11, AC-12 |
| 5 | README, koleksi Postman, screenshot | 0,5 jam | Dokumentasi |
| 6 | QA penuh (AC-01 s/d AC-14), siapkan presentasi | 0,5 jam | Siap dikumpulkan |

Total ≈ 5 jam kerja, berada dalam estimasi soal (4–6 jam). Batas pengumpulan: ____ Oktober 2026 pukul 23.59 WIB (isi sesuai soal yang diterima). Disarankan commit kecil per tahap dengan pesan yang jelas.

### 16.2 Panduan presentasi (10 menit + 5 menit tanya jawab)

| Menit | Isi |
| :---: | --- |
| 0–1 | Konteks: SmartWarehouse, dua gudang, kebutuhan Admin IT. |
| 1–3 | Desain database: relasi 1 : N, tipe data, indeks komposit, cascade. |
| 3–6 | API: 6 endpoint, urutan validasi, alasan 400/404/409, format error. |
| 6–8 | Demo frontend: tambah, ubah, hapus dengan konfirmasi, detail 10 pembacaan. |
| 8–10 | Keputusan teknis, kendala, dan rencana pengembangan (autentikasi, pagination, test). |

**Pertanyaan yang perlu disiapkan jawabannya:**

- Mengapa kode duplikat memakai 409, bukan 400 atau 422?
- Mengapa indeks komposit `(device_id, created_at)` dan apa dampaknya pada query pembacaan terbaru?
- Apa fungsi `ON DELETE CASCADE` dan risikonya?
- Bagaimana menangani dua request yang membuat kode sama bersamaan?
- Mengapa validasi hanya di backend? Apa yang ditambahkan jika datanya jutaan baris?
- Bagaimana aplikasi diamankan dari XSS dan mass assignment?

> **Perhatian:** Soal mengizinkan referensi internet dan alat bantu AI, tetapi peserta wajib memahami dan mampu menjelaskan setiap bagian pekerjaan saat presentasi.

## 17. Asumsi, Risiko, dan Pertanyaan Terbuka

### 17.1 Asumsi

Soal meminta asumsi ditulis bila ada yang tidak dijelaskan. Asumsi berikut juga dicantumkan di README.

| ID | Asumsi |
| :---: | --- |
| A-01 | `is_active` opsional pada POST/PUT (boolean), default `true`; ditampilkan sebagai kolom "status aktif". |
| A-02 | Respons 400 memuat `message` dan tambahan `errors` per field agar frontend dapat menampilkan pesan tepat di field terkait. Format `{"message": "..."}` tetap terpenuhi. |
| A-03 | `limit` pada pembacaan: default 10, rentang 1–100, nilai tidak valid → 400. |
| A-04 | Tidak ada autentikasi; aplikasi berjalan di lingkungan lokal dan diakses Admin IT. Endpoint penerima sensor juga tanpa token (di luar lingkup tes). |
| A-05 | Waktu pembacaan adalah `created_at` yang diisi server, bukan dikirim klien. |
| A-06 | Penghapusan perangkat bersifat permanen (hard delete) beserta pembacaannya. |
| A-07 | Semua waktu memakai zona `Asia/Jakarta`. |

### 17.2 Risiko dan mitigasi

| ID | Risiko | Mitigasi |
| :---: | --- | --- |
| R-01 | Validasi bawaan Laravel menghasilkan 422, sedangkan soal menuntut 400. | Override lewat `failedValidation` pada Form Request atau handler di `bootstrap/app.php`; uji AC-03/05/09. |
| R-02 | Validasi `unique` bawaan menghasilkan 400, bukan 409. | Cek duplikat manual setelah validasi format; tangkap `UniqueConstraintViolationException`. |
| R-03 | Request tanpa header `Accept` dibalas halaman HTML Laravel. | Paksa render JSON untuk `api/*` (`shouldRenderJsonWhen`). |
| R-04 | Ekstensi `pdo_mysql` atau MySQL belum aktif di lingkungan penguji. | Cantumkan prasyarat dan langkah `CREATE DATABASE` di README. |
| R-05 | Terlalu sibuk menambah fitur sehingga inti tidak rapi. | Selesaikan semua AC wajib dulu; nilai tambah hanya sesudahnya. |
| R-06 | Kode dari alat bantu AI tidak dipahami saat presentasi. | Baca dan uji tiap bagian; siapkan jawaban pertanyaan pada §16.2. |
| R-07 | Terlambat mengumpulkan (memengaruhi aspek ketepatan waktu, bobot 10%). | Targetkan selesai lebih awal dari batas 23.59 WIB; periksa link repo publik. |

### 17.3 Pertanyaan terbuka untuk panitia (via grup WhatsApp)

- Apakah `is_active` perlu dapat diubah lewat form, atau cukup tampil saja?
- Apakah pesan error 400 boleh memuat rincian per field selain `message`?
- Apakah endpoint pembacaan perlu pembatasan akses tertentu?

## 18. Hasil yang Dikumpulkan

| No | Hasil | Ketentuan |
| :---: | --- | --- |
| 1 | Repository GitHub publik | Nama `TT26_FS_MuhammadDzakyHamid` (format `TT26_[KodePosisi]_[NamaLengkap]`). |
| 2 | Koleksi Postman (`.json`) atau daftar perintah curl | Mencakup 6 endpoint dan contoh error. |
| 3 | Screenshot halaman utama dan detail perangkat | Ditaruh di README. |
| 4 | README | Teknologi, instalasi & menjalankan, daftar endpoint, contoh request. |
| 5 | Migration dan seeder | Di dalam repository. |

Kirim link repository (atau folder Google Drive dengan akses "Siapa saja yang memiliki link") melalui grup WhatsApp atau email panitia **sebelum batas waktu**. Jadwal presentasi daring diinformasikan oleh panitia.

## 19. Starter Prompt

Starter prompt berikut dipakai untuk mengerjakan proyek bersama asisten AI atau agen coding (misalnya Claude, atau Claude Code di folder repository). Tempel **Prompt 0** lebih dulu sebagai konteks, lalu lanjutkan tahap demi tahap. Setelah tiap tahap, jalankan hasilnya sendiri dan pastikan Anda memahaminya.

> **Catatan:** Tips: sertakan isi PRD ini (atau bagian yang relevan) saat menempel prompt, ganti nilai yang berbeda pada lingkungan Anda (kredensial MySQL, path), dan jangan pernah menempel password atau API key asli ke dalam prompt.

### Prompt 0 — Konteks utama

```
Kamu adalah asisten pair-programming senior untuk saya, Muhammad Dzaky Hamid
(calon Junior Fullstack Engineer magang TaggIoT 2026). Kita mengerjakan tes teknis
TT26-05-FS: aplikasi admin "SmartWarehouse" untuk mengelola perangkat sensor suhu &
kelembapan (ESP32 + DHT22) milik klien fiktif PT Dingin Segar Logistik
(Gudang A = produk beku, Gudang B = produk segar).

TECH STACK (wajib, jangan diganti):
- Backend: Laravel (PHP) sebagai REST API dengan prefix /api
- Database: MySQL; skema lewat Laravel Migration; data awal lewat Laravel Seeder
- Frontend: HTML + CSS + JavaScript murni (tanpa framework), data diambil dengan
  Fetch API dari API yang sama

ATURAN KERJA:
1. PRD (saya tempel di bawah) adalah satu-satunya sumber kebenaran. Jika ada yang
   ambigu, tanyakan atau tulis asumsimu secara eksplisit.
2. Kerjakan bertahap, satu tahap per giliran. Jelaskan alasan tiap keputusan
   dalam bahasa Indonesia singkat agar saya bisa mempresentasikannya.
3. Kode rapi: pisahkan route / controller / form request / model. Tidak ada
   kredensial di repository (gunakan .env).
4. Setelah tiap tahap, beri perintah verifikasi (curl/artisan) dan hasil yang
   diharapkan.
5. Jangan menambah fitur di luar PRD kecuali saya minta.

[TEMPEL PRD ATAU BAGIAN YANG RELEVAN DI SINI]
```

### Prompt 1 — Setup proyek

```
Tahap 1 - Setup proyek.
Buat langkah dan perintah untuk:
(a) memastikan PHP >= 8.2, Composer, dan MySQL >= 8.0 tersedia;
(b) menyiapkan proyek Laravel di folder repository TT26_FS_MuhammadDzakyHamid;
(c) mengisi .env.example dan .env untuk MySQL (DB_CONNECTION=mysql,
    DB_DATABASE=smartwarehouse, APP_TIMEZONE=Asia/Jakarta; tanpa password asli
    di repo);
(d) membuat database: CREATE DATABASE smartwarehouse CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
(e) memastikan routes/api.php terdaftar di bootstrap/app.php (prefix /api)
    tanpa memasang Sanctum.
Akhiri dengan perintah memeriksa koneksi (php artisan migrate:status) dan
menjalankan php artisan serve.
```

### Prompt 2 — Database dan seeder (Tugas 1 & 4)

```
Tahap 2 - Database (Tugas 1) dan Seeder (Tugas 4).
Buat migration, model Eloquent, dan seeder sesuai PRD bagian 11 dan 14:
- devices: id, kode VARCHAR(10) UNIQUE, nama VARCHAR(50), gudang ENUM('A','B'),
  is_active BOOLEAN DEFAULT TRUE, timestamps.
- readings: id, device_id FK -> devices.id ON DELETE CASCADE, suhu DECIMAL(5,2),
  kelembapan DECIMAL(5,2), timestamps, indeks komposit (device_id, created_at).
- Model Device (hasMany readings) dan Reading (belongsTo device) dengan $fillable
  dan $casts yang tepat.
- DeviceSeeder: 3 perangkat (SNS-A01 dan SNS-A02 gudang A; SNS-B01 gudang B),
  masing-masing 10 pembacaan berjarak 5 menit. Suhu gudang A -25 s/d -15, gudang B
  0 s/d 8, kelembapan 40-80. Panggil dari DatabaseSeeder.
Jelaskan mengapa memakai indeks komposit dan ON DELETE CASCADE, lalu beri perintah
php artisan migrate:fresh --seed serta query SQL untuk memverifikasi (3 perangkat,
30 pembacaan).
```

### Prompt 3 — REST API (Tugas 2)

```
Tahap 3 - REST API (Tugas 2).
Implementasikan 6 endpoint pada PRD bagian 12: GET/POST /api/devices,
PUT/DELETE /api/devices/{id}, POST /api/readings, GET /api/devices/{id}/readings?limit=10.
Persyaratan:
- Gunakan Form Request. kode: wajib, regex ^SNS-[AB][0-9]{2}$. nama: wajib, maks 50.
  gudang: wajib, hanya A atau B. suhu & kelembapan: wajib numerik; kelembapan 0-100.
- Semua error JSON {"message": "..."} (boleh ditambah "errors" per field):
  400 data tidak valid (BUKAN 422 bawaan Laravel), 404 perangkat tidak ditemukan,
  409 kode duplikat dengan pesan "Kode perangkat sudah digunakan".
- Urutan POST/PUT device: validasi format -> 400, cek duplikat (abaikan dirinya
  sendiri saat PUT) -> 409, simpan -> 201/200. Tangani juga race condition lewat
  UniqueConstraintViolationException.
- POST /api/readings: device_id tidak ada -> 404. Pembacaan terbaru urut created_at
  DESC (tie-break id DESC); limit default 10 (1-100).
- DELETE sukses -> 204 tanpa body. Semua respons JSON walau header Accept tidak dikirim.
- suhu dan kelembapan dikembalikan sebagai angka.
Berikan kode lengkap dan 10 perintah curl untuk menguji tiap skenario status.
```

### Prompt 4 — Frontend (Tugas 3)

```
Tahap 4 - Frontend (Tugas 3).
Buat public/index.html, public/style.css, public/app.js (HTML + CSS + JavaScript
murni, Fetch API ke /api). Route "/" pada Laravel menyajikan index.html.
Fitur:
- tabel daftar perangkat (kode, nama, gudang, status aktif, aksi Detail/Ubah/Hapus);
- form tambah/ubah dengan error per field dari respons 400/409;
- tombol hapus dengan konfirmasi sebelum memanggil DELETE;
- panel detail 10 pembacaan terakhir (waktu, suhu C, kelembapan %), terbaru di atas;
- state loading, kosong, dan error;
- tabel otomatis diperbarui setelah tambah/ubah/hapus tanpa reload halaman.
Aturan: tidak ada data statis; render dengan textContent (cegah XSS); satu fungsi
request() yang mengirim header Accept & Content-Type JSON dan menangani 204;
tata letak responsif dan rapi.
Jelaskan alur kode secara ringkas agar bisa saya presentasikan.
```

### Prompt 5 — Dokumentasi (Tugas 5)

```
Tahap 5 - Dokumentasi (Tugas 5).
Susun README.md berbahasa Indonesia berisi: latar belakang singkat, tech stack,
struktur proyek, prasyarat, langkah instalasi & menjalankan (composer install,
cp .env.example .env, key:generate, buat database, migrate --seed, serve), desain
database, tabel 6 endpoint, aturan validasi & format error, contoh curl untuk setiap
endpoint (sukses dan error), keputusan teknis, asumsi, dan placeholder screenshot
halaman utama & detail perangkat. Buat juga koleksi Postman (.json, v2.1) berisi
seluruh request beserta contoh respons. Pastikan README dapat diikuti dari clone baru
tanpa langkah tambahan.
```

### Prompt 6 — Review dan QA

```
Tahap 6 - Review & QA.
Periksa seluruh kode terhadap Kriteria Penerimaan PRD bagian 15 (AC-01 s/d AC-14).
Untuk tiap kriteria, jalankan atau tuliskan perintah uji, lalu laporkan LULUS/GAGAL
beserta perbaikannya. Cek khusus: kode status (200/201/204/400/404/409), format error
JSON, urutan pembacaan, cascade delete, XSS pada frontend, tidak ada kredensial di
repository, dan migrate:fresh --seed berjalan bersih. Terakhir buat 8 pertanyaan yang
mungkin diajukan penguji saat presentasi beserta jawaban singkatnya.
```

### Prompt 7 — Nilai tambah (opsional)

```
Tahap 7 (Opsional) - Nilai tambah. Hanya jika semua tugas utama sudah lulus QA:
(a) docker-compose.yml untuk app + MySQL;
(b) pagination & pencarian perangkat (?page, ?q) di API dan UI;
(c) feature test PHPUnit untuk 6 endpoint (target coverage modul >= 60%).
Kerjakan satu per satu dan jangan mengubah kontrak API yang sudah ada.
```

## Lampiran A. Keterkaitan dengan Job Description

Dokumen JD-MAG26-05-FS menempatkan Muhammad Dzaky Hamid sebagai Junior Fullstack Engineer di tim Engineering — Product, PT Teknologi Tata Data (TaggIoT), Semarang. Proyek ini menjadi bukti awal kompetensi berikut:

| Tanggung jawab (JD) | Wujud pada proyek ini |
| --- | --- |
| 4.1 Backend & API: endpoint REST, validasi input, kode status HTTP tepat | Enam endpoint, validasi Form Request, status 200/201/204/400/404/409 (§12). |
| 4.2 Database: skema, migrasi, seeder, query efisien, indeks | Migration `devices` dan `readings`, seeder, indeks komposit (§11, §14). |
| 4.3 Frontend: halaman admin, form, tabel, pesan error | Halaman admin dengan form, tabel, dan error per field (§13). |
| 4.4 Integrasi data IoT | Endpoint `POST /api/readings` sebagai penerima data sensor (HTTP). |
| 4.5 Pengujian & kualitas kode; praktik keamanan dasar | Skenario uji AC-01 s/d AC-14; validasi input; tanpa rahasia di repository (§15, §8). |
| 4.6 Dokumentasi: API (Postman/Swagger) dan cara menjalankan proyek | README dan koleksi Postman (§18). |

| KPI magang (JD) | Target | Keterkaitan |
| --- | --- | --- |
| Tugas selesai sesuai estimasi | ≥ 80% | Rencana tahapan dan estimasi waktu (§16). |
| Coverage test pada modul baru | ≥ 60% | Test otomatis bersifat opsional (FO-03); jika dikerjakan, targetkan ≥ 60%. |
| Bug kritis dari kode sendiri saat rilis | 0 | QA penuh sebelum pengumpulan (AC-01 s/d AC-14). |
| Dokumentasi API diperbarui | Setiap ada endpoint baru/berubah | README dan Postman diperbarui bersama kode. |

## Lampiran B. Aspek Penilaian dan Pemenuhannya

Setiap aspek dinilai skala 1–5 lalu dikalikan bobot; nilai akhir maksimal 100.

| No | Aspek | Bobot | Pemenuhan dalam PRD |
| :---: | --- | :---: | --- |
| 1 | API CRUD perangkat | 20% | §12.2–12.6; AC-01 s/d AC-07. |
| 2 | Endpoint pembacaan & validasi | 15% | §12.3–12.5; AC-08 s/d AC-10. |
| 3 | Frontend terintegrasi API | 15% | §13; AC-11, AC-12. |
| 4 | Desain database | 10% | §11, §14. |
| 5 | Struktur kode & README | 15% | §10, §18; AC-13. |
| 6 | Presentasi & pemahaman hasil | 15% | §16.2, §19 (Prompt 6). |
| 7 | Kelengkapan & ketepatan waktu | 10% | §16.1, §18; AC-14. |
|  | **TOTAL** | **100%** |  |