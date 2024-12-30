<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('typing_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->float('wpm');
            $table->float('accuracy');
            $table->integer('time_taken');
            $table->boolean('mode');
            $table->integer('duration')->nullable(); // For timer mode
            $table->integer('word_count')->nullable(); // For word count mode
            $table->boolean('include_numbers')->default(false);
            $table->boolean('include_punctuation')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('typing_sessions');
    }
};
