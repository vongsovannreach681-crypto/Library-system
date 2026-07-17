import React, { useEffect, useMemo, useState } from "react";
import logo from "../assets/NobgLogo.png";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

const navLinks = [
  { label: "ប្លុកវេទីការ", href: "/" },
  { label: "បណ្ណាល័យ", href: "/library" },
  { label: "មេរៀន", href: "/" },
  { label: "អំពីយើង", href: "" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState("");
  const [favoritesQuery, setFavoritesQuery] = useState("");
  const navigate = useNavigate();

  const loadFavorites = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setFavoritesCount(0);
      setFavoriteBooks([]);
      return;
    }

    try {
      const response = await api.get("/favorites");
      const favorites = response.data?.favorites || [];
      setFavoriteBooks(favorites);
      setFavoritesCount(favorites.length || 0);
    } catch (error) {
      console.error("Failed to load favorites:", error);
      setFavoritesCount(0);
      setFavoriteBooks([]);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const shouldUseDark = savedTheme
      ? savedTheme === "dark"
      : systemPrefersDark;

    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
    document.documentElement.style.colorScheme = shouldUseDark
      ? "dark"
      : "light";

    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        console.error("Failed to parse user data");
      }
    }

    loadFavorites();

    const handleUserUpdated = (event) => {
      const updatedUser = event.detail;
      if (updatedUser) {
        setUser(updatedUser);
      }
    };

    const handleFavoritesUpdated = () => {
      loadFavorites();
    };

    window.addEventListener("user-updated", handleUserUpdated);
    window.addEventListener("favorites-updated", handleFavoritesUpdated);

    return () => {
      window.removeEventListener("user-updated", handleUserUpdated);
      window.removeEventListener("favorites-updated", handleFavoritesUpdated);
    };
  }, []);

  useEffect(() => {
    if (!isFavoritesOpen) {
      setFavoritesQuery("");
      setFavoritesError("");
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setFavoritesLoading(false);
      setFavoritesError("សូមចូលគណនី ដើម្បីមើលសៀវភៅចូលចិត្ត។");
      return;
    }

    const refreshFavorites = async () => {
      try {
        setFavoritesLoading(true);
        const response = await api.get("/favorites");
        const favorites = response.data?.favorites || [];
        setFavoriteBooks(favorites);
        setFavoritesCount(favorites.length);
      } catch (error) {
        console.error("Failed to load favorites:", error);
        setFavoritesError("មិនអាចផ្ទុកសៀវភៅចូលចិត្តបានទេ។");
      } finally {
        setFavoritesLoading(false);
      }
    };

    refreshFavorites();
  }, [isFavoritesOpen]);

  const toggleTheme = () => {
    setIsDarkMode((current) => {
      const nextTheme = !current;
      localStorage.setItem("theme", nextTheme ? "dark" : "light");
      document.documentElement.classList.toggle("dark", nextTheme);
      document.documentElement.style.colorScheme = nextTheme ? "dark" : "light";
      return nextTheme;
    });
  };

  const toggleMenu = () => {
    setIsMenuOpen((current) => !current);
  };

  const closeFavorites = () => {
    setIsFavoritesOpen(false);
    setFavoritesQuery("");
    setFavoritesError("");
    setFavoritesLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setUser(null);
    setFavoritesCount(0);
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    setIsFavoritesOpen(false);
    navigate("/login");
  };

  const handleFavoriteRemove = async (bookId) => {
    try {
      await api.delete(`/favorites/${bookId}`);
      setFavoriteBooks((prev) => prev.filter((book) => book.id !== bookId));
      setFavoritesCount((prev) => Math.max(0, prev - 1));
      window.dispatchEvent(new Event("favorites-updated"));
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      setFavoritesError("មិនអាចលុបសៀវភៅនេះបានទេ។");
    }
  };

  const handleFavoriteDownload = (book) => {
    if (!book?.pdf_file) return;
    window.open(book.pdf_file, "_blank", "noreferrer");
  };

  const filteredFavorites = useMemo(() => {
    const q = favoritesQuery.trim().toLowerCase();
    if (!q) return favoriteBooks;
    return favoriteBooks.filter((book) => {
      const haystack = `${book.title || ""} ${book.author || ""} ${book.category_name || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [favoriteBooks, favoritesQuery]);

  return (
    <>
      <header className="bg-nav flex items-center justify-between px-4 py-2 md:px-6 lg:px-8">
        <div className="flex flex-shrink-0 items-center">
          <img className="h-auto w-20 md:w-24" src={logo} alt="Logo" />
        </div>

        <nav className="hidden gap-5 lg:gap-8 md:flex">
          {navLinks.map((link, index) => (
            <a
              key={index}
              className="font-primary text-lg font-semibold text-white transition-colors duration-200 hover:text-accent lg:text-xl"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center justify-center gap-4 lg:gap-5 md:flex">
          <div className="flex items-center gap-3 text-xl lg:text-2xl">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors duration-200 hover:bg-white/10 hover:text-accent"
              aria-label="Toggle color theme"
            >
              <i className={`fa-solid ${isDarkMode ? "fa-sun" : "fa-moon"}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsFavoritesOpen(true)}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors duration-200 hover:bg-white/10 hover:text-red-500"
              aria-label="Open favorites drawer"
            >
              <i className="fa-regular fa-heart" />
              {favoritesCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  {favoritesCount}
                </span>
              )}
            </button>
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 transition-opacity hover:opacity-80"
              >
                <img
                  src={
                    user.profile
                      ? `http://localhost:8000/storage/${user.profile}`
                      : "https://i.pinimg.com/1200x/2c/47/d5/2c47d5dd5b532f83bb55c4cd6f5bd1ef.jpg"
                  }
                  alt={user.name}
                  className="h-10 w-10 rounded-full border-2 border-accent object-cover"
                />
                <span className="font-primary text-sm font-semibold text-white lg:text-base">
                  {user.name}
                </span>
                <i
                  className={`fa-solid fa-chevron-down text-xs text-white transition-transform ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-600 bg-nav shadow-lg">
                  <div className="border-b border-gray-600 px-4 py-3">
                    <p className="font-primary font-semibold text-white">
                      {user.name}
                    </p>
                    <p className="font-primary text-xs text-gray-300">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 font-primary text-white transition-colors hover:bg-primary"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <i className="fa-solid fa-user mr-2" />
                    ប្រវត្តិរូប
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left font-primary text-red-400 transition-colors hover:bg-red-500/20"
                  >
                    <i className="fa-solid fa-sign-out-alt mr-2" />
                    ចាកចេញ
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded bg-primary px-4 py-2.5 font-primary text-sm font-semibold text-white transition-all duration-200 hover:bg-opacity-90 lg:text-lg"
            >
              Login <i className="fa-solid fa-right-to-bracket ml-1" />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <div className="flex items-center gap-2 text-lg">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors duration-200 hover:bg-white/10 hover:text-accent"
              aria-label="Toggle color theme"
            >
              <i className={`fa-solid ${isDarkMode ? "fa-sun" : "fa-moon"}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsFavoritesOpen(true)}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors duration-200 hover:bg-white/10 hover:text-red-500"
              aria-label="Open favorites drawer"
            >
              <i className="fa-regular fa-heart" />
              {favoritesCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  {favoritesCount}
                </span>
              )}
            </button>
          </div>
          <button
            onClick={toggleMenu}
            className="p-2 text-2xl text-white transition-colors duration-200 hover:text-accent"
            aria-label="Toggle menu"
          >
            <i className={`fa-solid ${isMenuOpen ? "fa-times" : "fa-bars"}`} />
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="border-t border-gray-700 bg-nav md:hidden">
          <nav className="flex flex-col gap-2 px-4 py-3">
            {navLinks.map((link, index) => (
              <a
                key={index}
                className="rounded px-3 py-2 font-primary text-base font-semibold text-white transition-all duration-200 hover:bg-white hover:bg-opacity-10 hover:text-accent"
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}

            {user ? (
              <>
                <div className="mt-2 border-t border-gray-600 px-3 py-2">
                  <div className="mb-2 flex items-center gap-2">
                    <img
                      src={
                        user.profile
                          ? `http://localhost:8000/storage/${user.profile}`
                          : "https://via.placeholder.com/40"
                      }
                      alt={user.name}
                      className="h-8 w-8 rounded-full border-2 border-accent object-cover"
                    />
                    <div>
                      <p className="font-primary text-sm font-semibold text-white">
                        {user.name}
                      </p>
                      <p className="font-primary text-xs text-gray-300">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="block rounded px-3 py-2 font-primary text-white transition-colors hover:bg-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fa-solid fa-user mr-2" />
                  ប្រវត្តិរូប
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full rounded px-3 py-2 text-left font-primary text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <i className="fa-solid fa-sign-out-alt mr-2" />
                  ចាកចេញ
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="mt-2 w-full rounded bg-primary px-3 py-3 text-center font-primary text-lg font-semibold text-white transition-all duration-200 hover:bg-opacity-90"
              >
                Login <i className="fa-solid fa-right-to-bracket ml-2" />
              </Link>
            )}
          </nav>
        </div>
      )}

      {isFavoritesOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={closeFavorites}
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col border-l border-slate-200 bg-white shadow-[-18px_0_50px_rgba(0,0,0,0.22)] dark:border-slate-800 dark:bg-slate-950 sm:max-w-[460px]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div>
                
                <h3 className="font-primary text-xl font-bold text-slate-900 dark:text-white">
                  សៀវភៅចូលចិត្តរបស់អ្នក
                </h3>
              </div>

              <button
                onClick={closeFavorites}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                aria-label="Close favorites drawer"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <i className="ph-bold ph-magnifying-glass text-slate-400" />
                <input
                  type="text"
                  value={favoritesQuery}
                  onChange={(e) => setFavoritesQuery(e.target.value)}
                  placeholder="Search by title, author, or tag."
                  className="w-full bg-transparent font-primary text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {favoritesLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center font-primary text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  កំពុងផ្ទុកសៀវភៅចូលចិត្ត...
                </div>
              ) : favoritesError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 font-primary text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                  {favoritesError}
                </div>
              ) : filteredFavorites.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center font-primary text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  មិនទាន់មានសៀវភៅចូលចិត្ត។
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFavorites.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <Link
                        to={`/bookDetail/${book.id}`}
                        className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800"
                      >
                        <img
                          src={book.cover_image}
                          alt={book.title}
                          className="h-full w-full object-cover"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link to={`/bookDetail/${book.id}`}>
                          <h4 className="line-clamp-1 font-primary text-base font-bold text-slate-900 transition hover:text-[#5a67d8] dark:text-white">
                            {book.title}
                          </h4>
                        </Link>
                        <p className="mt-1 font-primary text-sm text-slate-500 dark:text-slate-400">
                          {book.author}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-primary text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <i className="ph-bold ph-calendar" />
                            {book.release_date
                              ? new Date(book.release_date).getFullYear()
                              : "N/A"}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-primary text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <i className="ph-bold ph-tag" />
                            {book.category_name || "General"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleFavoriteRemove(book.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
                          aria-label="Delete favorite"
                        >
                          <i className="fa-solid fa-trash-can text-xs" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFavoriteDownload(book)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          aria-label="Download book"
                          disabled={!book.pdf_file}
                        >
                          <i className="fa-solid fa-download text-xs" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 px-5 py-4 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <p className="font-primary text-sm text-slate-600 dark:text-slate-400">
                  Book QTY : x{favoritesCount}
                </p>
                <button
                  type="button"
                  onClick={closeFavorites}
                  className="inline-flex items-center gap-2 rounded-full bg-[#18385f] px-4 py-2 font-primary text-sm font-semibold text-white transition hover:bg-[#0f2644] dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  បិទ
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Header;
