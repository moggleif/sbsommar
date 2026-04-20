<?php

declare(strict_types=1);

namespace SBSommar;

/**
 * Feedback validation and GitHub Issue creation — mirrors source/api/feedback.js.
 */
final class Feedback
{
    private const VALID_CATEGORIES = ['bug', 'suggestion', 'other'];

    private const CATEGORY_LABELS = [
        'bug'        => 'feedback:bug',
        'suggestion' => 'feedback:suggestion',
        'other'      => 'feedback:other',
    ];

    private const CATEGORY_DISPLAY = [
        'bug'        => 'Bugg',
        'suggestion' => 'Förslag',
        'other'      => 'Övrigt',
    ];

    private const MAX_LENGTHS = [
        'title'       => 200,
        'description' => 2000,
        'name'        => 200,
    ];

    private const TEXT_FIELDS = ['title', 'description', 'name'];

    private const INJECTION_PATTERNS = [
        '/<script/i'         => '<script>',
        '/javascript:/i'     => 'javascript: URI',
        '/on\w+\s*=/i'       => 'event handler (on*=)',
        '/<iframe/i'         => '<iframe>',
        '/<object/i'         => '<object>',
        '/<embed/i'          => '<embed>',
        '/data:text\/html/i' => 'data:text/html URI',
    ];

    // ── Validation ──────────────────────────────────────────────────────

    /**
     * @param array<string,mixed> $body
     * @return array{ok:bool,error?:string,honeypot?:bool}
     */
    public static function validate(array $body): array
    {
        // Honeypot check
        $website = trim((string) ($body['website'] ?? ''));
        if ($website !== '') {
            return ['ok' => true, 'honeypot' => true];
        }

        $category    = trim((string) ($body['category'] ?? ''));
        $title       = trim((string) ($body['title'] ?? ''));
        $description = trim((string) ($body['description'] ?? ''));
        $name        = trim((string) ($body['name'] ?? ''));

        if ($category === '' || !in_array($category, self::VALID_CATEGORIES, true)) {
            return ['ok' => false, 'error' => 'category måste vara bug, suggestion eller other'];
        }
        if ($title === '') {
            return ['ok' => false, 'error' => 'title är obligatoriskt'];
        }
        if ($description === '') {
            return ['ok' => false, 'error' => 'description är obligatoriskt'];
        }

        // Length limits
        if (mb_strlen($title) > self::MAX_LENGTHS['title']) {
            return ['ok' => false, 'error' => 'title överskrider maxlängd ' . self::MAX_LENGTHS['title'] . ' tecken'];
        }
        if (mb_strlen($description) > self::MAX_LENGTHS['description']) {
            return ['ok' => false, 'error' => 'description överskrider maxlängd ' . self::MAX_LENGTHS['description'] . ' tecken'];
        }
        if (mb_strlen($name) > self::MAX_LENGTHS['name']) {
            return ['ok' => false, 'error' => 'name överskrider maxlängd ' . self::MAX_LENGTHS['name'] . ' tecken'];
        }

        // Injection scan
        foreach (self::TEXT_FIELDS as $field) {
            $val = trim((string) ($body[$field] ?? ''));
            if ($val === '') {
                continue;
            }
            foreach (self::INJECTION_PATTERNS as $pattern => $label) {
                if (preg_match($pattern, $val)) {
                    return ['ok' => false, 'error' => "{$field} innehåller otillåtet mönster: {$label}"];
                }
            }
        }

        return ['ok' => true];
    }

    // ── GitHub Issue creation ────────────────────────────────────────────

    /**
     * @param array<string,mixed> $body  Validated request body
     * @return string  HTML URL of the created issue
     */
    public static function createIssue(array $body): string
    {
        $category    = trim((string) ($body['category'] ?? ''));
        $title       = trim((string) ($body['title'] ?? ''));
        $description = trim((string) ($body['description'] ?? ''));
        $name        = trim((string) ($body['name'] ?? ''));
        $pageUrl     = trim((string) ($body['url'] ?? ''));
        $viewport    = (string) ($body['viewport'] ?? '');
        $userAgent   = (string) ($body['userAgent'] ?? '');
        $timestamp   = (string) ($body['timestamp'] ?? '');

        $display = self::CATEGORY_DISPLAY[$category] ?? $category;

        $issueTitle = "[Feedback] {$display}: {$title}";
        $issueBody  = "{$description}\n\n---\n\n"
            . "| Metadata | Värde |\n"
            . "|----------|-------|\n"
            . "| Kategori | {$display} |\n"
            . '| Sida | ' . ($pageUrl ?: 'Ej angivet') . " |\n"
            . '| Viewport | ' . ($viewport ?: 'Ej angivet') . " |\n"
            . '| Tid | ' . ($timestamp ?: 'Ej angivet') . " |\n"
            . '| Namn/kontakt | ' . ($name ?: 'Ej angivet') . " |\n"
            . '| User-Agent | ' . ($userAgent ?: 'Ej angivet') . " |\n";

        $labels = [self::CATEGORY_LABELS[$category] ?? 'feedback:bug'];

        $gh = new GitHub();

        return $gh->createIssue($issueTitle, $issueBody, $labels);
    }
}
