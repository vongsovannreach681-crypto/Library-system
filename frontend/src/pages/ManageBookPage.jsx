import React, { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import Dashboard from "../components/DashboardHeader";
import api from "../api/api";
import AddBook from "../Form/AddBook";
const ManageBookPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddBook, setShowAddBook] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
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
      setLoading(true);
      try {
        const response = await api.get("/get-all-books");
        setBooks(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleBookAdded = (book) => {
    setBooks((prevBooks) => [book, ...prevBooks]);
    setShowAddBook(false);
    setEditingBook(null);
  };

  const handleBookUpdated = (updatedBook) => {
    setBooks((prevBooks) =>
      prevBooks.map((book) =>
        book.id === updatedBook.id ? updatedBook : book,
      ),
    );
    setShowAddBook(false);
    setEditingBook(null);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setShowAddBook(true);
  };

  const handleDeleteBook = async (bookId) => {
    const confirmed = window.confirm("តើអ្នកពុំប្រាកដទេ? លុបសៀវភៅនេះ?");
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/delete-book/${bookId}`);
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));
    } catch (err) {
      console.error("Failed to delete book:", err);
      setError("លុពុំបានជោគជ័យ។ សូមព្យាយាមម្ដងទៀត។");
    }
  };

  if (loading) {
    return (
      <>
        <SideBar />
        <Dashboard />
        <div className="ml-[290px] m-auto p-5 card flex flex-col items-center justify-center gap-3 bg-background">
          <p className="text-lg font-medium  text-primary font-primary">
            កំពុងទាញយកសៀវភៅ...
          </p>
          <p className="text-lg font-medium text-primary font-primary">
            សូមធ្វើការរង់ចាំ
          </p>
          <img
            className="w-[150px]"
            src="https://i.sstatic.net/kOnzy.gif"
            alt="Loading"
          />
        </div>
      </>
    );
  }
  if (error) {
    return (
      <>
        <SideBar />
        <Dashboard />
        <div className="ml-[290px] m-auto p-5 card flex flex-col items-center justify-center gap-3 bg-background">
          <p className="text-lg font-medium  text-primary font-primary">
            មានកំហុសកើតឡើង: {error}
          </p>
        </div>
      </>
    );
  }
  return (
    <>
      <SideBar />
      <Dashboard />
      <main className="ml-[290px] p-6">
        
        <button
              className="inline-flex font-primary my-5 cursor-pointer items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary"
              onClick={() => {
                setEditingBook(null);
                setShowAddBook(true);
              }}
            >
              + បន្ថែមសៀវភៅថ្មី
            </button>
        <AddBook
          isOpen={showAddBook}
          onClose={() => {
            setShowAddBook(false);
            setEditingBook(null);
          }}
          onBookAdded={handleBookAdded}
          onBookUpdated={handleBookUpdated}
          initialData={editingBook}
        />

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-primary text-white align-center">
                <tr className="font-primary text-sm uppercase tracking-wide">
                  <th className="px-4 py-4 font-medium">លេខ</th>
                  <th className="px-4 py-4 font-medium">ចំណងជើង</th>
                  <th className="px-4 py-4 font-medium">អ្នកនិពន្ធ</th>
                  <th className="px-4 py-4 font-medium">ថ្ងៃចេញផ្សាយ</th>
                  <th className="px-4 py-4 font-medium">ប្រភេទ</th>
                  <th className="px-4 py-4 font-medium">អត្ថបទ</th>
                  <th className="px-4 py-4 font-medium">រយៈពេល</th>
                  <th className="px-4 py-4 font-medium">គម្រប</th>
                  <th className="px-4 py-4 font-medium">PDF</th>
                  <th className="px-4 py-4 font-medium">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="font-primary text-sm text-gray-700">
                {books.map((book, index) => (
                  <tr
                    key={book.id}
                    className={`border-b border-gray-100 transition hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 py-4 align-top font-medium text-primary">
                      {book.id}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="max-w-[220px]">
                        <p className="truncate font-semibold text-primary">
                          {book.title}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">{book.author}</td>
                    <td className="px-4 py-4 align-top">
                      {book.release_date || "-"}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-secondary">
                        {book.category_name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="max-w-[280px] line-clamp-2 text-gray-600">
                        {book.description}
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {book.Time_spent} ម៉ោង
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      {book.cover_image ? (
                        <img
                          src={resolveFileUrl(book.cover_image)}
                          alt={`${book.title} cover`}
                          className="h-16 w-12 rounded-xl object-cover ring-1 ring-gray-200"
                        />
                      ) : (
                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                          No cover
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top">
                      {book.pdf_file ? (
                        <a
                          href={resolveFileUrl(book.pdf_file)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                        >
                          Open PDF
                        </a>
                      ) : (
                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                          No PDF
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-secondary"
                          onClick={() => handleEditBook(book)}
                        >
                          កែប្រែ
                        </button>
                        <button
                          className="inline-flex items-center rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
                          onClick={() => handleDeleteBook(book.id)}
                        >
                          លុប
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
};

export default ManageBookPage;
