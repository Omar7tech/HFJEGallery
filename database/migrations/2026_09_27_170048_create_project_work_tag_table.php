<?php

use App\Models\Project;
use App\Models\WorkTag;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_work_tag', function (Blueprint $table) {
            $table->foreignIdFor(Project::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(WorkTag::class)->constrained()->cascadeOnDelete();

            $table->primary(['project_id', 'work_tag_id']);
            $table->index('work_tag_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_work_tag');
    }
};
