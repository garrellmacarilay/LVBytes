<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class MapService
{
    public function geocode(string $address)
    {
        return Http::get(config('map.maps.geocode_url'), [
            'address' => $address,
            'key' => config('map.maps.key')
        ])->json();
    }

    public function reverseGeocode(float $lat, float $lon)
    {
        return Http::get(config('map.maps.geocode_url'), [
            'latlng' => "{$lat},{$lon}",
            'key' => config('map.maps.key')
        ])->json();
    }

    public function nearby(float $lat, float $lon, int $radius = 1500, ?string $keyword = null)
    {
        return Http::get(config('map.maps.places_url'), array_filter([
            'location' => "{$lat},{$lon}",
            'radius' => $radius,
            'keyword' => $keyword,
            'key' => config('map.maps.key')
        ]))->json();
    }
}
