<?php

namespace Tests\Feature;

use App\Actions\Shared\ArchiveModel;
use App\Actions\Shared\RestoreModel;
use App\Enums\BusinessStatus;
use App\Models\Business;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SoftDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_domain_records_are_archived_and_restored(): void
    {
        $business = Business::create([
            'name' => 'BGC Tutor Hub',
            'slug' => 'bgc-tutor-hub',
            'status' => BusinessStatus::Active,
        ]);

        app(ArchiveModel::class)->execute($business);

        $this->assertSoftDeleted($business);
        $this->assertNull(Business::find($business->getKey()));

        app(RestoreModel::class)->execute($business);

        $this->assertNotNull(Business::find($business->getKey()));
    }
}
