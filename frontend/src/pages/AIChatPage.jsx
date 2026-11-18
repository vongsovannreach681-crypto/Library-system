import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import AIChatWidget from "../components/chat/AIChatWidget";

const AIChatPage = () => {
  return (
    <div className="min-h-screen bg-background dark:bg-[#05070d] text-text-black dark:text-pure-white transition-colors duration-200">
      {/* Header Layout */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <Header />
      </div>

      <main className="pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Breadcrumb / Title Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-primary/40 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-secondary dark:text-accent uppercase tracking-wider">
              <i className="fa-solid fa-sparkles text-accent" />
              <span>AI Assistant Experience</span>
            </div>
            <h1 className="mt-1 font-primary text-2xl sm:text-3xl font-extrabold text-primary dark:text-pure-white flex items-center gap-3">
              <span>Reach Assistant (MAX)</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-secondary/15 text-secondary dark:text-accent border border-secondary/30 font-bold">
                Online
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/library"
              className="inline-flex items-center gap-2 rounded-xl border border-secondary/30 dark:border-primary/60 bg-white dark:bg-primary/30 px-4 py-2 text-xs font-bold text-text-black dark:text-pure-white shadow-xs hover:border-accent hover:text-secondary dark:hover:text-accent transition"
            >
              <i className="ph-bold ph-books text-secondary dark:text-accent" />
              <span>ទៅកាន់បណ្ណាល័យ</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary transition"
            >
              <i className="ph-bold ph-newspaper" />
              <span>ប្លុកវេទីការ</span>
            </Link>
          </div>
        </div>

        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Info Sidebar */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Assistant Profile Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-primary/40 bg-white dark:bg-primary/20 p-5 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-secondary text-accent shadow-lg border border-accent/20">
                  <i className="fa-solid fa-robot text-2xl text-accent" />
                </div>
                <div>
                  <h3 className="font-primary text-lg font-bold text-primary dark:text-pure-white">
                    Reach Assistant
                  </h3>
                  <p className="text-xs text-secondary dark:text-accent/90 font-medium">
                    ជំនួយការឆ្លាតវៃផ្នែកសៀវភៅ និងការអាន
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-primary/30 space-y-2.5 text-xs text-text-black/80 dark:text-pure-white/80">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-secondary/15 text-secondary dark:text-accent">
                    <i className="fa-solid fa-check text-[10px]" />
                  </span>
                  <span>ឆ្លើយជាភាសាខ្មែរ 🇰🇭 និងភាសាអង់គ្លេស 🇬🇧</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-secondary/15 text-secondary dark:text-accent">
                    <i className="fa-solid fa-book-open text-[10px]" />
                  </span>
                  <span>ណែនាំសៀវភៅល្បីៗ និងសៀវភៅក្នុងបណ្ណាល័យ</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-secondary/15 text-secondary dark:text-accent">
                    <i className="fa-solid fa-lightbulb text-[10px]" />
                  </span>
                  <span>ជួយបង្កើតគំនិតសរសេរ Post & Review</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-secondary/15 text-secondary dark:text-accent">
                    <i className="fa-solid fa-heart text-[10px]" />
                  </span>
                  <span>ការគ្រប់គ្រងបញ្ជីសៀវភៅចូលចិត្ត (Favorites)</span>
                </div>
              </div>
            </div>

            {/* Quick Tips Card */}
            <div className="rounded-2xl border border-secondary/20 dark:border-primary/40 bg-gradient-to-br from-secondary/10 via-transparent to-transparent dark:from-primary/30 p-5 shadow-xs">
              <h4 className="font-primary text-sm font-bold text-primary dark:text-pure-white flex items-center gap-2">
                <i className="fa-solid fa-wand-magic-sparkles text-accent" />
                <span>គន្លឹះក្នុងការសួរសំណួរ</span>
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-text-black/70 dark:text-pure-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>សួរបញ្ជាក់ប្រភេទសៀវភៅដែលអ្នកចូលចិត្ត (ឧ. Romance, Mystery, Self-Help)។</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>សួររកគំនិតសម្រាប់សរសេរ Post រៀបរាប់ពីសៀវភៅដែលទើបតែអានចប់។</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>សួរអំពីរបៀបកែប្រែ Profile ឬរក្សាទុកសៀវភៅចូលចិត្ត។</span>
                </li>
              </ul>
            </div>
          </aside>

          {/* Right Chat Interface */}
          <section className="lg:col-span-8 h-[calc(100vh-12rem)] min-h-[640px] max-h-[820px]">
            <AIChatWidget compact={false} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default AIChatPage;
