<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class CrisisService
{
    /**
     * Create a new class instance.
     */

    protected string $apiKey;
    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('crisis.key');
        $this->baseUrl = config('crisis.url');

        if (empty($this->apiKey)) {
            throw new RuntimeException("Google Crisis API key is not configured.");
        }
    }

    public function getActiveAlerts(float $lat, float $lng): array
    {
        $res = Http::get($this->baseUrl, [
            'key' => $this->apiKey,
            'location.latitude'  => $lat,
            'location.longitude' => $lng
        ]);

        if ($res->failed()) {
            return [
                'error' => true,
                'message' => 'Failed to fetch crisis alerts',
                'details' => $res->json()
            ];
        }

        $data = $res->json();

        return $data['weatherAlerts'] ?? $data['alerts'] ?? [];
    }

    public function formatAlerts(array $alerts): array
    {
        if (empty($alerts)) {
            return [];
        }

        return array_map(function ($alert) {
            return [
                'type' => $alert['eventType'] ?? 'Unknown',
                'severity' => $alert['severity'] ?? 'Unknown',
                'urgency' => $alert['urgency'] ?? 'Unknown',
                'headline' => $alert['alertTitle']['text'] ?? 'Emergency Alert',
                'description' => $alert['description'] ?? 'No details available.',
                'source' => $alert['dataSource']['sender'] ?? 'Official Authority',
                'link' => $alert['web'] ?? null,
            ];
        }, $alerts);
    }
}
