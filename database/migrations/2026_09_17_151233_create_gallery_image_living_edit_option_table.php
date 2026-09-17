<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gallery_image_living_edit_option', function (Blueprint $table) {
            $table->foreignId('gallery_image_id')->constrained()->cascadeOnDelete();
            $table->foreignId('living_edit_option_id')->constrained()->cascadeOnDelete();
            $table->primary(['gallery_image_id', 'living_edit_option_id']);
            $table->index('living_edit_option_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_image_living_edit_option');
    }
};
