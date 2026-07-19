import React from "react";

const BlogHero = () => {
  return (
    <div>
      <section className="relative w-full overflow-hidden bg-white dark:bg-[#05070d] transition-colors duration-200">
        {/* Grid background - colors shift dynamically based on dark mode */}
        <div
          className="absolute inset-0 opacity-[0.7] dark:opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #d4e6fc 1px, transparent 1px), linear-gradient(to bottom, #d3d6db 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        
        {/* Soft radial fade to reduce background noise against text content */}
        <div
          className="absolute inset-0 block dark:hidden"
          style={{
            background:
              "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)",
          }}
        />
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background:
              "radial-gradient(circle at 30% 40%, rgba(22,28,44,0.5) 0%, rgba(5,7,13,0) 70%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            
            {/* Left: copy */}
            <div className="relative z-10">
              <h1 className="font-heading text-5xl leading-[1.05] tracking-tight sm:text-6xl">
                <span className="block text-accent font-primary font-semibold pb-3">ស្វាគមន៍មកកាន់</span>
                <span className="block text-secondary dark:text-white font-semibold font-primary">ប្លុកវេទីការ</span>
                <span className="block text-secondary dark:text-white font-semibold font-primary">នៃការចែករំលែក</span>
              </h1>

              <p className="mt-4 max-w-xl text-lg leading-relaxed font-primary text-slate-500 dark:text-slate-400">
                ចាប់ផ្តើបចែករំលែកលំហាត់ ឬ សៀវភៅដែលអ្នកមាននៅទីនេះ
                ដើម្បីជាប្រយោជន៍ដល់សមាគមន៍បណ្ណាល័យដល់សិស្សនុសិស្សទាំងអស់គ្នា!
                សង្ឃឹមថាវេទិការនេះនឹងជួយអ្នកទាំងអស់គ្នាបានច្រើនពីការរៀនសូត្រ៕
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                {/* Custom CTAs can be nested here */}
              </div>
            </div>

            {/* Right: image + decorations */}
            <div className="relative mx-auto flex h-[520px] w-full max-w-md items-center justify-center lg:mx-0 lg:ml-auto">
              {/* Decorative dots */}
              <span className="absolute left-2 top-6 h-3 w-3 rounded-full bg-emerald-400" />
              <span className="absolute -left-4 bottom-24 h-3 w-3 rounded-full bg-orange-400" />
              <span className="absolute right-4 bottom-4 h-3 w-3 rounded-full bg-indigo-500" />
              <span className="absolute left-10 top-1/2 h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="absolute right-8 top-16 h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="absolute left-24 bottom-10 h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />

              {/* Circle backdrop */}
              <div className="absolute right-6 top-6 h-82 w-82 rounded-full bg-secondary/90 dark:bg-secondary/30" />

              {/* Student image */}
              <img
                src="https://cdnai.iconscout.com/ai-image/premium/thumb/ai-robot-reading-book-3d-illustration-png-download-jpg-13171575.png"
                alt="Student thinking while holding books"
                className="relative z-10 h-[480px] w-auto object-contain drop-shadow-2xl dark:drop-shadow-[0_20px_35px_rgba(249,115,22,0.15)]"
              />

              {/* Floating icon card - top left */}
              <div className="absolute left-0 top-24 z-20 flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-[#11151f] border border-transparent dark:border-white/5 shadow-xl shadow-slate-300/40 dark:shadow-black/50">
                <i className="fa-solid fa-brain text-accent"></i>
              </div>

              {/* Floating icon card - right */}
              <div className="absolute -right-2 bottom-32 z-20 flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-[#11151f] border border-transparent dark:border-white/5 shadow-xl shadow-slate-300/40 dark:shadow-black/50">
                <i className="fa-solid fa-lightbulb text-accent"></i>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogHero;