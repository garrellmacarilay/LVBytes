<?php

namespace App\Http\Controllers;

use App\Services\CrisisService;
use App\Services\OpenWeatherMapService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CrisisController extends Controller
{
    public function __construct(
        protected CrisisService $crisisService,
        protected OpenWeatherMapService $weatherService
    ) {}

    /**
     * Fetch active crisis alerts for a specific city.
     * Route: GET /api/crisis/{city}
     */
    public function show(string $city): JsonResponse
    {
        // 1. We need coordinates first. Re-use WeatherService to resolve City -> Lat/Lng.
        // (Alternatively, you could accept lat/lng directly in the Request)
        $locationData = $this->weatherService->getCurrentWeather($city);

        // Handle case where city is not found
        if (isset($locationData['error'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Could not locate city to check for alerts.',
                'details' => $locationData['message'] ?? ''
            ], 404);
        }

        $lat = $locationData['coord']['lat'];
        $lng = $locationData['coord']['lon'];

        // 2. Fetch Crisis Alerts using the coordinates
        $rawAlerts = $this->crisisService->getActiveAlerts($lat, $lng);
        $formattedAlerts = $this->crisisService->formatAlerts($rawAlerts);

        // 3. Return response
        return response()->json([
            'status' => 'success',
            'location' => [
                'city' => $locationData['name'],
                'country' => $locationData['sys']['country'] ?? null,
                'coordinates' => ['lat' => $lat, 'lng' => $lng]
            ],
            'alerts_count' => count($formattedAlerts),
            'alerts' => $formattedAlerts,
        ]);
    }
}
