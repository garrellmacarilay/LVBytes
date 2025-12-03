<?php

return [
    'base_url' => env('OPENWEATHER_URL', 'https://api.openweathermap.org/data/2.5'),
    'api_key' => env('OPENWEATHER_KEY'),
    'units' => 'metric', // default to metric for Celsius
];
