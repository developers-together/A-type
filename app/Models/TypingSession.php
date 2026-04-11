<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TypingSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'wpm',
        'accuracy',
        'mode',
        'amount',
        'numbers',
        'punctuation',
        'session_at',
    ];

    protected $casts = [
        'numbers' => 'boolean',
        'punctuation' => 'boolean',
        'accuracy' => 'decimal:2',
        'session_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
