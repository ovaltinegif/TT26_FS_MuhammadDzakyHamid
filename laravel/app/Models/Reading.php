<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reading extends Model
{
    protected $fillable = [
        'device_id',
        'suhu',
        'kelembapan',
    ];

    protected $casts = [
        'suhu' => 'decimal:2',
        'kelembapan' => 'decimal:2',
    ];

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }
}
