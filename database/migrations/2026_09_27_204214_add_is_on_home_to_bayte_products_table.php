<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bayte_products', function (Blueprint $table) {
            $table->boolean('is_on_home')->default(false)->after('description');

            $table->index(['is_on_home', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::table('bayte_products', function (Blueprint $table) {
            $table->dropIndex(['is_on_home', 'sort_order']);
            $table->dropColumn('is_on_home');
        });
    }
};
