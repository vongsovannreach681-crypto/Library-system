<?php

namespace App\Http\Controllers;

use App\Models\Books;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Throwable;

class ChatbotController extends Controller
{
    public function respond(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'nullable|string|min:1|max:4000',
            'messages' => 'nullable|array|max:20',
            'messages.*.role' => 'required_with:messages|in:user,assistant',
            'messages.*.content' => 'required_with:messages|string|min:1|max:4000',
            'language' => 'nullable|string|in:km,en',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid chatbot request.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $incomingMessages = $request->input('messages', []);
        if (empty($incomingMessages) && $request->filled('message')) {
            $incomingMessages = [
                ['role' => 'user', 'content' => $request->string('message')->toString()],
            ];
        }

        $normalized = $this->normalizeMessages($incomingMessages);
        $userText = $request->string('message')->toString();
        if (empty($userText) && !empty($normalized)) {
            $lastUser = collect($normalized)->reverse()->firstWhere('role', 'user');
            $userText = $lastUser['content'] ?? '';
        }

        $language = $request->input('language');
        if (!$language) {
            $language = preg_match('/[\x{1780}-\x{17FF}]/u', $userText) ? 'km' : 'en';
        }

        $geminiKey = config('services.gemini.key');
        $openAiKey = config('services.openai.key');

        // 1. Try Gemini API if key is configured
        if (!empty($geminiKey)) {
            try {
                $geminiReply = $this->callGemini($geminiKey, $normalized, $language);
                if (!empty($geminiReply)) {
                    return response()->json([
                        'reply' => $geminiReply,
                        'provider' => 'gemini',
                        'model' => config('services.gemini.model', 'gemini-2.0-flash'),
                    ]);
                }
            } catch (Throwable $e) {
                Log::warning('Gemini API call failed: ' . $e->getMessage());
            }
        }

        // 2. Try OpenAI API if key is configured
        if (!empty($openAiKey)) {
            try {
                $openAiReply = $this->callOpenAI($openAiKey, $normalized, $language);
                if (!empty($openAiReply)) {
                    return response()->json([
                        'reply' => $openAiReply,
                        'provider' => 'openai',
                        'model' => config('services.openai.chat_model', 'gpt-4o-mini'),
                    ]);
                }
            } catch (Throwable $e) {
                Log::warning('OpenAI API call failed: ' . $e->getMessage());
            }
        }

        // 3. Smart local fallback engine (Zero-downtime, database-aware)
        $fallbackReply = $this->buildSmartFallback($userText, $language, $normalized);

        return response()->json([
            'reply' => $fallbackReply,
            'provider' => 'smart-engine',
            'model' => 'reach-assistant-v2',
        ]);
    }

    private function getSystemPrompt(string $language): string
    {
        $bookContext = $this->getDatabaseBookContext();

        $prompt = "You are Reach Assistant (MAX), a warm, intelligent, and helpful AI assistant for a Social Reading and Library web application.\n";
        $prompt .= "You can communicate fluently in both Khmer (ភាសាខ្មែរ) and English.\n";
        $prompt .= "Default language preference for this conversation: " . ($language === 'km' ? 'Khmer' : 'English') . ".\n";
        $prompt .= "Guidelines:\n";
        $prompt .= "- Provide concise, insightful, and friendly answers about books, authors, genres, reading tips, social posts, favorites, and using the website features.\n";
        $prompt .= "- Format your responses neatly using clear paragraphs, bullet points, and bold text when listing recommendations.\n";
        $prompt .= "- When users ask for book recommendations, you can suggest famous worldwide classics as well as books currently available in our library.\n\n";

        if (!empty($bookContext)) {
            $prompt .= "Current books available in the app library:\n" . $bookContext . "\n\n";
        }

        return $prompt;
    }

    private function getDatabaseBookContext(): string
    {
        try {
            $books = Books::with('category')->latest()->take(12)->get();
            if ($books->isEmpty()) {
                return '';
            }

            $lines = [];
            foreach ($books as $book) {
                $cat = $book->category ? $book->category->name : 'General';
                $rating = $book->star_rating ? " ({$book->star_rating}★)" : '';
                $lines[] = "- \"{$book->title}\" by {$book->author} [Category: {$cat}]{$rating}";
            }

            return implode("\n", $lines);
        } catch (Throwable $e) {
            return '';
        }
    }

