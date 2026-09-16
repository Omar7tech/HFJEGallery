<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        $this->migrator->add('general.phone_number_enabled', false);
        $this->migrator->add('general.phone_number', null);
        $this->migrator->add('general.email', null);
        $this->migrator->add('general.social_links', []);
    }

    public function down(): void
    {
        $this->migrator->deleteIfExists('general.phone_number_enabled');
        $this->migrator->deleteIfExists('general.phone_number');
        $this->migrator->deleteIfExists('general.email');
        $this->migrator->deleteIfExists('general.social_links');
    }
};
