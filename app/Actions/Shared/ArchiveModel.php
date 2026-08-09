<?php

namespace App\Actions\Shared;

use Illuminate\Database\Eloquent\Model;
use LogicException;

class ArchiveModel
{
    public function execute(Model $model): void
    {
        if (! method_exists($model, 'runSoftDelete')) {
            throw new LogicException($model::class.' must use Laravel SoftDeletes.');
        }

        $model->delete();
    }
}
