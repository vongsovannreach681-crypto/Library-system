import React, { useState } from "react";
import LogoNoBg from "../assets/NoBgLogo.png";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profile, setProfile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
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

      const response = await api.post("/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const token = response.data.token;
      const userData = response.data.user;

      // Save token and user data to localStorage
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      alert("Account created successfully!");

      navigate("/");
    } catch (ex) {
      const errorMessage = ex.response?.data?.errors
        ? Object.values(ex.response.data.errors).join(", ")
        : ex.response?.data?.message ||
          "Registration failed. Please try again.";
      setError(errorMessage);
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 pt-24">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex w-full max-w-5xl h-auto md:h-[700px]">
        {/* Left Sidebar */}
        <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex-col items-center justify-center p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <img src={LogoNoBg} alt="LibreShelf" className="w-៥2 mx-auto " />
            <h2 className="text-4xl font-extrabold text-white mb-6 font-primary leading-tight">
              បង្កើតគណនី
            </h2>
            <p className="text-blue-200 text-base leading-relaxed font-primary">
              បង្កើតគណនីដើម្បីចាប់ផ្តើមការដើរលេងរបស់អ្នក។ ផ្ទុករូបថតសៀវភៅ
              រក្សាទុកលក្ខណៈពិសេស ហើយតាមដានលក្ខណៈវិនិច្ឆ័យរបស់អ្នក។
            </p>
          </div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-secondary rounded-full opacity-10 blur-3xl"></div>
        </div>

        {/* Right Content */}
        <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center relative">
          {/* Close Button for Mobile */}
          <button className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2">
            <i className="ph-bold ph-x text-xl"></i>
          </button>

          {/* Header */}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
              <i className="ph-bold ph-warning-circle text-lg mt-0.5 flex-shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Profile Picture Upload */}
            <div className="mb-6 flex justify-center">
              <label className="cursor-pointer">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary p-1 flex items-center justify-center shadow-lg">
                    {profilePreview ? (
                      <img
                        src={profilePreview}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                        <i className="ph-bold ph-user text-3xl text-gray-400"></i>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-primary hover:bg-secondary text-white p-2 rounded-full shadow-lg transition-colors cursor-pointer">
                    <i className="ph-bold ph-camera text-lg"></i>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Full Name */}
            <div>
              <label className=" font-primary text-primary block text-xs font-bold uppercase tracking-wider  dark:text-gray-300 mb-2">
                ឈ្មោះពេញលេញ
              </label>
              <div className="relative">
                <i className="ph-bold ph-user absolute left-4 top-4 text-gray-400 text-lg"></i>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ឈ្មោះរបស់អ្នក"
                  required
                  className="w-full font-primary text-white pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block font-primary text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                លេខទូរស័ព្ទ
              </label>
              <div className="relative">
                <i className="ph-bold ph-phone absolute left-4 top-4 text-gray-400 text-lg"></i>
                <input
                  type="number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="លេខទូរស័ព្ទរបស់អ្នក"
                  required
                  className="w-full font-primary text-white pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className=" font-primary text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                អ៊ីមែល
              </label>
              <div className="relative">
                <i className="ph-bold ph-envelope absolute left-4 top-4 text-gray-400 text-lg"></i>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="អ៊ីមែល"
                  required
                  className="w-full font-primary text-white pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            {/* Password and Confirm */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-primary text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  ពាក្យសម្ងាត់
                </label>
                <div className="relative">
                  <i className="ph-bold ph-lock absolute left-4 top-4 text-gray-400 text-lg"></i>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ពាក្យសម្ងាត់"
                    required
                    minLength="8"
                    className="w-full font-primary text-white pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-primary text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  បញ្ជាក់ពាក្យសម្ងាត់
                </label>
                <div className="relative">
                  <i className="ph-bold ph-check absolute left-4 top-4 text-gray-400 text-lg"></i>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="ពាក្យសម្ងាត់"
                    required
                    className="w-full font-primary text-white pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-primary cursor-pointer hover:bg-accent translate-middle-y from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 font-primary text-base"
            >
              <i className="ph-bold ph-user-plus text-lg"></i>
              <span>{loading ? "កំពុងបង្កើត..." : "បង្កើតគណនី"}</span>
            </button>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 text-accent font-primary mt-6">
              មានគណនីរួចហើយ?{" "}
              <Link
                to="/login"
                className="text-accent hover:text-secondary font-bold transition-colors"
              >
                ចូលគណនី
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
