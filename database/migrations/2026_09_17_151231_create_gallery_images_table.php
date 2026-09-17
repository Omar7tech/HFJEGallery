<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gallery_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('slot');
            $table->string('alt_text')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['slot', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_images');
    }
};
