<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        $this->migrator->add('general.whatsapp_number', null);
    }

    public function down(): void
    {
        $this->migrator->deleteIfExists('general.whatsapp_number');
    }
};
