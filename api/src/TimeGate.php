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
        return self::isBeforeEditingPeriod($today, $opensForEditing)
            || self::isAfterEditingPeriod($today, $endDate);
    }

    /**
     * Today is strictly before `opens_for_editing`. Admins may bypass this
     * state via a valid admin token (02-§26.17).
     */
    public static function isBeforeEditingPeriod(string $today, string $opensForEditing): bool
    {
        return $today < $opensForEditing;
    }

    /**
     * Today is strictly after `end_date + 1 day`. No admin bypass applies
     * (02-§26.18).
     */
    public static function isAfterEditingPeriod(string $today, string $endDate): bool
    {
        return $today > self::addOneDay($endDate);
    }
}
