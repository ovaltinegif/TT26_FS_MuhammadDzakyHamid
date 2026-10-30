<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - SmartWarehouse Admin
| Menyajikan halaman frontend pada route '/' (PRD Section 13)
|--------------------------------------------------------------------------
*/

Route::get('/{any?}', function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath);
    }
    return view('welcome');
})->where('any', '^(?!api).*$');
