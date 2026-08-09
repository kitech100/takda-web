<?php

namespace App\Actions\Shared;

use Illuminate\Database\Eloquent\Model;
use LogicException;

class RestoreModel
{
    public function execute(Model $model): void
    {
        if (! method_exists($model, 'restore')) {
            throw new LogicException($model::class.' must use Laravel SoftDeletes.');
        }

        $model->restore();
    }
}
