import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getStorageUrl } from "../../api/api";
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
  const imageSrc = getStorageUrl(person?.profile_url || person?.profile);
  const name = person?.name || "User";
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`${sizeClass} shrink-0 overflow-hidden rounded-full border-2 border-white dark:border-slate-800 bg-gradient-to-br from-primary to-secondary text-white shadow-sm flex items-center justify-center`}
    >
      {imageSrc && !imgError ? (
        <img
          src={imageSrc}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
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

// ─── Post Detail Modal ────────────────────────────────────────────────────────
const PostDetailModal = ({
  post,
  currentUser,
  onClose,
  onLike,
  canInteract,
  onRequireLogin,
  onCommentSubmit,
}) => {
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [likedByMe, setLikedByMe] = useState(post.liked_by_me);
  const commentsEndRef = useRef(null);

  // Close on backdrop click or Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLike = async () => {
    if (!canInteract) { onRequireLogin(); return; }
    try {
      const response = await api.post(`/posts/${post.id}/like`);
      setLikedByMe(response.data.liked);
      setLikesCount(response.data.likes_count);
      onLike(post.id, response.data.liked, response.data.likes_count);
    } catch { /* silent */ }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    if (!canInteract) { onRequireLogin(); return; }

    setCommentError("");
    setSubmitting(true);
    try {
      const response = await api.post("/comments", { post_id: post.id, comment: text });
      // Server may return 201 with body OR 204 with no body — handle both
      const serverComment = response.data && typeof response.data === "object" && response.data.id
        ? response.data
        : null;
      const enriched = serverComment
        ? { ...serverComment, user: serverComment.user || currentUser }
        : { id: Date.now(), comment: text, post_id: post.id, created_at: new Date().toISOString(), user: currentUser };
      setComments((prev) => [...prev, enriched]);
      setCommentText("");
      onCommentSubmit(post.id, enriched);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.comment?.[0] || "មិនអាចបញ្ចូលមតិបានទេ។";
      setCommentError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const mediaSrc = post.image_url || post.image || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-[28px] border border-slate-200 dark:border-white/8 bg-white dark:bg-[#11151f] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/8 px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <Avatar person={post.user} sizeClass="h-10 w-10" textClass="text-sm" />
            <div>
              <p className="font-primary text-sm font-bold text-slate-800 dark:text-white">
                {post.user?.name || "Unknown"}
              </p>
              <p className="text-[11px] text-slate-400">{formatRelativeTime(post.created_at)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-white/10"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Image */}
          {mediaSrc && (
            <div className="w-full max-h-[300px] overflow-hidden bg-slate-100 dark:bg-[#1a2130]">
              <img
                src={getStorageUrl(mediaSrc)}
                alt="Post"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Post content */}
          <div className="px-5 py-4">
            <p className="whitespace-pre-line text-sm font-primary leading-6 text-slate-700 dark:text-slate-200">
              {post.content}
            </p>
          </div>

          {/* Like / stats bar */}
          <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100 dark:border-white/8">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[8px] text-white">
                <i className="fa-solid fa-thumbs-up" />
              </span>
              {formatCount(likesCount)}
            </span>
            <span className="text-xs font-primary text-slate-400">
              {formatCount(comments.length)} មតិយោបល់
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex border-b border-slate-100 dark:border-white/8">
            <button
              type="button"
              onClick={handleLike}
              className={`inline-flex flex-1 items-center justify-center gap-2 py-2.5 text-xs font-semibold transition hover:bg-slate-50 dark:hover:bg-white/5 ${
                likedByMe ? "text-secondary font-bold" : "text-slate-400"
              }`}
            >
              <i className={`fa-${likedByMe ? "solid" : "regular"} fa-thumbs-up`} />
              <span className="font-primary">ចូលចិត្ត</span>
            </button>
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-2 py-2.5 text-xs font-semibold text-slate-400 transition hover:bg-slate-50 dark:hover:bg-white/5"
              onClick={() => document.getElementById("detail-comment-input")?.focus()}
            >
              <i className="fa-regular fa-comment" />
              <span className="font-primary">មតិយោបល់</span>
            </button>
          </div>

          {/* Comments list */}
          <div className="px-5 py-4 space-y-3">
            {comments.length === 0 ? (
              <p className="text-center text-xs text-slate-400 font-primary py-4">
                មិនទាន់មានមតិយោបល់។ សូមបញ្ចេញមតិដំបូង!
              </p>
            ) : (
              comments.map((comment, idx) => (
                <div key={comment.id ?? idx} className="flex items-start gap-2.5">
                  <Avatar person={comment.user} sizeClass="h-7 w-7" textClass="text-[9px]" />
                  <div className="flex-1 rounded-2xl bg-slate-100 dark:bg-white/5 px-3 py-2 border border-slate-200/60 dark:border-white/5">
                    <p className="text-[11px] font-bold text-slate-800 dark:text-white font-primary">
                      {comment.user?.name || "Someone"}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-300 font-primary">
                      {comment.comment}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {formatRelativeTime(comment.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={commentsEndRef} />
          </div>
        </div>

        {/* Comment input */}
        <div className="shrink-0 border-t border-slate-100 dark:border-white/8 px-5 py-3">
          {commentError && (
            <p className="mb-2 text-xs text-red-500 font-primary">{commentError}</p>
          )}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-3">
            <Avatar person={currentUser} sizeClass="h-8 w-8" textClass="text-[10px]" />
            <div className="flex flex-1 items-center gap-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 px-4 py-2">
              <input
                id="detail-comment-input"
                type="text"
                value={commentText}
                onChange={(e) => { setCommentText(e.target.value); setCommentError(""); }}
                placeholder={canInteract ? "សរសេរមតិយោបល់..." : "សូមចូលគណនី ដើម្បីបញ្ចេញមតិ"}
                disabled={!canInteract}
                className="flex-1 bg-transparent text-xs font-primary text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || submitting || !canInteract}
                className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <i className="fa-solid fa-spinner animate-spin text-[10px]" />
                ) : (
                  <i className="fa-solid fa-paper-plane text-[10px]" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Post Card ────────────────────────────────────────────────────────────────
const PostCard = ({
  post,
  currentUser,
  onLike,
  canInteract,
  onRequireLogin,
  canManage,
  onEditPost,
  onDeletePost,
  onOpenDetail,
  onCommentSubmit,
}) => {
  const mediaSrc = getStorageUrl(post.image_url || post.image);
  const [imageFailed, setImageFailed] = useState(false);
  const comments = post.comments || [];
  const previewComments = comments.slice(0, 2);

  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    if (!canInteract) { onRequireLogin(); return; }

    setSubmitting(true);
    try {
      const response = await api.post("/comments", { post_id: post.id, comment: text });
      // Server may return 201 with body OR 204 with no body — handle both
      const serverComment = response.data && typeof response.data === "object" && response.data.id
        ? response.data
        : null;
      const enriched = serverComment
        ? { ...serverComment, user: serverComment.user || currentUser }
        : { id: Date.now(), comment: text, post_id: post.id, created_at: new Date().toISOString(), user: currentUser };
      setCommentText("");
      setShowCommentInput(false);
      onCommentSubmit(post.id, enriched);
    } catch (err) {
      console.error("Comment failed:", err?.response?.data || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <article className="flex flex-col h-full min-h-[400px] overflow-hidden rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#11151f] shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.35)] transition-all duration-200">
      {/* Image — clickable to open detail */}
      <div
        className="cursor-pointer"
        onClick={() => onOpenDetail(post)}
      >
        {mediaSrc && !imageFailed ? (
          <div className="h-[220px] w-full overflow-hidden bg-slate-100 dark:bg-[#1a2130]">
            <img
              src={mediaSrc}
              alt="Post attachment"
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          </div>
        ) : (
          <div className="h-[220px] w-full flex flex-col items-center justify-center bg-slate-100 dark:bg-[#161c2c]/40 border-b border-slate-200/40 dark:border-white/5 text-slate-400 gap-1.5">
            <i className="fa-regular fa-image text-3xl opacity-30" />
            <span className="text-[10px] opacity-40 font-primary">គ្មានរូបភាព</span>
          </div>
        )}
      </div>

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

      {/* Post content — clickable to open detail */}
      <div
        className="px-4 pb-3 pt-2 flex-1 flex flex-col justify-between cursor-pointer"
        onClick={() => onOpenDetail(post)}
      >
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

      {/* Action buttons */}
      <div className="mt-auto">
        <div className="flex items-center border-y border-slate-100 dark:border-white/8 px-2 py-0.5">
          {/* Like */}
          <button
            type="button"
            onClick={() => {
              if (!canInteract) { onRequireLogin(); return; }
              onLike(post.id);
            }}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition ${
              post.liked_by_me ? "text-secondary font-bold" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <i className={`fa-${post.liked_by_me ? "solid" : "regular"} fa-thumbs-up`} />
            <span className="font-primary">ចូលចិត្ត</span>
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-white/10" />

          {/* Comment toggle */}
          <button
            type="button"
            onClick={() => {
              if (!canInteract) { onRequireLogin(); return; }
              setShowCommentInput((prev) => !prev);
            }}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <i className="fa-regular fa-comment" />
            <span className="font-primary">មតិយោបល់</span>
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-white/10" />

          {/* View detail */}
          <button
            type="button"
            onClick={() => onOpenDetail(post)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <i className="fa-regular fa-eye" />
            <span className="font-primary">មើល</span>
          </button>
        </div>

        {/* Inline comment input */}
        {showCommentInput && (
          <div className="px-3 py-2 bg-slate-50/70 dark:bg-black/10 border-b border-slate-100 dark:border-white/5">
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
              <Avatar person={currentUser} sizeClass="h-7 w-7" textClass="text-[9px]" />
              <div className="flex flex-1 items-center gap-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/8 px-3 py-1.5">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="សរសេរមតិយោបល់..."
                  autoFocus
                  className="flex-1 bg-transparent text-[11px] font-primary text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || submitting}
                  className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <i className="fa-solid fa-spinner animate-spin text-[9px]" />
                  ) : (
                    <i className="fa-solid fa-paper-plane text-[9px]" />
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Preview comments */}
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

// ─── Composer Modal ───────────────────────────────────────────────────────────
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

// ─── Blogpage ─────────────────────────────────────────────────────────────────
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
  const [selectedPost, setSelectedPost] = useState(null);

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
      setPosts((current) =>
        current.map((p) =>
          p.id === postId
            ? { ...p, liked_by_me: response.data.liked, likes_count: response.data.likes_count }
            : p
        )
      );
    } catch { setError("Unable to update like."); }
  };

  // Called from detail modal when user likes inside it
  const handleDetailLike = (postId, liked, likesCount) => {
    setPosts((current) =>
      current.map((p) =>
        p.id === postId ? { ...p, liked_by_me: liked, likes_count: likesCount } : p
      )
    );
    // Sync selected post
    setSelectedPost((prev) =>
      prev && prev.id === postId ? { ...prev, liked_by_me: liked, likes_count: likesCount } : prev
    );
  };

  // Called when a comment is submitted (from card or detail modal)
  const handleCommentSubmit = (postId, newComment) => {
    setPosts((current) =>
      current.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [...(p.comments || []), newComment],
              comments_count: (p.comments_count || 0) + 1,
            }
          : p
      )
    );
    // Keep detail modal in sync if open
    setSelectedPost((prev) =>
      prev && prev.id === postId
        ? {
            ...prev,
            comments: [...(prev.comments || []), newComment],
            comments_count: (prev.comments_count || 0) + 1,
          }
        : prev
    );
  };

  const handleOpenDetail = (post) => {
    navigate(`/post/${post.id}`, { state: { post } });
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
                      onOpenDetail={handleOpenDetail}
                      onCommentSubmit={handleCommentSubmit}
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
          
        </div>
      </section>

      {/* Composer Modal */}
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

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          currentUser={user}
          canInteract={Boolean(user)}
          onRequireLogin={requireLogin}
          onClose={() => setSelectedPost(null)}
          onLike={handleDetailLike}
          onCommentSubmit={handleCommentSubmit}
        />
      )}
    </main>
  );
};

export default Blogpage;
