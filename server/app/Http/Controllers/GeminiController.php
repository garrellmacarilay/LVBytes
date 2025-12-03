<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GeminiService;

class GeminiController extends Controller
{
    public function chat(Request $request, GeminiService $gemini)
    {
        $request->validate([
            'prompt' => 'required|string'
        ]);

        $prompt = $request->input('prompt');

        $result = $gemini->generate($prompt);


        // Check if we got an error array back
        if (is_array($result) && isset($result['error'])) {
            return response()->json($result, 400);
        }

        // Otherwise, $result is the plain text string
        return response()->json([
            'response' => $result
        ]);
    }

}
