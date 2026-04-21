<?php

declare(strict_types=1);

namespace SBSommar;

/**
 * Shared rate-limit helper for the PHP API (02-§93.9).
 *
 * State is a JSON file under the system temp dir, keyed by
 * "{namespace}:{ip}" so endpoints do not share quotas. PHP runs as a
 * fresh process per request on shared hosting, so we cannot hold
 * counters in memory the way the Node side does.
 *
 * The Node API (`app.js`) uses the third-party `express-rate-limit`
 * middleware instead; see docs/03-ARCHITECTURE.md §31.3.
 */
final class RateLimit
{
    private const STATE_FILE = 'sbsommar_rate_limit.json';

    /**
     * Return true when the caller should reject the request (429). Each
     * call counts as one request; callers should invoke this once per
     * incoming request, before any other work.
     */
    public static function isLimited(string $ip, string $namespace, int $limit, int $windowSeconds): bool
    {
        $file = sys_get_temp_dir() . '/' . self::STATE_FILE;
        $data = [];

        if (file_exists($file)) {
            $raw = file_get_contents($file);
            $data = json_decode($raw ?: '{}', true) ?: [];
        }

        $now = time();

        // Sweep expired entries.
        foreach ($data as $k => $entry) {
            if ($now > ($entry['resetAt'] ?? 0)) {
                unset($data[$k]);
            }
        }

        $key = "{$namespace}:{$ip}";
        $entry = $data[$key] ?? null;
        if ($entry === null || $now > ($entry['resetAt'] ?? 0)) {
            $data[$key] = ['count' => 1, 'resetAt' => $now + $windowSeconds];
            file_put_contents($file, json_encode($data));

            return false;
        }

        $data[$key]['count'] = ($data[$key]['count'] ?? 0) + 1;
        file_put_contents($file, json_encode($data));

        return $data[$key]['count'] > $limit;
    }
}
