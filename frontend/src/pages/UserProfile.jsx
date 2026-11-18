import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import Header from "../components/Header";
import PostHistory from "./PostHistory";

const getProfileImage = (person) =>
  person?.profile_url ||
  (person?.profile ? `http://localhost:8000/storage/${person.profile}` : "https://via.placeholder.com/300");

const normalizePost = (post) => ({
  ...post,
  likes_count: post.likes_count ?? post.likes?.length ?? 0,
  comments_count: post.comments_count ?? post.comments?.length ?? 0,
  liked_by_me: Boolean(post.liked_by_me),
  comments: Array.isArray(post.comments) ? post.comments : [],
});

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
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
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

  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    const loadActivity = async () => {
      setActivityLoading(true);
      setError("");

      try {
        const [favoritesRes, postsRes] = await Promise.all([
          api.get("/favorites"),
          api.get("/posts"),
        ]);

        const favorites = favoritesRes.data?.favorites || [];
        const postsPayload = postsRes.data?.data || [];
        const posts = Array.isArray(postsPayload)
          ? postsPayload
              .map(normalizePost)
              .filter(
                (post) =>
                  String(post.user_id ?? post.user?.id) === String(user.id),
              )
          : [];

        if (!isMounted) return;

        setFavoriteBooks(favorites);
        setUserPosts(posts);
      } catch (activityError) {
        console.error("Failed to load profile activity:", activityError);
        if (isMounted) {
          setError("Could not load your favorite books and posts right now.");
        }
      } finally {
        if (isMounted) {
          setActivityLoading(false);
        }
      }
    };

    loadActivity();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

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
    getProfileImage(user);

  return (
    <>
      <div className="fixed z-3 top-0 left-0 right-0">
        <Header />
      </div>
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-2 sm:px-6 lg:px-8">
        <section className="w-full">
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

        {!isEditing && (
          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f9d58]">
                    Favorite Book
                  </p>
                  <h2 className="mt-1 font-primary text-xl font-bold text-slate-800 dark:text-white">
                    Your latest saved book
                  </h2>
                </div>
                <i className="fa-solid fa-star text-[#0f9d58]" />
              </div>

              {activityLoading ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                  Loading your favorite books...
                </div>
              ) : favoriteBooks.length > 0 ? (
                <Link
                  to={`/bookDetail/${favoriteBooks[0].id}`}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-950"
                >
                  <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
                    <img
                      src={favoriteBooks[0].cover_image}
                      alt={favoriteBooks[0].title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="line-clamp-1 text-lg font-bold text-slate-900 dark:text-white">
                      {favoriteBooks[0].title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {favoriteBooks[0].author || favoriteBooks[0].category_name || "Book"}
                    </p>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {favoriteBooks[0].description || "Saved to your favorites."}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                  No favorite books yet.
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f9d58]">
                    Latest Post
                  </p>
                  <h2 className="mt-1 font-primary text-xl font-bold text-slate-800 dark:text-white">
                    Your recent post
                  </h2>
                </div>
                <i className="fa-solid fa-pen-to-square text-[#0f9d58]" />
              </div>

              {activityLoading ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                  Loading your posts...
                </div>
              ) : userPosts.length > 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <img
                      src={getProfileImage(user)}
                      alt={user.name}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {userPosts[0].content || "Shared post"}
                  </p>

                  {userPosts[0].image_url && (
                    <div className="mt-4 overflow-hidden rounded-xl">
                      <img
                        src={userPosts[0].image_url}
                        alt="Post attachment"
                        className="max-h-64 w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span>{userPosts[0].comments_count ?? 0} comments</span>
                    <span>{userPosts[0].likes_count ?? 0} likes</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                  No posts yet.
                </div>
              )}
            </article>
          </section>
        )}

        {!isEditing && (
          <PostHistory
            activeTab={activeTab}
            onTabChange={setActiveTab}
            posts={userPosts}
            favorites={favoriteBooks}
            loading={activityLoading}
            error={error}
          />
        )}
      </section>
    </>
  );
};

export default UserProfile;
