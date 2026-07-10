import React, { useState } from "react";
import LogoNoBg from "../assets/NoBgLogo.png";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      alert("Logged in successfully!");

      navigate("/");
    } catch (ex) {
      setError(ex.response?.data?.message || "Login failed. Please try again.");
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex w-full max-w-4xl h-[600px]">
          <div className="hidden md:flex w-1/2 bg-primary relative flex-col items-center justify-center p-12 text-center">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="relative z-10">
              <img
                src={LogoNoBg}
                alt="LibreShelf Logo"
                className="w-80 mx-auto "
              />
              <h2 className="text-3xl font-extrabold text-white mb-4 font-primary">
                ស្វាគមន៍មកកាន់ LibreShelf
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed font-primary">
                សូមចូលគណនីរបស់អ្នកដើម្បីចូលប្រើផ្ទាំងគ្រប់គ្រងសៀវភៅ
                ក្នុងប្រព័ន្ធ LibreShelf។ ប្រសិនបើអ្នកមិនមានគណនីទេ
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
                    className="w-full font-semibold text-white pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
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
                disabled={loading}
                className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="font-primary text-medium">
                  {loading ? "កំពុងចូលគណនី..." : "ចូលគណនី"}
                </span>
                <i className="ph-bold ph-sign-in" />
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400 font-primary mt-4">
                មិនមានគណនីទេ?{" "}
                <Link
                  to="/register"
                  className="text-primary hover:text-secondary font-semibold transition-colors"
                >
                  បង្កើតគណនីនៅទីនេះ
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
