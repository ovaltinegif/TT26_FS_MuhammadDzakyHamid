<?php

namespace Database\Seeders;

use App\Models\Device;
use App\Models\Reading;
use Illuminate\Database\Seeder;

class DeviceSeeder extends Seeder
{
    public function run(): void
    {
        $devices = [
            ['kode' => 'SNS-A01', 'nama' => 'Sensor Freezer Utama', 'gudang' => 'A', 'is_active' => true],
            ['kode' => 'SNS-A02', 'nama' => 'Sensor Freezer Cadangan', 'gudang' => 'A', 'is_active' => true],
            ['kode' => 'SNS-B01', 'nama' => 'Sensor Chiller Produk Segar', 'gudang' => 'B', 'is_active' => true],
        ];

        foreach ($devices as $deviceData) {
            $device = Device::create($deviceData);

            // Gudang A: suhu -25 s/d -15, kelembapan 40–80
            // Gudang B: suhu 0 s/d 8, kelembapan 40–80
            for ($i = 10; $i >= 1; $i--) {
                if ($deviceData['gudang'] === 'A') {
                    $suhu = round(rand(-2500, -1500) / 100, 2);
                } else {
                    $suhu = round(rand(0, 800) / 100, 2);
                }

                $kelembapan = round(rand(4000, 8000) / 100, 2);

                Reading::create([
                    'device_id'  => $device->id,
                    'suhu'       => $suhu,
                    'kelembapan' => $kelembapan,
                    'created_at' => now()->subMinutes($i * 5),
                    'updated_at' => now()->subMinutes($i * 5),
                ]);
            }
        }
    }
}
