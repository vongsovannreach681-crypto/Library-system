import React, { useEffect, useState, useRef } from "react";
import api from "../api/api";
import Header from "../components/Header";
import defaultBookCover from "../assets/Book/Static1.PNG";
import { Link, useNavigate, useParams } from "react-router-dom";

const DetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pdfContainerRef = useRef(null);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    const loadBook = async () => {
      try {
        const res = await api.get(`/get-book/${id}`);
        setBook(res.data);
      } catch (ex) {
        console.error("Message : ", ex);
        setError(true);
      } finally {
        setLoading(false);
      }

      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsFavorite(false);
        return;
      }

      try {
        const favoritesRes = await api.get("/favorites");
        const favorites = favoritesRes.data?.favorites || [];
        setIsFavorite(favorites.some((item) => String(item.id) === String(id)));
      } catch (ex) {
        console.error("Favorite lookup error:", ex);
        setIsFavorite(false);
      }
    };

    loadBook();
  }, [id]);

  const handleFavoriteToggle = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login");
      return;
    }

    setFavoriteLoading(true);
    try {
      if (!isFavorite) {
        await api.post(`/favorites/${id}`);
        setIsFavorite(true);
      }
      window.dispatchEvent(new Event("favorites-updated"));
    } catch (ex) {
      console.error("Favorite error:", ex);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleToggleFullscreen = () => {
    if (!pdfContainerRef.current) return;

    if (!document.fullscreenElement) {
      if (pdfContainerRef.current.requestFullscreen) {
        pdfContainerRef.current.requestFullscreen();
      } else if (pdfContainerRef.current.webkitRequestFullscreen) {
        /* Safari */
        pdfContainerRef.current.webkitRequestFullscreen();
      } else if (pdfContainerRef.current.msRequestFullscreen) {
        /* IE11 */
        pdfContainerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="font-primary text-primary text-base sm:text-lg">
          Loading book details...
        </p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="font-primary text-red-600 text-base sm:text-lg">
          Failed to load book details.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 z-30 right-0">
        <Header />
      </div>

      <main className="min-h-screen pb-12 sm:pb-16 pt-16 sm:pt-20">
        {/* Header Hero Section */}
        <section className="bg-primary pt-12 sm:pt-16 pb-10 sm:pb-16 relative shadow-lg">
          {/* Back Button */}
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
            <Link
              to="/library"
              onClick={(e) => {
                if (window.history.length > 1) {
                  e.preventDefault();
                  window.history.back();
                }
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition backdrop-blur-sm"
            >
              <i className="ph-bold ph-arrow-left text-lg sm:text-xl" />
            </Link>
          </div>

          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-6 sm:gap-8 lg:gap-10 items-center md:items-start">
              {/* Book Cover */}
              <div className="flex-shrink-0 w-[160px] sm:w-[220px] md:w-[260px] aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border-2 sm:border-4 border-white/10">
                <img
                  id="book-cover"
                  src={book.cover_image || defaultBookCover}
                  alt={book.title || "Book Cover"}
                  className="w-full h-full object-cover bg-gray-700"
                />
              </div>

              {/* Book Overview Details */}
              <div className="flex-1 text-center md:text-left text-white w-full">
                <p
                  id="book-author"
                  className="text-gray-300 text-lg sm:text-xl md:text-2xl font-medium mb-1.5 sm:mb-2 font-primary"
                >
                  និពន្ធដោយលោក : {book.author || "N/A"}
                </p>

                <h1
                  id="book-title"
                  className="text-2xl sm:text-4xl md:text-5xl font-primary font-extrabold mb-3 sm:mb-4 leading-tight break-words"
                >
                  ចំណងជើងរឿង : {book.title}
                </h1>

                <p className="font-primary text-gray-300 text-sm sm:text-base mb-3 line-clamp-2 max-w-2xl mx-auto md:mx-0">
                  {book.description}
                </p>

                <p className="font-primary text-gray-300 text-sm sm:text-base mb-4">
                  បោះពុម្ភផ្សាយនៅឆ្នាំ :{" "}
                  <span>
                    {book.release_date
                      ? new Date(book.release_date).getFullYear()
                      : "N/A"}
                  </span>
                </p>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-4 mb-6">
                  {book.star_rating !== undefined && (
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm text-xs sm:text-sm">
                      <i className="ph-fill ph-star text-accent text-sm sm:text-base" />
                      <span className="font-bold">{book.star_rating}</span>
                    </div>
                  )}

                  {book.Time_spent && (
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm text-xs sm:text-sm">
                      <i className="ph-bold ph-clock text-sm sm:text-base" />
                      <span className="font-primary">
                        រយះពេលអាន : {book.Time_spent} ម៉ោង
                      </span>
                    </div>
                  )}

                  {book.category_name && (
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm text-xs sm:text-sm">
                      <i className="ph-bold ph-files text-sm sm:text-base" />
                      <span id="page-count" className="font-primary">
                        ប្រភេទរឿង : {book.category_name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4 w-full">
                  <a
                    id="download-btn"
                    download={book.title ? `${book.title}.pdf` : "book.pdf"}
                    href={book.pdf_file || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-6 py-3 font-primary bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <i className="ph-bold ph-download-simple text-lg" />{" "}
                    ទាញយកសៀវភៅ
                  </a>

                  <button
                    id="favorite-btn"
                    onClick={handleFavoriteToggle}
                    disabled={favoriteLoading}
                    className="w-full sm:w-auto px-5 py-3 border border-white/30 text-white rounded-lg hover:bg-white/10 transition flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <i
                      className={`text-lg sm:text-xl ${
                        isFavorite ? "ph-fill ph-heart text-red-500" : "ph-bold ph-heart"
                      }`}
                    />
                    <span className="font-primary">
                      {favoriteLoading
                        ? "កំពុងដាក់..."
                        : isFavorite
                        ? "ដកចេញពីចូលចិត្ត"
                        : "ដាក់ចូលចិត្ត"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section: Summary & PDF Reader */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Summary Card */}
            <aside className="lg:col-span-4">
              <div className="bg-white dark:bg-primary rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 dark:border-slate-700 lg:sticky lg:top-28">
                <h3 className="font-primary text-lg sm:text-xl font-bold text-primary dark:text-white mb-3 flex items-center gap-2">
                  <i className="ph-fill ph-book-marked text-xl sm:text-2xl text-accent"></i>
                  រឿងសង្ខេប
                </h3>
                <div className="w-12 h-1 bg-gradient-to-r from-accent to-transparent rounded-full mb-4"></div>
                
                <p
                  className={`font-primary text-gray-600 dark:text-gray-300 leading-relaxed text-sm transition-all duration-300 ${
                    isDescriptionExpanded ? "" : "line-clamp-6"
                  }`}
                >
                  {book.description || "មិនមានការពិពណ៌នាឡើយ។"}
                </p>

                {book.description && book.description.length > 200 && (
                  <button
                    onClick={() =>
                      setIsDescriptionExpanded(!isDescriptionExpanded)
                    }
                    className="mt-4 text-accent font-primary text-sm font-semibold hover:text-accent/80 transition flex items-center gap-1"
                  >
                    {isDescriptionExpanded ? (
                      <>
                        បង្រ្កឹម <i className="ph-bold ph-arrow-up"></i>
                      </>
                    ) : (
                      <>
                        អានលំអិត <i className="ph-bold ph-arrow-right"></i>
                      </>
                    )}
                  </button>
                )}
              </div>
            </aside>

            {/* Right Column: Interactive Document Reader */}
            <div className="lg:col-span-8 space-y-6">
              <div
                ref={pdfContainerRef}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-slate-700"
              >
                {/* Header Bar */}
                <div className="bg-gradient-to-r from-primary to-primary/90 px-4 sm:px-6 py-3.5 sm:py-4 flex justify-between items-center">
                  <h3 className="font-bold text-white flex items-center gap-2.5 font-primary text-base sm:text-lg">
                    <i className="ph-fill ph-book-open-text text-lg sm:text-xl"></i>
                    មើលឯកសារ
                  </h3>
                  <button
                    id="fullscreen-btn"
                    onClick={handleToggleFullscreen}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 text-white/90 hover:text-white"
                    title="Toggle Fullscreen"
                  >
                    <i className="ph-bold ph-corners-out text-lg sm:text-xl"></i>
                  </button>
                </div>

                {/* PDF Container Viewport */}
                <div
                  id="pdf-container"
                  className="bg-gray-50 dark:bg-slate-700 p-2 sm:p-4 h-[450px] sm:h-[650px] lg:h-[800px] flex flex-col group"
                >
                  {book.pdf_file ? (
                    <iframe
                      id="pdf-viewer"
                      src={book.pdf_file}
                      title={book.title || "PDF Document"}
                      className="w-full flex-1 rounded-xl bg-white shadow-inner border border-gray-200 dark:border-slate-600"
                      frameBorder="0"
                    />
                  ) : (
                    <div
                      id="pdf-fallback"
                      className="flex-1 flex flex-col items-center justify-center text-center bg-gray-100 dark:bg-slate-600 rounded-xl p-4"
                    >
                      <i className="ph-duotone ph-file-x text-5xl sm:text-6xl text-gray-300 dark:text-gray-500 mb-3"></i>
                      <p className="text-gray-600 dark:text-gray-300 font-primary text-sm sm:text-base mb-1">
                        មិនអាចមើលឯកសារបានទេ
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-4 font-primary">
                        សូមព្យាយាមទាញយកឯកសារដើម្បីអានវា
                      </p>
                    </div>
                  )}
                </div>

                {/* Viewer Footer Toolbar */}
                <div className="bg-gray-50 dark:bg-slate-700 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-slate-600 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-primary">
                    <i className="ph-fill ph-file-pdf text-base sm:text-lg text-red-500"></i>
                    <span>ឯកសារ PDF</span>
                  </div>
                  <a
                    href={book.pdf_file || "#"}
                    download={book.title ? `${book.title}.pdf` : "book.pdf"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:text-accent/80 transition font-primary text-xs sm:text-sm font-semibold flex items-center gap-1"
                  >
                    <i className="ph-bold ph-download-simple"></i>
                    ទាញយកឯកសារ
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default DetailPage;