import React, { useEffect, useRef, useState } from "react";
import api from "../../api/api";

const assistantMeta = {
  time: "Aug 13, 3:53 PM",
  title: "Reach",
  badge: "Assistant",
};

const starterMessage = (language) => ({
  id: "welcome",
  role: "assistant",
  content:
    language === "km"
      ? "សួស្តី! ខ្ញុំជា Reach Assistant ជំនួយការរបស់អ្នក។ សូមសួរអំពីសៀវភៅ, ការបង្ហោះ, favorites, ឬរបៀបប្រើកម្មវិធី។"
      : "Hi there! I'm Reach Assistant, your assistant. Ask me about books, posts, favorites, or how to use the app.",
});

const containsAny = (text, words) => words.some((word) => text.includes(word));

const toApiMessages = (messages) =>
  messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));

const pickReply = (language, en, km) => (language === "km" ? km : en);

const cleanText = (value) => value.toLowerCase().replace(/\s+/g, " ").trim();

const buildSmartReply = (userText, language, history = []) => {
  const text = cleanText(userText);
  const khmer = /[\u1780-\u17FF]/.test(userText);
  const preferKhmer = language === "km" || khmer;

  const lastAssistant = [...history]
    .reverse()
    .find((message) => message.role === "assistant")?.content;

  const greeting = containsAny(text, [
    "hi",
    "hello",
    "hey",
    "sawasdee",
    "hello there",
    "សួស្តី",
    "ជំរាបសួរ",
  ]);

  if (greeting) {
    return pickReply(
      preferKhmer ? "km" : "en",
      "Hi! I can help with books, posts, favorites, profile tips, and app navigation.",
      "សួស្តី! ខ្ញុំអាចជួយអំពីសៀវភៅ, ការបង្ហោះ, favorites, ការកែ profile និងរបៀបប្រើកម្មវិធី។",
    );
  }

  const howAreYou = containsAny(text, [
    "how are you",
    "how's it going",
    "how you doing",
    "តើអ្នកសុខសប្បាយទេ",
    "សុខសប្បាយទេ",
  ]);

  if (howAreYou) {
    return pickReply(
      preferKhmer ? "km" : "en",
      "I'm doing great, thanks for asking! How can I help you today?",
      "ខ្ញុំសុខសប្បាយ អរគុណដែលបានសួរ! តើថ្ងៃនេះខ្ញុំអាចជួយអ្នកយ៉ាងណាបាន?",
    );
  }

  const askName = containsAny(text, [
    "what's your name",
    "what is your name",
    "who are you",
    "your name",
    "ឈ្មោះអ្នកជាអ្វី",
    "អ្នកឈ្មោះអ្វី",
  ]);

  if (askName) {
    return pickReply(
      preferKhmer ? "km" : "en",
      "I'm Reach Assistant! I'm here to help with books, posts, and getting around the app.",
      "ខ្ញុំឈ្មោះ Reach Assistant! ខ្ញុំនៅទីនេះដើម្បីជួយអំពីសៀវភៅ, ការបង្ហោះ, និងការប្រើប្រាស់កម្មវិធី។",
    );
  }

  const thanks = containsAny(text, [
    "thank",
    "thanks",
    "thank you",
    "appreciate it",
    "អរគុណ",
  ]);

  if (thanks) {
    return pickReply(
      preferKhmer ? "km" : "en",
      "You're welcome! Happy to help anytime.",
      "សូមស្វាគមន៍! ខ្ញុំរីករាយបានជួយជានិច្ច។",
    );
  }

  const farewell = containsAny(text, [
    "bye",
    "goodbye",
    "see you",
    "see ya",
    "ជម្រាបលា",
    "លាហើយ",
  ]);

  if (farewell) {
    return pickReply(
      preferKhmer ? "km" : "en",
      "Goodbye! Come back anytime you need book ideas or help with the app.",
      "លាហើយ! សូមត្រលប់មកវិញនៅពេលណាដែលអ្នកត្រូវការជំនួយ ឬសៀវភៅណែនាំ។",
    );
  }

  const bookIntent = containsAny(text, [
    "book",
    "books",
    "read",
    "novel",
    "story",
    "recommend",
    "suggest",
    "សៀវភៅ",
    "អាន",
    "ណែនាំ",
  ]);

  if (bookIntent) {
    if (containsAny(text, ["mystery", "thriller", "crime", "suspense", "ចម្លែក", "អាថ៌កំបាំង"])) {
      return pickReply(
        preferKhmer ? "km" : "en",
        "If you want a smart mystery pick, try The Silent Patient, Gone Girl, or And Then There Were None. If you want, I can narrow it down by mood or length.",
        "បើអ្នកចង់បានសៀវភៅ mystery ល្អៗ សាកល្បង The Silent Patient, Gone Girl, ឬ And Then There Were None។ បើចង់ ខ្ញុំអាចជួយជ្រើសតាមអារម្មណ៍ ឬប្រវែងបាន។",
      );
    }

    if (containsAny(text, ["romance", "love", "relationship", "ស្នេហា"])) {
      return pickReply(
        preferKhmer ? "km" : "en",
        "For romance, good starter picks are The Love Hypothesis, Pride and Prejudice, or Book Lovers.",
        "សម្រាប់ romance អ្នកអាចសាកល្បង The Love Hypothesis, Pride and Prejudice, ឬ Book Lovers។",
      );
    }

    if (containsAny(text, ["self-help", "motivation", "habit", "productivity", "growth", "អភិវឌ្ឍ", "ជោគជ័យ"])) {
      return pickReply(
        preferKhmer ? "km" : "en",
        "For self-growth, try Atomic Habits, Deep Work, or The Psychology of Money. Tell me your goal and I can refine the list.",
        "សម្រាប់ការអភិវឌ្ឍខ្លួនឯង សាកល្បង Atomic Habits, Deep Work, ឬ The Psychology of Money។ បើប្រាប់គោលដៅ ខ្ញុំអាចជួយជ្រើសបន្ថែមបាន។",
      );
    }

    if (containsAny(text, ["fantasy", "magic", "adventure", "dragon", "វេទមន្ត"])) {
      return pickReply(
        preferKhmer ? "km" : "en",
        "For fantasy, start with The Hobbit, Harry Potter, or Percy Jackson.",
        "សម្រាប់ fantasy អ្នកអាចចាប់ផ្តើមពី The Hobbit, Harry Potter, ឬ Percy Jackson។",
      );
    }

    if (containsAny(text, ["sci-fi", "scifi", "science fiction", "space", "future", "aliens", "វិទ្យាសាស្ត្រ"])) {
      return pickReply(
        preferKhmer ? "km" : "en",
        "For sci-fi, try Dune, The Martian, or Project Hail Mary.",
        "សម្រាប់ sci-fi សាកល្បង Dune, The Martian, ឬ Project Hail Mary។",
      );
    }

    if (containsAny(text, ["horror", "scary", "ghost", "haunted", "creepy", "ខ្មោច", "គួរឱ្យខ្លាច"])) {
      return pickReply(
        preferKhmer ? "km" : "en",
        "For horror, try The Shining, It, or Bird Box — read with the lights on.",
        "សម្រាប់ horror សាកល្បង The Shining, It, ឬ Bird Box — ល្អបើអានពេលមានពន្លឺ។",
      );
    }

    if (containsAny(text, ["biography", "history", "true story", "memoir", "historical", "ប្រវត្តិសាស្ត្រ", "ជីវប្រវត្តិ"])) {
      return pickReply(
        preferKhmer ? "km" : "en",
        "For biography or history, try Educated, Sapiens, or Steve Jobs by Walter Isaacson.",
        "សម្រាប់ជីវប្រវត្តិ ឬប្រវត្តិសាស្ត្រ សាកល្បង Educated, Sapiens, ឬ Steve Jobs (ដោយ Walter Isaacson)។",
      );
    }

    if (containsAny(text, ["kids", "children", "child", "picture book", "កុមារ"])) {
      return pickReply(
        preferKhmer ? "km" : "en",
        "For kids, try Charlotte's Web, Matilda, or The Very Hungry Caterpillar.",
        "សម្រាប់កុមារ សាកល្បង Charlotte's Web, Matilda, ឬ The Very Hungry Caterpillar។",
      );
    }

    if (containsAny(text, ["short", "easy", "beginner", "quick", "tiny", "ខ្លី", "ងាយ"])) {
      return pickReply(
        preferKhmer ? "km" : "en",
        "If you want something short and easy, try The Alchemist, Who Moved My Cheese?, or The Little Prince.",
        "បើចង់បានសៀវភៅខ្លី និងអានងាយ សាកល្បង The Alchemist, Who Moved My Cheese?, ឬ The Little Prince។",
      );
    }

    return pickReply(
      preferKhmer ? "km" : "en",
      "Tell me the genre, mood, or age range, and I’ll give you a tighter recommendation list. For example: mystery, romance, self-help, sci-fi, horror, or fantasy.",
      "ប្រាប់ខ្ញុំអំពី genre, អារម្មណ៍, ឬកម្រិតអាយុ ហើយខ្ញុំនឹងណែនាំឱ្យត្រឹមត្រូវជាងនេះ។ ឧទាហរណ៍: mystery, romance, self-help, sci-fi, horror, ឬ fantasy។",
    );
  }

  const postIntent = containsAny(text, [
    "post",
    "caption",
    "write",
    "content",
    "blog",
    "status",
    "អត្ថបទ",
    "បង្ហោះ",
    "សរសេរ",
  ]);

  if (postIntent) {
    if (containsAny(text, ["book", "review", "reviewe", "សៀវភៅ"])) {
      return pickReply(
        preferKhmer ? "km" : "en",
        "Try this: 'I just finished [book title] and loved how it made me feel. The ending stayed with me.' Want it more casual or more polished?",
        "សាកល្បងសរសេរៈ 'ខ្ញុំ刚អាន [ឈ្មោះសៀវភៅ] រួច ហើយចូលចិត្តអារម្មណ៍ដែលវាបង្កើត។ ចប់រឿងហើយនៅតែគិតដល់វា។' បើចង់ ខ្ញុំអាចធ្វើឱ្យសាមញ្ញ ឬស្អាតជាងនេះបាន។",
      );
    }

    if (containsAny(text, ["question", "poll", "engage", "comment", "អន្តរកម្ម"])) {
      return pickReply(
        preferKhmer ? "km" : "en",
        "A good engagement post is: 'Which book should I read next: mystery, romance, or fantasy?'",
        "Post សម្រាប់ចូលរួមល្អៗ៖ 'តើខ្ញុំគួរអានសៀវភៅប្រភេទណាបន្ទាប់: mystery, romance, ឬ fantasy?'",
      );
    }

    if (containsAny(text, ["funny", "joke", "lighthearted", "humor", "humorous", "កំប្លែង"])) {
      return pickReply(
        preferKhmer ? "km" : "en",
        "Try something lighthearted: 'Currently debating my houseplants about which book to read next. They're leaning towards mystery.' Want a few more options like this?",
        "សាកល្បង post កំប្លែងបន្តិចៈ 'ថ្ងៃនេះខ្ញុំកំពុងពិភាក្សាជាមួយដើមឈើក្នុងផ្ទះថាគួរអានសៀវភៅអ្វី។ ពួកគេទាំងអស់គ្នាបោះឆ្នោតឱ្យ mystery។' ចង់បានច្រើនទៀតទេ?",
      );
    }

    return pickReply(
      preferKhmer ? "km" : "en",
      "A strong post formula is: hook + one honest thought + a question. Example: 'This book surprised me in the best way. Have you read anything like it?'",
      "រូបមន្ត post ល្អគឺ: ចាប់អារម្មណ៍ + មតិស្មោះត្រង់ + សំណួរ។ ឧទាហរណ៍: 'សៀវភៅនេះធ្វើឱ្យខ្ញុំភ្ញាក់ផ្អើលខ្លាំង។ តើអ្នកធ្លាប់អានអ្វីប្រហាក់ប្រហែលនេះទេ?'",
    );
  }

  if (containsAny(text, ["favorite", "favorites", "bookmark", "save", "liked", "ចូលចិត្ត", "រក្សាទុក"])) {
    return pickReply(
      preferKhmer ? "km" : "en",
      "Favorites are where you save posts or books you want to revisit later. Use them like a personal shelf for the things you liked most.",
      "Favorites គឺសម្រាប់រក្សាទុក post ឬសៀវភៅដែលអ្នកចង់ត្រលប់មើលពេលក្រោយ។ វាដូចជាធ្នើផ្ទាល់ខ្លួនសម្រាប់អ្វីដែលអ្នកចូលចិត្តបំផុត។",
    );
  }

  if (containsAny(text, ["profile", "avatar", "photo", "name", "email", "phone", "edit", "កែ", "គណនី"])) {
    return pickReply(
      preferKhmer ? "km" : "en",
      "To update your profile, open the profile page, tap edit, change your name or photo, then save changes.",
      "ដើម្បីកែ profile សូមបើកទំព័រ profile របស់អ្នក រួចចុច edit ប្តូរឈ្មោះ ឬរូបភាព ហើយចុច save changes។",
    );
  }

  if (containsAny(text, ["login", "log in", "sign in", "register", "logout", "sign up", "ចូល", "ចាកចេញ"])) {
    return pickReply(
      preferKhmer ? "km" : "en",
      "If you’re stuck with login or signup, check that your email and password are correct, then try again. I can also help you reset your flow step by step.",
      "បើអ្នកជាប់លើ login ឬ signup សូមពិនិត្យ email និង password រួចសាកល្បងម្ដងទៀត។ ខ្ញុំក៏អាចជួយបង្ហាញជំហានម្តងមួយបាន។",
    );
  }

  if (containsAny(text, ["notification", "notifications", "notify", "alert", "alerts", "ដំណឹង"])) {
    return pickReply(
      preferKhmer ? "km" : "en",
      "Notifications let you know when someone likes, comments, or follows your posts. Check the bell icon to review them.",
      "ដំណឹងជូនអ្នកនៅពេលមានគេ like, comment ឬ follow post របស់អ្នក។ សូមចុចរូបកណ្តឹងដើម្បីមើលពួកវា។",
    );
  }

  if (containsAny(text, ["dark mode", "light mode", "theme", "switch theme", "ងងឹត", "ភ្លឺ"])) {
    return pickReply(
      preferKhmer ? "km" : "en",
      "You can switch between dark and light mode using the toggle in settings or the top navigation bar.",
      "អ្នកអាចប្តូររវាង dark mode និង light mode ដោយប្រើប៊ូតុងនៅក្នុង settings ឬនៅលើ navigation bar ខាងលើ។",
    );
  }

  if (containsAny(text, ["how to search", "find a book", "find book", "search tips", "searching", "ស្វែងរក"])) {
    return pickReply(
      preferKhmer ? "km" : "en",
      "Use the search bar to look up book titles, authors, or genres. Shorter, simpler keywords usually give broader results.",
      "ប្រើប្រអប់ search ដើម្បីរកឈ្មោះសៀវភៅ, អ្នកនិពន្ធ ឬ genre។ ប្រើពាក្យខ្លីៗនិងសាមញ្ញ ដើម្បីទទួលបានលទ្ធផលច្រើនជាង។",
    );
  }

  if (containsAny(text, ["contact", "support", "report", "bug", "issue", "problem", "ជំនួយ", "បញ្ហា"])) {
    return pickReply(
      preferKhmer ? "km" : "en",
      "If you run into a bug or need support, use the contact/support option in settings, or just describe the issue here and I'll try to help.",
      "បើអ្នកជួបបញ្ហា ឬត្រូវការជំនួយ សូមប្រើប្រអប់ contact/support នៅក្នុង settings ឬពិពណ៌នាបញ្ហានៅទីនេះ ខ្ញុំនឹងព្យាយាមជួយ។",
    );
  }

  if (containsAny(text, ["home", "search", "feed", "post", "like", "comment", "navigate", "menu", "explore", "browse"])) {
    return pickReply(
      preferKhmer ? "km" : "en",
      "You can use the feed to browse posts, the search area to find books, and the buttons around the page to like, comment, and create new posts.",
      "អ្នកអាចប្រើ feed ដើម្បីមើល post, ប្រអប់ search ដើម្បីរកសៀវភៅ, ហើយប្រើប៊ូតុងជុំវិញទំព័រ ដើម្បី like, comment និងបង្កើត post ថ្មី។",
    );
  }

  if (containsAny(text, ["what can you do", "help", "how do you work", "your feature", "about you", "chatbot"])) {
    return pickReply(
      preferKhmer ? "km" : "en",
      "I can help with book ideas, post ideas, favorites, profile tips, notifications, themes, search tips, and general app navigation. Ask me in plain language and I’ll try to respond with something useful.",
      "ខ្ញុំអាចជួយអំពី book ideas, post ideas, favorites, profile tips, notifications, theme, របៀប search និងការប្រើប្រាស់កម្មវិធី។ សួរខ្ញុំដោយភាសាសាមញ្ញបានเลย ខ្ញុំនឹងព្យាយាមឆ្លើយឱ្យមានប្រយោជន៍។",
    );
  }

  if (lastAssistant) {
    return pickReply(
      preferKhmer ? "km" : "en",
      `I can be more specific if you want. Based on your last question, try adding a detail like genre, mood, or goal. Example: "recommend a short mystery book" or "give me a post idea about this app".`,
      `ខ្ញុំអាចឆ្លើយឱ្យត្រឹមត្រូវជាងនេះបើអ្នកបន្ថែមលម្អិតបន្តិច។ ឧទាហរណ៍: "ណែនាំសៀវភៅ mystery ខ្លីមួយ" ឬ "ផ្តល់ post idea សម្រាប់ app នេះ"។`,
    );
  }

  return pickReply(
    preferKhmer ? "km" : "en",
    "I’m not fully sure yet, but I can still help. Try asking about books, posts, favorites, your profile, notifications, themes, or app navigation.",
    "ខ្ញុំនៅមិនទាន់ប្រាកដទេ ប៉ុន្តែខ្ញុំនៅតែអាចជួយបាន។ សូមសួរអំពីសៀវភៅ, ការបង្ហោះ, favorites, profile, notifications, theme ឬការប្រើកម្មវិធី។",
  );
};

