import { useEffect, useState } from "react";
import SideBar from "./components/SideBar";
import Dashboard from "./components/DashboardHeader";
import api from "./api/api";

const App = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const apiOrigin = new URL(api.defaults.baseURL).origin;

  const resolveFileUrl = (fileUrl) => {
    if (!fileUrl) {
      return "";
    }

    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      return fileUrl;
    }

    return `${apiOrigin}${fileUrl}`;
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get("/get-all-books");
        const nextBooks = response.data || [];
        setBooks(nextBooks);
        setSelectedBook((current) => current ?? nextBooks[0] ?? null);
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <section className="min-h-screen bg-background">
      <SideBar />
      <Dashboard />

      <main className="ml-[290px] p-6">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-secondary">
            Frontend Preview
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-primary font-primary">
            Uploaded books, covers, and PDFs
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            This page shows every book returned by the API with its uploaded
            cover image and a direct PDF link, so you can confirm uploads are
            visible in the frontend immediately.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-medium text-primary font-primary">
              Loading books...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-red-50 p-6 text-red-700 shadow-sm">
            {error}
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
              {books.map((book) => (
                <article
                  key={book.id}
                  className={`overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200 transition ${
                    selectedBook?.id === book.id
                      ? "ring-2 ring-secondary shadow-md"
                      : "hover:-translate-y-0.5 hover:shadow-md"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedBook(book)}
                    className="block w-full text-left"
                  >
                    <div className="relative aspect-[4/3] bg-gray-100">
                      {book.cover_image ? (
                        <img
                          src={resolveFileUrl(book.cover_image)}
                          alt={book.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-500">
                          No cover uploaded
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 text-white">
                        <p className="text-xs uppercase tracking-[0.25em]">
                          Click to preview
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 p-5">
                      <div>
                        <h3 className="text-xl font-semibold text-primary font-primary">
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-600">{book.author}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                          {book.category_name || "Uncategorized"}
                        </span>
                        {book.release_date && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                            {book.release_date}
                          </span>
                        )}
                      </div>

                      <p className="line-clamp-3 text-sm text-gray-600">
                        {book.description}
                      </p>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-700">
                          PDF: {book.pdf_file ? "Available" : "Missing"}
                        </span>
                        {book.pdf_file ? (
                          <span className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white">
                            Preview ready
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-500">
                            No PDF
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </article>
              ))}
            </div>

            <aside className="sticky top-6 h-fit rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              {selectedBook ? (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl bg-gray-100">
                    {selectedBook.cover_image ? (
                      <img
                        src={resolveFileUrl(selectedBook.cover_image)}
                        alt={selectedBook.title}
                        className="h-64 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
                        No cover uploaded
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold text-primary font-primary">
                      {selectedBook.title}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedBook.author}</p>
                    <p className="mt-2 text-sm text-gray-600">
                      {selectedBook.description}
                    </p>
                  </div>

                  {selectedBook.pdf_file ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-primary">
                          PDF Preview
                        </p>
                        <a
                          href={resolveFileUrl(selectedBook.pdf_file)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-secondary underline"
                        >
                          Open in new tab
                        </a>
                      </div>

                      <object
                        data={resolveFileUrl(selectedBook.pdf_file)}
                        type="application/pdf"
                        className="h-[70vh] w-full rounded-2xl border border-gray-200"
                      >
                        <div className="flex h-[70vh] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600">
                          Your browser cannot preview this PDF.
                          <a
                            href={resolveFileUrl(selectedBook.pdf_file)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 font-medium text-secondary underline"
                          >
                            Open it here
                          </a>
                        </div>
                      </object>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-gray-50 p-6 text-sm text-gray-600">
                      This book does not have a PDF uploaded yet.
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-full min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
                  Select a book to preview its cover and PDF.
                </div>
              )}
            </aside>
          </div>
        )}
      </main>
    </section>
  );
};

export default App;
