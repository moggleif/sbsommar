<?php

declare(strict_types=1);

namespace SBSommar;

/**
 * Form time-gating – mirrors source/api/time-gate.js.
 *
 * The submission period runs from opens_for_editing through
 * end_date + 1 day (inclusive on both ends).
 */
final class TimeGate
{
    public static function addOneDay(string $dateStr): string
    {
        $dt = new \DateTimeImmutable($dateStr, new \DateTimeZone('UTC'));

        return $dt->modify('+1 day')->format('Y-m-d');
    }

    public static function isOutsideEditingPeriod(
        string $today,
        string $opensForEditing,
        string $endDate,
    ): bool {
        $closes = self::addOneDay($endDate);

        return $today < $opensForEditing || $today > $closes;
    }
}
