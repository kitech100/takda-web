<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

trait HasPublicId
{
    public static function bootHasPublicId(): void
    {
        static::creating(function (Model $model): void {
            if (blank($model->getAttribute('public_id'))) {
                $model->setAttribute('public_id', (string) Str::uuid());
            }
        });
    }

    public function initializeHasPublicId(): void
    {
        if (blank($this->getAttribute('public_id'))) {
            $this->setAttribute('public_id', (string) Str::uuid());
        }
    }

    public function getRouteKeyName(): string
    {
        return 'public_id';
    }
}
