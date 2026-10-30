<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Reading;
use Database\Seeders\DeviceSeeder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;

class StatsController extends Controller
{
    /**
     * GET /api/stats
     * Statistik agregat untuk ringkasan dashboard.
     */
    public function stats(): JsonResponse
    {
        $devices = Device::all();
        $readings = Reading::all();

        $totalDevices = $devices->count();
        $onlineDevices = $devices->where('is_active', true)->count();
        $totalReadings = $readings->count();

        // Cek peringatan sesuai PRD BR-01:
        // Gudang A: -25 s/d -15 °C, 40-80% hum
        // Gudang B: 0 s/d 8 °C, 40-80% hum
        $alertsCount = 0;
        $deviceLatest = [];

        foreach ($readings as $r) {
            if (!isset($deviceLatest[$r->device_id]) || $r->created_at > $deviceLatest[$r->device_id]->created_at) {
                $deviceLatest[$r->device_id] = $r;
            }
        }

        foreach ($devices as $dev) {
            if (isset($deviceLatest[$dev->id])) {
                $latest = $deviceLatest[$dev->id];
                if ($dev->gudang === 'A') {
                    if ($latest->suhu < -25 || $latest->suhu > -15 || $latest->kelembapan < 40 || $latest->kelembapan > 80) {
                        $alertsCount++;
                    }
                } elseif ($dev->gudang === 'B') {
                    if ($latest->suhu < 0 || $latest->suhu > 8 || $latest->kelembapan < 40 || $latest->kelembapan > 80) {
                        $alertsCount++;
                    }
                }
            }
        }

        return response()->json([
            'totalDevices' => $totalDevices,
            'onlineDevices' => $onlineDevices,
            'totalReadings' => $totalReadings,
            'alertsCount' => $alertsCount,
            'gudangACount' => $devices->where('gudang', 'A')->count(),
            'gudangBCount' => $devices->where('gudang', 'B')->count(),
        ], 200);
    }

    /**
     * POST /api/seed/reset
     * Reset database ke kondisi seeder default untuk keperluan pengujian.
     */
    public function resetSeed(): JsonResponse
    {
        $seeder = new DeviceSeeder();
        $seeder->run();

        return response()->json([
            'message' => 'Database berhasil di-reset ke kondisi seeder default.',
            'devicesCount' => Device::count(),
            'readingsCount' => Reading::count(),
        ], 200);
    }
}
