<?php

namespace App\Http\Controllers;

use App\Models\Device;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class DeviceController extends Controller
{
    /**
     * GET /api/devices — Daftar semua perangkat
     */
    public function index(): JsonResponse
    {
        $devices = Device::orderBy('kode')->get();
        return response()->json($devices);
    }

    /**
     * POST /api/devices — Tambah perangkat
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode'   => ['required', 'string', 'max:10', 'regex:/^SNS-[AB]\d{2}$/', 'unique:devices,kode'],
            'nama'   => ['required', 'string', 'max:50'],
            'gudang' => ['required', Rule::in(['A', 'B'])],
        ], [
            'kode.required'  => 'Kode perangkat wajib diisi.',
            'kode.regex'     => 'Format kode tidak valid. Gunakan format SNS-A01 atau SNS-B01.',
            'kode.unique'    => 'Kode perangkat sudah digunakan.',
            'nama.required'  => 'Nama perangkat wajib diisi.',
            'nama.max'       => 'Nama perangkat maksimal 50 karakter.',
            'gudang.required'=> 'Gudang wajib diisi.',
            'gudang.in'      => 'Gudang hanya boleh A atau B.',
        ]);

        $device = Device::create($validated);

        return response()->json($device, 201);
    }

    /**
     * PUT /api/devices/{id} — Ubah perangkat
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $device = Device::find($id);

        if (! $device) {
            return response()->json(['message' => 'Perangkat tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'kode'   => ['required', 'string', 'max:10', 'regex:/^SNS-[AB]\d{2}$/', Rule::unique('devices', 'kode')->ignore($device->id)],
            'nama'   => ['required', 'string', 'max:50'],
            'gudang' => ['required', Rule::in(['A', 'B'])],
        ], [
            'kode.required'  => 'Kode perangkat wajib diisi.',
            'kode.regex'     => 'Format kode tidak valid. Gunakan format SNS-A01 atau SNS-B01.',
            'kode.unique'    => 'Kode perangkat sudah digunakan.',
            'nama.required'  => 'Nama perangkat wajib diisi.',
            'nama.max'       => 'Nama perangkat maksimal 50 karakter.',
            'gudang.required'=> 'Gudang wajib diisi.',
            'gudang.in'      => 'Gudang hanya boleh A atau B.',
        ]);

        $device->update($validated);

        return response()->json($device);
    }

    /**
     * DELETE /api/devices/{id} — Hapus perangkat
     */
    public function destroy(int $id): Response|JsonResponse
    {
        $device = Device::find($id);

        if (! $device) {
            return response()->json(['message' => 'Perangkat tidak ditemukan.'], 404);
        }

        $device->delete();

        return response()->noContent();
    }
}