    private function callGemini(string $apiKey, array $messages, string $language): ?string
    {
        $model = config('services.gemini.model', 'gemini-2.0-flash');
        $systemPrompt = $this->getSystemPrompt($language);

        $contents = [];
        foreach ($messages as $msg) {
            $role = ($msg['role'] === 'assistant') ? 'model' : 'user';
            $contents[] = [
                'role' => $role,
                'parts' => [
                    ['text' => $msg['content']],
                ],
            ];
        }

        if (empty($contents)) {
            return null;
        }

        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        $payload = [
            'systemInstruction' => [
                'parts' => [
                    ['text' => $systemPrompt],
                ],
            ],
            'contents' => $contents,
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 1000,
            ],
        ];

        $response = Http::acceptJson()
            ->asJson()
            ->timeout(20)
            ->post($url, $payload);

        if (!$response->successful()) {
            Log::warning('Gemini API returned error: ' . $response->body());
            return null;
        }

        $data = $response->json();
        $text = data_get($data, 'candidates.0.content.parts.0.text');

        return !empty($text) ? trim($text) : null;
    }

    private function callOpenAI(string $apiKey, array $messages, string $language): ?string
    {
        $model = config('services.openai.chat_model', 'gpt-4o-mini');
        $systemPrompt = $this->getSystemPrompt($language);

        $chatMessages = array_merge([
            ['role' => 'system', 'content' => $systemPrompt],
        ], $messages);

        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->asJson()
            ->timeout(20)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $model,
                'messages' => $chatMessages,
                'max_tokens' => 1000,
                'temperature' => 0.7,
            ]);

        if (!$response->successful()) {
            Log::warning('OpenAI API returned error: ' . $response->body());
            return null;
        }

        $payload = $response->json();
        $reply = trim((string) data_get($payload, 'choices.0.message.content', ''));

        return $reply !== '' ? $reply : null;
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

    private function buildSmartFallback(string $userText, string $language, array $history = []): string
    {
        $lower = mb_strtolower(trim($userText), 'UTF-8');
        $isKhmer = $language === 'km' || preg_match('/[\x{1780}-\x{17FF}]/u', $userText);

        // Greetings
        if (preg_match('/(hi|hello|hey|greetings|សួស្តី|ជំរាបសួរ|សួស្ដី)/ui', $lower)) {
            return $isKhmer
                ? "សួស្តី! ខ្ញុំជា **Reach Assistant (MAX)** 🤖 ជំនួយការ AI របស់អ្នក។\n\nខ្ញុំអាចជួយអ្នកជាមួយ៖\n- 📚 **ណែនាំសៀវភៅល្អៗ** តាមចំណូលចិត្ត\n- ✍️ **គំនិតសរសេរការបង្ហោះ (Post)** ក្នុងប្លុក\n- ❤️ **ការគ្រប់គ្រងសៀវភៅចូលចិត្ត (Favorites)**\n- 🔍 **ការស្វែងរកសៀវភៅ និងប្រភេទសៀវភៅ**\n- ⚙️ **របៀបប្រើប្រាស់កម្មវិធី និងកែប្រែ Profile**\n\nតើអ្នកចង់ដឹងអំពីអ្វីដែរ?"
                : "Hello! I'm **Reach Assistant (MAX)** 🤖, your AI companion.\n\nI can help you with:\n- 📚 **Book recommendations** by genre & mood\n- ✍️ **Post & caption ideas** for the social feed\n- ❤️ **Managing your favorites**\n- 🔍 **Searching books & categories**\n- ⚙️ **App navigation & profile settings**\n\nHow can I help you today?";
        }

        // How are you
        if (preg_match('/(how are you|how\'s it going|សុខសប្បាយ|សុខទេ)/ui', $lower)) {
            return $isKhmer
                ? "ខ្ញុំសុខសប្បាយធម្មតាទេ អរគុណច្រើនដែលបានសួរ! 😊 ខ្ញុំត្រៀមខ្លួនជានិច្ចដើម្បីជួយអ្នករកសៀវភៅល្អៗ ឬឆ្លើយសំណួរផ្សេងៗ។"
                : "I'm doing great, thank you for asking! 😊 I'm always ready to help you discover great books or answer any questions about the app.";
        }

        // About / Who are you
        if (preg_match('/(who are you|what is your name|your name|អ្នកជាអ្នកណា|ឈ្មោះអ្វី)/ui', $lower)) {
            return $isKhmer
                ? "ខ្ញុំឈ្មោះ **Reach Assistant (MAX)** ជាជំនួយការ AI ប្រចាំកម្មវិធី Social Reading នេះ។ ខ្ញុំអាចជួយអ្នកស្វែងរកសៀវភៅ ណែនាំគំនិតសរសេរ និងជួយសម្រួលដល់ការប្រើប្រាស់វេទិកានេះ។"
                : "I am **Reach Assistant (MAX)**, your AI assistant in this Social Reading & Library platform. I'm here to recommend books, generate post ideas, and guide you through the app features.";
        }

        // Thanks
        if (preg_match('/(thank|thanks|អរគុណ|អរគុណច្រើន)/ui', $lower)) {
            return $isKhmer
                ? "រីករាយណាស់ដែលបានជួយ! សូមកុំស្ទាក់ស្ទើរក្នុងការសួរខ្ញុំបន្ថែម ប្រសិនបើអ្នកត្រូវការអ្វីផ្សេងទៀត។ 📖✨"
                : "You're very welcome! Feel free to ask whenever you need more recommendations or tips. Happy reading! 📖✨";
        }

        // Book recommendations
        if (preg_match('/(book|novel|recommend|suggest|read|reading|សៀវភៅ|ប្រលោមលោក|ណែនាំ|អាន)/ui', $lower)) {
            $dbBooks = '';
            try {
                $found = Books::latest()->take(3)->get();
                if ($found->isNotEmpty()) {
                    $bookList = $found->map(fn($b) => "• **{$b->title}** (ដោយ {$b->author})")->implode("\n");
                    $dbBooks = "\n\n📖 **សៀវភៅដែលមានស្រាប់ក្នុងបណ្ណាល័យយើង៖**\n" . $bookList;
                }
            } catch (Throwable $e) {}

            if (preg_match('/(mystery|crime|thriller|suspense|អាថ៌កំបាំង|ចម្លែក)/ui', $lower)) {
                return $isKhmer
                    ? "សម្រាប់ប្រភេទ **Mystery & Thriller** (រឿងអាថ៌កំបាំង/រន្ធត់) ខ្ញុំសូមណែនាំ៖\n1. **The Silent Patient** — Alex Michaelides (អាថ៌កំបាំងចិត្តសាស្ត្រ)\n2. **And Then There Were None** — Agatha Christie (រឿងស៊ើបអង្កេតបុរាណល្បីល្បាញ)\n3. **Gone Girl** — Gillian Flynn (រឿងព្រឺព្រួចនិងអាថ៌កំបាំង)" . $dbBooks
                    : "For **Mystery & Thriller**, here are top recommendations:\n1. **The Silent Patient** by Alex Michaelides (Psychological thriller)\n2. **And Then There Were None** by Agatha Christie (Classic whodunit)\n3. **Gone Girl** by Gillian Flynn (Riveting twists)";
            }

            if (preg_match('/(self-help|habit|productivity|motivation|growth|អភិវឌ្ឍ|ជោគជ័យ|ទម្លាប់)/ui', $lower)) {
                return $isKhmer
                    ? "សម្រាប់ប្រភេទ **អភិវឌ្ឍន៍ខ្លួន (Self-Help & Productivity)**៖\n1. **Atomic Habits** — James Clear (ការកសាងទម្លាប់ល្អបន្តិចម្តងៗ)\n2. **The Psychology of Money** — Morgan Housel (ការគ្រប់គ្រងផ្នត់គំនិតហិរញ្ញវត្ថុ)\n3. **Deep Work** — Cal Newport (ការផ្ដោតអារម្មណ៍ធ្វើការងារឱ្យមានប្រសិទ្ធភាព)" . $dbBooks
                    : "For **Self-Help & Productivity**, I highly recommend:\n1. **Atomic Habits** by James Clear (Small habits, big results)\n2. **The Psychology of Money** by Morgan Housel (Timeless lessons on wealth)\n3. **Deep Work** by Cal Newport (Mastering focused success)";
            }

            if (preg_match('/(romance|love|relationship|ស្នេហា)/ui', $lower)) {
                return $isKhmer
                    ? "សម្រាប់ប្រភេទ **Romance (រឿងស្នេហា)**៖\n1. **Pride and Prejudice** — Jane Austen\n2. **The Love Hypothesis** — Ali Hazelwood\n3. **Book Lovers** — Emily Henry" . $dbBooks
                    : "For **Romance**, check out these wonderful reads:\n1. **Pride and Prejudice** by Jane Austen\n2. **The Love Hypothesis** by Ali Hazelwood\n3. **Book Lovers** by Emily Henry";
            }

            if (preg_match('/(sci-fi|science fiction|space|future|fantasy|វេទមន្ត|វិទ្យាសាស្ត្រ)/ui', $lower)) {
                return $isKhmer
                    ? "សម្រាប់ប្រភេទ **Sci-Fi & Fantasy (វិទ្យាសាស្ត្រ និងវេទមន្ត)**៖\n1. **Dune** — Frank Herbert\n2. **Project Hail Mary** — Andy Weir\n3. **The Hobbit** — J.R.R. Tolkien" . $dbBooks
                    : "For **Sci-Fi & Fantasy**, here are must-reads:\n1. **Dune** by Frank Herbert\n2. **Project Hail Mary** by Andy Weir\n3. **The Hobbit** by J.R.R. Tolkien";
            }

            return $isKhmer
                ? "ខ្ញុំមានសៀវភៅល្អៗជាច្រើនដើម្បីណែនាំ! 📚\n\nអ្នកអាចប្រាប់ខ្ញុំពីប្រភេទដែលអ្នកចូលចិត្តដូចជា៖\n- **Mystery / Thriller** (រឿងអាថ៌កំបាំង)\n- **Self-Help / Business** (អភិវឌ្ឍន៍ខ្លួន)\n- **Romance** (រឿងមនោសញ្ចេតនា)\n- **Sci-Fi / Fantasy** (វិទ្យាសាស្ត្រ និងស្រមើស្រមៃ)\n- **Short & Easy** (សៀវភៅខ្លីៗអានងាយ)" . $dbBooks
                : "I'd love to recommend the right book for you! 📚\n\nTell me which genre or mood you prefer:\n- **Mystery / Thriller**\n- **Self-Help / Productivity**\n- **Romance**\n- **Sci-Fi & Fantasy**\n- **Short & Quick Reads**";
        }

        // Post / writing / caption
        if (preg_match('/(post|caption|write|status|បង្ហោះ|សរសេរ|មតិ)/ui', $lower)) {
            return $isKhmer
                ? "💡 **គំនិតសរសេរ Post ល្អៗក្នុងប្លុក៖**\n\n1. **ការ Review សៀវភៅខ្លី៖**\n> \"ទើបតែអាន [ឈ្មោះសៀវភៅ] ចប់! អ្វីដែលខ្ញុំចូលចិត្តបំផុតគឺ... តើមានអ្នកណាធ្លាប់អានសៀវភៅនេះទេ?\"\n\n2. **ការសួរសំណួរទៅកាន់សហគមន៍៖**\n> \"តើអ្នកចូលចិត្តអានសៀវភៅពេលព្រឹក ឬពេលយប់ជាង? ហើយសៀវភៅអ្វីដែលអ្នកកំពុងអានបច្ចុប្បន្ន?\"\n\n3. **ការចែករំលែក Quote ល្អៗ៖**\n> ចែករំលែកសម្រង់សម្ដីដែលអ្នកចូលចិត្ត រួមជាមួយរូបភាពគម្របសៀវភៅ!"
                : "💡 **Great Post Ideas for your feed:**\n\n1. **Quick Book Review:**\n> \"Just finished reading [Book Title]! The biggest takeaway for me was... Has anyone else read this?\"\n\n2. **Community Question:**\n> \"Which book should I dive into next: mystery or self-growth? Let me know your favorites!\"\n\n3. **Favorite Quotes:**\n> Share a memorable quote from your current read along with a photo!";
        }

        // Favorites
        if (preg_match('/(favorite|bookmark|save|ចូលចិត្ត|រក្សាទុក)/ui', $lower)) {
            return $isKhmer
                ? "❤️ **របៀបប្រើប្រាស់មុខងារ Favorite (សៀវភៅចូលចិត្ត)៖**\n\n1. នៅពេលអ្នកមើលសៀវភៅក្នុង **បណ្ណាល័យ (Library)** សូមចុចរូបបេះដូងដើម្បីរក្សាទុក។\n2. អ្នកអាចមើលបញ្ជីសៀវភៅដែលបានរក្សាទុកទាំងអស់ដោយចុចលើរូបបេះដូងនៅ Navigation Bar ខាងលើ។\n3. ពីទីនោះ អ្នកអាចអានលម្អិត ឬទាញយក PDF បានយ៉ាងងាយស្រួល!"
                : "❤️ **How to use Favorites:**\n\n1. Browse books in the **Library** and tap the heart icon on any book you love.\n2. Access your saved collection anytime by clicking the heart icon on the top header.\n3. From your favorites drawer, you can view details or download the PDF directly!";
        }

        // Search
        if (preg_match('/(search|find|ស្វែងរក|រក)/ui', $lower)) {
            return $isKhmer
                ? "🔍 **ការស្វែងរកសៀវភៅ៖**\n- ចូលទៅកាន់ទំព័រ **បណ្ណាល័យ (/library)**\n- ប្រើប្រអប់ Search ដើម្បីស្វែងរកតាមចំណងជើង អ្នកនិពន្ធ ឬប្រភេទ (Category)។\n- អ្នកក៏អាចចុចលើប្រភេទសៀវភៅដើម្បីមើលសៀវភៅតាមក្រុមនីមួយៗបានផងដែរ!"
                : "🔍 **How to search books:**\n- Navigate to the **Library (/library)** page.\n- Use the search bar to find books by title, author, or genre.\n- You can also filter by categories to browse your favorite genres easily!";
        }

        // Profile / Login / Account
        if (preg_match('/(profile|login|register|account|password|គណនី|ចូល|កែ)/ui', $lower)) {
            return $isKhmer
                ? "👤 **ការគ្រប់គ្រងគណនី (Account & Profile)៖**\n- ដើម្បីចូលគណនី សូមចុចប៊ូតុង **Login** នៅជ្រុងខាងស្តាំខាងលើ។\n- ប្រសិនបើមិនទាន់មានគណនីទេ សូមជ្រើសរើស **Register**។\n- បន្ទាប់ពីចូលរួច អ្នកអាចចុចលើរូប Avatar របស់អ្នកដើម្បីចូលទៅ **ប្រវត្តិរូប (Profile)** និងកែប្រែព័ត៌មានផ្ទាល់ខ្លួន។"
                : "👤 **Account & Profile Management:**\n- Click the **Login** button at the top right header to sign in.\n- If you're new, click **Register** to create a free account.\n- Once signed in, click your avatar to visit your **Profile** and customize your info & avatar photo.";
        }

        // Default response
        return $isKhmer
            ? "ខ្ញុំយល់ពីសំណួររបស់អ្នក! 💡\n\nអ្នកអាចសួរខ្ញុំបន្ថែមអំពី៖\n- 📚 **ការណែនាំសៀវភៅ** តាមប្រភេទដែលអ្នកចង់អាន\n- ✍️ **ការបង្កើតការបង្ហោះថ្មី**\n- ❤️ **ការរក្សាទុកសៀវភៅចូលចិត្ត**\n- 🧭 **របៀបប្រើប្រាស់មុខងារផ្សេងៗក្នុង App**\n\nតើខ្ញុំអាចជួយអ្វីអ្នកបន្តទៀតបាន?"
            : "I hear you! 💡\n\nFeel free to ask me about:\n- 📚 **Book recommendations** in any genre\n- ✍️ **Writing posts & social sharing**\n- ❤️ **Saving books to your favorites**\n- 🧭 **Navigating any feature in the app**\n\nWhat would you like to explore next?";
    }
}

