<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        $this->migrator->add('bayte.whatsapp_number', null);
    }

    public function down(): void
    {
        $this->migrator->deleteIfExists('bayte.whatsapp_number');
    }
};
