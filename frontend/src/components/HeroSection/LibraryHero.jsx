import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import book1 from "../../assets/Book/Static1.PNG";
import book2 from "../../assets/Book/Static2.jpg";
import book3 from "../../assets/Book/Static3.jpg";
import book4 from "../../assets/Book/Static4.jpg";

const LibraryHero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown when clicking outside the search box
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced live search as the user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setSearchError(null);
      try {
        const res = await api.get("/search-books", {
          params: { query: searchQuery.trim(), limit: 6 },
        });

        // BooksController::search returns a plain JSON array of books
        setResults(Array.isArray(res.data) ? res.data : []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
        setShowDropdown(true);
        if (err.response) {
          // Request reached the server but failed (e.g. 404, 422, 500)
          setSearchError(
            `មានបញ្ហា (${err.response.status}): សូមពិនិត្យ API endpoint ឬទិន្នន័យស្វែងរក`
          );
        } else if (err.request) {
          // Request never got a response — server unreachable, wrong URL, or CORS
          setSearchError(
            "មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ សូមពិនិត្យ API URL ឬ CORS"
          );
        } else {
          setSearchError("មានបញ្ហាមិនស្គាល់មូលហេតុ");
        }
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/library?search=${encodeURIComponent(searchQuery)}`);
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearchSubmit(e);
  };

  const handleSelectBook = (book) => {
    setShowDropdown(false);
    setSearchQuery("");
    navigate(`/bookDetail/${book.id}`);
  };

  return (
    <section className="relative overflow-hidden bg-primary pt-20">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-secondary/30 blur-3xl" />
        <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-12 py-12 sm:py-16 lg:grid-cols-2 lg:gap-10 lg:py-24">
          <div className="mx-auto max-w-2xl space-y-6 text-center lg:mx-0 lg:text-left">
            <h1 className="font-primary text-4xl font-extrabold leading-tight text-pure-white sm:text-5xl lg:text-6xl">
              ទាញយក <span className="text-secondary">សៀវភៅអាន</span>
              <br className="hidden lg:block" />
              <span>ដើម្បីអានកាន់តែងាយស្រួល</span>
            </h1>

            {/* Search box + live results dropdown */}
            <div ref={wrapperRef} className="relative mx-auto mt-8 max-w-lg lg:mx-0">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => results.length > 0 && setShowDropdown(true)}
                  placeholder="ស្វែងរកសៀវភៅដើម្បីអាន"
                  className="w-full rounded-full bg-white py-3.5 pl-5 pr-28 text-sm text-text-black shadow-xl placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-secondary/50 sm:py-4 sm:pl-6 sm:pr-32 sm:text-base font-primary"
                />
                <button
                  onClick={handleSearchSubmit}
                  className="absolute bottom-2 right-2 top-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-pure-white transition-all duration-200 hover:bg-blue-400 sm:px-6 sm:text-base font-primary"
                >
                  ស្វែងរក
                </button>
              </div>

              {/* Dropdown list card */}
              {showDropdown && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-96 overflow-y-auto rounded-2xl bg-white p-2 text-left shadow-2xl">
                  {loading && (
                    <p className="font-primary px-4 py-3 text-sm text-gray-400">
                      កំពុងស្វែងរក...
                    </p>
                  )}

                  {!loading && searchError && (
                    <p className="font-primary px-4 py-3 text-sm text-red-500">
                      {searchError}
                    </p>
                  )}

                  {!loading && !searchError && results.length === 0 && (
                    <p className="font-primary px-4 py-3 text-sm text-gray-400">
                      រកមិនឃើញសៀវភៅដែលត្រូវនឹងការស្វែងរករបស់អ្នកទេ
                    </p>
                  )}

                  {!loading &&
                    results.map((book) => (
                      <button
                        key={book.id}
                        onClick={() => handleSelectBook(book)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-primary/5"
                      >
                        <img
                          src={book.cover_image}
                          alt={book.title}
                          className="h-14 w-10 flex-shrink-0 rounded-md object-cover shadow"
                        />
                        <div className="min-w-0">
                          <p className="font-primary truncate text-sm font-semibold text-text-black">
                            {book.title}
                          </p>
                          {book.author && (
                            <p className="font-primary truncate text-xs text-gray-400">
                              {book.author}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}

                  {!loading && results.length > 0 && (
                    <button
                      onClick={handleSearchSubmit}
                      className="font-primary mt-1 w-full rounded-xl px-3 py-2 text-center text-sm font-semibold text-secondary hover:bg-secondary/5"
                    >
                      មើលលទ្ធផលទាំងអស់
                    </button>
                  )}
                </div>
              )}
            </div>

            <p className="mx-auto max-w-2xl text-sm font-light leading-7 text-light-gray sm:text-base lg:mx-0 font-primary">
              ចាប់ផ្តើមការអានសៀវភៅនៅលើសមាជិកន៍សៀវភៅ ដើម្បីទទួលបានចំណេះដឹងថ្មីៗ។
              <br />
              ចូលរួមទាំងអស់គ្នា ដើម្បីអាន និងរកឃើញសៀវភៅដែលអ្នកចូលចិត្ត។
            </p>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="grid w-full max-w-md grid-cols-2 gap-4 sm:max-w-lg lg:max-w-none lg:grid-cols-2 lg:gap-6">
              <img
                src={book1}
                alt="Library preview book 1"
                className="mx-auto w-36 rounded-2xl object-cover shadow-2xl transition duration-500 hover:scale-105 sm:w-44 lg:w-48"
              />
              <img
                src={book2}
                alt="Library preview book 2"
                className="mx-auto w-36 rounded-2xl object-cover shadow-2xl transition duration-500 hover:scale-105 sm:w-44 lg:w-48"
              />
              <img
                src={book3}
                alt="Library preview book 3"
                className="mx-auto w-36 rounded-2xl object-cover shadow-2xl transition duration-500 hover:scale-105 sm:w-44 lg:w-48"
              />
              <img
                src={book4}
                alt="Library preview book 4"
                className="mx-auto w-36 rounded-2xl object-cover shadow-2xl transition duration-500 hover:scale-105 sm:w-44 lg:w-48"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LibraryHero;
