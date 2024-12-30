<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypingSession extends Model
{
    use HasFactory;

    protected $table ='typing_sessions';

    protected $fillable = [
        'user_id',
        'wpm',
        'accuracy',
        'time_taken',
        'mode',
        'duration',
        'word_count',
        'include_numbers',
        'include_punctuation',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
