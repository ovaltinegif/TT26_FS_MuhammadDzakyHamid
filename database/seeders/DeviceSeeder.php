<?php

namespace Database\Seeders;

use App\Models\Device;
use App\Models\Reading;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DeviceSeeder extends Seeder
{
    /**
     * Run the database seeds according to PRD Section 14.
     */
    public function run(): void
    {
        // 1. Device SNS-A01 (Gudang A - Beku: -25 to -15 °C, Hum: 40-80%)
        $devA01 = Device::updateOrCreate(
            ['kode' => 'SNS-A01'],
            [
                'nama' => 'Sensor Freezer Utama',
                'gudang' => 'A',
                'is_active' => true,
            ]
        );

        // 2. Device SNS-A02 (Gudang A - Beku: -25 to -15 °C, Hum: 40-80%)
        $devA02 = Device::updateOrCreate(
            ['kode' => 'SNS-A02'],
            [
                'nama' => 'Sensor Freezer Cadangan',
                'gudang' => 'A',
                'is_active' => true,
            ]
        );

        // 3. Device SNS-B01 (Gudang B - Segar: 0 to 8 °C, Hum: 40-80%)
        $devB01 = Device::updateOrCreate(
            ['kode' => 'SNS-B01'],
            [
                'nama' => 'Sensor Chiller Produk Segar',
                'gudang' => 'B',
                'is_active' => true,
            ]
        );

        // Remove old readings for clean seeding
        Reading::whereIn('device_id', [$devA01->id, $devA02->id, $devB01->id])->delete();

        $now = Carbon::now();

        // 10 readings for SNS-A01 (5 min interval)
        $a01Temps = [-18.5, -19.1, -18.2, -19.4, -20.1, -18.8, -19.5, -18.0, -17.5, -18.9];
        $a01Hums = [62.3, 60.8, 64.0, 61.5, 63.2, 59.5, 65.1, 62.0, 60.0, 63.8];
        for ($i = 9; $i >= 0; $i--) {
            Reading::create([
                'device_id' => $devA01->id,
                'suhu' => $a01Temps[9 - $i],
                'kelembapan' => $a01Hums[9 - $i],
                'created_at' => (clone $now)->subMinutes($i * 5),
                'updated_at' => (clone $now)->subMinutes($i * 5),
            ]);
        }

        // 10 readings for SNS-A02 (5 min interval)
        $a02Temps = [-21.2, -20.8, -21.5, -20.0, -21.0, -20.5, -21.8, -20.9, -21.1, -20.7];
        $a02Hums = [58.2, 59.0, 57.5, 60.1, 58.8, 59.4, 58.0, 60.5, 59.1, 58.6];
        for ($i = 9; $i >= 0; $i--) {
            Reading::create([
                'device_id' => $devA02->id,
                'suhu' => $a02Temps[9 - $i],
                'kelembapan' => $a02Hums[9 - $i],
                'created_at' => (clone $now)->subMinutes($i * 5),
                'updated_at' => (clone $now)->subMinutes($i * 5),
            ]);
        }

        // 10 readings for SNS-B01 (5 min interval)
        $b01Temps = [4.5, 4.2, 4.8, 4.1, 5.0, 4.7, 4.3, 4.9, 4.4, 4.6];
        $b01Hums = [70.2, 71.5, 69.8, 72.0, 68.5, 70.8, 71.2, 69.5, 70.0, 71.8];
        for ($i = 9; $i >= 0; $i--) {
            Reading::create([
                'device_id' => $devB01->id,
                'suhu' => $b01Temps[9 - $i],
                'kelembapan' => $b01Hums[9 - $i],
                'created_at' => (clone $now)->subMinutes($i * 5),
                'updated_at' => (clone $now)->subMinutes($i * 5),
            ]);
        }
    }
}
