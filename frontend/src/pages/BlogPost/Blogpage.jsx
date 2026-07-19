import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import BlogHero from "../../components/HeroSection/BlogHero";

const formatCount = (value = 0) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${value}`;
};

const formatRelativeTime = (dateValue) => {
  if (!dateValue) return "Just now";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";

const normalizePost = (post) => ({
  ...post,
  likes_count: post.likes_count ?? post.likes?.length ?? 0,
  comments_count: post.comments_count ?? post.comments?.length ?? 0,
  liked_by_me: Boolean(post.liked_by_me),
  comments: Array.isArray(post.comments) ? post.comments : [],
});

const Avatar = ({ person, sizeClass = "h-9 w-9", textClass = "text-xs" }) => {
  const imageSrc = person?.profile_url || person?.profile || null;
  const name = person?.name || "User";

  return (
    <div
      className={`${sizeClass} shrink-0 overflow-hidden rounded-full border-2 border-white dark:border-slate-800 bg-gradient-to-br from-primary to-secondary text-white shadow-sm`}
    >
      {imageSrc ? (
        <img src={imageSrc} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className={`flex h-full w-full items-center justify-center font-bold ${textClass}`}>
          {getInitials(name)}
        </div>
      )}
    </div>
  );
};

const SectionHeading = ({ title, action }) => (
  <div className="flex items-center gap-4 w-full">
    <h2 className="whitespace-nowrap font-primary text-base font-extrabold text-slate-800 dark:text-white">{title}</h2>
    <span className="h-px flex-1 bg-gradient-to-r from-orange-500/80 via-orange-500/20 to-transparent" />
    {action}
  </div>
);

const PostCard = ({
  post,
  currentUser,
  onLike,
  canInteract,
  onRequireLogin,
  canManage,
  onEditPost,
  onDeletePost,
}) => {
  const mediaSrc = post.image_url || post.image || null;
  const comments = post.comments || [];
  const previewComments = comments.slice(0, 2);

  return (
    <article className="flex flex-col h-full min-h-[400px] overflow-hidden rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#11151f] shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.35)] transition-all duration-200">
      {mediaSrc ? (
        <div className="h-[220px] w-full overflow-hidden bg-slate-100 dark:bg-[#1a2130]">
          <img src={mediaSrc} alt="Post attachment" className="h-full w-full object-cover" loading="lazy" />
        </div>
      ) : (
        <div className="h-[220px] w-full flex items-center justify-center bg-slate-100 dark:bg-[#161c2c]/40 border-b border-slate-200/40 dark:border-white/5 text-slate-400">
          <i className="fa-regular fa-image text-3xl opacity-30" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar person={post.user} sizeClass="h-8 w-8" textClass="text-[10px]" />
          <div className="min-w-0">
            <h3 className="truncate font-primary text-xs font-bold leading-tight text-slate-800 dark:text-white">
              {post.user?.name || "Unknown user"}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
              <span>{formatRelativeTime(post.created_at)}</span>
              <i className="fa-solid fa-earth-africa text-[9px]" />
            </div>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => onEditPost(post)}
              className="rounded-full p-1 text-xs text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/5 hover:text-orange-500"
              aria-label="Edit post"
            >
              <i className="fa-solid fa-pen-to-square" />
            </button>
            <button
              type="button"
              onClick={() => onDeletePost(post)}
              className="rounded-full p-1 text-xs text-slate-400 transition hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500"
              aria-label="Delete post"
            >
              <i className="fa-solid fa-trash-can" />
            </button>
          </div>
        )}
      </div>

      <div className="px-4 pb-3 pt-2 flex-1 flex flex-col justify-between">
        <p className="whitespace-pre-line text-xs font-primary leading-5 text-slate-600 dark:text-slate-200 line-clamp-3">
          {post.content}
        </p>
        
        <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-white/5 pt-2">
          <span className="inline-flex items-center gap-1">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[8px] text-white">
              <i className="fa-solid fa-thumbs-up" />
            </span>
            {formatCount(post.likes_count)}
          </span>
          <span className="font-primary">{formatCount(post.comments_count)} មតិយោបល់</span>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex items-center border-y border-slate-100 dark:border-white/8 px-2 py-0.5">
          <button
            type="button"
            onClick={() => {
              if (!canInteract) {
                onRequireLogin();
                return;
              }
              onLike(post.id);
            }}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition ${
              post.liked_by_me ? "text-secondary font-bold" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <i className={`fa-${post.liked_by_me ? "solid" : "regular"} fa-thumbs-up`} />
            <span className="font-primary">ចូលចិត្ត</span>
          </button>
        </div>

        {previewComments.length > 0 && (
          <div className="space-y-2 px-4 py-3 bg-slate-50/50 dark:bg-black/15">
            <div className="space-y-1.5">
              {previewComments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2">
                  <Avatar person={comment.user} sizeClass="h-6 w-6" textClass="text-[9px]" />
                  <div className="min-w-0 flex-1 rounded-lg bg-slate-100 dark:bg-white/5 px-2.5 py-1.5 border border-slate-200/40 dark:border-white/5">
                    <p className="truncate text-[11px] font-bold text-slate-800 dark:text-white">
                      {comment.user?.name || "Someone"}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-slate-600 dark:text-slate-300 truncate">
                      {comment.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

const ComposerModal = ({
  user,
  composer,
  imagePreview,
  error,
  success,
  submittingPost,
  fileInputRef,
  mode,
  onClose,
  onSubmit,
  onContentChange,
  onImageChange,
  onRemoveImage,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 dark:border-white/8 bg-white dark:bg-[#11151f] shadow-[0_24px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/8 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              {mode === "edit" ? "Edit post" : "Create post"}
            </p>
            <h2 className="font-primary text-2xl font-bold text-slate-800 dark:text-white">
              {mode === "edit" ? "Update your post" : "What is on your mind?"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white transition hover:bg-slate-200"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="flex items-start gap-3 mb-4">
            <Avatar person={user} sizeClass="h-12 w-12" textClass="text-base" />
            <div className="min-w-0">
              <h3 className="font-primary text-base font-bold text-slate-800 dark:text-white">
                {user?.name || "User"}
              </h3>
              <p className="text-xs text-slate-400">Share with your followers and community.</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <textarea
              value={composer.content}
              onChange={(e) => onContentChange(e.target.value)}
              rows={6}
              placeholder="What's on your mind?"
              className="w-full resize-none rounded-2xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/5 px-4 py-3 text-sm text-slate-800 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-orange-500/50 focus:dark:bg-[#161c2c]"
            />

            {imagePreview && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/8 max-h-[200px]">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            {error && <div className="rounded-xl bg-red-50 p-3 text-xs text-red-500 dark:bg-red-950/30 dark:text-red-400">{error}</div>}
            {success && <div className="rounded-xl bg-green-50 p-3 text-xs text-green-600 dark:bg-green-950/30 dark:text-green-400">{success}</div>}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-white/8 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageChange} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-white/5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-white transition hover:bg-slate-200"
                >
                  <i className="fa-regular fa-image text-orange-500 dark:text-orange-400" /> Photo
                </button>
                {composer.image && (
                  <button
                    type="button"
                    onClick={onRemoveImage}
                    className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-500 transition"
                  >
                    Remove
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={submittingPost}
                className="rounded-full bg-secondary px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {mode === "edit" ? "Save changes" : "Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Blogpage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [pageMeta, setPageMeta] = useState({ current_page: 1, last_page: 1, next_page_url: null });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [composer, setComposer] = useState({ content: "", image: null });
  const [imagePreview, setImagePreview] = useState("");

  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const resetComposer = () => {
    setComposer({ content: "", image: null });
    setImagePreview("");
    setEditingPost(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const requireLogin = () => navigate("/login");

  const openCreateComposer = () => {
    setError(""); setSuccess(""); setEditingPost(null);
    setComposer({ content: "", image: null }); setImagePreview("");
    setIsComposerOpen(true);
  };

  const openEditComposer = (post) => {
    if (!user) { requireLogin(); return; }
    setError(""); setSuccess(""); setEditingPost(post);
    setComposer({ content: post.content || "", image: null });
    setImagePreview(post.image_url || post.image || "");
    setIsComposerOpen(true);
  };

  const closeComposer = () => { setIsComposerOpen(false); resetComposer(); };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try { setUser(JSON.parse(userData)); } catch {
        localStorage.removeItem("auth_token"); localStorage.removeItem("user"); setUser(null);
      }
    } else { setUser(null); }
    setIsBootstrapped(true);
  }, [navigate]);

  useEffect(() => { return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); }; }, [imagePreview]);

  const fetchPosts = async (url = "/posts", append = false) => {
    try {
      if (append) setLoadingMore(true); else setLoading(true);
      const response = await api.get(url);
      const payload = response.data;
      const nextPosts = Array.isArray(payload?.data) ? payload.data.map(normalizePost) : [];
      setPosts((current) => (append ? [...current, ...nextPosts] : nextPosts));
      setPageMeta({
        current_page: payload?.current_page ?? 1,
        last_page: payload?.last_page ?? 1,
        next_page_url: payload?.next_page_url ?? null,
      });
    } catch {
      setError("We could not load the feed right now.");
    } finally { setLoading(false); setLoadingMore(false); }
  };

  useEffect(() => { if (isBootstrapped) fetchPosts(); }, [isBootstrapped]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Please choose an image smaller than 5MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setComposer((current) => ({ ...current, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSavePost = async (event) => {
    event.preventDefault();
    if (!user) { requireLogin(); return; }
    const content = composer.content.trim();
    if (!content) return;
    try {
      setSubmittingPost(true);
      const formData = new FormData();
      formData.append("content", content);
      if (composer.image) {
        formData.append("image", composer.image);
      }
      
      let response;
      if (editingPost) {
        formData.append("_method", "PUT");
        response = await api.post(`/posts/${editingPost.id}`, formData);
      } else {
        response = await api.post("/posts", formData);
      }

      const savedPost = normalizePost(response.data.post);
      setPosts((current) => editingPost ? current.map((p) => (p.id === savedPost.id ? { ...p, ...savedPost } : p)) : [savedPost, ...current]);
      closeComposer();
    } catch { setError("We could not save your post."); } finally { setSubmittingPost(false); }
  };

  const handleDeletePost = async (post) => {
    if (!user) { requireLogin(); return; }
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${post.id}`);
      setPosts((current) => current.filter((item) => item.id !== post.id));
    } catch { setError("Could not delete post."); }
  };

  const handleLike = async (postId) => {
    if (!user) { requireLogin(); return; }
    try {
      const response = await api.post(`/posts/${postId}/like`);
      setPosts((current) => current.map((p) => p.id === postId ? { ...p, liked_by_me: response.data.liked, likes_count: response.data.likes_count } : p));
    } catch { setError("Unable to update like."); }
  };

  const loadMore = () => {
    if (pageMeta.next_page_url) fetchPosts(pageMeta.next_page_url, true);
  };

  if (!isBootstrapped) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 dark:bg-[#05070d]">
        <div className="flex items-center gap-3 text-orange-500 dark:text-orange-400">
          <i className="fa-solid fa-spinner animate-spin text-2xl" />
          <span className="font-primary text-sm font-semibold">Loading your feed...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070d] pb-16 transition-colors duration-200">
      <BlogHero user={user} postCount={posts.length} onNewPostClick={() => (user ? openCreateComposer() : requireLogin())} isAuthenticated={Boolean(user)} />
      
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_380px] items-start">
          
          <div className="space-y-8​  ">
            <section className="flex items-center sticky  justify-between gap-4 rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#11151f] px-4 py-3.5 shadow-xs">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar person={user} sizeClass="h-9 w-9" textClass="text-xs" />
                <h1 className="truncate font-primary text-sm font-bold text-slate-800 dark:text-white">
                  {user ? `សួរស្តី! ${user.name}` : "សូមស្វាគមន៍!"}
                </h1>
              </div>
              <div className="flex shrink-0 items-center gap-2​">
                <button type="button" onClick={() => (user ? openCreateComposer() : requireLogin())} className="font-primary inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-xs font-bold text-white transition hover:opacity-90 cursor-pointer">
                  <i className="fa-solid fa-pen-to-square" /> បង្ហោះសារ
                </button>
              </div>
            </section>

            <section className="space-y-4 my-4">
              <SectionHeading 
                title="ការបង្ហោះលេចធ្លោទាំងអស់" 
                action={
                  pageMeta.next_page_url ? (
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="shrink-0 font-primary text-xs font-bold text-orange-500 dark:text-orange-400 transition hover:underline disabled:opacity-50"
                    >
                      {loadingMore ? "..." : "មើលបន្ថែមទៀត"}
                    </button>
                  ) : null
                }
              />
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[400px] animate-pulse rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#11151f]" />
                  <div className="h-[400px] animate-pulse rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#11151f]" />
                </div>
              ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={user}
                      onLike={handleLike}
                      canInteract={Boolean(user)}
                      onRequireLogin={requireLogin}
                      canManage={Boolean(user && (user.id === post.user_id || user.id === post.user?.id))}
                      onEditPost={openEditComposer}
                      onDeletePost={handleDeletePost}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-[#11151f] p-10 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-white/5 text-2xl text-orange-500 dark:text-orange-400">
                    <i className="fa-regular fa-face-smile" />
                  </div>
                  <h3 className="mt-4 font-primary text-base font-bold text-slate-800 dark:text-white">Your feed is empty</h3>
                </div>
              )}
            </section>
          </div>
          
          <aside className="hidden xl:flex sticky top-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#11151f]/60 p-6 text-center shadow-xs min-h-[300px]">
              
            <i className="fa-solid fa-robot text-2xl text-orange-500/70 dark:text-orange-400/70 mb-2" />
            <p className="font-primary text-xs text-slate-400 dark:text-slate-500 font-medium">កន្លែងសម្រាប់ AI Chat Bot</p>
          </aside>

        </div>
      </section>

      <button
        type="button"
        onClick={() => setIsMobileChatOpen(true)}
        className="xl:hidden fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-white shadow-xl hover:opacity-90 active:scale-95 transition"
        aria-label="Open AI Chat"
      >
        <i className="fa-solid fa-robot text-xl" />
      </button>

      {isMobileChatOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end items-center bg-black/60 dark:bg-black/70 sm:p-4 backdrop-blur-sm xl:hidden">
          <div className="w-full max-w-xl bg-white dark:bg-[#11151f] rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 dark:border-white/10 shadow-2xl transition-all max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 px-5 py-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-robot text-lg text-secondary" />
                <h3 className="font-primary text-sm font-bold text-slate-800 dark:text-white">AI Chat Bot</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileChatOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white hover:bg-slate-200 transition"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 min-h-[350px] flex flex-col items-center justify-center text-center">
              <i className="fa-solid fa-robot text-3xl text-orange-500/40 mb-3" />
              <p className="font-primary text-xs text-slate-400 dark:text-slate-500">កន្លែងសម្រាប់ AI Chat Bot (ទម្រង់ទូរស័ព្ទ)</p>
            </div>

          </div>
        </div>
      )}

      {isComposerOpen && (
        <ComposerModal 
          user={user} 
          composer={composer} 
          imagePreview={imagePreview}
          error={error}
          success={success}
          submittingPost={submittingPost} 
          fileInputRef={fileInputRef}
          mode={editingPost ? "edit" : "create"} 
          onClose={closeComposer} 
          onSubmit={handleSavePost} 
          onContentChange={(value) => setComposer((current) => ({ ...current, content: value }))}
          onImageChange={handleImageChange}
          onRemoveImage={() => {
            setComposer((current) => ({ ...current, image: null }));
            setImagePreview("");
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />
      )}
    </main>
  );
};

export default Blogpage;