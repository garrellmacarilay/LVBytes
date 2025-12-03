<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MapController;
use App\Http\Controllers\GeminiController;
use App\Http\Controllers\WeatherController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

//weather
Route::get('/weather/{city}', [WeatherController::class, 'show']);

//map api
Route::get('/map/geocode/{address}', [MapController::class, 'geocode']);
Route::get('/map/reverse/{lat}/{lon}', [MapController::class, 'reverse']);
Route::get('/map/nearby', [MapController::class, 'nearby']);

//gemini api
Route::post('/ask-ai', [GeminiController::class, 'chat']);


