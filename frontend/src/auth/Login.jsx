import React, { useState } from "react";
import LogoNoBg from "../assets/NobgLogo.png";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/login", { email, password });
      const token = response.data.token;
      const userData = response.data.user;

      // Save token and user data to localStorage
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      navigate("/");
    } catch (ex) {
      setError(ex.response?.data?.message || "ការចូលគណនីបរាជ័យ។ សូមពិនិត្យអ៊ីមែល និងពាក្យសម្ងាត់ម្តងទៀត។");
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-200 dark:from-[#080d1a] dark:via-[#0e172a] dark:to-[#121e36]">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Back to Home Link */}
      <Link
        to="/"
        className="absolute top-5 left-5 sm:top-8 sm:left-8 z-20 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm border border-slate-200/80 dark:border-white/10 hover:bg-white dark:hover:bg-slate-700 transition"
      >
        <i className="ph-bold ph-arrow-left text-base" />
        <span className="font-primary">ទំព័រដើម</span>
      </Link>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-[0_25px_70px_rgba(15,23,42,0.15)] border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col md:flex-row my-auto">
        {/* Left Side: Brand Showcase */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#0c1a30] via-[#112d4e] to-[#1e3c72] relative flex-col items-center justify-between p-10 lg:p-12 text-center overflow-hidden">
          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-accent/20 rounded-full blur-2xl" />
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-secondary/30 rounded-full blur-2xl" />

          {/* Brand Top Pill */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-accent border border-white/15 backdrop-blur-md font-primary">
              <i className="ph-fill ph-book-open text-sm" />
              បណ្ណាល័យឌីជីថល LibreShelf
            </span>
          </div>

          {/* Logo & Headline */}
          <div className="relative z-10 my-auto py-6">
            <img
              src={LogoNoBg}
              alt="LibreShelf Logo"
              className="w-44 lg:w-52 mx-auto drop-shadow-xl hover:scale-105 transition-transform duration-300"
            />
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white mt-4 mb-3 font-primary leading-snug">
              ស្វាគមន៍មកកាន់ <span className="text-accent">LibreShelf</span>
            </h2>
            <p className="text-blue-100/80 text-xs lg:text-sm leading-relaxed font-primary max-w-xs mx-auto">
              ស្វែងរក អាន និងចែករំលែកសៀវភៅចំណេះដឹងរាប់ពាន់ក្បាលក្នុងប្រព័ន្ធបណ្ណាល័យទំនើប។
            </p>
          </div>

          {/* Feature Badges Footer */}
          <div className="relative z-10 flex items-center justify-center gap-2 w-full pt-4 border-t border-white/10 text-[11px] text-blue-200/90 font-primary">
            <span>✓ អានឥតគិតថ្លៃ</span>
            <span>•</span>
            <span>✓ PDF ទាន់សម័យ</span>
            <span>•</span>
            <span>✓ សហគមន៍ចែករំលែក</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-7 sm:p-10 lg:p-12 flex flex-col justify-center bg-white dark:bg-slate-900">
          {/* Mobile Logo Branding */}
          <div className="md:hidden flex flex-col items-center mb-6 text-center">
            <img src={LogoNoBg} alt="LibreShelf Logo" className="w-24 mb-2" />
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-white/10 dark:text-accent font-primary">
              LibreShelf Platform
            </span>
          </div>

          <div className="text-center md:text-left mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-primary tracking-tight">
              ចូលគណនី
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-primary mt-1.5">
              សូមបញ្ចូលអ៊ីមែល និងពាក្យសម្ងាត់របស់អ្នកដើម្បីបន្ត
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs sm:text-sm font-primary flex items-start gap-2.5 animate-fadeIn">
              <i className="ph-fill ph-warning-circle text-lg shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-bold font-primary text-slate-700 dark:text-slate-300"
              >
                អ៊ីមែល <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <i className="ph-bold ph-envelope-simple absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary dark:group-focus-within:text-accent transition-colors text-lg" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-primary outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-secondary focus:ring-4 focus:ring-secondary/15 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-bold font-primary text-slate-700 dark:text-slate-300"
                >
                  ពាក្យសម្ងាត់ <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative group">
                <i className="ph-bold ph-lock-key absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary dark:group-focus-within:text-accent transition-colors text-lg" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-primary outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-secondary focus:ring-4 focus:ring-secondary/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <i
                    className={`ph-bold ${
                      showPassword ? "ph-eye-slash" : "ph-eye"
                    } text-lg`}
                  />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-primary via-[#1a3d6b] to-secondary hover:opacity-95 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="ph-bold ph-spinner animate-spin text-lg" />
                  <span className="font-primary text-sm sm:text-base">
                    កំពុងចូលគណនី...
                  </span>
                </>
              ) : (
                <>
                  <span className="font-primary text-sm sm:text-base">
                    ចូលគណនី
                  </span>
                  <i className="ph-bold ph-sign-in text-lg" />
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="pt-3 text-center">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-primary">
                មិនទាន់មានគណនីទេ?{" "}
                <Link
                  to="/register"
                  className="text-secondary dark:text-accent font-bold hover:underline transition-colors ml-1"
                >
                  បង្កើតគណនីថ្មី
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
