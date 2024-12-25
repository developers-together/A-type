<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypingSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'wpm',
        'accuracy',
        'time_taken',
        'text',
        'correct_characters',
        'incorrect_characters',
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
