<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CloudUploadService
{
    /**
     * Upload a file to Cloudinary if configured, otherwise fall back to Laravel local disk.
     *
     * @param UploadedFile $file
     * @param string $folder
     * @param string|null $currentPath
     * @return string Permanent URL (Cloudinary) or relative storage path
     */
    public static function upload(UploadedFile $file, string $folder = 'uploads', ?string $currentPath = null): string
    {
        // 1. Delete previous local file if applicable
        if ($currentPath && !Str::startsWith($currentPath, ['http://', 'https://'])) {
            try {
                if (Storage::disk('public')->exists($currentPath)) {
                    Storage::disk('public')->delete($currentPath);
                }
            } catch (\Throwable $e) {
                // Ignore deletion error
            }
        }

        // 2. Check for Cloudinary configuration
        $rawCloudinaryUrl = env('CLOUDINARY_URL', 'cloudinary://561445241888493:6filZaA54OQql93hU9EyrqwhQO8@gkabrska');
        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        $apiKey = env('CLOUDINARY_API_KEY');
        $apiSecret = env('CLOUDINARY_API_SECRET');
        $uploadPreset = env('CLOUDINARY_UPLOAD_PRESET');

        if ($rawCloudinaryUrl) {
            $cleanUrl = preg_replace('/^(CLOUDINARY_URL=)+/i', '', trim($rawCloudinaryUrl));
            $parsed = parse_url($cleanUrl);
            if (!empty($parsed['host'])) {
                $cloudName = $parsed['host'];
            }
            if (!empty($parsed['user'])) {
                $apiKey = $parsed['user'];
            }
            if (!empty($parsed['pass'])) {
                $apiSecret = $parsed['pass'];
            }
        }

        $cloudName = $cloudName ?: env('CLOUDINARY_CLOUD_NAME', 'gkabrska');
        $apiKey = $apiKey ?: env('CLOUDINARY_API_KEY', '561445241888493');
        $apiSecret = $apiSecret ?: env('CLOUDINARY_API_SECRET', '6filZaA54OQql93hU9EyrqwhQO8');

        if ($cloudName) {
            try {
                $timestamp = time();
                $params = [
                    'timestamp' => $timestamp,
                    'folder' => $folder,
                ];

                if ($uploadPreset) {
                    $params['upload_preset'] = $uploadPreset;
                } elseif ($apiSecret) {
                    $signString = "folder={$folder}&timestamp={$timestamp}" . $apiSecret;
                    $params['api_key'] = $apiKey;
                    $params['signature'] = sha1($signString);
                }

                $extension = strtolower($file->getClientOriginalExtension());
                $resourceType = in_array($extension, ['pdf', 'doc', 'docx', 'zip']) ? 'raw' : 'image';

                $response = Http::timeout(45)
                    ->attach('file', file_get_contents($file->getRealPath()), $file->getClientOriginalName())
                    ->post("https://api.cloudinary.com/v1_1/{$cloudName}/{$resourceType}/upload", $params);

                if ($response->successful()) {
                    $data = $response->json();
                    if (!empty($data['secure_url'])) {
                        return $data['secure_url'];
                    }
                } else {
                    Log::warning('Cloudinary upload returned non-200: ' . $response->body());
                }
            } catch (\Throwable $e) {
                Log::error('Cloudinary upload failed, falling back to local: ' . $e->getMessage());
            }
        }

        // 3. Fallback: Save to local storage disk
        $fileName = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
        return $file->storeAs($folder, $fileName, 'public');
    }
}
