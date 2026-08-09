<?php

use App\Jobs\AggregateDailyBusinessMetrics;
use Illuminate\Support\Facades\Schedule;

Schedule::job(new AggregateDailyBusinessMetrics(now('Asia/Manila')->subDay()->toDateString()))
    ->name('metrics:aggregate-daily')
    ->dailyAt('00:15')
    ->timezone('Asia/Manila')
    ->withoutOverlapping()
    ->onOneServer();

Schedule::command('horizon:snapshot')
    ->everyFiveMinutes()
    ->withoutOverlapping();

Schedule::command('sanctum:prune-expired --hours=24')
    ->daily()
    ->withoutOverlapping()
    ->onOneServer();

Schedule::command('activitylog:clean')
    ->weeklyOn(1, '02:30')
    ->timezone('Asia/Manila')
    ->withoutOverlapping()
    ->onOneServer();
