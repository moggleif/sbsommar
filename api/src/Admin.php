<?php

declare(strict_types=1);

namespace SBSommar;

/**
 * Admin token helpers – mirrors source/api/admin.js.
 *
 * Tokens have the shape "name_uuid_epoch"; the trailing `_epoch` is a Unix
 * timestamp after which the token expires (02-§91.5).
 */
final class Admin
{
    /**
     * Parses a comma-separated ADMIN_TOKENS value into a trimmed array
     * (02-§91.1, §91.2).
     *
     * @return list<string>
     */
    public static function parseAdminTokens(?string $raw): array
    {
        if ($raw === null || $raw === '') {
            return [];
        }

        $parts = explode(',', $raw);
        $result = [];
        foreach ($parts as $part) {
            $trimmed = trim($part);
            if ($trimmed !== '') {
                $result[] = $trimmed;
            }
        }

        return $result;
    }

    /**
     * Returns true when the embedded expiry timestamp has passed.
     */
    public static function isTokenExpired(string $token): bool
    {
        $i = strrpos($token, '_');
        if ($i === false) {
            return false;
        }
        $epoch = (int) substr($token, $i + 1);
        if ($epoch <= 0) {
            return false;
        }

        return time() > $epoch;
    }

    /**
     * Constant-time check of a candidate against the list of valid tokens.
     * Returns false for empty/expired candidates and empty token lists.
     *
     * @param list<string> $validTokens
     */
    public static function verifyAdminToken(?string $candidate, array $validTokens): bool
    {
        if ($candidate === null || $candidate === '') {
            return false;
        }
        if (self::isTokenExpired($candidate)) {
            return false;
        }
        foreach ($validTokens as $valid) {
            if (strlen($candidate) === strlen($valid) && hash_equals($valid, $candidate)) {
                return true;
            }
        }

        return false;
    }
}
