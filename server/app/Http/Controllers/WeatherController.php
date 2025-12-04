<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\WeatherUpdated;
use Illuminate\Http\JsonResponse;
use App\Services\OpenWeatherMapService;


class WeatherController extends Controller
{
    public function __construct(
        protected OpenWeatherMapService $weatherService
    ) {}

    public function show(string $city): JsonResponse
    {
        $weatherData = $this->weatherService->getCurrentWeather($city);

        if (isset($weatherData['error'])) {
            $status = $weatherData['status'] ?? 500;

            return response()->json([
                'status' => 'error',
                'message' => $weatherData['message'] ?? $weatherData['error']
            ], $status);
        }

        $formatted = $this->formatWeatherResponse($weatherData);

        return response()->json([
            'status' => 'success',
            'data' => $formatted,
        ]);
    }

    protected function formatWeatherResponse(array $data)
    {
        return [
            'city_name' => $data['name'],
            'country' => $data['sys']['country'] ?? 'N/A',
            'temperature' => $data['main']['temp'], // Temperature in Celsius
            'feels_like' => $data['main']['feels_like'],
            'humidity' => $data['main']['humidity'],
            'description' => $data['weather'][0]['description'] ?? 'No description',
            'icon' => $data['weather'][0]['icon'] ?? null,
            'rainfall'    => $data['rain']['1h'] ?? 0,
            'wind_speed' => $data['wind']['speed'],
        ];
    }
}
