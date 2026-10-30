<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReadingRequest;
use App\Models\Device;
use App\Models\Reading;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReadingController extends Controller
{
    /**
     * POST /api/readings
     * Menerima dan menyimpan pembacaan sensor (PRD Section 12.2 & 12.5).
     */
    public function store(StoreReadingRequest $request): JsonResponse
    {
        $deviceId = (int) $request->validated('device_id');
        $device = Device::find($deviceId);

        if (!$device) {
            return response()->json([
                'message' => 'Perangkat tidak ditemukan'
            ], 404);
        }

        $reading = Reading::create([
            'device_id' => $deviceId,
            'suhu' => round((float) $request->validated('suhu'), 2),
            'kelembapan' => round((float) $request->validated('kelembapan'), 2),
        ]);

        return response()->json($reading, 201);
    }

    /**
     * GET /api/devices/{id}/readings?limit=10
     * Pembacaan terbaru perangkat tertentu (PRD Section 12.2 & 12.5).
     * Urut created_at DESC (tie-break id DESC), limit default 10 (1-100).
     */
    public function deviceReadings(Request $request, $id): JsonResponse
    {
        $device = Device::find($id);
        if (!$device) {
            return response()->json([
                'message' => 'Perangkat tidak ditemukan'
            ], 404);
        }

        $limit = 10;
        if ($request->has('limit')) {
            $rawLimit = $request->query('limit');
            if (!is_numeric($rawLimit) || (int) $rawLimit < 1 || (int) $rawLimit > 100 || (int) $rawLimit != $rawLimit) {
                return response()->json([
                    'message' => 'Data tidak valid.',
                    'errors' => [
                        'limit' => ['Limit harus berupa bilangan bulat antara 1 dan 100.']
                    ]
                ], 400);
            }
            $limit = (int) $rawLimit;
        }

        $readings = Reading::where('device_id', $id)
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->limit($limit)
            ->get();

        return response()->json($readings, 200);
    }

    /**
     * GET /api/readings
     * Seluruh pembacaan terbaru (opsional untuk visualisasi multi-grafik).
     */
    public function index(Request $request): JsonResponse
    {
        $limit = $request->query('limit', 100);
        $readings = Reading::orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->limit((int) $limit)
            ->get();

        return response()->json($readings, 200);
    }
}
