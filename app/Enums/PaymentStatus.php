<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Unpaid = 'unpaid';
    case PaidAtVenue = 'paid_at_venue';
    case Refunded = 'refunded';
}