const MessageAvatar = ({ role }) => {
  const isAssistant = role === "assistant";
  let avatarClasses = "bg-slate-900 text-white dark:bg-white dark:text-slate-900";
  let iconClass = "fa-user";

  if (isAssistant) {
    avatarClasses = "bg-[#0f9d58] text-white shadow-[0_10px_22px_rgba(15,157,88,0.24)]";
    iconClass = "fa-robot";
  }

  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${avatarClasses}`}>
      <i className={`fa-solid ${iconClass} text-xs`} />
    </div>
  );
};

const ChatBubble = ({ message }) => {
  const isAssistant = message.role === "assistant";
  let wrapperClasses = "justify-start";
  let bubbleClasses =
    "bg-[#f1f1f1] text-slate-900 shadow-sm dark:bg-white/10 dark:text-white";

  if (!isAssistant) {
    wrapperClasses = "justify-end";
    bubbleClasses =
      "bg-[linear-gradient(135deg,#0f9d58,#0d7f47)] text-white shadow-[0_14px_30px_rgba(15,157,88,0.22)]";
  }

  return (
    <div className={`flex items-end gap-3 ${wrapperClasses}`}>
      {isAssistant && <MessageAvatar role="assistant" />}

      <div className={`max-w-[92%] rounded-[18px] px-4 py-3 text-[15px] leading-6 ${bubbleClasses}`}>
        <p className="whitespace-pre-line">{message.content}</p>
      </div>

      {!isAssistant && <MessageAvatar role="user" />}
    </div>
  );
};

const AIChatWidget = ({ compact = false, onClose = null }) => {
  const [language, setLanguage] = useState("km");
  const [messages, setMessages] = useState([starterMessage("km")]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
  }, [input]);

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
    setMessages([starterMessage(nextLanguage)]);
    setInput("");
    setIsThinking(false);
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const nextMessages = [...messagesRef.current, userMessage];
    messagesRef.current = nextMessages;
    setMessages(nextMessages);
    setInput("");
    setIsThinking(true);

    try {
      const response = await api.post("/chatbot", {
        message: trimmed,
        messages: toApiMessages(nextMessages),
      });

      const reply =
        response.data?.reply?.trim() ||
        buildSmartReply(trimmed, language, nextMessages);

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: reply,
      };

      messagesRef.current = [...nextMessages, assistantMessage];
      setMessages(messagesRef.current);
    } catch {
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: buildSmartReply(trimmed, language, nextMessages),
      };

      messagesRef.current = [...nextMessages, assistantMessage];
      setMessages(messagesRef.current);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  let shellClasses =
    "flex h-[calc(100vh-7rem)] min-h-[600px] flex-col overflow-hidden rounded-[30px] border border-[#0f9d58] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)] dark:border-[#0f9d58] dark:bg-[#0b1020] dark:shadow-[0_24px_70px_rgba(0,0,0,0.42)]";

  if (compact) {
    shellClasses =
      "flex h-full max-h-[72vh] flex-col overflow-hidden rounded-[30px] border border-[#0f9d58] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.10)] dark:border-[#0f9d58] dark:bg-[#0b1020] dark:shadow-[0_24px_60px_rgba(0,0,0,0.4)]";
  }

  return (
    <section className={shellClasses}>
      <header className="border-b border-[#0f9d58] bg-[#0f9d58] px-4 py-3 text-white dark:border-[#0d7f47] dark:bg-[#0d7f47]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#0f9d58] shadow-[0_10px_22px_rgba(0,0,0,0.12)]">
              <i className="fa-solid fa-robot text-lg" />
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <h3 className="font-primary text-[1.45rem] font-bold leading-tight">
                {assistantMeta.title}
              </h3>
              <span className="rounded-full border border-white/40 px-2 py-0.5 text-[11px] font-semibold leading-none text-white/95">
                {assistantMeta.badge}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-white/95">
            <button type="button" className="transition hover:opacity-80" aria-label="Call">
              <i className="fa-solid fa-phone text-sm" />
            </button>
            <button type="button" className="transition hover:opacity-80" aria-label="Mail">
              <i className="fa-regular fa-envelope text-sm" />
            </button>
            <button type="button" className="transition hover:opacity-80" aria-label="More">
              <i className="fa-solid fa-ellipsis-vertical text-sm" />
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                aria-label="Close chat"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white px-4 py-4 dark:bg-[#0b1020]">
        <div className="flex flex-col items-center gap-3 text-[12px] text-slate-500 dark:text-slate-400">
          <span>{assistantMeta.time}</span>
        </div>

        <div className="mt-4 space-y-4">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}

          {isThinking && (
            <div className="flex items-start gap-3">
              <MessageAvatar role="assistant" />
              <div className="rounded-[18px] bg-[#f1f1f1] px-4 py-3 text-sm text-slate-500 dark:bg-white/10 dark:text-slate-300">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-slate-200 bg-white px-3 py-3 dark:border-white/10 dark:bg-[#0b1020]">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="rounded-[22px] border border-[#0f9d58]/30 bg-[#f8faf8] px-3 py-3 shadow-[0_8px_22px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/5">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={language === "km" ? "សួរអ្វីក៏បាន..." : "Ask anything..."}
              className="max-h-[140px] w-full resize-none bg-transparent px-1 py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
            />

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleLanguageChange("km")}
                  className={`rounded-lg bg-[#f3f4f6] px-3 py-2 text-sm transition dark:bg-white/10 dark:text-white ${
                    language === "km" ? "ring-2 ring-[#0f9d58]/30" : "text-slate-700"
                  }`}
                >
                  <span className="mr-1">🇰🇭</span>
                  ភាសាខ្មែរ
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange("en")}
                  className={`rounded-lg bg-[#f3f4f6] px-3 py-2 text-sm transition dark:bg-white/10 dark:text-white ${
                    language === "en" ? "ring-2 ring-[#0f9d58]/30" : "text-slate-700"
                  }`}
                >
                  <span className="mr-1">🇬🇧</span>
                  English
                </button>
              </div>

              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#6b7280] text-white shadow-[0_10px_22px_rgba(107,114,128,0.28)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Ask"
              >
                <i className="fa-solid fa-paper-plane text-sm" />
              </button>
            </div>
          </div>
        </form>
      </footer>
    </section>
  );
};

export default AIChatWidget;