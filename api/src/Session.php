<?php

declare(strict_types=1);

namespace SBSommar;

/**
 * Session cookie handling – mirrors source/api/session.js.
 */
final class Session
{
    public const COOKIE_NAME     = 'sb_session';
    public const MAX_AGE_SECONDS = 604800; // 7 days

    /**
     * Parse the sb_session cookie from the raw Cookie header.
     *
     * @return string[]
     */
    public static function parseSessionIds(string $cookieHeader): array
    {
        if ($cookieHeader === '') {
            return [];
        }

        $pairs = array_map('trim', explode(';', $cookieHeader));
        $prefix = self::COOKIE_NAME . '=';

        foreach ($pairs as $pair) {
            if (str_starts_with($pair, $prefix)) {
                $raw = substr($pair, strlen($prefix));
                $decoded = urldecode($raw);
                $parsed = json_decode($decoded, true);

                if (!is_array($parsed)) {
                    return [];
                }

                return array_values(array_filter(
                    $parsed,
                    static fn($id) => is_string($id) && $id !== '',
                ));
            }
        }

        return [];
    }

    /**
     * Build the Set-Cookie header value.
     */
    public static function buildSetCookieHeader(array $ids, ?string $domain = null): string
    {
        $value = urlencode(json_encode(array_values($ids), JSON_UNESCAPED_UNICODE));
        $domainPart = $domain ? "; Domain={$domain}" : '';

        return sprintf(
            '%s=%s; Path=/; Max-Age=%d; Secure; SameSite=Strict%s',
            self::COOKIE_NAME,
            $value,
            self::MAX_AGE_SECONDS,
            $domainPart,
        );
    }

    /**
     * Merge a new event ID into an existing list (deduplicating).
     *
     * @param string[] $existing
     * @return string[]
     */
    public static function mergeIds(array $existing, string $newId): array
    {
        if (in_array($newId, $existing, true)) {
            return $existing;
        }

        return [...$existing, $newId];
    }
}
