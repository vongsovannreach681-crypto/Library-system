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

      
    </section>
  );
};

export default App;
