<?php

namespace Tests\Feature;

use App\Models\Device;
use App\Models\Reading;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SmartWarehouseApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    /**
     * AC-01: GET /api/devices setelah seeding
     */
    public function test_get_devices_returns_seeded_data(): void
    {
        $response = $this->getJson('/api/devices');
        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    /**
     * AC-02: POST /api/devices data valid
     */
    public function test_create_device_success(): void
    {
        $payload = [
            'kode' => 'SNS-B02',
            'nama' => 'Sensor Chiller Cadangan',
            'gudang' => 'B',
            'is_active' => true,
        ];

        $response = $this->postJson('/api/devices', $payload);
        $response->assertStatus(201)
            ->assertJsonFragment(['kode' => 'SNS-B02']);

        $this->assertDatabaseHas('devices', ['kode' => 'SNS-B02']);
    }

    /**
     * AC-03: POST /api/devices format kode salah -> 400
     */
    public function test_create_device_invalid_format_returns_400(): void
    {
        $payload = [
            'kode' => 'ABC',
            'nama' => '',
            'gudang' => 'C',
        ];

        $response = $this->postJson('/api/devices', $payload);
        $response->assertStatus(400)
            ->assertJsonStructure(['message', 'errors' => ['kode', 'nama', 'gudang']]);
    }

    /**
     * AC-04: POST /api/devices kode duplikat -> 409
     */
    public function test_create_device_duplicate_kode_returns_409(): void
    {
        $payload = [
            'kode' => 'SNS-A01',
            'nama' => 'Duplikat Sensor',
            'gudang' => 'A',
        ];

        $response = $this->postJson('/api/devices', $payload);
        $response->assertStatus(409)
            ->assertJson(['message' => 'Kode perangkat sudah digunakan']);
    }

    /**
     * AC-06: PUT /api/devices/{id}
     */
    public function test_update_device_success_and_errors(): void
    {
        $device = Device::first();

        // Valid update
        $response = $this->putJson("/api/devices/{$device->id}", [
            'kode' => $device->kode,
            'nama' => 'Nama Baru Diperbarui',
            'gudang' => $device->gudang,
            'is_active' => false,
        ]);
        $response->assertStatus(200)
            ->assertJsonFragment(['nama' => 'Nama Baru Diperbarui', 'is_active' => false]);

        // 404
        $this->putJson('/api/devices/9999', [
            'kode' => 'SNS-A99',
            'nama' => 'Tidak Ada',
            'gudang' => 'A',
        ])->assertStatus(404);

        // 409 (bentrok dengan kode device lain)
        $other = Device::where('id', '!=', $device->id)->first();
        $this->putJson("/api/devices/{$device->id}", [
            'kode' => $other->kode,
            'nama' => 'Coba Bentrok',
            'gudang' => 'A',
        ])->assertStatus(409);
    }

    /**
     * AC-07: DELETE /api/devices/{id} dan cascade readings
     */
    public function test_delete_device_cascade(): void
    {
        $device = Device::first();
        $deviceId = $device->id;

        $response = $this->deleteJson("/api/devices/{$deviceId}");
        $response->assertStatus(204);

        $this->assertDatabaseMissing('devices', ['id' => $deviceId]);
        $this->assertDatabaseMissing('readings', ['device_id' => $deviceId]);

        // 404 delete non-existent
        $this->deleteJson("/api/devices/{$deviceId}")->assertStatus(404);
    }

    /**
     * AC-08 & AC-09: POST /api/readings
     */
    public function test_create_reading_and_validation(): void
    {
        $device = Device::first();

        // Valid
        $response = $this->postJson('/api/readings', [
            'device_id' => $device->id,
            'suhu' => -18.5,
            'kelembapan' => 60.2,
        ]);
        $response->assertStatus(201)
            ->assertJsonFragment(['suhu' => -18.5, 'kelembapan' => 60.2]);

        // 400 Invalid kelembapan
        $this->postJson('/api/readings', [
            'device_id' => $device->id,
            'suhu' => -18.5,
            'kelembapan' => 150,
        ])->assertStatus(400);

        // 404 Device not found
        $this->postJson('/api/readings', [
            'device_id' => 9999,
            'suhu' => -18.5,
            'kelembapan' => 60,
        ])->assertStatus(404);
    }

    /**
     * AC-10: GET /api/devices/{id}/readings
     */
    public function test_get_device_readings_sorted_desc(): void
    {
        $device = Device::first();

        $response = $this->getJson("/api/devices/{$device->id}/readings?limit=10");
        $response->assertStatus(200)
            ->assertJsonCount(10);

        $readings = $response->json();
        // Cek urutan terbaru di atas
        $time1 = strtotime($readings[0]['created_at']);
        $time2 = strtotime($readings[1]['created_at']);
        $this->assertGreaterThanOrEqual($time2, $time1);

        // 400 invalid limit
        $this->getJson("/api/devices/{$device->id}/readings?limit=invalid")->assertStatus(400);

        // 404 device not found
        $this->getJson("/api/devices/9999/readings?limit=10")->assertStatus(404);
    }
}
