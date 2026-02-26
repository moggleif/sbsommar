<?php

declare(strict_types=1);

namespace SBSommar;

/**
 * Active camp resolution – mirrors source/scripts/resolve-active-camp.js.
 *
 * Priority:
 *   1. On dates — today within start_date..end_date (inclusive)
 *   2. Next upcoming — nearest future start_date
 *   3. Most recent — latest end_date (even if archived)
 *
 * Environment-aware filtering:
 *   - 'production': camps with qa: true are excluded
 *   - 'qa': qa: true camps on dates take priority
 *   - unset: no filtering
 */
final class ActiveCamp
{
    /**
     * @param  array<int,array<string,mixed>> $camps
     * @return array<string,mixed>
     *
     * @throws \RuntimeException when no camps are available
     */
    public static function resolve(array $camps, ?string $today = null, ?string $environment = null): array
    {
        if (count($camps) === 0) {
            throw new \RuntimeException('No camps found in camps.yaml');
        }

        $todayStr = $today ?? date('Y-m-d');
        $pool = $camps;

        // ── Environment filtering ────────────────────────────────────────
        if ($environment === 'production') {
            $pool = array_values(array_filter(
                $camps,
                static fn(array $c) => empty($c['qa']),
            ));
            if (count($pool) === 0) {
                throw new \RuntimeException('No camps found in camps.yaml');
            }
        } elseif ($environment === 'qa') {
            $qaOnDates = array_filter(
                $camps,
                static fn(array $c) => ($c['qa'] ?? false) === true
                    && (string) $c['start_date'] <= $todayStr
                    && $todayStr <= (string) $c['end_date'],
            );
            if (count($qaOnDates) > 0) {
                return array_values($qaOnDates)[0];
            }
        }

        // 1. On dates
        $onDates = array_filter(
            $pool,
            static fn(array $c) => (string) $c['start_date'] <= $todayStr
                && $todayStr <= (string) $c['end_date'],
        );
        usort($onDates, static fn($a, $b) => strcmp((string) $a['start_date'], (string) $b['start_date']));

        if (count($onDates) > 0) {
            return $onDates[0];
        }

        // 2. Next upcoming
        $upcoming = array_filter(
            $pool,
            static fn(array $c) => (string) $c['start_date'] > $todayStr,
        );
        usort($upcoming, static fn($a, $b) => strcmp((string) $a['start_date'], (string) $b['start_date']));

        if (count($upcoming) > 0) {
            return array_values($upcoming)[0];
        }

        // 3. Most recent
        $sorted = $pool;
        usort($sorted, static fn($a, $b) => strcmp((string) $b['end_date'], (string) $a['end_date']));

        return $sorted[0];
    }
}
