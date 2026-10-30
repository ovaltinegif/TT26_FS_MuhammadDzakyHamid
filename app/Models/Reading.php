<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reading extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'suhu',
        'kelembapan',
        'created_at',
    ];

    protected $casts = [
        'device_id' => 'integer',
        'suhu' => 'float',
        'kelembapan' => 'float',
    ];

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }
}
