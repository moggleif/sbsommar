<?php

declare(strict_types=1);

namespace SBSommar;

/**
 * Input validation – mirrors source/api/validate.js.
 */
final class Validate
{
    private const TIME_RE = '/^\d{2}:\d{2}$/';

    private const MAX_LENGTHS = [
        'title'       => 200,
        'location'    => 200,
        'responsible' => 200,
        'description' => 2000,
        'link'        => 500,
    ];

    /**
     * @param array<string,mixed>      $body
     * @param array{start_date?:string,end_date?:string}|null $campDates
     * @return array{ok:bool,error?:string}
     */
    public static function validateEventRequest(array $body, ?array $campDates = null): array
    {
        return self::validateFields($body, false, $campDates);
    }

    /**
     * @param array<string,mixed>      $body
     * @param array{start_date?:string,end_date?:string}|null $campDates
     * @return array{ok:bool,error?:string}
     */
    public static function validateEditRequest(array $body, ?array $campDates = null): array
    {
        return self::validateFields($body, true, $campDates);
    }

    // ── internal ──────────────────────────────────────────────────────────

    /**
     * @param array<string,mixed>      $body
     * @param array{start_date?:string,end_date?:string}|null $campDates
     * @return array{ok:bool,error?:string}
     */
    private static function validateFields(array $body, bool $requireId, ?array $campDates): array
    {
        $id          = self::str($body, 'id');
        $title       = self::str($body, 'title');
        $date        = self::str($body, 'date');
        $start       = self::str($body, 'start');
        $end         = self::str($body, 'end');
        $location    = self::str($body, 'location');
        $responsible = self::str($body, 'responsible');

        if ($requireId && $id === '') {
            return self::fail('id är obligatoriskt');
        }
        if ($title === '') {
            return self::fail('title är obligatoriskt');
        }
        if ($date === '') {
            return self::fail('date är obligatoriskt');
        }
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return self::fail('date måste vara YYYY-MM-DD');
        }
        $ts = strtotime($date);
        if ($ts === false) {
            return self::fail('date är inte ett giltigt datum');
        }
        if ($date < date('Y-m-d')) {
            return self::fail('Datum kan inte vara i det förflutna.');
        }

        // Camp date range check
        if ($campDates !== null
            && isset($campDates['start_date'], $campDates['end_date'])
        ) {
            if ($date < $campDates['start_date'] || $date > $campDates['end_date']) {
                return self::fail(sprintf(
                    'date %s är utanför lägrets datumintervall (%s – %s)',
                    $date,
                    $campDates['start_date'],
                    $campDates['end_date'],
                ));
            }
        }

        if ($start === '') {
            return self::fail('start är obligatoriskt');
        }
        if (!preg_match(self::TIME_RE, $start)) {
            return self::fail('start måste vara HH:MM');
        }
        if ($end === '') {
            return self::fail('end är obligatoriskt');
        }
        if (!preg_match(self::TIME_RE, $end)) {
            return self::fail('end måste vara HH:MM');
        }
        if ($end <= $start) {
            return self::fail('end måste vara efter start');
        }
        if ($location === '') {
            return self::fail('location är obligatoriskt');
        }
        if ($responsible === '') {
            return self::fail('responsible är obligatoriskt');
        }

        // String length limits
        foreach (['title', 'location', 'responsible'] as $field) {
            $val = self::str($body, $field);
            if (mb_strlen($val) > self::MAX_LENGTHS[$field]) {
                return self::fail(sprintf(
                    '%s överskrider maxlängd %d tecken',
                    $field,
                    self::MAX_LENGTHS[$field],
                ));
            }
        }

        // Optional fields
        if (array_key_exists('description', $body) && !is_string($body['description'])) {
            return self::fail('description måste vara en sträng');
        }
        if (is_string($body['description'] ?? null)
            && mb_strlen($body['description']) > self::MAX_LENGTHS['description']
        ) {
            return self::fail(sprintf(
                'description överskrider maxlängd %d tecken',
                self::MAX_LENGTHS['description'],
            ));
        }
        if (array_key_exists('link', $body) && !is_string($body['link'])) {
            return self::fail('link måste vara en sträng');
        }
        if (is_string($body['link'] ?? null)
            && mb_strlen($body['link']) > self::MAX_LENGTHS['link']
        ) {
            return self::fail(sprintf(
                'link överskrider maxlängd %d tecken',
                self::MAX_LENGTHS['link'],
            ));
        }
        if (array_key_exists('ownerName', $body) && !is_string($body['ownerName'])) {
            return self::fail('ownerName måste vara en sträng');
        }

        return ['ok' => true];
    }

    private static function str(array $body, string $key): string
    {
        $val = $body[$key] ?? null;

        return is_string($val) ? trim($val) : '';
    }

    /** @return array{ok:false,error:string} */
    private static function fail(string $error): array
    {
        return ['ok' => false, 'error' => $error];
    }
}
