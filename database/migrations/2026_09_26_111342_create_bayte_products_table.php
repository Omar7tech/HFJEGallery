<?php

use App\Models\BayteCategory;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bayte_products', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(BayteCategory::class)->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('description');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['bayte_category_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bayte_products');
    }
};
