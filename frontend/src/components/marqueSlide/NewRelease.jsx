import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { Link } from "react-router-dom";
import LoadingState from "../card/LoadingState";

const NewRelease = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const getAllBooks = async () => {
      try {
        const response = await api.get("get-all-books?limit=10");
        setBooks(response.data);
      } catch (err) {
        console.error("Message : ", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    getAllBooks();
  }, []);

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 w-full max-w-md">
          <h2 className="font-primary text-2xl font-semibold text-primary dark:text-white sm:text-3xl">
            សៀវភៅដែលពេញនិយម
          </h2>
          <hr className="my-2 w-70 h-1 border-0 bg-primary dark:bg-accent" />
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 font-primary text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            Failed to load new releases.
          </div>
        ) : (
          <div className="overflow-x-auto pb-3">
            <div className="flex min-w-max gap-4">
              {books.map((item) => (
                <Link
                  to={`/bookDetail/${item.id}`}
                  key={item.id}
                  className="group w-40 flex-shrink-0 sm:w-44"
                >
                  <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
                    <div className="aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-slate-800">
                      <img
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        src={item.cover_image}
                        alt={item.title}
                      />
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-1 font-primary text-sm font-semibold text-primary dark:text-white">
                        {item.title}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewRelease;
