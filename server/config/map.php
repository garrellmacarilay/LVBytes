<?php

return [
    'maps' => [
        'key' => env('GOOGLE_MAP_KEY'),
        'geocode_url' => env('GOOGLE_GEOCODE_URL', 'https://maps.googleapis.com/maps/api/geocode/json'),
        'places_url' => env('GOOGLE_PLACES_URL', 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'),
    ]
];
