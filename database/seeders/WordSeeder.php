<?php

namespace Database\Seeders;

use App\Models\Word;
use Illuminate\Database\Seeder;

class WordSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $wordFile = database_path('data/words.txt');

        if (! file_exists($wordFile)) {
            return;
        }

        $contents = trim((string) file_get_contents($wordFile));

        if ($contents === '') {
            return;
        }

        $rawWords = preg_split('/\s+/', $contents) ?: [];
        $words = collect($rawWords)
            ->map(fn (string $word): string => trim(mb_strtolower($word)))
            ->filter(fn (string $word): bool => $word !== '')
            ->unique()
            ->values();

        $batch = [];

        foreach ($words as $word) {
            $batch[] = [
                'word' => $word,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if (count($batch) >= 500) {
                Word::query()->insertOrIgnore($batch);
                $batch = [];
            }
        }

        if ($batch !== []) {
            Word::query()->insertOrIgnore($batch);
        }
    }
}
