<?php

use App\Http\Controllers\DeviceController;
use App\Http\Controllers\ReadingController;
use App\Http\Controllers\StatsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| REST API Routes - SmartWarehouse (PRD Section 12)
|--------------------------------------------------------------------------
*/

// 1. GET /api/devices - Daftar semua perangkat (200 OK)
Route::get('/devices', [DeviceController::class, 'index']);

// 2. POST /api/devices - Tambah perangkat (201 Created)
Route::post('/devices', [DeviceController::class, 'store']);

// 3. PUT /api/devices/{id} - Ubah perangkat (200 OK)
Route::put('/devices/{id}', [DeviceController::class, 'update']);

// 4. DELETE /api/devices/{id} - Hapus perangkat & cascade readings (204 No Content)
Route::delete('/devices/{id}', [DeviceController::class, 'destroy']);

// 5. POST /api/readings - Simpan pembacaan sensor (201 Created)
Route::post('/readings', [ReadingController::class, 'store']);

// 6. GET /api/devices/{id}/readings - 10 pembacaan terbaru perangkat (200 OK)
Route::get('/devices/{id}/readings', [ReadingController::class, 'deviceReadings']);

// Endpoint tambahan untuk Frontend Dashboard & QA
Route::get('/readings', [ReadingController::class, 'index']);
Route::get('/stats', [StatsController::class, 'stats']);
Route::post('/seed/reset', [StatsController::class, 'resetSeed']);
