import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Header from "../components/Header";
import FavoritesPage from "./FavoritesPage";
import PostHistory from "./PostHistory";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [profile, setProfile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("auth_token");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData({
      name: parsedUser.name || "",
      email: parsedUser.email || "",
      phone: parsedUser.phone || "",
    });
  }, [navigate]);

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Reject files over 2MB before preview/upload (matches backend max:2048 rule)
      if (file.size > 2 * 1024 * 1024) {
        setError("រូបភាពត្រូវតែតូចជាង 2MB");
        return;
      }
      setProfile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard clause: Prevent submitting if user or user.id is missing
    if (!user || !user.id) {
      setError(
        "មិនអាចស្វែងរក ID របស់អ្នកប្រើប្រាស់បានទេ។ សូមព្យាយាមចាកចេញ រួចចូលម្តងទៀត។ (User ID is undefined. Please log out and log back in.)",
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = new FormData();
      data.append("name", formData.name || "");
      data.append("email", formData.email || "");
      data.append("phone", formData.phone || "");

      if (profile) {
        data.append("profile", profile);
      }

      // Update the signed-in user's own profile via the auth-protected endpoint.
      // Let Axios handle Content-Type boundary automatically.
      const response = await api.post(`/user/${user.id}`, data, {
        headers: {
          Accept: "application/json",
        },
      });

      const updatedUser = response.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setFormData({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
      });
      window.dispatchEvent(
        new CustomEvent("user-updated", { detail: updatedUser }),
      );
      setIsEditing(false);
      setProfile(null);
      setProfilePreview(null);
      setSuccess(
        "កែប្រែព័ត៌មានផ្ទាល់ខ្លួនបានជោគជ័យ! (Profile updated successfully!)",
      );
    } catch (ex) {
      const errorMessage =
        ex.response?.data?.message || "Failed to update profile";
      setError(errorMessage);
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfile(null);
    setProfilePreview(null);
    setError("");
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-3 text-primary font-primary">
          <i className="ph-bold ph-spinner text-2xl animate-spin" />
          <span>កំពុងផ្ទុក...</span>
        </div>
      </div>
    );
  }

  const avatarSrc =
    profilePreview ||
    (user.profile
      ? `http://localhost:8000/storage/${user.profile}`
      : "https://via.placeholder.com/300");

  return (
    <>
      <div className="fixed z-3 top-0 left-0 right-0">
        <Header />
      </div>
      <section className="flex gap-6 justify-center mt-2">
        
        <section className="w-[100%] h-screen ">
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-800 shadowCus borderCus rounded-2xl overflow-hidden">
            {/* Cover Photo */}
            <div className="relative h-48 md:h-56 bg-gradient-to-br from-primary via-primary to-secondary overflow-hidden">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 70%, white 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              {isEditing && (
                <button
                  type="button"
                  className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 hover:bg-white text-primary text-xs font-bold font-primary px-3 py-2 rounded-lg shadow-md transition-colors"
                >
                  <i className="ph-bold ph-camera text-base" />
                  ប្តូររូបគម្រប
                </button>
              )}
            </div>

            {/* Avatar + Name Row */}
            <div className="px-6 md:px-10 pb-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-14">
                <div className="flex flex-col align-middle sm:flex-row sm:items-end gap-4">
                  {/* Avatar */}
                  <div className="relative w-50 h-50 shrink-0">
                    <img
                      src={avatarSrc}
                      alt={user.name}
                      className="w-50 h-50 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg bg-gray-100"
                    />
                    {isEditing && (
                      <label className="absolute bottom-1 right-1 cursor-pointer bg-accent hover:bg-secondary text-white p-2 rounded-full shadow-md transition-colors">
                        <i className="ph-bold ph-camera text-sm" />
                        <input
                          type="file"
                          accept="image/"
                          onChange={handleProfileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Name & Meta */}
                  <div className="-mt-50 text-center items-center sm:text-left">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-primary dark:text-white font-primary">
                      {user.name}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-primary mt-1">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {!isEditing && (
                  <div className="flex gap-2 mt-4 sm:mt-0 justify-center sm:justify-end">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-accent hover:bg-secondary text-white text-sm font-bold font-primary px-4 py-2.5 rounded-lg shadow-sm transition-all active:scale-95"
                    >
                      <i className="ph-bold ph-pencil-simple text-base" />
                      កែប្រែប្រវត្តិរូប
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 text-sm font-bold font-primary px-4 py-2.5 rounded-lg transition-all active:scale-95"
                    >
                      <i className="ph-bold ph-sign-out text-base" />
                      ចាកចេញ
                    </button>
                  </div>
                )}
              </div>

              {/* Success Message */}
              {success && !isEditing && (
                <div className="mt-6 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm font-medium font-primary flex items-center gap-2">
                  <i className="ph-bold ph-check-circle text-lg flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-slate-700 mt-6" />

              {!isEditing ? (
                /* --- Info View --- */
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-900">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <i className="ph-bold ph-envelope-simple text-white text-lg" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-primary uppercase tracking-wide">
                        អ៊ីមែល
                      </p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 font-primary truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-900">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <i className="ph-bold ph-phone text-white text-lg" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-primary uppercase tracking-wide">
                        លេខទូរស័ព្ទ
                      </p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 font-primary truncate">
                        {user.phone || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* --- Edit Form --- */
                <form
                  onSubmit={handleSubmit}
                  className="mt-6 space-y-4 max-w-lg"
                >
                  <h2 className="text-lg font-bold text-primary dark:text-white font-primary mb-2">
                    កែប្រែព័ត៌មានប្រវត្តិរូប
                  </h2>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium font-primary flex items-center gap-2">
                      <i className="ph-bold ph-warning-circle text-lg flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-sm font-bold font-primary text-gray-700 dark:text-gray-300">
                      ឈ្មោះពេញលេញ
                    </label>
                    <div className="relative group">
                      <i className="ph-bold ph-user absolute left-3 top-3.5 text-gray-400 group-focus-within:text-accent transition-colors text-lg" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full font-semibold pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold font-primary text-gray-700 dark:text-gray-300">
                      អ៊ីមែល
                    </label>
                    <div className="relative group">
                      <i className="ph-bold ph-envelope absolute left-3 top-3.5 text-gray-400 group-focus-within:text-accent transition-colors text-lg" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full font-semibold pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold font-primary text-gray-700 dark:text-gray-300">
                      លេខទូរស័ព្ទ
                    </label>
                    <div className="relative group">
                      <i className="ph-bold ph-phone absolute left-3 top-3.5 text-gray-400 group-focus-within:text-accent transition-colors text-lg" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full font-semibold pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center gap-2 bg-accent hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold font-primary px-5 py-3 rounded-lg shadow-sm transition-all active:scale-95"
                    >
                      {loading ? (
                        <i className="ph-bold ph-spinner text-base animate-spin" />
                      ) : (
                        <i className="ph-bold ph-check text-base" />
                      )}
                      {loading ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 text-sm font-bold font-primary px-5 py-3 rounded-lg transition-all active:scale-95"
                    >
                      <i className="ph-bold ph-x text-base" />
                      បោះបង់
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

       
      </section>
    </>
  );
};

export default UserProfile;
