<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;

class OpenWeatherMapService
{
    /**
     * Create a new class instance.
     */
    protected string $baseUrl = 'https://api.openweathermap.org/data/2.5/';

    protected string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('weather.api_key');
    }

    public function getCurrentWeather(string $city): array
    {
        if (empty($this->apiKey)) {
            return ['error' => 'OpenWeatherMap API Key is missing in configuration.'];
        }

        try {
            $res = Http::get($this->baseUrl . 'weather', [
                'q' => $city,
                'appid' => $this->apiKey,
                // Add units=metric for Celsius, or units=imperial for Fahrenheit
                'units' => 'metric',
            ]);

            if ($res->successful()) {
                return $res->json();
            }

            return [
                'error' => 'API Request Failed',
                'status' => $res->status(),
                'message' => $res->json('message') ?? $res->body(),
            ];
        } catch (Exception $e) {
            return [
                'error' => 'An exception occurred during the request.',
                'message' => $e->getMessage(),
            ];
        }
    }
}
