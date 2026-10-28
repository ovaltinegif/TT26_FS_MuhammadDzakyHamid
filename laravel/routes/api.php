<?php

use App\Http\Controllers\DeviceController;
use App\Http\Controllers\ReadingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/devices', [DeviceController::class, 'index']);
Route::post('/devices', [DeviceController::class, 'store']);
Route::put('/devices/{id}', [DeviceController::class, 'update']);
Route::delete('/devices/{id}', [DeviceController::class, 'destroy']);

Route::post('/readings', [ReadingController::class, 'store']);
Route::get('/devices/{id}/readings', [ReadingController::class, 'index']);
