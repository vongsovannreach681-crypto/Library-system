import React, { useState } from "react";
import LogoNoBg from "../assets/NobgLogo.png";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleProfileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfile = () => {
    setProfile(null);
    setProfilePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("ពាក្យសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ។ សូមពិនិត្យម្តងទៀត។");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("password", password);
      if (profile) {
        formData.append("profile", profile);
      }

      const response = await api.post("/register", formData);
      const token = response.data.token;
      const userData = response.data.user;

      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      navigate("/");
    } catch (ex) {
      const errorMessage = ex.response?.data?.errors
        ? Object.values(ex.response.data.errors).flat().join(", ")
        : ex.response?.data?.message ||
          "ការចុះឈ្មោះមិនបានសម្រេច។ សូមព្យាយាមម្តងទៀត។";
      setError(errorMessage);
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsMismatch = password && confirmPassword && password !== confirmPassword;

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
      <div className="relative z-10 w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-[0_25px_70px_rgba(15,23,42,0.15)] border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col md:flex-row my-auto max-h-[94vh]">
        {/* Left Side: Brand Showcase */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-[#0c1a30] via-[#112d4e] to-[#1e3c72] relative flex-col items-center justify-between p-10 lg:p-12 text-center overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-accent/20 rounded-full blur-2xl" />
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-secondary/30 rounded-full blur-2xl" />

          {/* Brand Top Pill */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-accent border border-white/15 backdrop-blur-md font-primary">
              <i className="ph-fill ph-sparkle text-sm" />
              សហគមន៍អ្នកអាន LibreShelf
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
              បង្កើតគណនីថ្មី
            </h2>
            <p className="text-blue-100/80 text-xs lg:text-sm leading-relaxed font-primary max-w-xs mx-auto">
              ចូលរួមជាមួយសហគមន៍ LibreShelf ដើម្បីទទួលបានការអានសៀវភៅល្អៗ រក្សាទុកចំណូលចិត្ត និងចែករំលែកសៀវភៅរបស់អ្នក។
            </p>
          </div>

          {/* Benefits List */}
          <div className="relative z-10 w-full space-y-2 pt-4 border-t border-white/10 text-left text-xs text-blue-100 font-primary">
            <div className="flex items-center gap-2">
              <i className="ph-fill ph-check-circle text-accent text-sm shrink-0" />
              <span>បង្កើតកម្រងសៀវភៅផ្ទាល់ខ្លួន (Favorites)</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="ph-fill ph-check-circle text-accent text-sm shrink-0" />
              <span>ចែករំលែក និងបង្ហោះសៀវភៅថ្មីៗ</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="ph-fill ph-check-circle text-accent text-sm shrink-0" />
              <span>ចូលរួមពិភាក្សានៅក្នុងប្លុកសហគមន៍</span>
            </div>
          </div>
        </div>

        {/* Right Side: Register Form with Smooth Scroll */}
        <div className="w-full md:w-7/12 p-6 sm:p-10 lg:p-12 flex flex-col justify-start overflow-y-auto bg-white dark:bg-slate-900 overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
          {/* Mobile Logo Branding */}
          <div className="md:hidden flex flex-col items-center mb-6 text-center">
            <img src={LogoNoBg} alt="LibreShelf Logo" className="w-24 mb-2" />
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-white/10 dark:text-accent font-primary">
              LibreShelf Platform
            </span>
          </div>

          <div className="text-center md:text-left mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-primary tracking-tight">
              ចុះឈ្មោះប្រើប្រាស់
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-primary mt-1">
              សូមបំពេញព័ត៌មានខាងក្រោមដើម្បីបង្កើតគណនីថ្មី
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs sm:text-sm font-primary flex items-start gap-2.5 animate-fadeIn">
              <i className="ph-fill ph-warning-circle text-lg shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Picture Upload Avatar */}
            <div className="flex flex-col items-center justify-center pb-2">
              <div className="relative group">
                <label
                  htmlFor="profile-upload"
                  className="block cursor-pointer"
                  title="Click to choose profile picture"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-4 ring-slate-100 dark:ring-slate-800 shadow-md overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition group-hover:opacity-90">
                    {profilePreview ? (
                      <img
                        src={profilePreview}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <i className="ph-bold ph-user text-3xl sm:text-4xl text-slate-400 group-hover:text-secondary transition-colors" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 transition hover:bg-secondary">
                    <i className="ph-bold ph-camera text-sm" />
                  </div>
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileChange}
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-primary">
                  រូបថតគណនី (ស្រេចចិត្ត)
                </span>
                {profilePreview && (
                  <button
                    type="button"
                    onClick={removeProfile}
                    className="text-[11px] text-red-500 hover:text-red-600 font-primary font-semibold underline"
                  >
                    ដកចេញ
                  </button>
                )}
              </div>
            </div>

            {/* Name & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold font-primary text-slate-700 dark:text-slate-300">
                  ឈ្មោះពេញលេញ <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <i className="ph-bold ph-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary dark:group-focus-within:text-accent transition-colors text-base" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ឧ. សុខ ចាន់ដារា"
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-primary outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-secondary focus:ring-4 focus:ring-secondary/15 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold font-primary text-slate-700 dark:text-slate-300">
                  លេខទូរស័ព្ទ <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <i className="ph-bold ph-phone absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary dark:group-focus-within:text-accent transition-colors text-base" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="012 345 678"
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-primary outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-secondary focus:ring-4 focus:ring-secondary/15 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold font-primary text-slate-700 dark:text-slate-300">
                អ៊ីមែល <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <i className="ph-bold ph-envelope-simple absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary dark:group-focus-within:text-accent transition-colors text-base" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-primary outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-secondary focus:ring-4 focus:ring-secondary/15 transition-all"
                />
              </div>
            </div>

            {/* Passwords Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold font-primary text-slate-700 dark:text-slate-300">
                  ពាក្យសម្ងាត់ <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <i className="ph-bold ph-lock-key absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary dark:group-focus-within:text-accent transition-colors text-base" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-primary outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-secondary focus:ring-4 focus:ring-secondary/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    title={showPassword ? "Hide" : "Show"}
                  >
                    <i className={`ph-bold ${showPassword ? "ph-eye-slash" : "ph-eye"} text-base`} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold font-primary text-slate-700 dark:text-slate-300">
                  បញ្ជាក់ពាក្យសម្ងាត់ <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <i className="ph-bold ph-lock-key-open absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary dark:group-focus-within:text-accent transition-colors text-base" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-primary outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-secondary focus:ring-4 focus:ring-secondary/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    title={showConfirmPassword ? "Hide" : "Show"}
                  >
                    <i className={`ph-bold ${showConfirmPassword ? "ph-eye-slash" : "ph-eye"} text-base`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Password Match Status Hint */}
            {passwordsMatch && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-primary flex items-center gap-1.5">
                <i className="ph-bold ph-check text-xs" /> ពាក្យសម្ងាត់ផ្ទៀងផ្ទាត់ត្រឹមត្រូវ
              </p>
            )}
            {passwordsMismatch && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-primary flex items-center gap-1.5">
                <i className="ph-bold ph-x text-xs" /> ពាក្យសម្ងាត់ទាំងពីរមិនទាន់ត្រូវគ្នាទេ
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-primary via-[#1a3d6b] to-secondary hover:opacity-95 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="ph-bold ph-spinner animate-spin text-lg" />
                  <span className="font-primary text-sm sm:text-base">
                    កំពុងបង្កើតគណនី...
                  </span>
                </>
              ) : (
                <>
                  <i className="ph-bold ph-user-plus text-lg" />
                  <span className="font-primary text-sm sm:text-base">
                    បង្កើតគណនីថ្មី
                  </span>
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="pt-2 text-center">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-primary">
                មានគណនីរួចហើយ?{" "}
                <Link
                  to="/login"
                  className="text-secondary dark:text-accent font-bold hover:underline transition-colors ml-1"
                >
                  ចូលគណនីនៅទីនេះ
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
