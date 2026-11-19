import React, { useEffect, useRef, useState } from "react";
import api from "../../api/api";

const STORAGE_KEY = "reach_assistant_messages_v2";
const LANG_STORAGE_KEY = "reach_assistant_lang_v2";

const starterMessage = (language) => ({
  id: "welcome",
  role: "assistant",
  content:
    language === "km"
      ? "សួស្តី! ខ្ញុំជា **Reach Assistant (MAX)**  ជំនួយការ AI របស់អ្នក។\n\nខ្ញុំអាចជួយណែនាំសៀវភៅល្អៗ, គំនិតសរសេរការបង្ហោះ, របៀបរក្សាទុកសៀវភៅចូលចិត្ត, និងការប្រើប្រាស់មុខងារផ្សេងៗក្នុង App។\n\nតើអ្នកចង់ដឹងអ្វីខ្លះថ្ងៃនេះ?"
      : "Hi there! I'm **Reach Assistant (MAX)** , your AI companion.\n\nI can help recommend books, generate post ideas, guide you through favorites, and explain app features.\n\nWhat would you like to explore today?",
  timestamp: new Date().toISOString(),
});

const quickPrompts = {
  km: [
    { label: " ណែនាំសៀវភៅល្អៗ", prompt: "សូមណែនាំសៀវភៅល្អៗដែលគួរអាន" },
    { label: " សៀវភៅ Mystery", prompt: "ណែនាំសៀវភៅប្រភេទ Mystery & Thriller អាថ៌កំបាំង" },
    { label: " សៀវភៅអភិវឌ្ឍន៍ខ្លួន", prompt: "ណែនាំសៀវភៅ Self-Help និងទម្លាប់ជោគជ័យ" },
    { label: " គំនិតសរសេរ Post", prompt: "ផ្តល់គំនិតសរសេរ Post ល្អៗក្នុងប្លុក" },
    { label: " របៀបរក្សាទុក Favorites", prompt: "តើខ្ញុំអាចរក្សាទុកសៀវភៅចូលចិត្តដោយរបៀបណា?" },
    { label: " របៀបស្វែងរកសៀវភៅ", prompt: "តើខ្ញុំអាចស្វែងរកសៀវភៅតាមប្រភេទយ៉ាងដូចម្តេច?" },
  ],
  en: [
    { label: " Book Recommendations", prompt: "Can you recommend some must-read books?" },
    { label: " Mystery & Thriller", prompt: "Recommend some great Mystery and Thriller novels" },
    { label: " Self-Help & Habits", prompt: "What are the best self-growth and productivity books?" },
    { label: " Post & Caption Ideas", prompt: "Give me ideas for my next reading feed post" },
    { label: " How to use Favorites", prompt: "How do I save books to my favorites list?" },
    { label: " Search & Explore", prompt: "How do I search and filter books in the library?" },
  ],
};

// Formats markdown-like text (bold, quotes, bullets, numbered lists)
const FormattedMessage = ({ text }) => {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed === "") {
          return <div key={idx} className="h-1.5" />;
        }

        // Blockquote
        if (trimmed.startsWith(">")) {
          const content = trimmed.substring(1).trim();
          return (
            <blockquote
              key={idx}
              className="my-1 rounded-r-lg border-l-3 border-accent bg-black/5 dark:bg-white/5 px-3 py-1.5 text-xs italic opacity-90"
            >
              {renderFormattedInline(content)}
            </blockquote>
          );
        }

        // Bullet point
        if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
          const content = trimmed.replace(/^[\s•\-*]+/, "").trim();
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span className="flex-1">{renderFormattedInline(content)}</span>
            </div>
          );
        }

        // Numbered list
        const matchNumber = trimmed.match(/^(\d+[.)])\s*(.*)$/);
        if (matchNumber) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="shrink-0 font-semibold text-secondary dark:text-accent text-xs">
                {matchNumber[1]}
              </span>
              <span className="flex-1">{renderFormattedInline(matchNumber[2])}</span>
            </div>
          );
        }

        return <p key={idx}>{renderFormattedInline(line)}</p>;
      })}
    </div>
  );
};

