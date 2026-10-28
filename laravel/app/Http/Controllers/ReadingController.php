<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Reading;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReadingController extends Controller
{
    /**
     * POST /api/readings — Simpan pembacaan sensor
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'device_id'  => ['required', 'integer'],
            'suhu'       => ['required', 'numeric'],
            'kelembapan' => ['required', 'numeric', 'min:0', 'max:100'],
        ], [
            'device_id.required'  => 'device_id wajib diisi.',
            'device_id.integer'   => 'device_id harus berupa angka.',
            'suhu.required'       => 'Suhu wajib diisi.',
            'suhu.numeric'        => 'Suhu harus berupa angka.',
            'kelembapan.required' => 'Kelembapan wajib diisi.',
            'kelembapan.numeric'  => 'Kelembapan harus berupa angka.',
            'kelembapan.min'      => 'Kelembapan minimal 0.',
            'kelembapan.max'      => 'Kelembapan maksimal 100.',
        ]);

        $device = Device::find($validated['device_id']);

        if (! $device) {
            return response()->json(['message' => 'Perangkat tidak ditemukan.'], 404);
        }

        $reading = Reading::create($validated);

        return response()->json($reading, 201);
    }

    /**
     * GET /api/devices/{id}/readings?limit=10 — Pembacaan terbaru perangkat
     */
    public function index(Request $request, int $id): JsonResponse
    {
        $device = Device::find($id);

        if (! $device) {
            return response()->json(['message' => 'Perangkat tidak ditemukan.'], 404);
        }

        $limit = (int) $request->query('limit', 10);
        $limit = max(1, min(100, $limit));

        $readings = Reading::where('device_id', $id)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        return response()->json($readings);
    }
}
