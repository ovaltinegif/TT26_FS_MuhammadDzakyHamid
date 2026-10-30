<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDeviceRequest;
use App\Http\Requests\UpdateDeviceRequest;
use App\Models\Device;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class DeviceController extends Controller
{
    /**
     * GET /api/devices
     * Daftar seluruh perangkat sensor (PRD Section 12.2).
     */
    public function index(): JsonResponse
    {
        $devices = Device::orderBy('id', 'asc')->get();
        return response()->json($devices, 200);
    }

    /**
     * POST /api/devices
     * Tambah perangkat baru dengan validasi dan penanganan duplikasi (PRD Section 12.5).
     */
    public function store(StoreDeviceRequest $request): JsonResponse
    {
        $kode = trim($request->validated('kode'));

        // Cek kode duplikat -> 409
        $existing = Device::whereRaw('UPPER(kode) = ?', [strtoupper($kode)])->first();
        if ($existing) {
            return response()->json([
                'message' => 'Kode perangkat sudah digunakan'
            ], 409);
        }

        try {
            $device = Device::create([
                'kode' => $kode,
                'nama' => trim($request->validated('nama')),
                'gudang' => $request->validated('gudang'),
                'is_active' => $request->has('is_active') ? (bool) $request->validated('is_active') : true,
            ]);

            return response()->json($device, 201);
        } catch (UniqueConstraintViolationException $e) {
            return response()->json([
                'message' => 'Kode perangkat sudah digunakan'
            ], 409);
        }
    }

    /**
     * PUT /api/devices/{id}
     * Ubah data perangkat (PRD Section 12.5).
     */
    public function update(UpdateDeviceRequest $request, $id): JsonResponse
    {
        $device = Device::find($id);
        if (!$device) {
            return response()->json([
                'message' => 'Perangkat tidak ditemukan'
            ], 404);
        }

        $kode = trim($request->validated('kode'));

        // Cek duplikasi kode pada perangkat lain -> 409
        $duplicate = Device::where('id', '!=', $id)
            ->whereRaw('UPPER(kode) = ?', [strtoupper($kode)])
            ->first();

        if ($duplicate) {
            return response()->json([
                'message' => 'Kode perangkat sudah digunakan'
            ], 409);
        }

        try {
            $device->update([
                'kode' => $kode,
                'nama' => trim($request->validated('nama')),
                'gudang' => $request->validated('gudang'),
                'is_active' => $request->has('is_active') ? (bool) $request->validated('is_active') : $device->is_active,
            ]);

            return response()->json($device, 200);
        } catch (UniqueConstraintViolationException $e) {
            return response()->json([
                'message' => 'Kode perangkat sudah digunakan'
            ], 409);
        }
    }

    /**
     * DELETE /api/devices/{id}
     * Hapus perangkat dan pembacaannya secara cascade (PRD Section 12.5).
     */
    public function destroy($id): Response|JsonResponse
    {
        $device = Device::find($id);
        if (!$device) {
            return response()->json([
                'message' => 'Perangkat tidak ditemukan'
            ], 404);
        }

        $device->delete();

        // 204 No Content
        return response()->noContent(204);
    }
}
