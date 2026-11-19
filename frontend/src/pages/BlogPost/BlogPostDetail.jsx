import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import api, { getStorageUrl } from "../../api/api";
import Header from "../../components/Header";

const normalizePost = (post) => ({
  ...post,
  likes_count: post?.likes_count ?? post?.likes?.length ?? 0,
  comments_count: post?.comments_count ?? post?.comments?.length ?? 0,
  liked_by_me: Boolean(post?.liked_by_me),
  comments: Array.isArray(post?.comments) ? post.comments : [],
});

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

const getProfileImage = (person) =>
  getStorageUrl(person?.profile_url || person?.profile) || "";

const Avatar = ({ person, sizeClass = "h-10 w-10", textClass = "text-sm" }) => {
  const imageSrc = getProfileImage(person);
  const name = person?.name || "User";
  const [loadError, setLoadError] = useState(false);

  return (
    <div
      className={`${sizeClass} shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 flex items-center justify-center`}
    >
      {imageSrc && !loadError ? (
        <img
          src={imageSrc}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setLoadError(true)}
        />
      ) : (
        <div className={`flex h-full w-full items-center justify-center font-bold ${textClass}`}>
          {getInitials(name)}
        </div>
      )}
    </div>
  );
};

const StatPill = ({ icon, label, value }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
    <i className={icon} />
    <span>{value}</span>
    <span className="hidden sm:inline text-slate-400">{label}</span>
  </div>
);

const BlogPostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const commentsEndRef = useRef(null);

  const [post, setPost] = useState(() =>
    location.state?.post ? normalizePost(location.state.post) : null,
  );
  const [loading, setLoading] = useState(!location.state?.post);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(
    () => localStorage.getItem("auth_token") || "",
  );

  useEffect(() => {
    const token = localStorage.getItem("auth_token") || "";
    setAuthToken(token);

    const rawUser = localStorage.getItem("user");
    if (!rawUser) {
      setCurrentUser(null);
      return;
    }

    try {
      setCurrentUser(JSON.parse(rawUser));
    } catch {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    if (location.state?.post) {
      setPost(normalizePost(location.state.post));
    }
  }, [location.state?.post]);

  useEffect(() => {
    if (!id) return;

    let active = true;

    const loadPost = async () => {
      if (!authToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/posts/${id}`);
        if (!active) return;
        setPost(normalizePost(response.data));
        setError("");
      } catch (requestError) {
        if (!active) return;

        const status = requestError?.response?.status;
        if (status === 401) {
          setError("Please log in to view this post.");
        } else if (status === 404) {
          setError("We could not find that post.");
        } else {
          setError("We could not load this post right now.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPost();

    return () => {
      active = false;
    };
  }, [id, authToken]);

  const canInteract = Boolean(authToken);
  const comments = post?.comments || [];
  const mediaSrc = post?.image_url || post?.image || "";

  const handleRequireLogin = () => {
    navigate("/login");
  };

  const handleLike = async () => {
    if (!post) return;
    if (!canInteract) {
      handleRequireLogin();
      return;
    }

    try {
      const response = await api.post(`/posts/${post.id}/like`);
      setPost((current) =>
        current
          ? {
              ...current,
              liked_by_me: response.data.liked,
              likes_count: response.data.likes_count,
            }
          : current,
      );
    } catch (requestError) {
      const status = requestError?.response?.status;
      if (status === 401) {
        handleRequireLogin();
      } else {
        setError("Unable to update like right now.");
      }
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    const text = commentText.trim();
    if (!text || !post) return;

    if (!canInteract) {
      handleRequireLogin();
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post("/comments", {
        post_id: post.id,
        comment: text,
      });

      const serverComment =
        response.data && typeof response.data === "object" && response.data.id
          ? response.data
          : null;

      const enrichedComment = serverComment
        ? { ...serverComment, user: serverComment.user || currentUser }
        : {
            id: Date.now(),
            comment: text,
            post_id: post.id,
            created_at: new Date().toISOString(),
            user: currentUser,
          };

      setPost((current) =>
        current
          ? {
              ...current,
              comments: [...(current.comments || []), enrichedComment],
              comments_count: (current.comments_count || 0) + 1,
            }
          : current,
      );
      setCommentText("");

      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (requestError) {
      const status = requestError?.response?.status;
      if (status === 401) {
        handleRequireLogin();
        return;
      }

      const apiMessage =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.errors?.comment?.[0] ||
        "We could not add your comment right now.";
      setError(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] text-slate-900 dark:bg-[#05070d] dark:text-white">
        <Header />
        <main className="mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center px-4 pt-24 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            <i className="fa-solid fa-spinner animate-spin text-secondary" />
            Loading post details...
          </div>
        </main>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] text-slate-900 dark:bg-[#05070d] dark:text-white">
        <Header />
        <main className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center px-4 pt-24 sm:px-6 lg:px-8">
          <section className="w-full rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-[#11151f]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 dark:bg-white/5 dark:text-slate-300">
              <i className="fa-regular fa-circle-xmark" />
            </div>
            <h1 className="mt-5 font-primary text-2xl font-bold text-slate-900 dark:text-white">
              Post unavailable
            </h1>
            <p className="mt-3 font-primary text-sm leading-6 text-slate-600 dark:text-slate-300">
              {error}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-full bg-secondary px-5 py-3 font-primary text-sm font-semibold text-white transition hover:opacity-95"
              >
                Go back
              </button>
              <Link
                to="/"
                className="rounded-full border border-slate-200 px-5 py-3 font-primary text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
              >
                Back to feed
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] text-slate-900 dark:bg-[#05070d] dark:text-white">
        <Header />
        <main className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center px-4 pt-24 sm:px-6 lg:px-8">
          <section className="w-full rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-[#11151f]">
            <h1 className="font-primary text-2xl font-bold text-slate-900 dark:text-white">
              We could not load this post.
            </h1>
            <p className="mt-3 font-primary text-sm leading-6 text-slate-600 dark:text-slate-300">
              Try refreshing the page or return to the feed.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-full bg-secondary px-5 py-3 font-primary text-sm font-semibold text-white transition hover:opacity-95"
              >
                Go back
              </button>
              <Link
                to="/"
                className="rounded-full border border-slate-200 px-5 py-3 font-primary text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
              >
                Back to feed
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900 transition-colors duration-300 dark:bg-[#05070d] dark:text-white">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 font-primary text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <i className="fa-solid fa-arrow-left" />
            Back
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 font-primary text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <i className="fa-solid fa-house" />
            Feed
          </Link>
        </div>

        {!canInteract && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
            Read-only mode. Log in to like or comment.
            <button
              type="button"
              onClick={handleRequireLogin}
              className="ml-2 font-semibold underline underline-offset-4"
            >
              Log in
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#11151f]">
            <div className="border-b border-slate-100 p-5 sm:p-6 dark:border-white/10">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <Avatar person={post.user} sizeClass="h-11 w-11" textClass="text-sm" />
                    <div className="min-w-0">
                      <p className="truncate font-primary text-sm font-bold text-slate-900 dark:text-white">
                        {post.user?.name || "Unknown user"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatRelativeTime(post.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatPill icon="fa-solid fa-thumbs-up" label="likes" value={formatCount(post.likes_count)} />
                  <StatPill icon="fa-regular fa-comment" label="comments" value={formatCount(comments.length)} />
                </div>
              </div>
            </div>

            {mediaSrc ? (
              <img
                src={getStorageUrl(mediaSrc)}
                alt="Blog post attachment"
                className="max-h-[460px] w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-[300px] items-center justify-center bg-slate-50 dark:bg-white/5">
                <i className="fa-regular fa-image text-5xl text-slate-300 dark:text-slate-600" />
              </div>
            )}

            <div className="space-y-6 p-5 sm:p-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary dark:text-sky-300">
                  Blog post
                </p>
                <h1 className="font-primary text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl">
                  {post.title || "Untitled post"}
                </h1>
                <p className="whitespace-pre-line font-primary text-base leading-7 text-slate-700 dark:text-slate-200">
                  {post.content}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleLike}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    post.liked_by_me
                      ? "bg-secondary text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                  }`}
                >
                  <i className={`fa-${post.liked_by_me ? "solid" : "regular"} fa-thumbs-up`} />
                  {post.liked_by_me ? "Liked" : "Like"}
                </button>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {formatCount(comments.length)} comments
                </span>
              </div>

              <div className="border-t border-slate-100 pt-6 dark:border-white/10">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="font-primary text-lg font-bold text-slate-900 dark:text-white">
                    Comments
                  </h2>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {formatCount(comments.length)} total
                  </span>
                </div>

                {comments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    No comments yet. Start the conversation.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment, index) => (
                      <div
                        key={comment.id ?? index}
                        className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/10 dark:bg-white/5"
                      >
                        <Avatar person={comment.user} sizeClass="h-9 w-9" textClass="text-[10px]" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="truncate font-primary text-sm font-semibold text-slate-900 dark:text-white">
                              {comment.user?.name || "Someone"}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {formatRelativeTime(comment.created_at)}
                            </p>
                          </div>
                          <p className="mt-1 whitespace-pre-line font-primary text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {comment.comment}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div ref={commentsEndRef} />
              </div>

              <form
                onSubmit={handleCommentSubmit}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <label className="mb-3 block font-primary text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Add a comment
                </label>
                <textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  rows={4}
                  placeholder={canInteract ? "Write your comment..." : "Please log in to comment."}
                  disabled={!canInteract}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 font-primary text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-secondary/50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#0b1020] dark:text-white"
                />

                {error && (
                  <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                    {error}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={!commentText.trim() || submitting || !canInteract}
                    className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 font-primary text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <i className="fa-solid fa-spinner animate-spin" />
                    ) : (
                      <i className="fa-solid fa-paper-plane" />
                    )}
                    {submitting ? "Posting..." : "Post comment"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#11151f]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary dark:text-sky-300">
                Author
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Avatar person={post.user} sizeClass="h-11 w-11" textClass="text-sm" />
                <div className="min-w-0">
                  <h3 className="truncate font-primary text-base font-bold text-slate-900 dark:text-white">
                    {post.user?.name || "Unknown user"}
                  </h3>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                    {post.user?.email || "Community member"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#11151f]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary dark:text-sky-300">
                Post info
              </p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/5">
                  <p className="text-xs text-slate-400">Created</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {formatRelativeTime(post.created_at)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/5">
                  <p className="text-xs text-slate-400">Last updated</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {formatRelativeTime(post.updated_at || post.created_at)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#11151f]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary dark:text-sky-300">
                Quick note
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                This layout keeps the content front and center, with metadata and
                discussion kept quiet and easy to scan.
              </p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default BlogPostDetail;
