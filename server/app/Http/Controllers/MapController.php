<?php

namespace App\Http\Controllers;

use App\Services\MapService;
use Illuminate\Http\Request;

class MapController extends Controller
{
    protected $mapService;

    public function __construct(MapService $mapService)
    {
        $this->mapService = $mapService;
    }

    public function geocode($address)
    {
        return response()->json($this->mapService->geocode($address));
    }

    public function reverse($lat, $lon)
    {
        return response()->json($this->mapService->reverseGeocode($lat, $lon));
    }

    public function nearby(Request $request)
    {
        return response()->json(
            $this->mapService->nearby($request->lat, $request->lon, $request->radius, $request->keyword)
        );
    }
}
