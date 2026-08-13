import React from "react";
import { Link } from "react-router-dom";

const tabs = [
  { id: "posts", label: "Posts", icon: "fa-pen-to-square" },
  { id: "books", label: "Books", icon: "fa-book" },
  { id: "favorites", label: "Favorites", icon: "fa-star" },
];

const HistoryCard = ({ title, subtitle, meta, href, badge, image, actionLabel }) => {
  const content = (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="w-full overflow-hidden rounded-xl sm:w-36">
          <div className="aspect-[2/3] overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-800">
            {image ? (
              <img
                src={image}
                alt={title}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 dark:from-slate-800 dark:to-slate-700">
                <i className="fa-solid fa-layer-group text-2xl" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="line-clamp-1 font-primary text-xl font-bold text-primary transition hover:text-[#0f9d58] dark:text-white sm:text-2xl">
                {title}
              </h3>
              <p className="mt-1 line-clamp-2 font-primary text-sm font-medium text-dark-gray dark:text-slate-300">
                {subtitle}
              </p>
            </div>

            {badge && (
              <span className="rounded-full bg-[#0f9d58]/10 px-2.5 py-1 text-[10px] font-semibold text-[#0f9d58] dark:bg-white/10 dark:text-white">
                {badge}
              </span>
            )}
          </div>

          {meta && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-dark-gray font-primary dark:text-slate-400">
              {meta}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4 dark:border-slate-700">
            <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-primary text-sm font-bold text-white transition hover:bg-secondary">
              {actionLabel || "Open"} <i className="fa-solid fa-arrow-right" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link to={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

const PostHistory = ({
  activeTab,
  onTabChange,
  posts = [],
  books = [],
  favorites = [],
  loading = false,
  error = "",
}) => {
  const selectedTab = activeTab || "posts";

  const renderEmpty = (message) => (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-dark-gray dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
      {message}
    </div>
  );

  let content = null;

  if (loading) {
    content = <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 dark:bg-slate-900">Loading...</div>;
  } else if (selectedTab === "books") {
    content =
      books.length === 0
        ? renderEmpty("No books found yet.")
        : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {books.map((book) => (
              <HistoryCard
                key={book.id}
                href={`/bookDetail/${book.id}`}
                title={book.title}
                subtitle={book.author || book.category_name || "Book"}
                meta={book.description || `Rating ${book.star_rating ?? "N/A"}`}
                badge="Book"
                image={book.cover_image}
                actionLabel="Open book"
              />
            ))}
          </div>
        );
  } else if (selectedTab === "favorites") {
    content =
      favorites.length === 0
        ? renderEmpty("No favorites yet. Your saved books will appear here.")
        : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((book) => (
              <HistoryCard
                key={book.id}
                href={`/bookDetail/${book.id}`}
                title={book.title}
                subtitle={book.author || book.category_name || "Saved book"}
                meta={book.description || "Saved to favorites"}
                badge="Favorite"
                image={book.cover_image}
                actionLabel="Open book"
              />
            ))}
          </div>
        );
  } else {
    content =
      posts.length === 0
        ? renderEmpty("No posts yet. Your recent posts will appear here.")
        : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <HistoryCard
                key={post.id}
                title={post.content?.slice(0, 42) || "Post"}
                subtitle={post.content || "Shared post"}
                meta={`${post.comments_count ?? 0} comments · ${post.likes_count ?? 0} likes`}
                badge="Post"
                image={post.image_url}
                actionLabel="Open post"
              />
            ))}
          </div>
        );
  }

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f9d58]">History</p>
          <h2 className="mt-1 font-primary text-2xl font-bold text-slate-800 dark:text-white">
            Your posts, books, and favorites
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedTab === tab.id
                  ? "bg-[#0f9d58] text-white shadow-[0_10px_22px_rgba(15,157,88,0.2)]"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <i className={`fa-solid ${tab.icon} text-xs`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="mt-5">{content}</div>
    </section>
  );
};

export default PostHistory;
