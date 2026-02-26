<?php

declare(strict_types=1);

namespace SBSommar;

use Symfony\Component\Yaml\Yaml;

/**
 * GitHub Contents API integration – mirrors source/api/github.js.
 */
final class GitHub
{
    private string $owner;
    private string $repo;
    private string $branch;
    private string $token;
    private ?string $buildEnv;

    private const CAMPS_PATH = 'source/data/camps.yaml';

    public function __construct()
    {
        $this->owner    = self::env('GITHUB_OWNER');
        $this->repo     = self::env('GITHUB_REPO');
        $this->branch   = self::env('GITHUB_BRANCH');
        $this->token    = self::env('GITHUB_TOKEN');
        $this->buildEnv = $_ENV['BUILD_ENV'] ?? null;
    }

    // ── Public API ───────────────────────────────────────────────────────

    /**
     * Append a new event to the active camp's YAML file via ephemeral
     * branch → PR → auto-merge.
     *
     * @param array<string,mixed> $body  Validated request body
     */
    public function addEventToActiveCamp(array $body): void
    {
        $title       = trim((string) ($body['title'] ?? ''));
        $date        = trim((string) ($body['date'] ?? ''));
        $start       = trim((string) ($body['start'] ?? ''));
        $end         = trim((string) ($body['end'] ?? ''));
        $location    = trim((string) ($body['location'] ?? ''));
        $responsible = trim((string) ($body['responsible'] ?? ''));
        $description = is_string($body['description'] ?? null) ? trim($body['description']) : null;
        $link        = is_string($body['link'] ?? null) ? trim($body['link']) : null;
        $ownerName   = is_string($body['ownerName'] ?? null) ? trim($body['ownerName']) : '';

        $description = $description !== '' ? $description : null;
        $link        = $link !== '' ? $link : null;

        $now = (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))->format('Y-m-d H:i');

        $event = [
            'id'          => self::slugify($title) . "-{$date}-" . str_replace(':', '', $start),
            'title'       => $title,
            'date'        => $date,
            'start'       => $start,
            'end'         => $end,
            'location'    => $location,
            'responsible' => $responsible,
            'description' => $description,
            'link'        => $link,
            'owner'       => ['name' => $ownerName, 'email' => ''],
            'meta'        => ['created_at' => $now, 'updated_at' => $now],
        ];

        // 1. Resolve active camp
        $camp         = $this->resolveActiveCamp();
        $campFilePath = 'source/data/' . $camp['file'];

        // 2. Fetch camp file
        [$campContent, $fileSha] = $this->getFile($campFilePath);

        // 3. Build new content
        $newContent = rtrim($campContent) . "\n" . self::buildEventYaml($event, 2) . "\n";
        $commitMsg  = "Add event to {$camp['name']}: {$title} ({$date})";

        // 4. Ephemeral branch
        $mainSha    = $this->getMainSha();
        $branchName = 'event/' . $date . '-' . self::slugify($title) . '-' . time();
        $this->createBranch($branchName, $mainSha);

        // 5. Commit
        $this->putFile($campFilePath, $newContent, $fileSha, $commitMsg, $branchName);

