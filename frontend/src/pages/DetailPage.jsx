import React, { useEffect, useState } from "react";
import api from "../api/api";
import Header from "../components/Header";
import book from "../assets/Book/Static1.PNG";
import { Link, useParams } from "react-router-dom";
const DetailPage = () => {
  const { id } = useParams();

  const [book, setBook] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    const BookDetail = async () => {
      try {
        const res = await api.get(`/get-book/${id}`);
        setBook(res.data);
      } catch (ex) {
        console.error("Message : ", ex);
      } finally {
        setLoading(false);
      }
    };
    BookDetail();
  });
  return (
    <>
      <div className="fixed top-0 left-0 z-3 right-0 mb-3">
        <Header />
      </div>
      <main className="min-h-screen pb-16 mt-5">
        {/* main contain */}
        <section className="bg-primary pt-28 pb-16 relative shadow-lg">
          {/* Back Button (Absolute) */}
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <Link to={"/library"}
              onclick="history.back()"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition backdrop-blur-sm"
            >
              <i className="ph-bold ph-arrow-left text-xl" />
            </Link>
          </div>
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
              {/* Left: Book Cover */}
              <div className="flex-shrink-0 w-[200px] md:w-[260px] aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border-4 border-white/10">
                <img
                  id="book-cover"
                  src={book.cover_image}
                  alt="Book Cover"
                  className="w-full h-full object-cover bg-gray-700"
                />
              </div>
              {/* Right: Info */}
              <div className="flex-1 text-center md:text-left text-white">
                {/* Author */}
                <p
                  id="book-author"
                  className="text-gray-300 text-2xl font-medium mb-2 font-primary"
                >
                  និពន្ធដោយលោក​ : {book.author}
                </p>
                {/* Title */}
                <h1
                  id="book-title"
                  className="text-3xl md:text-5xl font-primary font-extrabold mb-4 leading-tight"
                >
                  ចំណងជើងរឿង : {book.title}
                </h1>

                <p className="font-primary text-gray-300 mb-3 line-clamp-1 w-150">
                  {book.description}
                </p>
                <p className="font-primary text-gray-300 mb-3">
                  បោះពុម្ភផ្សាយនៅឆ្នាំ : <span> </span>
                  {book.release_date
                    ? new Date(book.release_date).getFullYear()
                    : "N/A"}
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                  {/* Rating */}
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <i className="ph-fill ph-star text-accent" />
                    <span className="font-bold">{book.star_rating}</span>
                  </div>
                  {/* Read Time (Mock) */}
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <i className="ph-bold ph-clock" />
                    <span className="text-sm font-primary">
                      រយះពេលអាន : {book.Time_spent} ម៉ោង{" "}
                    </span>
                  </div>
                  {/* NEW: Page Count Badge */}
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <i className="ph-bold ph-files" />
                    <span id="page-count" className="text-sm font-primary">
                      ប្រភេទរឿង : {book.category_name}
                    </span>
                  </div>
                </div>
                {/* Categories (Pills) */}

                {/* Actions */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  {/* Download PDF */}
                  <a
                    id="download-btn"
                    download={book.pdf_file}
                    href="#"
                    target="_blank"
                    className="px-6 py-3 font-primary bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition shadow-lg flex items-center gap-2"
                  >
                    <i className="ph-bold ph-download-simple" /> ទាញយកសៀវភៅ
                  </a>
                  {/* Favorite */}
                  <button
                    id="favorite-btn"
                    className="px-4 py-3 border border-white/30 text-white rounded-lg hover:bg-white/10 transition flex items-center gap-2"
                  >
                    <i className="ph-bold ph-heart text-xl" />
                    <span className="font-primary">ទុកអានពេលក្រោយ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ========================== */}
        {/* BOTTOM SECTION (Content)   */}
        {/* ========================== */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Col: Synopsis (Sticky Sidebar) */}
            <aside className="lg:col-span-1">
              <div className="bg-white dark:bg-primary rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 lg:sticky lg:top-32">
                <h3 className="font-primary text-xl font-bold text-primary dark:text-white mb-4 flex items-center gap-2">
                  <i className="ph-fill ph-book-marked text-2xl text-accent"></i>
                  រឿងសង្ខេប
                </h3>
                <div className="w-12 h-1 bg-gradient-to-r from-accent to-transparent rounded-full mb-4"></div>
                <p
                  className={`font-primary text-gray-600 dark:text-gray-300 leading-relaxed text-sm transition-all duration-300 ${isDescriptionExpanded ? "" : "line-clamp-6"}`}
                >
                  {book.description}
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
                        បង្រួម <i className="ph-bold ph-arrow-up"></i>
                      </>
                    ) : (
                      <>
                        អានលម្អិត <i className="ph-bold ph-arrow-right"></i>
                      </>
                    )}
                  </button>
                )}
              </div>
            </aside>

            {/* Right Col: Description & Reader */}
            <div className="lg:col-span-1 space-y-10">
              {/* Synopsis Section */}
            

              {/* PDF Viewer Section */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-slate-700">
                <div className="bg-gradient-to-r from-primary to-primary/90 px-6 py-4 flex justify-between items-center">
                  <h3 className="font-bold text-white flex items-center gap-3 font-primary text-lg">
                    <i className="ph-fill ph-book-open-text text-xl"></i>
                    មើលឯកសារ
                  </h3>
                  {/* Fullscreen Toggle Button */}
                  <button
                    id="fullscreen-btn"
                    className="p-2.5 hover:bg-white/20 rounded-lg transition-all duration-200 text-white/90 hover:text-white"
                    title="Toggle Fullscreen"
                  >
                    <i className="ph-bold ph-corners-out text-xl"></i>
                  </button>
                </div>

                {/* PDF Viewer Container */}
                <div
                  id="pdf-container"
                  className="bg-gray-50 dark:bg-slate-700 p-4 h-[600px] sm:h-[700px] lg:h-[800px] flex flex-col group"
                >
                  {/* IFRAME for PDF */}
                  <iframe
                    id="pdf-viewer"
                    src={book.pdf_file}
                    className="w-full flex-1 rounded-xl bg-white shadow-inner border border-gray-200 dark:border-slate-600"
                    frameBorder="0"
                  />
                  {/* Fallback Message */}
                  <div
                    id="pdf-fallback"
                    className="hidden flex-1 flex flex-col items-center justify-center text-center bg-gray-100 dark:bg-slate-600 rounded-xl"
                  >
                    <i className="ph-duotone ph-file-x text-6xl text-gray-300 dark:text-gray-500 mb-4"></i>
                    <p className="text-gray-600 dark:text-gray-300 font-primary mb-2">
                      មិនអាចមើលឯកសារបានទេ
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 font-primary">
                      សូមព្យាយាមទាញយកឯកសារដើម្បីអានវា
                    </p>
                    <a
                      id="fallback-download"
                      href="#"
                      className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent/90 transition font-primary font-semibold"
                    >
                      ទាញយកឯកសារ
                    </a>
                  </div>
                </div>

                {/* PDF Footer Info */}
                <div className="bg-gray-50 dark:bg-slate-700 px-6 py-4 border-t border-gray-200 dark:border-slate-600 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm font-primary">
                    <i className="ph-fill ph-file-pdf text-lg text-red-500"></i>
                    <span>ឯកសារ PDF</span>
                  </div>
                  <button className="text-accent hover:text-accent/80 transition font-primary text-sm font-semibold flex items-center gap-1">
                    <i className="ph-bold ph-download-simple"></i>
                    ទាញយកឯកសារ
                  </button>
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
