<?php

use App\Models\WorkCategory;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(WorkCategory::class)->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['work_category_id', 'slug']);
            $table->index(['work_category_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_tags');
    }
};
