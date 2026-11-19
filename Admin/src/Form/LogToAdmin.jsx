import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import LogoNoBg from "../assets/NobgLogo.png";

const LogToAdmin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const user = JSON.parse(localStorage.getItem("auth_user") || "null");
    if (token && user && user.role === "admin") {
      navigate("/adminPanel", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/login", { email, password });
      const { token, user } = response.data;

      if (!token || !user || user.role !== "admin") {
        setError("គណនីនេះមិនមានសិទ្ធិជា Admin ទេ។ (Unauthorized)");
        return;
      }

      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
      navigate("/adminPanel", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message || "ការចូលគណនីបរាជ័យ។ សូមពិនិត្យព័ត៌មានម្តងទៀត។";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-100 via-slate-200 to-blue-100/40 dark:from-[#080d1a] dark:via-[#0e172a] dark:to-[#121e36]">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-[0_25px_70px_rgba(15,23,42,0.18)] border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col md:flex-row my-auto">
        {/* Left Side: Admin Brand Showcase */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#0c1a30] via-[#112d4e] to-[#1e3c72] relative flex-col items-center justify-between p-10 lg:p-12 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-accent/20 rounded-full blur-2xl" />
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-secondary/30 rounded-full blur-2xl" />

          {/* Admin Shield Badge */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-accent/20 text-accent border border-accent/30 font-primary backdrop-blur-md">
              <i className="ph-fill ph-shield-check text-sm" />
              ផ្ទាំងគ្រប់គ្រងរដ្ឋបាល (Admin Panel)
            </span>
          </div>

          {/* Logo & Headline */}
          <div className="relative z-10 my-auto py-6">
            <img
              src={LogoNoBg}
              alt="LibreShelf Admin Logo"
              className="w-44 lg:w-52 mx-auto drop-shadow-xl hover:scale-105 transition-transform duration-300"
            />
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white mt-4 mb-2 font-primary leading-snug">
              LibreShelf <span className="text-accent">Admin Portal</span>
            </h2>
            <p className="text-blue-100/80 text-xs lg:text-sm leading-relaxed font-primary max-w-xs mx-auto">
              ប្រព័ន្ធគ្រប់គ្រងសៀវភៅ ប្រភេទសៀវភៅ និងអ្នកប្រើប្រាស់សម្រាប់ LibreShelf Library System។
            </p>
          </div>

          {/* Security Notice */}
          <div className="relative z-10 flex items-center justify-center gap-2 w-full pt-4 border-t border-white/10 text-[11px] text-blue-200/90 font-primary">
            <i className="ph-bold ph-lock-key" />
            <span>សម្រាប់តែគណនីមានសិទ្ធិជា Admin ប៉ុណ្ណោះ</span>
          </div>
        </div>

        {/* Right Side: Admin Login Form */}
        <div className="w-full md:w-1/2 p-7 sm:p-10 lg:p-12 flex flex-col justify-center bg-white dark:bg-slate-900">
          {/* Mobile Logo Branding */}
          <div className="md:hidden flex flex-col items-center mb-6 text-center">
            <img src={LogoNoBg} alt="LibreShelf Logo" className="w-24 mb-2" />
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent/20 text-accent font-primary">
              Admin Portal
            </span>
          </div>

          <div className="text-center md:text-left mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-primary tracking-tight">
              ចូលគ្រប់គ្រង
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-primary mt-1.5">
              សូមបញ្ចូលអ៊ីមែល និងពាក្យសម្ងាត់អ្នកគ្រប់គ្រង
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
                htmlFor="admin-email"
                className="block text-xs sm:text-sm font-bold font-primary text-slate-700 dark:text-slate-300"
              >
                អ៊ីមែល Admin <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <i className="ph-bold ph-envelope-simple absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary dark:group-focus-within:text-accent transition-colors text-lg" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-primary outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs sm:text-sm font-bold font-primary text-slate-700 dark:text-slate-300"
              >
                ពាក្យសម្ងាត់ <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <i className="ph-bold ph-lock-key absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary dark:group-focus-within:text-accent transition-colors text-lg" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-primary outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all"
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
                    កំពុងផ្ទៀងផ្ទាត់...
                  </span>
                </>
              ) : (
                <>
                  <span className="font-primary text-sm sm:text-base">
                    ចូលផ្ទាំងគ្រប់គ្រង
                  </span>
                  <i className="ph-bold ph-sign-in text-lg" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LogToAdmin;
