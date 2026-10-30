<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode',
        'nama',
        'gudang',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function readings(): HasMany
    {
        return $this->hasMany(Reading::class);
    }
}
