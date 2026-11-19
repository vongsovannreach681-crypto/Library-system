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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto overscroll-contain">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 my-auto flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-[28px] border border-slate-200 dark:border-white/8 bg-white dark:bg-[#11151f] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
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
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    if (!canInteract) { onRequireLogin(); return; }

    setSubmitting(true);
    try {
      const response = await api.post("/comments", { post_id: post.id, comment: text });
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
    <article className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#111522] shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.35)] hover:border-slate-300 dark:hover:border-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)] transition-all duration-300 overflow-hidden">
      
      <div>
        {/* 1. Author Header at the Top */}
        <div className="flex items-center justify-between gap-3 p-4 sm:p-5 pb-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar person={post.user} sizeClass="h-10 w-10" textClass="text-xs" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate font-primary text-sm font-bold text-slate-900 dark:text-white hover:text-secondary dark:hover:text-accent transition-colors">
                  {post.user?.name || "Unknown user"}
                </h3>
                {post.user?.role === "admin" && (
                  <span className="inline-flex items-center rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                    Admin
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <span>{formatRelativeTime(post.created_at)}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <i className="fa-solid fa-earth-asia text-[10px]" />
                  <span className="hidden sm:inline">សាធារណៈ</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Controls for Author */}
          {canManage && (
            <div className="flex items-center gap-1 rounded-lg bg-slate-100/80 dark:bg-white/5 p-1">
              <button
                type="button"
                onClick={() => onEditPost(post)}
                className="rounded-md p-1.5 text-xs text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 hover:text-secondary dark:hover:text-accent transition-colors"
                title="កែសម្រួល / Edit"
              >
                <i className="fa-solid fa-pen" />
              </button>
              <button
                type="button"
                onClick={() => onDeletePost(post)}
                className="rounded-md p-1.5 text-xs text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-colors"
                title="លុប / Delete"
              >
                <i className="fa-regular fa-trash-can" />
              </button>
            </div>
          )}
        </div>

        {/* 2. Post Content Text */}
        <div
          className="px-4 sm:px-5 pb-3 cursor-pointer"
          onClick={() => onOpenDetail(post)}
        >
          <p className="whitespace-pre-line font-primary text-sm leading-relaxed text-slate-700 dark:text-slate-200 line-clamp-4">
            {post.content}
          </p>
        </div>

        {/* 3. Media Attachment (Rendered ONLY if post has a valid image) */}
        {mediaSrc && !imageFailed && (
          <div
            className="px-4 sm:px-5 pb-3 cursor-pointer"
            onClick={() => onOpenDetail(post)}
          >
            <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-white/8 bg-slate-100 dark:bg-black/30 max-h-[340px]">
              <img
                src={mediaSrc}
                alt="Post attachment"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.01]"
                loading="lazy"
                onError={() => setImageFailed(true)}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        {/* 4. Stats & Metrics Counter */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[9px] text-white shadow-xs">
              <i className="fa-solid fa-thumbs-up" />
            </span>
            <span className="font-semibold">{formatCount(post.likes_count)}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-primary hover:underline cursor-pointer" onClick={() => onOpenDetail(post)}>
              {formatCount(post.comments_count)} មតិយោបល់
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="hover:text-secondary dark:hover:text-accent transition-colors"
              title="ចែករំលែក"
            >
              <i className={`fa-solid ${copied ? "fa-check text-green-500" : "fa-share-nodes"}`} />
            </button>
          </div>
        </div>

        {/* 5. Interactive Action Buttons */}
        <div className="border-t border-slate-100 dark:border-white/5 px-2 py-1 bg-slate-50/40 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between">
            {/* Like Button */}
            <button
              type="button"
              onClick={() => {
                if (!canInteract) { onRequireLogin(); return; }
                onLike(post.id);
              }}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold font-primary transition-all duration-200 ${
                post.liked_by_me
                  ? "text-secondary dark:text-accent font-bold bg-secondary/10 dark:bg-accent/10"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <i className={`fa-${post.liked_by_me ? "solid text-secondary dark:text-accent" : "regular"} fa-thumbs-up text-sm`} />
              <span>ចូលចិត្ត</span>
            </button>

            {/* Comment Toggle */}
            <button
              type="button"
              onClick={() => {
                if (!canInteract) { onRequireLogin(); return; }
                setShowCommentInput((prev) => !prev);
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold font-primary text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <i className="fa-regular fa-comment text-sm" />
              <span>មតិយោបល់</span>
            </button>

            {/* View Details */}
            <button
              type="button"
              onClick={() => onOpenDetail(post)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold font-primary text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <i className="fa-regular fa-eye text-sm" />
              <span>មើល</span>
            </button>
          </div>
        </div>

        {/* 6. Inline Comment Input */}
        {showCommentInput && (
          <div className="px-4 py-3 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5">
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2.5">
              <Avatar person={currentUser} sizeClass="h-7 w-7" textClass="text-[9px]" />
              <div className="flex flex-1 items-center gap-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3.5 py-1.5 shadow-xs">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="សរសេរមតិយោបល់របស់អ្នក..."
                  autoFocus
                  className="flex-1 bg-transparent text-xs font-primary text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || submitting}
                  className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
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
        )}

        {/* 7. Preview Comments */}
        {previewComments.length > 0 && (
          <div className="space-y-2 px-4 sm:px-5 py-3 bg-slate-50/70 dark:bg-black/20 border-t border-slate-100 dark:border-white/5">
            <div className="space-y-2">
              {previewComments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2.5">
                  <Avatar person={comment.user} sizeClass="h-6 w-6" textClass="text-[9px]" />
                  <div className="min-w-0 flex-1 rounded-2xl bg-white dark:bg-white/5 px-3 py-2 border border-slate-200/50 dark:border-white/5 shadow-2xs">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {comment.user?.name || "Someone"}
                    </p>
                    <p className="mt-0.5 text-xs font-primary leading-relaxed text-slate-600 dark:text-slate-300">
                      {comment.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {comments.length > 2 && (
              <button
                type="button"
                onClick={() => onOpenDetail(post)}
                className="text-[11px] font-bold font-primary text-secondary dark:text-accent hover:underline pt-1 block"
              >
                មើលមតិទាំងអស់ ({comments.length})...
              </button>
            )}
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
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto overscroll-contain">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 my-auto flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-[28px] border border-slate-200 dark:border-white/8 bg-white dark:bg-[#11151f] shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/8 px-5 py-4 shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 font-primary">
              {mode === "edit" ? "Edit post" : "Create post"}
            </p>
            <h2 className="font-primary text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
              {mode === "edit" ? "កែប្រែការបង្ហោះ" : "តើអ្នកកំពុងគិតអ្វី?"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white transition hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-4" style={{ WebkitOverflowScrolling: "touch" }}>
            <div className="flex items-center gap-3">
              <Avatar person={user} sizeClass="h-11 w-11" textClass="text-sm" />
              <div className="min-w-0">
                <h3 className="font-primary text-sm font-bold text-slate-800 dark:text-white">
                  {user?.name || "User"}
                </h3>
                <p className="text-[11px] text-slate-400 font-primary">ចែករំលែកជាមួយសហគមន៍ LibreShelf</p>
              </div>
            </div>

            <textarea
              value={composer.content}
              onChange={(e) => onContentChange(e.target.value)}
              rows={5}
              placeholder="សរសេរអ្វីដែលអ្នកចង់ចែករំលែក..."
              className="w-full resize-y min-h-[110px] rounded-2xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/5 px-4 py-3 text-sm text-slate-800 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-secondary/50 focus:dark:bg-[#161c2c] font-primary"
            />

            {imagePreview && (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/8 max-h-[300px] bg-slate-100 dark:bg-black/30">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover max-h-[300px]" />
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                  title="Remove image"
                >
                  <i className="fa-solid fa-xmark text-xs" />
                </button>
              </div>
            )}

            {error && <div className="rounded-xl bg-red-50 p-3 text-xs text-red-500 dark:bg-red-950/30 dark:text-red-400 font-primary">{error}</div>}
            {success && <div className="rounded-xl bg-green-50 p-3 text-xs text-green-600 dark:bg-green-950/30 dark:text-green-400 font-primary">{success}</div>}
          </div>

          {/* Sticky Actions Footer */}
          <div className="shrink-0 border-t border-slate-100 dark:border-white/8 bg-white dark:bg-[#11151f] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageChange} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-white/5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-white transition hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer font-primary"
              >
                <i className="fa-regular fa-image text-emerald-500" /> រូបភាព
              </button>
              {composer.image && (
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="inline-flex items-center gap-2 rounded-full bg-red-50 dark:bg-red-950/20 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-100 cursor-pointer font-primary"
                >
                  លុបរូបភាព
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer font-primary"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                disabled={submittingPost}
                className="rounded-full bg-secondary px-6 py-2 text-xs sm:text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50 cursor-pointer font-primary"
              >
                {submittingPost ? "កំពុងរក្សាទុក..." : mode === "edit" ? "រក្សាទុកការកែប្រែ" : "បង្ហោះ"}
              </button>
            </div>
          </div>
        </form>
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
            {/* Modern Create Post Bar */}
            <section className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#111522] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition-all">
              <div className="flex items-center gap-3">
                <Avatar person={user} sizeClass="h-10 w-10" textClass="text-xs" />
                <button
                  type="button"
                  onClick={() => (user ? openCreateComposer() : requireLogin())}
                  className="flex-1 text-left rounded-full bg-slate-100/90 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/5 px-5 py-3 text-xs sm:text-sm font-primary text-slate-500 dark:text-slate-400 transition cursor-pointer"
                >
                  {user ? `តើអ្នកចង់ចែករំលែកអ្វីថ្ងៃនេះ, ${user.name}?` : "សូមចូលគណនី ដើម្បីចែករំលែក..."}
                </button>
                <button
                  type="button"
                  onClick={() => (user ? openCreateComposer() : requireLogin())}
                  className="inline-flex items-center gap-2 rounded-xl bg-secondary hover:bg-secondary/90 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:scale-105 active:scale-95 cursor-pointer font-primary shrink-0"
                >
                  <i className="fa-solid fa-pen-to-square" />
                  <span className="hidden sm:inline">បង្ហោះសារ</span>
                </button>
              </div>

              <div className="mt-3.5 flex items-center justify-around border-t border-slate-100 dark:border-white/5 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!user) { requireLogin(); return; }
                    openCreateComposer();
                    setTimeout(() => fileInputRef.current?.click(), 100);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer font-primary"
                >
                  <i className="fa-regular fa-image text-emerald-500 text-sm" />
                  <span>រូបភាព</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/library")}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer font-primary"
                >
                  <i className="fa-solid fa-book-open text-blue-500 text-sm" />
                  <span>បណ្ណាល័យ</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event("open-ai-chat"))}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer font-primary"
                >
                  <i className="fa-solid fa-robot text-accent text-sm" />
                  <span>ជំនួយការ AI</span>
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

          {/* Right Sidebar */}
          <aside className="hidden xl:block space-y-6 sticky top-28">
            {/* Quick Navigation Card */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#111522] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <h3 className="font-primary text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-compass text-secondary dark:text-accent" />
                  <span>រុករក LibreShelf</span>
                </h3>
              </div>
              <ul className="mt-4 space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/library")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-left transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                        <i className="fa-solid fa-book text-sm" />
                      </span>
                      <div>
                        <p className="text-xs font-bold font-primary text-slate-800 dark:text-white group-hover:text-secondary dark:group-hover:text-accent transition">
                          បណ្ណាល័យសៀវភៅ
                        </p>
                        <p className="text-[10px] text-slate-400">ស្វែងរកសៀវភៅល្អៗ</p>
                      </div>
                    </div>
                    <i className="fa-solid fa-chevron-right text-xs text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/favorites")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-left transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                        <i className="fa-solid fa-heart text-sm" />
                      </span>
                      <div>
                        <p className="text-xs font-bold font-primary text-slate-800 dark:text-white group-hover:text-secondary dark:group-hover:text-accent transition">
                          សៀវភៅចូលចិត្ត
                        </p>
                        <p className="text-[10px] text-slate-400">បញ្ជីដែលបានរក្សាទុក</p>
                      </div>
                    </div>
                    <i className="fa-solid fa-chevron-right text-xs text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new Event("open-ai-chat"))}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-left transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-accent">
                        <i className="fa-solid fa-robot text-sm" />
                      </span>
                      <div>
                        <p className="text-xs font-bold font-primary text-slate-800 dark:text-white group-hover:text-secondary dark:group-hover:text-accent transition">
                          Reach Assistant AI
                        </p>
                        <p className="text-[10px] text-slate-400">ជំនួយការឆ្លាតវៃ</p>
                      </div>
                    </div>
                    <i className="fa-solid fa-chevron-right text-xs text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </li>
              </ul>
            </div>

            {/* Community Inspiration Box */}
            <div className="rounded-2xl border border-secondary/20 dark:border-accent/20 bg-gradient-to-br from-secondary/5 via-primary/5 to-accent/5 p-5">
              <div className="flex items-center gap-2 text-xs font-bold text-secondary dark:text-accent font-primary">
                <i className="fa-solid fa-lightbulb" />
                <span>គន្លឹះចែករំលែក</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed font-primary text-slate-600 dark:text-slate-300">
                ចែករំលែកសៀវភៅល្អៗ លំហាត់ ឬគំនិតរបស់អ្នក ដើម្បីជួយដល់សិស្សនិស្សិតក្នុងសហគមន៍ LibreShelf ទាំងអស់គ្នា!
              </p>
              <button
                type="button"
                onClick={() => (user ? openCreateComposer() : requireLogin())}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-secondary to-primary px-4 py-2.5 text-xs font-bold font-primary text-white shadow-xs hover:opacity-95 transition cursor-pointer"
              >
                សរសេរបង្ហោះសារឥឡូវនេះ
              </button>
            </div>
          </aside>
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
