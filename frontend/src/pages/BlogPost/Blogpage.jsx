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

const Avatar = ({ person, sizeClass = "h-12 w-12", textClass = "text-sm" }) => {
  const imageSrc = person?.profile_url || person?.profile || null;
  const name = person?.name || "User";

  return (
    <div
      className={`${sizeClass} shrink-0 overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-primary to-secondary text-white shadow-sm`}
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

const PostCard = ({
  post,
  currentUser,
  onLike,
  onCommentSubmit,
  commentDraft,
  onCommentChange,
  submittingCommentId,
  canInteract,
  onRequireLogin,
  canManage,
  onEditPost,
  onDeletePost,
}) => {
  const mediaSrc = post.image_url || post.image || null;
  const comments = post.comments || [];
  const previewComments = comments.slice(0, 2);
  const isSubmittingComment = submittingCommentId === post.id;

  return (
    <article className="overflow-hidden rounded-3xl border border-light-gray/70 bg-pure-white shadow-[0_12px_30px_rgba(17,45,78,0.08)]">
      <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar person={post.user} sizeClass="h-12 w-12" />
          <div className="min-w-0">
            <h3 className="truncate font-primary text-base font-bold text-text-black">
              {post.user?.name || "Unknown user"}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-dark-gray">
              <span>{formatRelativeTime(post.created_at)}</span>
              
              <i class="fa-solid fa-earth-africa"></i>
              <span className="font-primary">ទាំងអស់</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => onEditPost(post)}
                className="rounded-full p-2 text-dark-gray transition hover:bg-background hover:text-primary"
                aria-label="Edit post"
              >
                <i className="fa-solid fa-pen-to-square" />
              </button>
              <button
                type="button"
                onClick={() => onDeletePost(post)}
                className="rounded-full p-2 text-dark-gray transition hover:bg-red-50 hover:text-red-600"
                aria-label="Delete post"
              >
                <i className="fa-solid fa-trash-can" />
              </button>
            </>
          )}
          <button
            type="button"
            className="rounded-full p-2 text-dark-gray transition hover:bg-background hover:text-primary"
            aria-label="More options"
          >
            <i className="fa-solid fa-ellipsis" />
          </button>
        </div>
      </div>

      <div className="px-5 pb-4 pt-4 sm:px-6">
        <p className="whitespace-pre-line text-sm font-primary leading-7 text-text-black">
          {post.content}
          
        </p>
      </div>

      {mediaSrc && (
        <div className="border-y border-light-gray/70 bg-background">
          <img
            src={mediaSrc}
            alt="Post attachment"
            className=" w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-4 text-sm text-dark-gray">
          <span className="inline-flex items-center gap-2">
            <span className="flex h-7 w-7 font-primary items-center justify-center rounded-full bg-secondary text-xs text-pure-white">
              <i className="fa-solid fa-thumbs-up" />
            </span >
            {formatCount(post.likes_count)} <span className="font-primary">ចំនួនអ្នកចូលចិត្ត</span>
          </span>
          <span className="font-primary">{formatCount(post.comments_count)} មតិយោបល់</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!canInteract) {
                onRequireLogin();
                return;
              }
              onLike(post.id);
            }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              post.liked_by_me
                ? "bg-primary text-pure-white shadow-sm"
                : "bg-background text-text-black hover:bg-light-gray/40"
            }`}
          >
            <i className={`fa-${post.liked_by_me ? "solid" : "regular"} fa-thumbs-up`} />
            <span className="font-primary">ចូលចិត្ត</span>
          </button>
        </div>
      </div>

      <div className="space-y-3 border-t border-light-gray/70 px-5 py-4 sm:px-6">
        {previewComments.length > 0 ? (
          <div className="space-y-3">
            {previewComments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <Avatar person={comment.user} sizeClass="h-9 w-9" textClass="text-xs" />
                <div className="min-w-0 flex-1 rounded-2xl bg-background px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-text-black">
                      {comment.user?.name || "Someone"}
                    </p>
                    <span className="shrink-0 text-[11px] text-dark-gray">
                      {formatRelativeTime(comment.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm leading-6 text-text-black">
                    {comment.comment}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl font-primary bg-background px-4 py-3 text-sm text-dark-gray">
            មិនទាន់មានមតិយោបល់ទេ
          </div>
        )}

        {canInteract ? (
          <form
            onSubmit={(e) => onCommentSubmit(e, post.id)}
            className="flex items-end gap-3 rounded-2xl border border-light-gray/70 bg-pure-white p-3"
          >
            <Avatar person={currentUser} sizeClass="h-9 w-9" textClass="text-xs" />
            <div className="min-w-0 flex-1">
              <textarea
                value={commentDraft}
                onChange={(e) => onCommentChange(post.id, e.target.value)}
                rows={2}
                placeholder="បញ្ជេញមតិយោបល់"
                className="w-full font-primary resize-none rounded-xl border border-transparent bg-background px-3 py-2 text-sm text-text-black outline-none placeholder:text-dark-gray focus:border-secondary focus:bg-pure-white"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmittingComment || !commentDraft.trim()}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-pure-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmittingComment ? (
                <i className="fa-solid fa-spinner animate-spin" />
              ) : (
                <i className="fa-solid fa-paper-plane" />
              )}
              Send
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={onRequireLogin}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-light-gray/70 bg-background px-4 py-3 text-left text-sm text-dark-gray transition hover:border-secondary"
          >
            <span>Sign in to like or comment on public posts.</span>
            <i className="fa-solid fa-arrow-right text-secondary" />
          </button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#112d4e]/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] bg-pure-white shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between border-b border-light-gray/70 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-dark-gray">
              {mode === "edit" ? "Edit post" : "Create post"}
            </p>
            <h2 className="font-primary text-2xl font-bold text-text-black">
              {mode === "edit"
                ? "Update your post"
                : "What is on your mind?"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background text-text-black transition hover:bg-light-gray/40"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="flex items-start gap-3">
            <Avatar person={user} sizeClass="h-14 w-14" textClass="text-base" />
            <div className="min-w-0">
              <h3 className="font-primary text-lg font-bold text-text-black">
                {user?.name || "User"}
              </h3>
              <p className="text-sm text-dark-gray">
                Share with your followers and community.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <textarea
              value={composer.content}
              onChange={(e) => onContentChange(e.target.value)}
              rows={6}
              placeholder={`What's on your mind, ${user?.name?.split(" ")[0] || "friend"}?`}
              className="w-full resize-none rounded-2xl border border-light-gray/80 bg-background px-4 py-3 text-sm text-text-black outline-none placeholder:text-dark-gray focus:border-secondary focus:bg-pure-white"
            />

            {imagePreview && (
              <div className="overflow-hidden rounded-2xl border border-light-gray/80">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-[380px] w-full object-cover"
                />
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-light-gray/70 pt-4">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-semibold text-text-black transition hover:bg-light-gray/40"
                >
                  <i className="fa-regular fa-image text-secondary" />
                  Photo
                </button>
                {composer.image && (
                  <button
                    type="button"
                    onClick={onRemoveImage}
                    className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-semibold text-text-black transition hover:bg-light-gray/40"
                  >
                    <i className="fa-solid fa-xmark text-accent" />
                    Remove image
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={submittingPost}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-pure-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingPost ? (
                  <i className="fa-solid fa-spinner animate-spin" />
                ) : (
                  <i className="fa-solid fa-paper-plane" />
                )}
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
  const [pageMeta, setPageMeta] = useState({
    current_page: 1,
    last_page: 1,
    next_page_url: null,
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [submittingCommentId, setSubmittingCommentId] = useState(null);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [composer, setComposer] = useState({
    content: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});

  const resetComposer = () => {
    setComposer({ content: "", image: null });
    setImagePreview("");
    setEditingPost(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const requireLogin = () => {
    navigate("/login");
  };

  const openCreateComposer = () => {
    setError("");
    setSuccess("");
    setEditingPost(null);
    setComposer({ content: "", image: null });
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsComposerOpen(true);
  };

  const openEditComposer = (post) => {
    if (!user) {
      requireLogin();
      return;
    }

    setError("");
    setSuccess("");
    setEditingPost(post);
    setComposer({
      content: post.content || "",
      image: null,
    });
    setImagePreview(post.image_url || post.image || "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsComposerOpen(true);
  };

  const closeComposer = () => {
    setIsComposerOpen(false);
    setError("");
    setSuccess("");
    resetComposer();
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } else {
      setUser(null);
    }

    setIsBootstrapped(true);
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === "Escape") {
        setIsComposerOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  const fetchPosts = async (url = "/posts", append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError("");
      const response = await api.get(url);
      const payload = response.data;
      const nextPosts = Array.isArray(payload?.data)
        ? payload.data.map(normalizePost)
        : [];

      setPosts((current) => (append ? [...current, ...nextPosts] : nextPosts));
      setPageMeta({
        current_page: payload?.current_page ?? 1,
        last_page: payload?.last_page ?? 1,
        next_page_url: payload?.next_page_url ?? null,
      });
    } catch (requestError) {
      console.error("Failed to load posts:", requestError);
      if (requestError.response?.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        requestError.response?.data?.message ||
          "We could not load the feed right now.",
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!isBootstrapped) return;
    fetchPosts();
  }, [isBootstrapped]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Please choose an image smaller than 5MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setComposer((current) => ({
      ...current,
      image: file,
    }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSavePost = async (event) => {
    event.preventDefault();

    if (!user) {
      requireLogin();
      return;
    }

    const content = composer.content.trim();
    if (!content) {
      setError("Write something before posting.");
      return;
    }

    try {
      setSubmittingPost(true);
      setError("");
      setSuccess("");

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

      setPosts((current) =>
        editingPost
          ? current.map((post) =>
              post.id === savedPost.id
                ? {
                    ...post,
                    ...savedPost,
                    user: post.user || savedPost.user,
                    comments: post.comments || [],
                    liked_by_me: post.liked_by_me,
                  }
                : post,
            )
          : [savedPost, ...current],
      );

      closeComposer();
      setSuccess(
        editingPost ? "Your post was updated." : "Your post is live now.",
      );
    } catch (requestError) {
      console.error("Failed to save post:", requestError);
      if (requestError.response?.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const validationErrors = requestError.response?.data?.errors;
      if (validationErrors?.content?.length) {
        setError(validationErrors.content[0]);
      } else {
        setError(
          requestError.response?.data?.message ||
            "We could not save your post.",
        );
      }
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleDeletePost = async (post) => {
    if (!user) {
      requireLogin();
      return;
    }

    const confirmed = window.confirm(
      "Delete this post? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      await api.delete(`/posts/${post.id}`);
      setPosts((current) => current.filter((item) => item.id !== post.id));
      if (editingPost?.id === post.id) {
        closeComposer();
      }
      setSuccess("Your post was deleted.");
    } catch (requestError) {
      console.error("Failed to delete post:", requestError);
      if (requestError.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        requestError.response?.data?.message ||
          "We could not delete your post.",
      );
    }
  };

  const handleLike = async (postId) => {
    if (!user) {
      requireLogin();
      return;
    }

    try {
      const response = await api.post(`/posts/${postId}/like`);
      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                liked_by_me: response.data.liked,
                likes_count: response.data.likes_count,
              }
            : post,
        ),
      );
    } catch (requestError) {
      console.error("Failed to toggle like:", requestError);
      if (requestError.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError("Unable to update the like status right now.");
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentDrafts((current) => ({
      ...current,
      [postId]: value,
    }));
  };

  const handleCommentSubmit = async (event, postId) => {
    event.preventDefault();

    if (!user) {
      requireLogin();
      return;
    }

    const comment = (commentDrafts[postId] || "").trim();
    if (!comment) return;

    try {
      setSubmittingCommentId(postId);
      
      // Hits the freshly unified /comments route setup in your api.php
      const response = await api.post("/comments", {
        comment,
        post_id: postId,
      });

      const responseComment = response.data;
      const decoratedComment = {
        ...responseComment,
        user: responseComment.user || user,
      };

      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments_count: (post.comments_count || 0) + 1,
                comments: [decoratedComment, ...(post.comments || [])],
              }
            : post,
        ),
      );

      setCommentDrafts((current) => ({
        ...current,
        [postId]: "",
      }));
    } catch (requestError) {
      console.error("Failed to submit comment:", requestError);
      if (requestError.response?.status === 401) {
        navigate("/login");
        return;
      }

      const validationErrors = requestError.response?.data?.errors;
      if (validationErrors?.comment?.length) {
        setError(validationErrors.comment[0]);
      } else if (validationErrors?.post_id?.length) {
        setError(validationErrors.post_id[0]);
      } else {
        setError(
          requestError.response?.data?.message ||
            "Unable to send the comment right now.",
        );
      }
    } finally {
      setSubmittingCommentId(null);
    }
  };

  const loadMore = () => {
    if (pageMeta.next_page_url) {
      fetchPosts(pageMeta.next_page_url, true);
    }
  };

  if (!isBootstrapped) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-primary">
          <i className="fa-solid fa-spinner animate-spin text-2xl" />
          <span className="font-primary text-sm font-semibold">
            Loading your feed...
          </span>
        </div>
      </div>
    );
  }

  return (
    <main className="pb-16">
      <BlogHero
        user={user}
        postCount={posts.length}
        onNewPostClick={() => (user ? openCreateComposer() : requireLogin())}
        isAuthenticated={Boolean(user)}
      />
  <section className="flex justify-center">

      <div className=" w-[70%] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-light-gray/70 bg-pure-white p-5 shadow-[0_12px_30px_rgba(17,45,78,0.08)]">
              <div className="flex justify-between align-middle items-center gap-4">
                <div className="flex justify-center items-center gap-5 font-semibold">
                  <Avatar person={user} sizeClass="h-14 w-14" textClass="text-base" />
                  <h1 className="font-primary">សួរស្តី! {user.name}</h1>
                </div>
                <div className=" flex flex-wrap items-center gap-3  ">

                <button
                  type="button"
                  onClick={() => (user ? openCreateComposer() : requireLogin())}
                  className="font-primary inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-pure-white transition hover:bg-secondary"
                >
                  <i className="fa-solid fa-pen-to-square" />
                  {user ? "បង្ហោះសារ" : "ចូលគណនីជាមុនសិន"}
                </button>
                <button
                  onClick={alert="មកដល់ឆាប់ៗ"}
                  type="button"
                  
                  className="font-primary inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-pure-white transition hover:bg-secondary"
                >
                  <i className="fa-solid fa-pen-to-square" />
                  {user ? "ស្នើបង្ហោះសៀវភៅ" : "ចូលគណនីជាមុនសិន"}
                </button>
                
              </div>
              </div>

              
            </section>

            <section className="space-y-5">
              {loading ? (
                <div className="space-y-5">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-96 animate-pulse rounded-3xl border border-light-gray/70 bg-pure-white"
                    />
                  ))}
                </div>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={user}
                    onLike={handleLike}
                    onCommentSubmit={handleCommentSubmit}
                    commentDraft={commentDrafts[post.id] || ""}
                    onCommentChange={handleCommentChange}
                    submittingCommentId={submittingCommentId}
                    canInteract={Boolean(user)}
                    onRequireLogin={requireLogin}
                    canManage={Boolean(
                      user && (user.id === post.user_id || user.id === post.user?.id),
                    )}
                    onEditPost={openEditComposer}
                    onDeletePost={handleDeletePost}
                  />
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-secondary/40 bg-pure-white p-10 text-center shadow-[0_12px_30px_rgba(17,45,78,0.08)]">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-background text-2xl text-secondary">
                    <i className="fa-regular fa-face-smile" />
                  </div>
                  <h3 className="mt-4 font-primary text-xl font-bold text-text-black">
                    Your feed is empty
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-dark-gray">
                    Create the first post or follow more users to populate the timeline.
                  </p>
                </div>
              )}
            </section>

            {pageMeta.next_page_url && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-pure-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingMore ? (
                    <i className="fa-solid fa-spinner animate-spin" />
                  ) : (
                    <i className="fa-solid fa-angles-down" />
                  )}
                  <span className="font-primary">មើលបន្ថែម</span>
                </button>
              </div>
            )}
          </div>
            <aside>
              ghfgxdf
            </aside>
        </div>
      </div>
          
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
          onContentChange={(value) =>
            setComposer((current) => ({ ...current, content: value }))
          }
          onImageChange={handleImageChange}
          onRemoveImage={() => {
            setComposer((current) => ({ ...current, image: null }));
            setImagePreview("");
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        />
      )}
  </section>
    </main>
  );
};

export default Blogpage;