<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('living_feeling_living_space', function (Blueprint $table) {
            $table->foreignId('living_feeling_id')->constrained()->cascadeOnDelete();
            $table->foreignId('living_space_id')->constrained()->cascadeOnDelete();
            $table->primary(['living_feeling_id', 'living_space_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('living_feeling_living_space');
    }
};
