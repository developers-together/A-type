<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('typing_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->index();
            $table->unsignedInteger('wpm');
            $table->decimal('accuracy', 5, 2);
            $table->enum('mode', ['words', 'time'])->default('time')->index();
            $table->unsignedSmallInteger('amount')->default(15)->index();
            $table->boolean('numbers')->default(false);
            $table->boolean('punctuation')->default(false);
            $table->timestamp('session_at')->useCurrent()->index();
            $table->timestamps();

            $table->index(['user_id', 'mode', 'amount']);
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
