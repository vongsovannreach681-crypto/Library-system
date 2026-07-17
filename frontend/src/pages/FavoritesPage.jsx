import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import Header from "../components/Header";
import LoadingState from "../components/card/LoadingState";

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
      <>
        
      </>
    );
  }

  return (
    <>
      
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900 rounded-xl">
          <h1 className="font-primary text-primary  dark:text-white font-semibold text-2xl">សៀវភៅដែលអ្នកចូលចិត្ត </h1>
          <hr className="w-50 h-1 bg-accent " />
        <div className="mb-6 flex flex-col gap-4 mt-5 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-primary text-2xl font-bold text-primary dark:text-white">
            ចំនួន ({totalFavorites})
          </h1>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ស្វែងរកក្នុងបញ្ជីចូលចិត្ត"
              className="font-primary rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              className="font-primary rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="recent">ថ្មីៗបំផុត</option>
              <option value="title">តាមចំណងជើង</option>
              <option value="author">តាមអ្នកនិពន្ធ</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="font-primary mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500 dark:bg-red-900/20">
            {error}
          </p>
        )}

        {!error && filteredFavorites.length === 0 && (
          <div className="font-primary rounded-2xl border border-dashed border-gray-200 py-16 text-center text-dark-gray dark:border-slate-700 dark:text-slate-400">
            {totalFavorites === 0
              ? "អ្នកមិនទាន់មានសៀវភៅចូលចិត្តនៅឡើយទេ។"
              : "រកមិនឃើញសៀវភៅដែលត្រូវនឹងការស្វែងរករបស់អ្នកទេ។"}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredFavorites.map((book) => (
            <Link
              key={book.id}
              to={`/bookDetail/${book.id}`}
              className="block"
            >
              <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="w-full overflow-hidden rounded-xl sm:w-36">
                    <div className="aspect-[2/3] overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-800">
                      <img
                        src={book.cover_image}
                        alt={book.title}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col">
                    <h3 className="line-clamp-1 font-primary text-xl font-bold text-primary dark:text-white sm:text-2xl">
                      {book.title}
                    </h3>
                    <p className="mt-1 font-primary text-sm font-medium text-dark-gray dark:text-slate-300">
                      {book.author}
                    </p>

                    <div className="mt-3 flex items-center gap-1 text-sm text-accent">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i key={i} className="ph-fill ph-star" />
                      ))}
                      <span className="ml-1 font-primary text-dark-gray dark:text-slate-300">
                        ({book.star_rating ?? "N/A"})
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-dark-gray font-primary dark:text-slate-400">
                      {book.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4 dark:border-slate-700">
                      <button
                        type="button"
                        disabled={removingId === book.id}
                        onClick={(event) => handleFavoriteClick(event, book)}
                        className="text-red-500 transition hover:text-red-600 disabled:opacity-50 dark:text-red-400"
                        aria-label="ដកចេញពីបញ្ជីចូលចិត្ត"
                      >
                        <i className="ph-fill ph-heart text-xl" />
                      </button>
                      <span
                        onClick={(event) => handleDownload(event, book)}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-primary text-sm font-bold text-white transition hover:bg-secondary"
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
    </>
  );
};

export default FavoritesPage; 
