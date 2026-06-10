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
     * Per-process random key used only to equalise lengths before comparison.
     */
    private static function compareKey(): string
    {
        static $key = null;
        if ($key === null) {
            $key = random_bytes(32);
        }

        return $key;
    }

    /**
     * Hash a token to a fixed-width digest so comparison leaks neither the
     * match nor the token length via timing (02-§91.8, #386).
     */
    private static function tokenDigest(string $value): string
    {
        return hash_hmac('sha256', $value, self::compareKey(), true);
    }

    /**
     * Constant-time check of a candidate against the list of valid tokens.
     * Returns false for empty/expired candidates and empty token lists.
     *
     * Hashing both sides to a fixed-width digest lets hash_equals run on every
     * candidate/valid pair without a length pre-check, so the comparison leaks
     * neither which token matched nor the candidate's length.
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

        $candidateDigest = self::tokenDigest($candidate);
        $match = false;
        // Compare against every token (no early return) so neither which token
        // matched nor the candidate's length is observable through timing.
        foreach ($validTokens as $valid) {
            if (hash_equals(self::tokenDigest($valid), $candidateDigest)) {
                $match = true;
            }
        }

        return $match;
    }
}