        // 6. PR + auto-merge
        $pr = $this->createPullRequest($commitMsg, $branchName, 'Automatically created by the SB Sommar add-event API.');
        $this->enableAutoMerge($pr['node_id']);
    }

    /**
     * Patch an existing event in the active camp's YAML file.
     *
     * @param array<string,mixed> $updates  Validated request body
     */
    public function updateEventInActiveCamp(string $eventId, array $updates): void
    {
        // 1. Resolve active camp
        $camp         = $this->resolveActiveCamp();
        $campFilePath = 'source/data/' . $camp['file'];

        // 2. Fetch camp file
        [$campContent, $fileSha] = $this->getFile($campFilePath);

        // 3. Patch
        $newContent = self::patchEventInYaml($campContent, $eventId, $updates);
        if ($newContent === null) {
            throw new \RuntimeException("Event not found: {$eventId}");
        }

        $commitMsg = "Edit event in {$camp['name']}: {$eventId}";

        // 4. Ephemeral branch → commit → PR → auto-merge
        $mainSha    = $this->getMainSha();
        $branchName = "event-edit/{$eventId}-" . time();
        $this->createBranch($branchName, $mainSha);
        $this->putFile($campFilePath, $newContent, $fileSha, $commitMsg, $branchName);
        $pr = $this->createPullRequest($commitMsg, $branchName, 'Automatically created by the SB Sommar edit-event API.');
        $this->enableAutoMerge($pr['node_id']);
    }

    // ── Camp resolution ──────────────────────────────────────────────────

    /** @return array<string,mixed> */
    private function resolveActiveCamp(): array
    {
        [$campsYaml] = $this->getFile(self::CAMPS_PATH);
        $data = Yaml::parse($campsYaml);

        return ActiveCamp::resolve($data['camps'] ?? [], null, $this->buildEnv);
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    public static function slugify(string $str): string
    {
        $str = mb_strtolower($str);
        $str = strtr($str, ['å' => 'a', 'ä' => 'a', 'ö' => 'o']);
        $str = (string) preg_replace('/[^a-z0-9]+/', '-', $str);
        $str = trim($str, '-');

        return substr($str, 0, 48);
    }

    /**
     * Wrap a YAML scalar in single quotes only when necessary.
     */
    public static function yamlScalar(mixed $val): string
    {
        if ($val === null) {
            return 'null';
        }
        $s = (string) $val;
        if ($s === '') {
            return "''";
        }
        if (preg_match('/[:#{}[\],&*?|<>=!%@`]/', $s)
            || preg_match('/^[\s"\'0-9]/', $s)
            || $s !== trim($s)
        ) {
            return "'" . str_replace("'", "''", $s) . "'";
        }

        return $s;
    }

    /**
     * Serialise a single event as a YAML block ready to append.
     */
    public static function buildEventYaml(array $event, int $indent = 0): string
    {
        $p  = str_repeat(' ', $indent);       // prefix for "- id:" line
        $fp = str_repeat(' ', $indent + 2);   // prefix for field lines
        $dp = str_repeat(' ', $indent + 4);   // prefix for description body

        $lines = [
            "{$p}- id: {$event['id']}",
            "{$fp}title: " . self::yamlScalar($event['title']),
            "{$fp}date: '{$event['date']}'",
            "{$fp}start: '{$event['start']}'",
            "{$fp}end: '{$event['end']}'",
            "{$fp}location: " . self::yamlScalar($event['location']),
            "{$fp}responsible: " . self::yamlScalar($event['responsible']),
        ];

        if ($event['description'] !== null) {
            $lines[] = "{$fp}description: |";
            foreach (explode("\n", $event['description']) as $l) {
                $lines[] = "{$dp}{$l}";
            }
        } else {
            $lines[] = "{$fp}description: null";
        }

        $lines[] = "{$fp}link: " . ($event['link'] !== null ? self::yamlScalar($event['link']) : 'null');
        $lines[] = "{$fp}owner:";
        $lines[] = "{$dp}name: '" . str_replace("'", "''", $event['owner']['name'] ?? '') . "'";
        $lines[] = "{$dp}email: ''";
        $lines[] = "{$fp}meta:";
        $lines[] = "{$dp}created_at: {$event['meta']['created_at']}";
        $lines[] = "{$dp}updated_at: {$event['meta']['updated_at']}";

        return implode("\n", $lines);
    }

    /**
     * Patch an event in a YAML string, returning the new YAML or null if not found.
     */
    public static function patchEventInYaml(string $yamlContent, string $eventId, array $updates): ?string
    {
        $data = Yaml::parse($yamlContent);
        if (!is_array($data) || !is_array($data['events'] ?? null)) {
            return null;
        }

        $idx = null;
        foreach ($data['events'] as $i => $event) {
            if (($event['id'] ?? null) === $eventId) {
                $idx = $i;
                break;
            }
        }
        if ($idx === null) {
            return null;
        }

        $event = $data['events'][$idx];
        $now   = (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))->format('Y-m-d H:i');

        $data['events'][$idx] = [
            'id'          => $event['id'],
            'title'       => array_key_exists('title', $updates) ? ($updates['title'] ?: $event['title']) : $event['title'],
            'date'        => array_key_exists('date', $updates) ? ($updates['date'] ?: $event['date']) : $event['date'],
            'start'       => array_key_exists('start', $updates) ? ($updates['start'] ?: $event['start']) : $event['start'],
            'end'         => array_key_exists('end', $updates) ? ($updates['end'] ?: null) : $event['end'],
            'location'    => array_key_exists('location', $updates) ? ($updates['location'] ?: $event['location']) : $event['location'],
            'responsible' => array_key_exists('responsible', $updates) ? ($updates['responsible'] ?: $event['responsible']) : $event['responsible'],
            'description' => array_key_exists('description', $updates) ? ($updates['description'] ?: null) : ($event['description'] ?? null),
            'link'        => array_key_exists('link', $updates) ? ($updates['link'] ?: null) : ($event['link'] ?? null),
            'owner'       => $event['owner'] ?? null,
            'meta'        => [
                'created_at' => $event['meta']['created_at'] ?? null,
                'updated_at' => $now,
            ],
        ];

        return Yaml::dump($data, 4, 2, Yaml::DUMP_NULL_AS_TILDE);
    }

    // ── GitHub API primitives ────────────────────────────────────────────

    private static function env(string $name): string
    {
        $val = $_ENV[$name] ?? '';
        if ($val === '') {
            throw new \RuntimeException("Missing environment variable: {$name}");
        }

        return $val;
    }

    /**
     * @return array{string,string} [content, sha]
     */
    private function getFile(string $filePath): array
    {
        $apiPath = "/repos/{$this->owner}/{$this->repo}/contents/{$filePath}?ref={$this->branch}";
        $data = $this->githubRequest('GET', $apiPath);

        $content = base64_decode($data['content'], true);

        return [$content, $data['sha']];
    }

    private function putFile(string $filePath, string $content, string $sha, string $message, string $branch): void
    {
        $apiPath = "/repos/{$this->owner}/{$this->repo}/contents/{$filePath}";
        $this->githubRequest('PUT', $apiPath, [
            'message' => $message,
            'content' => base64_encode($content),
            'sha'     => $sha,
            'branch'  => $branch,
        ]);
    }

    private function getMainSha(): string
    {
        $apiPath = "/repos/{$this->owner}/{$this->repo}/git/refs/heads/{$this->branch}";
        $data = $this->githubRequest('GET', $apiPath);

        return $data['object']['sha'];
    }

    private function createBranch(string $name, string $sha): void
    {
        $apiPath = "/repos/{$this->owner}/{$this->repo}/git/refs";
        $this->githubRequest('POST', $apiPath, [
            'ref' => "refs/heads/{$name}",
            'sha' => $sha,
        ]);
    }

    /**
     * @return array{number:int,node_id:string}
     */
    private function createPullRequest(string $title, string $head, string $body): array
    {
        $apiPath = "/repos/{$this->owner}/{$this->repo}/pulls";
        $data = $this->githubRequest('POST', $apiPath, [
            'title' => $title,
            'head'  => $head,
            'base'  => $this->branch,
            'body'  => $body,
        ]);

        return ['number' => $data['number'], 'node_id' => $data['node_id']];
    }

    private function enableAutoMerge(string $nodeId): void
    {
        $query = '
            mutation($id: ID!) {
                enablePullRequestAutoMerge(input: { pullRequestId: $id, mergeMethod: SQUASH }) {
                    pullRequest { number }
                }
            }
        ';

        $data = $this->githubRequest('POST', '/graphql', [
            'query'     => $query,
            'variables' => ['id' => $nodeId],
        ]);

        if (!empty($data['errors'])) {
            throw new \RuntimeException('GraphQL error enabling auto-merge: ' . $data['errors'][0]['message']);
        }
    }

    /**
     * Make a single HTTPS request to the GitHub API.
     *
     * @return array<string,mixed>
     */
    private function githubRequest(string $method, string $path, ?array $body = null): array
    {
        $url = 'https://api.github.com' . $path;
        $payload = $body !== null ? json_encode($body, JSON_UNESCAPED_UNICODE) : null;

        $headers = [
            'Authorization: Bearer ' . $this->token,
            'Accept: application/vnd.github+json',
            'User-Agent: sbsommar-api/1.0',
            'X-GitHub-Api-Version: 2022-11-28',
        ];
        if ($payload !== null) {
            $headers[] = 'Content-Type: application/json';
            $headers[] = 'Content-Length: ' . strlen($payload);
        }

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST  => $method,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 30,
        ]);
        if ($payload !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        }

        $response   = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError  = curl_error($ch);
        curl_close($ch);

        if ($response === false) {
            throw new \RuntimeException("GitHub API request failed: {$curlError}");
        }

        $data = json_decode($response, true) ?? [];

        if ($statusCode >= 400) {
            $msg = $data['message'] ?? $response;
            throw new \RuntimeException("GitHub API {$statusCode}: {$msg}");
        }

        return $data;
    }
}
