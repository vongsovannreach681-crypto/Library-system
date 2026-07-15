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

  const handleDownload = (book) => {
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
      sorted.sort((a, b) => (new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0)));
    }

    return sorted;
  }, [favorites, query, sortMode]);

  const totalFavorites = favorites.length;
  const activeBook = filteredFavorites[0] || favorites[0];

  if (loading) {
    return (
      <>
        <Header />
        <LoadingState />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[linear-gradient(180deg,_#ffffff_0%,_#f5f7fb_100%)] pt-6 dark:bg-[linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]">
        <section className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#18385f] p-6 text-white shadow-[0_20px_50px_rgba(15,23,42,0.22)] dark:bg-[#0f2644] sm:p-8 lg:min-h-[760px]">
              <div className="absolute inset-0 opacity-35">
                <div className="absolute left-0 top-0 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-[#5a67d8]/20 blur-3xl" />
              </div>

              <div className="relative z-10 flex h-full flex-col">
                <div className="max-w-2xl">
                  <p className="font-primary text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                    សៀវភៅចូលចិត្ត
                  </p>
                  <h1 className="mt-5 max-w-xl font-primary text-4xl font-extrabold leading-tight sm:text-5xl xl:text-6xl">
                    ចូលទៅបណ្ណាល័យផ្ទាល់ខ្លួនរបស់អ្នក
                  </h1>
                  <p className="mt-6 max-w-xl font-primary text-base leading-8 text-white/80">
                    រក្សាទុកសៀវភៅដែលអ្នកចង់អាន និងត្រឡប់មកពេលណាក៏បានដោយរូបរាងស្អាត និងងាយមើល។
                  </p>
                </div>

                <div className="mt-8 max-w-xl">
                  <label className="sr-only" htmlFor="favorite-search">
                    Search favorites
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lg">
                    <i className="ph-bold ph-magnifying-glass text-slate-400" />
                    <input
                      id="favorite-search"
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by title, author, or tag."
                      className="w-full bg-transparent font-primary text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <p className="mt-6 max-w-xl font-primary text-sm leading-7 text-white/70">
                  បន្តអានពីចំណុចដែលអ្នកចូលចិត្តបំផុត។ រក្សាទុក, ស្វែងរក, និងគ្រប់គ្រងសៀវភៅបានងាយស្រួល។
                </p>

                <div className="mt-auto flex items-end justify-between gap-4 pt-12">
                  <p className="max-w-sm font-primary text-xs italic text-white/45">
                    Today a reader, tomorrow a leader.
                  </p>

                  {activeBook && (
                    <div className="hidden items-end gap-4 md:flex">
                      <img
                        src={activeBook.cover_image}
                        alt={activeBook.title}
                        className="h-48 w-36 rounded-2xl object-cover shadow-2xl ring-1 ring-white/20"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <div>
                  <h2 className="font-primary text-xl font-bold text-slate-900 dark:text-white">
                    Your Favorite Books
                  </h2>
                  <p className="font-primary text-sm text-slate-500 dark:text-slate-400">
                    {totalFavorites} saved book{totalFavorites !== 1 ? "s" : ""}
                  </p>
                </div>

                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-primary text-sm text-slate-700 outline-none transition focus:border-[#5a67d8] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                >
                  <option value="recent">ថ្មីបំផុត</option>
                  <option value="title">តម្រៀបតាមឈ្មោះ</option>
                  <option value="author">តម្រៀបតាមអ្នកនិពន្ធ</option>
                </select>
              </div>

              <div className="max-h-[680px] overflow-y-auto">
                {error ? (
                  <div className="p-6">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 font-primary text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                      {error}
                    </div>
                  </div>
                ) : filteredFavorites.length === 0 ? (
                  <div className="flex h-[680px] items-center justify-center p-6 text-center">
                    <div>
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#5a67d8]/10 text-[#5a67d8] dark:bg-white/10 dark:text-white">
                        <i className="ph-bold ph-heart text-3xl" />
                      </div>
                      <h3 className="mt-4 font-primary text-xl font-bold text-slate-900 dark:text-white">
                        មិនមានសៀវភៅចូលចិត្ត
                      </h3>
                      <p className="mt-2 max-w-sm font-primary text-sm leading-7 text-slate-500 dark:text-slate-400">
                        ស្វែងរកសៀវភៅដែលអ្នកចូលចិត្តនៅក្នុងបណ្ណាល័យ ហើយបន្ថែមមកទីនេះ។
                      </p>
                      <Link
                        to="/library"
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#5a67d8] px-5 py-3 font-primary text-sm font-bold text-white transition hover:bg-[#4855c7]"
                      >
                        ទៅបណ្ណាល័យ
                        <i className="ph-bold ph-arrow-right" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredFavorites.map((book) => (
                      <div
                        key={book.id}
                        className="flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50 dark:hover:bg-slate-950 sm:flex-row sm:items-center sm:gap-5"
                      >
                        <Link
                          to={`/bookDetail/${book.id}`}
                          className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
                        >
                          <img
                            src={book.cover_image}
                            alt={book.title}
                            className="h-full w-full object-cover"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <Link to={`/bookDetail/${book.id}`}>
                            <h3 className="truncate font-primary text-base font-bold text-slate-900 transition hover:text-[#5a67d8] dark:text-white">
                              {book.title}
                            </h3>
                          </Link>
                          <p className="mt-1 font-primary text-sm text-slate-500 dark:text-slate-400">
                            {book.author}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-primary text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              <i className="ph-bold ph-tag" />
                              {book.category_name || "General"}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-primary text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              <i className="ph-bold ph-calendar" />
                              {book.release_date
                                ? new Date(book.release_date).getFullYear()
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          <Link
                            to={`/bookDetail/${book.id}`}
                            className="inline-flex items-center gap-2 rounded-full bg-[#18385f] px-4 py-2 font-primary text-sm font-semibold text-white transition hover:bg-[#0f2644] dark:bg-slate-800 dark:hover:bg-slate-700"
                          >
                            អាន
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleRemove(book.id)}
                            disabled={removingId === book.id}
                            className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 font-primary text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
                          >
                            {removingId === book.id ? "កំពុងលុប..." : "លុប"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(book)}
                            disabled={!book.pdf_file}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-primary text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            ទាញយក
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default FavoritesPage;
