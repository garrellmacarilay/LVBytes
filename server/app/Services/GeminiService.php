<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\RequestException;

class GeminiService
{
    public function generate(string $prompt): string|array
    {
        $url = config('gemini.url') . "?key=" . config('gemini.key');

        // 1. Define Safety Settings
        // This tells Gemini: "Don't block content unless it is EXTREMELY unsafe."
        // This fixes 90% of the "[null]" issues.
        $safetySettings = [
            [
                "category" => "HARM_CATEGORY_HARASSMENT",
                "threshold" => "BLOCK_ONLY_HIGH"
            ],
            [
                "category" => "HARM_CATEGORY_HATE_SPEECH",
                "threshold" => "BLOCK_ONLY_HIGH"
            ],
            [
                "category" => "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold" => "BLOCK_ONLY_HIGH"
            ],
            [
                "category" => "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold" => "BLOCK_ONLY_HIGH"
            ]
        ];

        // 2. Make the Request
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($url, [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'safetySettings' => $safetySettings, // Add settings here
        ]);

        // 3. Handle HTTP Errors (400, 500, etc.)
        if ($response->failed()) {
            return [
                'error' => 'API Request Failed',
                'status' => $response->status(),
                'details' => $response->json()
            ];
        }

        $data = $response->json();

        // 4. Handle "Safety Block" or "Recitation" (The logic that returns NULL)
        // If 'content' is missing, the model refused to answer.
        if (!isset($data['candidates'][0]['content'])) {
            $reason = $data['candidates'][0]['finishReason'] ?? 'UNKNOWN';
            return [
                'error' => 'Model refused to generate content.',
                'reason' => $reason
            ];
        }

        // 5. Return ONLY the text
        // Navigate the deep JSON structure: candidates -> 0 -> content -> parts -> 0 -> text
        return $data['candidates'][0]['content']['parts'][0]['text'];
    }
}
