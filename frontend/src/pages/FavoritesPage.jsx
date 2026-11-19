import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getStorageUrl } from "../api/api";
import Header from "../components/Header";

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("recent");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadFavorites = async () => {
      try {
        const response = await api.get("/favorites");
        setFavorites(response.data?.favorites || []);
      } catch (ex) {
        console.error("Failed to load favorites:", ex);
        setError("មិនអាចផ្ទុកសៀវភៅចូលចិត្តបានទេ។");
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [navigate]);

  const handleRemove = async (bookId) => {
    setRemovingId(bookId);
    try {
      await api.delete(`/favorites/${bookId}`);
      setFavorites((prev) => prev.filter((book) => book.id !== bookId));
      window.dispatchEvent(new Event("favorites-updated"));
    } catch (ex) {
      console.error("Failed to remove favorite:", ex);
      setError("មិនអាចលុបសៀវភៅនេះបានទេ។");
    } finally {
      setRemovingId(null);
    }
  };

  // Prevent the card's <Link> navigation from firing when the heart icon is clicked
  const handleFavoriteClick = (event, book) => {
    event.preventDefault();
    event.stopPropagation();
    handleRemove(book.id);
  };

  const handleDownload = (event, book) => {
    event.preventDefault();
    event.stopPropagation();
    if (!book?.pdf_file) return;
    window.open(book.pdf_file, "_blank", "noreferrer");
  };

  const filteredFavorites = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = favorites.filter((book) => {
      const haystack = `${book.title || ""} ${book.author || ""} ${book.category_name || ""}`.toLowerCase();
      return haystack.includes(q);
    });

    const sorted = [...filtered];
    if (sortMode === "title") {
      sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortMode === "author") {
      sorted.sort((a, b) => (a.author || "").localeCompare(b.author || ""));
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.created_at || b.updated_at || 0) -
          new Date(a.created_at || a.updated_at || 0)
      );
    }

    return sorted;
  }, [favorites, query, sortMode]);

  const totalFavorites = favorites.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#070913] dark:text-white">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Header />
        </div>
        <main className="mx-auto max-w-5xl px-4 pt-28 pb-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-24">
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <i className="fa-solid fa-spinner animate-spin text-secondary text-base" />
              <span>កំពុងទាញយកសៀវភៅចូលចិត្ត...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(63,114,175,0.08),_transparent_40%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(17,45,78,0.25),_transparent_50%),linear-gradient(180deg,_#070913_0%,_#0b1020_100%)] text-slate-900 dark:text-white transition-colors duration-300">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <main className="mx-auto max-w-5xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <i className="ph-fill ph-heart text-xl" />
            </span>
            <div>
              <h1 className="font-primary text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                សៀវភៅដែលអ្នកចូលចិត្ត
              </h1>
              <p className="font-primary text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                បណ្តុំសៀវភៅដែលអ្នកបានរក្សាទុកសម្រាប់អាន
              </p>
            </div>
          </div>
          <div className="mt-3 h-1 w-20 rounded-full bg-accent" />
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-primary text-sm font-semibold text-slate-600 dark:text-slate-300">
            ចំនួនសរុប: <span className="text-secondary dark:text-accent font-bold">({totalFavorites})</span>
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ស្វែងរកក្នុងបញ្ជីចូលចិត្ត..."
              className="font-primary rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-xs"
            />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              className="font-primary rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-xs"
            >
              <option value="recent">ថ្មីៗបំផុត</option>
              <option value="title">តាមចំណងជើង</option>
              <option value="author">តាមអ្នកនិពន្ធ</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="font-primary mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </p>
        )}

        {!error && filteredFavorites.length === 0 && (
          <div className="font-primary rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 py-16 text-center text-slate-500 dark:text-slate-400">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400 dark:bg-white/10 dark:text-slate-300 mb-3">
              <i className="ph-bold ph-book-open" />
            </div>
            <p className="text-sm font-semibold">
              {totalFavorites === 0
                ? "អ្នកមិនទាន់មានសៀវភៅចូលចិត្តនៅឡើយទេ។"
                : "រកមិនឃើញសៀវភៅដែលត្រូវនឹងការស្វែងរករបស់អ្នកទេ។"}
            </p>
            {totalFavorites === 0 && (
              <Link
                to="/library"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-xs font-bold text-white hover:opacity-95 transition"
              >
                <i className="fa-solid fa-magnifying-glass" />
                <span>រុករកបណ្ណាល័យឥឡូវនេះ</span>
              </Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {filteredFavorites.map((book) => (
            <Link
              key={book.id}
              to={`/bookDetail/${book.id}`}
              className="group block"
            >
              <article className="h-full rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-slate-900 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="w-full shrink-0 overflow-hidden rounded-xl sm:w-36">
                    <div className="aspect-[2/3] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-inner">
                      <img
                        src={getStorageUrl(book.cover_image) || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80"}
                        alt={book.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80";
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="line-clamp-1 font-primary text-lg font-bold text-slate-900 dark:text-white group-hover:text-secondary dark:group-hover:text-accent transition">
                        {book.title}
                      </h3>
                      <p className="mt-1 font-primary text-xs font-medium text-slate-500 dark:text-slate-400">
                        {book.author}
                      </p>

                      <div className="mt-2.5 flex items-center gap-1 text-xs text-accent">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <i key={i} className="ph-fill ph-star" />
                        ))}
                        <span className="ml-1 font-primary text-slate-500 dark:text-slate-400 text-xs">
                          ({book.star_rating ?? "5.0"})
                        </span>
                      </div>

                      <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-slate-600 font-primary dark:text-slate-300">
                        {book.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-white/5">
                      <button
                        type="button"
                        disabled={removingId === book.id}
                        onClick={(event) => handleFavoriteClick(event, book)}
                        className="text-red-500 transition hover:text-red-600 disabled:opacity-50 dark:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                        aria-label="ដកចេញពីបញ្ជីចូលចិត្ត"
                        title="ដកចេញពីបញ្ជីចូលចិត្ត"
                      >
                        <i className="ph-fill ph-heart text-xl" />
                      </button>
                      <span
                        onClick={(event) => handleDownload(event, book)}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-1.5 font-primary text-xs font-bold text-white transition hover:bg-secondary cursor-pointer"
                      >
                        អានឥលូវនេះ <i className="ph-bold ph-book-open" />
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FavoritesPage; 
