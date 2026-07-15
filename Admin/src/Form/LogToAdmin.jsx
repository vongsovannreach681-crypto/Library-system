import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const LogToAdmin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    setError("");

    try {
      const response = await api.post("/login", { email, password });
      const { token, user } = response.data;

      if (!token || !user || user.role !== "admin") {
        setError("Invalid credentials or not an admin.");
        return;
      }

      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex w-full max-w-4xl h-[600px]">
        <div className="hidden md:flex w-1/2 bg-primary relative flex-col items-center justify-center p-12 text-center">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          <div className="relative z-10">
            <img
              src="https://libre-shelf-final-project-dun.vercel.app/img/Libreshelf-dark-mode.png"
              alt="LibreShelf Logo"
              className="w-48 mx-auto mb-6"
            />
            <h2 className="text-3xl font-extrabold text-white mb-4 font-primary">
              ស្វាគមន៍មកកាន់ LibreShelf
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed font-primary">
              សូមចូលគណនីរបស់អ្នកដើម្បីចូលប្រើផ្ទាំងគ្រប់គ្រងសៀវភៅ ក្នុងប្រព័ន្ធ
              LibreShelf។ ប្រសិនបើអ្នកមិនមានគណនីទេ
              សូមទំនាក់ទំនងអ្នកគ្រប់គ្រងសម្រាប់ការចូលប្រើ។
            </p>
          </div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent rounded-full opacity-20 blur-2xl" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary rounded-full opacity-20 blur-2xl" />
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
          <div className="text-center md:text-left mb-8">
            <h1 className="text-3xl font-extrabold text-primary font-primary dark:text-white mb-2">
              ចូលគណនី
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-primary">
              សូមបញ្ចូលអ៊ីមែល និងពាក្យសម្ងាត់របស់អ្នកដើម្បីចូលគណនី
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-bold font-primary text-gray-700 dark:text-gray-300">
                អ៊ីមែល
              </label>
              <div className="relative group">
                <i className="ph-bold ph-user absolute left-3 top-3.5 text-gray-400 group-focus-within:text-accent transition-colors text-lg" />
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@email.com"
                  required
                  className="w-full text-black pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-sm font-bold font-primary text-gray-700 dark:text-gray-300">
                  ពាក្យសម្ងាត់
                </label>
              </div>
              <div className="relative group">
                <i className="ph-bold text-white ph-lock-key absolute left-3 top-3.5 text-gray-400 group-focus-within:text-accent transition-colors text-lg" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full text-white pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                />
              </div>
            </div>
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium flex items-center gap-2">
                <i className="ph-bold ph-warning-circle text-lg" />
                <span>{error}</span>
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="text-sm font-medium font-primary">ចូលគណនី</span>
              <i className="ph-bold ph-sign-in" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LogToAdmin;