// Helper to render **bold** within line
const renderFormattedInline = (str) => {
  const parts = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.substring(lastIndex, match.index));
    }
    parts.push(
      <strong key={match.index} className="font-bold text-inherit">
        {match[1]}
      </strong>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < str.length) {
    parts.push(str.substring(lastIndex));
  }

  return parts.length > 0 ? parts : str;
};

const formatMessageTime = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const toApiMessages = (messages) =>
  messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-12)
    .map((m) => ({
      role: m.role,
      content: m.content,
    }));

const AIChatWidget = ({ compact = false, onClose = null, onNavigateFull = null }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem(LANG_STORAGE_KEY) || "km";
  });

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load saved chat", e);
    }
    return [starterMessage(localStorage.getItem(LANG_STORAGE_KEY) || "km")];
  });

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeModel, setActiveModel] = useState("MAX AI");
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save chat", e);
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(LANG_STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isThinking]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
  }, [input]);

  const handleLanguageChange = (nextLanguage) => {
    if (nextLanguage === language) return;
    setLanguage(nextLanguage);
    const starter = starterMessage(nextLanguage);
    setMessages([starter]);
    setInput("");
    setIsThinking(false);
  };

  const handleClearHistory = () => {
    if (window.confirm(language === "km" ? "តើអ្នកពិតជាចង់សម្អាតប្រវត្តិសារទាំងអស់មែនទេ?" : "Clear all chat history?")) {
      const reset = [starterMessage(language)];
      setMessages(reset);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const sendMessage = async (customText = null) => {
    const textToSend = typeof customText === "string" ? customText : input;
    const trimmed = textToSend.trim();
    if (!trimmed || isThinking) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
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
        language: language,
      });

      const replyText =
        response.data?.reply ||
        (language === "km"
          ? "ខ្ញុំរីករាយណាស់ដែលបានជួយ! សូមសួរខ្ញុំបន្ថែមអំពីសៀវភៅ ឬការប្រើប្រាស់កម្មវិធី។"
          : "I'm glad to help! Feel free to ask more about books or app features.");

      if (response.data?.model) {
        setActiveModel(response.data.model);
      }

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: replyText,
        timestamp: new Date().toISOString(),
      };

      messagesRef.current = [...nextMessages, assistantMessage];
      setMessages(messagesRef.current);
    } catch (err) {
      console.warn("Chatbot API error, using smart fallback", err);
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          language === "km"
            ? "ខ្ញុំនៅទីនេះជានិច្ចដើម្បីជួយអ្នក! 📖\n\nអ្នកអាចសួរខ្ញុំអំពី៖\n-  **ការណែនាំសៀវភៅល្អៗ** (Mystery, Romance, Self-help)\n-  **គំនិតសរសេរ Post ក្នុងប្លុក**\n-  **ការរក្សាទុកសៀវភៅក្នុង Favorites**\n-  **ការស្វែងរកសៀវភៅក្នុងបណ្ណាល័យ**"
            : "I'm always here to help you! 📖\n\nFeel free to ask about:\n-  **Book recommendations** (Mystery, Romance, Self-Help)\n-  **Post & caption ideas** for the blog\n-  **Saving favorites**\n-  **Searching library books**",
        timestamp: new Date().toISOString(),
      };

      messagesRef.current = [...nextMessages, assistantMessage];
      setMessages(messagesRef.current);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className={`flex flex-col overflow-hidden bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-primary/50 shadow-2xl transition-all duration-200 ${
        compact
          ? "h-full w-full rounded-2xl sm:rounded-[24px]"
          : "h-full min-h-[600px] w-full rounded-2xl"
      }`}
    >
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-primary/40 bg-gradient-to-r from-primary via-nav to-secondary px-4 py-3 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary font-bold shadow-md">
            <i className="fa-solid fa-robot text-lg text-primary" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-primary bg-accent" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-primary text-base font-bold tracking-tight text-white">
                {language === "km" ? "ជំនួយការ Reach " : "Reach Assistant "}
              </h3>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-accent uppercase tracking-wider backdrop-blur-xs">
                {activeModel}
              </span>
            </div>
            
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-white">
          {/* Language Toggle */}
          <div className="flex rounded-lg bg-black/25 p-0.5 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => handleLanguageChange("km")}
              className={`rounded-md px-2 py-1 text-xs font-bold transition ${
                language === "km" ? "bg-accent text-primary shadow-xs font-extrabold" : "text-white/80 hover:text-accent"
              }`}
              title="ភាសាខ្មែរ"
            >
              KH
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange("en")}
              className={`rounded-md px-2 py-1 text-xs font-bold transition ${
                language === "en" ? "bg-accent text-primary shadow-xs font-extrabold" : "text-white/80 hover:text-accent"
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Clear history */}
          <button
            type="button"
            onClick={handleClearHistory}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/15 hover:text-accent"
            title={language === "km" ? "សម្អាតប្រវត្តិសារ" : "Clear conversation"}
          >
            <i className="fa-regular fa-trash-can text-xs" />
          </button>

          {/* Navigate to full page if in popup */}
         

          {/* Close button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/15 hover:text-accent"
              title="Close chat"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          )}
        </div>
      </header>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-contain bg-background/50 dark:bg-[#060911] p-4 space-y-4"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-accent shadow-sm border border-secondary/30">
                  <i className="fa-solid fa-robot text-xs" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                <div
                  className={`rounded-2xl px-4 py-3 shadow-xs ${
                    isUser
                      ? "rounded-br-xs bg-gradient-to-r from-primary to-secondary text-white"
                      : "rounded-bl-xs border border-slate-200 dark:border-primary/40 bg-white dark:bg-primary/25 text-text-black dark:text-pure-white"
                  }`}
                >
                  <FormattedMessage text={msg.content} />
                </div>
                {msg.timestamp && (
                  <span className="mt-1 px-1 text-[10px] text-slate-400 dark:text-slate-500">
                    {formatMessageTime(msg.timestamp)}
                  </span>
                )}
              </div>

              {isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-white shadow-sm">
                  <i className="fa-solid fa-user text-xs" />
                </div>
              )}
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-end gap-2.5 justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-accent shadow-sm border border-secondary/30">
              <i className="fa-solid fa-robot text-xs" />
            </div>
            <div className="rounded-2xl rounded-bl-xs border border-slate-200 dark:border-primary/40 bg-white dark:bg-primary/25 px-4 py-3 shadow-xs">
              <div className="flex items-center gap-1.5 py-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-secondary [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="border-t border-slate-200 dark:border-primary/40 bg-white dark:bg-[#0c1220] px-3 py-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="shrink-0 font-bold text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider pl-1">
            {language === "km" ? "សំណួរណែនាំ " : "Suggested "}
          </span>
          {(quickPrompts[language] || quickPrompts.km).map((item, i) => (
            <button
              key={i}
              type="button"
              disabled={isThinking}
              onClick={() => sendMessage(item.prompt)}
              className="shrink-0 rounded-full border border-slate-200 dark:border-primary/50 bg-background dark:bg-primary/30 px-3 py-1 text-slate-700 dark:text-slate-200 font-medium transition hover:border-secondary hover:bg-secondary/10 hover:text-secondary dark:hover:text-accent dark:hover:border-accent disabled:opacity-50 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Footer */}
      <footer className="border-t border-slate-200 dark:border-primary/40 bg-white dark:bg-[#0c1220] p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="relative flex items-end gap-2 rounded-2xl border border-slate-200 dark:border-primary/50 bg-background dark:bg-primary/20 p-1.5 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 transition"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={
              language === "km"
                ? "សួរសំណួរអំពីសៀវភៅ, ការបង្ហោះ, ឬជំនួយ... (Enter ដើម្បីផ្ញើ)"
                : "Ask about books, writing posts, favorites... (Enter to send)"
            }
            className="flex-1 max-h-[120px] resize-none bg-transparent px-3 py-2 text-sm text-text-black dark:text-pure-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 font-primary"
          />

          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-white shadow-md transition hover:bg-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            aria-label="Send message"
          >
            <i className="fa-solid fa-paper-plane text-sm" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default AIChatWidget;