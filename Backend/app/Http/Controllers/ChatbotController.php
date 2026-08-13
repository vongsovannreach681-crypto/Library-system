<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class ChatbotController extends Controller
{
    public function respond(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'nullable|string|min:1|max:4000',
            'messages' => 'nullable|array|max:12',
            'messages.*.role' => 'required_with:messages|in:user,assistant',
            'messages.*.content' => 'required_with:messages|string|min:1|max:4000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid chatbot request.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $apiKey = config('services.openai.key');
        if (!$apiKey) {
            return response()->json([
                'message' => 'OpenAI API key is not configured on the server.',
            ], 500);
        }

        $incomingMessages = $request->input('messages', []);
        if (empty($incomingMessages) && $request->filled('message')) {
            $incomingMessages = [
                ['role' => 'user', 'content' => $request->string('message')->toString()],
            ];
        }

        $messages = array_merge([
            [
                'role' => 'system',
                'content' => 'You are a helpful, friendly assistant inside a social reading app. Keep replies concise, practical, and warm. Focus on books, reading, posts, favorites, profiles, and navigation tips.',
            ],
        ], $this->normalizeMessages($incomingMessages));

        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->asJson()
            ->timeout(30)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('services.openai.chat_model', 'gpt-5.6-luna'),
                'messages' => $messages,
            ]);

        if (!$response->successful()) {
            return response()->json([
                'message' => 'The chatbot request failed.',
                'details' => $response->json(),
            ], $response->status() ?: 502);
        }

        $payload = $response->json();
        $reply = trim((string) data_get($payload, 'choices.0.message.content', ''));

        if ($reply === '') {
            $reply = $this->extractFallbackReply($payload);
        }

        if ($reply === '') {
            $reply = 'I could not generate a reply right now.';
        }

        return response()->json([
            'reply' => $reply,
            'model' => data_get($payload, 'model'),
        ]);
    }

    private function normalizeMessages(array $messages): array
    {
        return collect($messages)
            ->map(function ($message) {
                return [
                    'role' => $message['role'] ?? null,
                    'content' => trim((string) ($message['content'] ?? '')),
                ];
            })
            ->filter(function ($message) {
                return in_array($message['role'], ['user', 'assistant'], true)
                    && $message['content'] !== '';
            })
            ->values()
            ->all();
    }

    private function extractFallbackReply(array $payload): string
    {
        $parts = [];

        foreach (data_get($payload, 'output', []) as $item) {
            if (($item['type'] ?? null) !== 'message') {
                continue;
            }

            foreach (($item['content'] ?? []) as $content) {
                if (!empty($content['text'])) {
                    $parts[] = $content['text'];
                }
            }
        }

        return trim(implode("\n", $parts));
    }
}
