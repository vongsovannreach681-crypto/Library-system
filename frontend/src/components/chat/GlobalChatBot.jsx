import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AIChatWidget from "./AIChatWidget";

const GlobalChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // If user is already on dedicated /chat page, don't show floating widget
  const isChatPage = location.pathname === "/chat" || location.pathname === "/ai-chat";

  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
    };

    window.addEventListener("open-ai-chat", handleOpenChat);
    return () => {
      window.removeEventListener("open-ai-chat", handleOpenChat);
    };
  }, []);

  if (isChatPage) {
    return null;
  }

  const handleNavigateFull = () => {
    setIsOpen(false);
    navigate("/chat");
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Helper tooltip pill (shows when chat is closed) */}
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-white/95 dark:bg-primary/95 px-3.5 py-2 text-xs font-bold text-text-black dark:text-pure-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all hover:scale-105 hover:border-accent cursor-pointer"
          >
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="font-primary">ជំនួយការ AI</span>
          </button>
        )}

        {/* Floating Bubble Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_12px_35px_rgba(17,45,78,0.38)] border border-accent/30 transition-all duration-300 hover:scale-110 hover:border-accent active:scale-95 cursor-pointer ${
            isOpen
              ? "bg-primary hover:bg-secondary rotate-90 text-accent"
              : "bg-gradient-to-tr from-primary via-secondary to-secondary"
          }`}
          aria-label={isOpen ? "Close AI chat" : "Open AI chat"}
        >
          {isOpen ? (
            <i className="fa-solid fa-xmark text-xl" />
          ) : (
            <>
              <i className="fa-solid fa-robot text-2xl text-accent animate-pulse" />
              {/* Online indicator ping */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-primary bg-accent" />
              </span>
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Window / Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-end sm:justify-end p-0 sm:p-6 sm:bottom-20 sm:right-0 pointer-events-none">
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs sm:hidden pointer-events-auto"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full h-[88vh] sm:h-[620px] sm:w-[440px] max-w-full rounded-t-[28px] sm:rounded-[28px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.35)] pointer-events-auto animate-in slide-in-from-bottom-5 duration-200">
            <AIChatWidget
              compact
              onClose={() => setIsOpen(false)}
              onNavigateFull={handleNavigateFull}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalChatBot;
