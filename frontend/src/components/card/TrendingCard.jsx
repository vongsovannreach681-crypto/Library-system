import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { Link, useNavigate } from "react-router-dom";

const TrendingCard = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const getAllBook = async () => {
      try {
        const res = await api.get("/get-all-books?limit=6");
        setBooks(res.data);
      } catch (err) {
        console.error("message : ", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    getAllBook();
  }, []);

  const handleFavoriteClick = async (event, item) => {
    event.preventDefault();
    event.stopPropagation();

    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await api.post(`/favorites/${item.id}`);
      window.dispatchEvent(new Event("favorites-updated"));
    } catch (err) {
      console.error("Failed to save favorite:", err);
    }
  };

  const cardGridClass =
    "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3";

  const CardSkeleton = () => (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="w-full overflow-hidden rounded-xl bg-gray-200 dark:bg-slate-700 sm:w-36">
          <div className="aspect-[2/3] animate-pulse bg-gray-200 dark:bg-slate-700" />
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div className="h-6 w-4/5 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
          <div className="mt-auto flex items-center justify-between pt-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-slate-700" />
            <div className="h-10 w-32 animate-pulse rounded-full bg-gray-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );

  const Card = ({ item }) => (
    <Link to={`/bookDetail/${item.id}`} className="block">
      <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="w-full overflow-hidden rounded-xl sm:w-36">
            <div className="aspect-[2/3] overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-800">
              <img
                src={item.cover_image}
                alt={item.title}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            <h3 className="line-clamp-1 font-primary text-xl font-bold text-primary dark:text-white sm:text-2xl">
              {item.title}
            </h3>
            <p className="mt-1 font-primary text-sm font-medium text-dark-gray dark:text-slate-300">
              {item.author}
            </p>

            <div className="mt-3 flex items-center gap-1 text-sm text-accent">
              <i className="ph-fill ph-star" />
              <i className="ph-fill ph-star" />
              <i className="ph-fill ph-star" />
              <i className="ph-fill ph-star" />
              <i className="ph-fill ph-star" />
              <span className="ml-1 font-primary text-dark-gray dark:text-slate-300">
                ({item.star_rating})
              </span>
            </div>

            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-dark-gray font-primary dark:text-slate-400">
              {item.description}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4 dark:border-slate-700">
              <button
                type="button"
                onClick={(event) => handleFavoriteClick(event, item)}
                className="text-dark-gray transition hover:text-red-500 dark:text-slate-300"
              >
                <i className="ph-bold ph-heart text-xl" />
              </button>
              <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-primary text-sm font-bold text-white transition hover:bg-secondary">
                អានឥលូវនេះ <i className="ph-bold ph-book-open" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 w-full max-w-md">
          <h2 className="font-primary text-2xl font-semibold text-primary dark:text-white sm:text-3xl">
            សៀវភៅដែលមានក្នុងបណ្ណាល័យ
          </h2>
          <hr className="my-2 h-1 w-100 border-0 bg-primary dark:bg-accent" />
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 font-primary text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            Failed to load books.
          </div>
        ) : (
          <div className={cardGridClass}>
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <CardSkeleton key={index} />
                ))
              : books.map((item) => <Card key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingCard;
