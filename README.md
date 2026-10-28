# SmartWarehouse — Aplikasi Admin Pengelolaan Perangkat Sensor

Tes Teknis Magang TaggIoT 2026 · Posisi **Junior Fullstack Engineer** · Kode Tes **TT26-05-FS**

Aplikasi web fullstack untuk proyek pilot **SmartWarehouse** milik klien fiktif PT Dingin Segar Logistik (cold storage, Semarang). Admin IT dapat menambah, mengubah, dan menghapus perangkat sensor suhu & kelembapan (ESP32 + DHT22), serta melihat 10 pembacaan terakhir tiap perangkat.

| | |
| --- | --- |
| **Peserta** | Muhammad Dzaky Hamid |
| **GitHub** | [@ovaltinegif](https://github.com/ovaltinegif) |
| **Repository** | `TT26_FS_MuhammadDzakyHamid` |

---

## Daftar Isi

1. [Latar Belakang](#latar-belakang)
2. [Tech Stack](#tech-stack)
3. [Fitur](#fitur)
4. [Struktur Proyek](#struktur-proyek)
5. [Panduan Menjalankan Proyek](#panduan-menjalankan-proyek)
6. [Desain Database](#desain-database)
7. [Dokumentasi API](#dokumentasi-api)
8. [Aturan Validasi](#aturan-validasi)
9. [Contoh Request](#contoh-request)
10. [Seeder](#seeder)
11. [Keputusan Teknis](#keputusan-teknis)

---

## Latar Belakang

Klien memiliki dua gudang dengan batas kondisi aman berikut:

| Gudang | Jenis Produk | Batas Suhu Aman | Batas Kelembapan Aman |
| --- | --- | --- | --- |
| **A** | Produk beku | -25°C s/d -15°C | 40% – 80% |
| **B** | Produk segar | 0°C s/d 8°C | 40% – 80% |

- Batas bersifat inklusif (suhu 8,0°C di Gudang B masih aman).
- Sensor mengirim data setiap 5 menit dan dianggap *offline* bila tidak mengirim data lebih dari 15 menit.

Use case yang dicakup: **UC-FS-01 — Mengelola Perangkat Sensor dan Melihat Pembacaan** (aktor: Admin IT).

---

## Tech Stack

| Lapisan | Teknologi |
| --- | --- |
| Backend / REST API | Laravel (PHP) |
| Database | MySQL |
| Frontend | HTML, CSS, JavaScript (Fetch API) |
| Migrasi & Seeder | Laravel Migration & Seeder |

---

## Fitur

- CRUD perangkat sensor (tambah, ubah, hapus dengan konfirmasi).
- Tabel daftar perangkat: kode, nama, gudang, status aktif.
- Panel detail berisi 10 pembacaan suhu & kelembapan terbaru (terbaru di atas).
- Endpoint penerimaan pembacaan sensor.
- Validasi lengkap dengan pesan error per field dan format error JSON yang konsisten.
- Seeder berisi 3 perangkat dan 10 pembacaan per perangkat.

---

## Struktur Proyek

> Sesuaikan bagian ini dengan struktur folder aktual di repository.

```
TT26_FS_MuhammadDzakyHamid/
├── app/
│   ├── Http/
│   │   ├── Controllers/       # DeviceController, ReadingController
│   │   └── Requests/          # Form Request (validasi)
│   └── Models/                # Device, Reading
├── database/
│   ├── migrations/            # Skema devices & readings
│   └── seeders/               # Data awal
├── public/                    # Frontend (index.html, css, js)
├── routes/
│   └── api.php                # Definisi endpoint /api/*
├── .env.example
└── README.md
```

---

## Panduan Menjalankan Proyek

### Prasyarat

- PHP >= 8.1 dan Composer
- MySQL >= 8.0 (atau MariaDB)
- Git

### Langkah

```bash
# 1. Clone repository
git clone git@github.com:ovaltinegif/TT26_FS_MuhammadDzakyHamid.git
cd TT26_FS_MuhammadDzakyHamid

# 2. Pasang dependensi
composer install

# 3. Salin konfigurasi environment
cp .env.example .env
php artisan key:generate
```

### Konfigurasi database

Buat database kosong, mis. `smartwarehouse`:

```sql
CREATE DATABASE smartwarehouse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Lalu sesuaikan `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=smartwarehouse
DB_USERNAME=root
DB_PASSWORD=
```

### Migrasi, seeder, dan jalankan server

```bash
php artisan migrate --seed
php artisan serve
```

Aplikasi dapat dibuka di **http://127.0.0.1:8000**. Base URL API: `http://127.0.0.1:8000/api`.

Untuk mengulang dari awal:

```bash
php artisan migrate:fresh --seed
```

---

## Desain Database

Relasi **one-to-many**: satu `devices` memiliki banyak `readings`.

```
devices 1 ───────< N readings
```

### Tabel `devices`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | BIGINT UNSIGNED, PK, AI | Primary key |
| `kode` | VARCHAR(10), UNIQUE, NOT NULL | Format `SNS-[A/B][2 digit]` |
| `nama` | VARCHAR(50), NOT NULL | Nama perangkat |
| `gudang` | ENUM('A','B'), NOT NULL | Lokasi gudang |
| `is_active` | BOOLEAN, DEFAULT TRUE | Status aktif |
| `created_at`, `updated_at` | TIMESTAMP | Jejak waktu |

### Tabel `readings`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | BIGINT UNSIGNED, PK, AI | Primary key |
| `device_id` | BIGINT UNSIGNED, FK → `devices.id`, ON DELETE CASCADE | Perangkat pengirim |
| `suhu` | DECIMAL(5,2), NOT NULL | Suhu dalam °C |
| `kelembapan` | DECIMAL(5,2), NOT NULL | Kelembapan dalam % (0–100) |
| `created_at`, `updated_at` | TIMESTAMP | `created_at` menjadi waktu pembacaan |

Indeks komposit `(device_id, created_at)` mempercepat query "N pembacaan terbaru per perangkat".

### Skrip SQL setara

```sql
CREATE TABLE devices (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kode VARCHAR(10) NOT NULL UNIQUE,
  nama VARCHAR(50) NOT NULL,
  gudang ENUM('A','B') NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

CREATE TABLE readings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  device_id BIGINT UNSIGNED NOT NULL,
  suhu DECIMAL(5,2) NOT NULL,
  kelembapan DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_readings_device
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_readings_device_time (device_id, created_at)
);
```

---

## Dokumentasi API

Semua respons berformat JSON. Base URL: `/api`.

| Method | Endpoint | Fungsi | Respons Sukses |
| --- | --- | --- | --- |
| `GET` | `/api/devices` | Daftar semua perangkat | `200` + array perangkat |
| `POST` | `/api/devices` | Tambah perangkat | `201` + perangkat baru |
| `PUT` | `/api/devices/:id` | Ubah perangkat | `200` + perangkat terbaru |
| `DELETE` | `/api/devices/:id` | Hapus perangkat | `204` (tanpa body) |
| `POST` | `/api/readings` | Simpan pembacaan sensor | `201` + data pembacaan |
| `GET` | `/api/devices/:id/readings?limit=10` | Pembacaan terbaru perangkat | `200` + array (terbaru di atas) |

### Format error

```json
{ "message": "Pesan kesalahan" }
```

| Status | Kondisi |
| --- | --- |
| `400` | Data tidak valid |
| `404` | Perangkat tidak ditemukan |
| `409` | Kode perangkat duplikat — `"Kode perangkat sudah digunakan"` |

---

## Aturan Validasi

**Perangkat (`/api/devices`)**

| Field | Aturan |
| --- | --- |
| `kode` | Wajib, unik, format `SNS-[A/B][2 digit]` (contoh `SNS-A01`) |
| `nama` | Wajib, maksimal 50 karakter |
| `gudang` | Wajib, hanya `A` atau `B` |

**Pembacaan (`/api/readings`)**

| Field | Aturan |
| --- | --- |
| `device_id` | Wajib, harus merujuk perangkat yang ada (selain itu `404`) |
| `suhu` | Wajib, berupa angka |
| `kelembapan` | Wajib, berupa angka, rentang `0–100` |

---

## Contoh Request

### Daftar perangkat

```bash
curl http://127.0.0.1:8000/api/devices
```

### Tambah perangkat

```bash
curl -X POST http://127.0.0.1:8000/api/devices \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"kode":"SNS-A01","nama":"Sensor Freezer Utama","gudang":"A"}'
```

Respons `201`:

```json
{
  "id": 1,
  "kode": "SNS-A01",
  "nama": "Sensor Freezer Utama",
  "gudang": "A",
  "is_active": true
}
```

### Ubah perangkat

```bash
curl -X PUT http://127.0.0.1:8000/api/devices/1 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"kode":"SNS-A01","nama":"Sensor Freezer 1","gudang":"A"}'
```

### Hapus perangkat

```bash
curl -X DELETE http://127.0.0.1:8000/api/devices/1 -H "Accept: application/json"
# 204 No Content
```

### Simpan pembacaan

```bash
curl -X POST http://127.0.0.1:8000/api/readings \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"device_id":1,"suhu":-18.5,"kelembapan":62.3}'
```

### Ambil 10 pembacaan terakhir

```bash
curl "http://127.0.0.1:8000/api/devices/1/readings?limit=10"
```

### Contoh error

```bash
curl -X POST http://127.0.0.1:8000/api/devices \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"kode":"ABC","nama":"","gudang":"C"}'
# 400 {"message":"..."}

curl -X POST http://127.0.0.1:8000/api/devices \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"kode":"SNS-A01","nama":"Duplikat","gudang":"A"}'
# 409 {"message":"Kode perangkat sudah digunakan"}
```

---

## Seeder

`php artisan migrate --seed` mengisi data awal:

| Kode | Gudang | Pembacaan |
| --- | --- | --- |
| `SNS-A01` | A (beku) | 10 pembacaan |
| `SNS-A02` | A (beku) | 10 pembacaan |
| `SNS-B01` | B (segar) | 10 pembacaan |

Nilai suhu seeder mengikuti rentang aman masing-masing gudang.

---

## Keputusan Teknis

- **Satu sumber validasi di backend.** Frontend hanya menampilkan pesan error dari API, sehingga aturan tidak ganda.
- **Kode status HTTP sesuai semantik.** `400` data tidak valid, `404` tidak ditemukan, `409` duplikat, `204` untuk hapus.
- **Indeks `(device_id, created_at)`** agar pengambilan pembacaan terbaru tetap cepat saat data bertambah.
- **`ON DELETE CASCADE`** supaya pembacaan ikut terhapus bersama perangkatnya dan tidak ada data yatim.
- **Konfirmasi hapus di frontend** sebelum memanggil `DELETE`, sesuai alur alternatif A3.

---

## Penulis

**Muhammad Dzaky Hamid** — Junior Fullstack Engineer (Magang TaggIoT 2026)
