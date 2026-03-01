<?php

declare(strict_types=1);

// ── Bootstrap ────────────────────────────────────────────────────────────

require_once __DIR__ . '/vendor/autoload.php';

use SBSommar\ActiveCamp;
use SBSommar\GitHub;
use SBSommar\Session;
use SBSommar\TimeGate;
use SBSommar\Validate;
use Symfony\Component\Yaml\Yaml;

// Load .env if present (server-managed, not committed)
$envPath = __DIR__ . '/.env';
if (file_exists($envPath)) {
    \Dotenv\Dotenv::createImmutable(__DIR__)->load();
}

// ── CORS ─────────────────────────────────────────────────────────────────

$allowedOrigins = array_filter([
    $_ENV['ALLOWED_ORIGIN'] ?? '',
    $_ENV['QA_ORIGIN'] ?? '',
]);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Credentials: true');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Routing ──────────────────────────────────────────────────────────────

// Strip /api prefix and query string to get the route path.
$uri   = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$route = preg_replace('#^/api#', '', $uri);
$route = $route === '' ? '/' : $route;

$method = $_SERVER['REQUEST_METHOD'];

// ── Resolve active camp for time-gating ──────────────────────────────────

$activeCamp = null;
try {
    $campsPath = dirname(__DIR__) . '/source/data/camps.yaml';
    if (file_exists($campsPath)) {
        $campsData  = Yaml::parseFile($campsPath);
        $buildEnv   = $_ENV['BUILD_ENV'] ?? null;
        $activeCamp = ActiveCamp::resolve($campsData['camps'] ?? [], null, $buildEnv);
    }
} catch (\Throwable $e) {
    // Non-fatal: if camp resolution fails, time-gating is skipped.
    // This can happen when deployed without the source/ directory.
}

// ── Handlers ─────────────────────────────────────────────────────────────

header('Content-Type: application/json; charset=utf-8');

