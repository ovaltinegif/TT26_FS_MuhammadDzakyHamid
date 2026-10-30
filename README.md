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
11. [Pengujian Otomatis](#pengujian)
12. [Koleksi Postman](#postman)

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

```text
TT26-05-FS-SmartWarehouse/
├── README.md                                # Dokumentasi proyek & panduan pengujian
├── docs/
│   ├── prd.md                               # Dokumen spesifikasi kebutuhan PRD
│   └── Tasteskill.md                        # Panduan standar UI/UX TasteSkill
├── postman/
│   └── SmartWarehouse.postman_collection.json # Koleksi Postman lengkap 6 endpoint + skenario error
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── DeviceController.php         # CRUD Perangkat (200, 201, 204, 400, 404, 409)
│   │   │   ├── ReadingController.php        # Telemetri sensor & 10 pembacaan terakhir
│   │   │   └── StatsController.php          # Ringkasan KPI dashboard & seed reset
│   │   └── Requests/
│   │       ├── StoreDeviceRequest.php       # Validasi format kode (regex) -> 400
│   │       ├── UpdateDeviceRequest.php      # Validasi ubah -> 400
│   │       └── StoreReadingRequest.php      # Validasi suhu & kelembapan -> 400
│   └── Models/
│       ├── Device.php                       # Model Device, relasi hasMany ke Reading
│       └── Reading.php                      # Model Reading, relasi belongsTo ke Device
├── database/
│   ├── migrations/
│   │   ├── 2024_01_01_000001_create_devices_table.php  # Migrasi devices
│   │   └── 2024_01_01_000002_create_readings_table.php # Migrasi readings (indeks komposit & cascade)
│   └── seeders/
│       ├── DeviceSeeder.php                 # Seeder 3 perangkat & 30 pembacaan (interval 5 menit)
│       └── DatabaseSeeder.php
├── public/                                  # Halaman Admin Web & Aset Frontend
│   ├── index.html                           # Antarmuka Admin SmartWarehouse
│   └── assets/                              # Script & Style UI
├── routes/
│   ├── api.php                              # Rute 6 REST API utama + endpoint helper
│   └── web.php                              # Menyajikan Antarmuka Admin pada route '/'
├── tests/Feature/
│   └── SmartWarehouseApiTest.php            # Otomasi pengujian seluruh AC-01 s/d AC-10 (PHPUnit)
└── .env.example
```

---

## Panduan Menjalankan Proyek

### Prasyarat

- PHP >= 8.1 dan Composer
- MySQL >= 8.0 (atau MariaDB)
- Git

### Langkah

Cara Menjalankan Aplikasi (Hanya Satu Perintah)

### 1. Instalasi Dependensi & Setup Environment:
```bash
composer install
cp .env.example .env
php artisan key:generate
```

### 2. Migrasi Database & Seeding Data:
```bash
# Mengisi 3 perangkat awal dan 30 telemetri sensor sesuai batas suhu Gudang A & B
php artisan migrate:fresh --seed
```

### 3. Jalankan Server:
```bash
php artisan serve
```

Aplikasi sekarang siap diakses:
- 🌐 **Antarmuka Web Admin:** buka browser di **`http://127.0.0.1:8000`**
- 🔌 **REST API:** dapat diakses langsung pada **`http://127.0.0.1:8000/api`**

## Desain Database

Relasi **one-to-many** (1 : N) antara tabel `devices` dan `readings`:
- `devices.id` (PK, BIGINT UNSIGNED)
- `devices.kode` (VARCHAR(10), UNIQUE) — format regex `^SNS-[AB][0-9]{2}$`
- `devices.nama` (VARCHAR(50))
- `devices.gudang` (ENUM 'A', 'B')
- `devices.is_active` (BOOLEAN DEFAULT TRUE)
- `readings.id` (PK, BIGINT UNSIGNED)
- `readings.device_id` (FK → `devices.id` dengan **`ON DELETE CASCADE`**)
- `readings.suhu` (DECIMAL(5,2))
- `readings.kelembapan` (DECIMAL(5,2))
- **Indeks Komposit:** `(device_id, created_at)` pada tabel `readings` guna mengoptimalkan query pembacaan berkala sensor secara instan.
  
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

## Pengujian Otomatis (QA Checklist AC-01 s/d AC-10)

Untuk menjalankan seluruh rangkaian automated feature test:
```bash
php artisan test --filter=SmartWarehouseApiTest
```

**Status Pengujian (LULUS 100%):**
- `GET /api/devices` setelah seeding: **LULUS (200 OK, 3 devices)**
- `POST /api/devices` data valid: **LULUS (201 Created)**
- `POST /api/devices` format salah: **LULUS (400 Bad Request)**
- `POST /api/devices` kode duplikat: **LULUS (409 Conflict)**
- `PUT /api/devices/:id` update & bentrok kode: **LULUS (200 / 404 / 409)**
- `DELETE /api/devices/:id` & cascade delete: **LULUS (204 No Content / 404)**
- `POST /api/readings` & validasi rentang 0-100: **LULUS (201 / 400 / 404)**
- `GET /api/devices/:id/readings?limit=10` urutan DESC: **LULUS (200 OK)**

---

## Koleksi Postman

Berkas Postman siap diimpor dari:
`postman/SmartWarehouse.postman_collection.json`
Mencakup seluruh 6 endpoint utama, endpoint statistik, endpoint reset seeder, serta contoh respons status `200`, `201`, `204`, `400`, `404`, dan `409`.

---

## Penulis

**Muhammad Dzaky Hamid** — Junior Fullstack Engineer (Magang TaggIoT 2026)
