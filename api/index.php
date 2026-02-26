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

    // Session cookie (only if consent given)
    $consentGiven = ($body['cookieConsent'] ?? false) === true;
    if ($consentGiven) {
        $existing = Session::parseSessionIds($_SERVER['HTTP_COOKIE'] ?? '');
        $updated  = Session::mergeIds($existing, $eventId);
        header('Set-Cookie: ' . Session::buildSetCookieHeader($updated, $_ENV['COOKIE_DOMAIN'] ?? null));
    }

    // Respond immediately, then commit in background
    jsonResponse(['success' => true, 'eventId' => $eventId]);

    // Flush output to client before GitHub work
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    }

    // Background: commit to GitHub
    try {
        $gh = new GitHub();
        $gh->addEventToActiveCamp($body);
    } catch (\Throwable $e) {
        error_log('POST /add-event background error: ' . $e->getMessage());
    }
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

    jsonResponse(['success' => true]);

    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    }

    try {
        $gh = new GitHub();
        $gh->updateEventInActiveCamp($eventId, $body);
    } catch (\Throwable $e) {
        error_log('POST /edit-event background error: ' . $e->getMessage());
    }
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