try {
    match (true) {
        $method === 'GET' && $route === '/health'
            => jsonResponse(['status' => 'API running']),

        $method === 'GET' && $route === '/cleanup-cookies'
            => handleCleanupCookies(),

        $method === 'POST' && $route === '/add-event'
            => handleAddEvent($activeCamp),

        $method === 'POST' && $route === '/edit-event'
            => handleEditEvent($activeCamp),

        default
            => jsonResponse(['error' => 'Not found'], 404),
    };
} catch (\Throwable $e) {
    error_log('PHP API error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'error' => 'Internt serverfel.'], 500);
}

// ── Route handlers ───────────────────────────────────────────────────────

function handleCleanupCookies(): void
{
    // Expire known WordPress/Blocksy HttpOnly cookies left over from the
    // previous site.  JavaScript cannot delete these — only the server can.
    $stale = ['PHPSESSID', 'wordpress_test_cookie', 'wp_lang'];

    // Also match dynamic WordPress cookies (e.g. wordpress_logged_in_<hash>).
    foreach (array_keys($_COOKIE) as $name) {
        if (str_starts_with($name, 'wordpress_') || str_starts_with($name, 'wp-')) {
            $stale[] = $name;
        }
    }

    $domain = !empty($_ENV['COOKIE_DOMAIN']) ? $_ENV['COOKIE_DOMAIN'] : '';

    foreach (array_unique($stale) as $name) {
        // Send multiple variations to cover however the cookie was originally set.
        setcookie($name, '', ['expires' => 1, 'path' => '/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
        if ($domain) {
            setcookie($name, '', ['expires' => 1, 'path' => '/', 'domain' => $domain, 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
            setcookie($name, '', ['expires' => 1, 'path' => '/', 'domain' => '.' . $domain, 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
        }
    }

    jsonResponse(['cleaned' => count(array_unique($stale))]);
}

function handleAddEvent(?array $activeCamp): void
{
    // Time-gating
    if ($activeCamp !== null) {
        $today = date('Y-m-d');
        if (TimeGate::isOutsideEditingPeriod(
            $today,
            (string) ($activeCamp['opens_for_editing'] ?? ''),
            (string) ($activeCamp['end_date'] ?? ''),
        )) {
            jsonResponse([
                'success' => false,
                'error'   => 'Det går inte att lägga till aktiviteter just nu. Formuläret är inte öppet.',
            ], 403);

            return;
        }
    }

    $body = getJsonBody();

    $v = Validate::validateEventRequest($body, $activeCamp);
    if (!$v['ok']) {
        jsonResponse(['success' => false, 'error' => $v['error']], 400);

        return;
    }

    // Build event ID (same logic as github.js)
    $title   = trim((string) ($body['title'] ?? ''));
    $date    = trim((string) ($body['date'] ?? ''));
    $start   = trim((string) ($body['start'] ?? ''));
    $eventId = GitHub::slugify($title) . "-{$date}-" . str_replace(':', '', $start);

    // Commit to GitHub synchronously so the user sees errors
    try {
        $gh = new GitHub();
        $gh->addEventToActiveCamp($body);
    } catch (\Throwable $e) {
        error_log('POST /add-event error: ' . $e->getMessage());
        jsonResponse(['success' => false, 'error' => 'Aktiviteten kunde inte sparas. Försök igen om en stund.'], 500);

        return;
    }

    // Session cookie (only if consent given) — set AFTER successful GitHub
    // commit so the browser never stores an ID for an event that failed to save.
    $consentGiven = ($body['cookieConsent'] ?? false) === true;
    if ($consentGiven) {
        $existing = Session::parseSessionIds($_SERVER['HTTP_COOKIE'] ?? '');
        $updated  = Session::mergeIds($existing, $eventId);
        $cookieDomain = !empty($_ENV['COOKIE_DOMAIN']) ? $_ENV['COOKIE_DOMAIN'] : null;
        header('Set-Cookie: ' . Session::buildSetCookieHeader($updated, $cookieDomain));
    }

    jsonResponse(['success' => true, 'eventId' => $eventId]);
}

function handleEditEvent(?array $activeCamp): void
{
    // Time-gating
    if ($activeCamp !== null) {
        $today = date('Y-m-d');
        if (TimeGate::isOutsideEditingPeriod(
            $today,
            (string) ($activeCamp['opens_for_editing'] ?? ''),
            (string) ($activeCamp['end_date'] ?? ''),
        )) {
            jsonResponse([
                'success' => false,
                'error'   => 'Det går inte att redigera aktiviteter just nu. Formuläret är inte öppet.',
            ], 403);

            return;
        }
    }

    $body = getJsonBody();

    $v = Validate::validateEditRequest($body, $activeCamp);
    if (!$v['ok']) {
        jsonResponse(['success' => false, 'error' => $v['error']], 400);

        return;
    }

    $eventId = trim((string) ($body['id'] ?? ''));

    // Verify ownership via session cookie
    $ownedIds = Session::parseSessionIds($_SERVER['HTTP_COOKIE'] ?? '');
    if (!in_array($eventId, $ownedIds, true)) {
        jsonResponse([
            'success' => false,
            'error'   => 'Ej behörig att redigera denna aktivitet.',
        ], 403);

        return;
    }

    // Reject past events
    $eventDate = trim((string) ($body['date'] ?? ''));
    if ($eventDate < date('Y-m-d')) {
        jsonResponse([
            'success' => false,
            'error'   => 'Aktiviteten har redan ägt rum och kan inte redigeras.',
        ], 400);

        return;
    }

    // Commit to GitHub synchronously so the user sees errors
    try {
        $gh = new GitHub();
        $gh->updateEventInActiveCamp($eventId, $body);
    } catch (\Throwable $e) {
        error_log('POST /edit-event error: ' . $e->getMessage());
        jsonResponse(['success' => false, 'error' => 'Ändringen kunde inte sparas. Försök igen om en stund.'], 500);

        return;
    }

    jsonResponse(['success' => true]);
}

// ── Utilities ────────────────────────────────────────────────────────────

/** @return array<string,mixed> */
function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) {
        return [];
    }
    $data = json_decode($raw, true);

    return is_array($data) ? $data : [];
}

/** @param array<string,mixed> $data */
function jsonResponse(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
}
