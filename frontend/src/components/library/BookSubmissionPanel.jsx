import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

const initialForm = {
  title: "",
  author: "",
  category_id: "",
  Time_spent: "",
  description: "",
  star_rating: "",
  review: "",
  release_date: "",
  cover_image: null,
  pdf_file: null,
};

const FieldShell = ({ label, children, hint }) => (
  <label className="block space-y-2">
    <div className="flex items-center justify-between gap-3">
      <span className="font-primary text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      {hint && (
        <span className="font-primary text-[11px] text-slate-400 dark:text-slate-500">
          {hint}
        </span>
      )}
    </div>
    {children}
  </label>
);

const BookSubmissionPanel = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/get-all-categories");
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (loadError) {
        console.error("Failed to load categories:", loadError);
        setError("We could not load categories right now.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && categories.length === 0) {
      loadCategories();
    }
  }, [categories.length, isOpen]);

  const isAuthenticated = useMemo(
    () => Boolean(localStorage.getItem("auth_token")),
    [],
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const closeModal = () => {
    setIsOpen(false);
    setError("");
    setSuccess("");
  };

  const openModal = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsOpen(true);
  };

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleFileChange = (key, file) => {
    updateField(key, file || null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!form.title.trim() || !form.author.trim() || !form.category_id) {
      setError("Please fill in the title, author, and category.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please add a short description for the book.");
      return;
    }

    if (!form.cover_image || !form.pdf_file) {
      setError("Please upload both a cover image and a PDF file.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const payload = new FormData();
      payload.append("title", form.title.trim());
      payload.append("author", form.author.trim());
      payload.append("category_id", form.category_id);
      payload.append("description", form.description.trim());
      payload.append("Time_spent", form.Time_spent.trim());
      payload.append("star_rating", form.star_rating);
      payload.append("review", form.review.trim());
      payload.append("release_date", form.release_date);
      payload.append("cover_image", form.cover_image);
      payload.append("pdf_file", form.pdf_file);

      await api.post("/add-book", payload);

      setSuccess("Your book was added to the library.");
      setForm(initialForm);
      setIsOpen(false);
    } catch (submitError) {
      console.error("Failed to add book:", submitError);
      const apiMessage =
        submitError.response?.data?.message ||
        submitError.response?.data?.errors?.title?.[0] ||
        submitError.response?.data?.errors?.author?.[0] ||
        "We could not save your book right now.";
      setError(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-12">
      <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-[linear-gradient(135deg,#f7fbff_0%,#ffffff_45%,#eef4ff_100%)] shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[linear-gradient(135deg,#101827_0%,#0d1320_50%,#111827_100%)]">
        <button
                type="button"
                onClick={openModal}
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#18385f,#3f72af)] px-5 py-3 font-primary text-sm font-semibold text-white transition hover:opacity-95"
              >
                <i className="fa-solid fa-plus" />
                ចែករំលែកសៀវភៅ
              </button>
      </div>

      {success && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-primary text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
          {success}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-primary text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto overscroll-contain">
          {/* Backdrop click handler */}
          <div className="fixed inset-0" onClick={closeModal} />

          <div className="relative z-10 my-auto flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-[#0b1020]">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary dark:text-slate-400">
                  Submit a book
                </p>
                <h3 className="mt-1 font-primary text-2xl font-bold text-slate-900 dark:text-white">
                  Share your book with the library
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 cursor-pointer"
                aria-label="Close book form"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-1 flex-col overflow-y-auto overscroll-contain lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:overflow-hidden max-h-[calc(92vh-76px)]"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div className="space-y-4 px-5 py-5 lg:px-6 lg:overflow-y-auto lg:overscroll-contain lg:max-h-[calc(92vh-76px)]" style={{ WebkitOverflowScrolling: "touch" }}>
                <FieldShell label="Book title">
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-primary text-sm text-slate-800 outline-none transition focus:border-secondary/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Enter the book title"
                  />
                </FieldShell>

                <div className="grid gap-4 md:grid-cols-2">
                  <FieldShell label="Author">
                    <input
                      type="text"
                      value={form.author}
                      onChange={(e) => updateField("author", e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-primary text-sm text-slate-800 outline-none transition focus:border-secondary/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      placeholder="Author name"
                    />
                  </FieldShell>

                  <FieldShell label="Category">
                    <select
                      value={form.category_id}
                      onChange={(e) => updateField("category_id", e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-primary text-sm text-slate-800 outline-none transition focus:border-secondary/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                      <option value="">
                        {isLoading ? "Loading categories..." : "Select category"}
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </FieldShell>
                </div>

                <FieldShell label="Description">
                  <textarea
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-primary text-sm text-slate-800 outline-none transition focus:border-secondary/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Write a short description or summary"
                  />
                </FieldShell>

                <FieldShell label="Review" hint="Optional">
                  <textarea
                    value={form.review}
                    onChange={(e) => updateField("review", e.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-primary text-sm text-slate-800 outline-none transition focus:border-secondary/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Add a short review"
                  />
                </FieldShell>
              </div>

              <div
                className="space-y-4 border-t border-slate-200 bg-slate-50/70 px-5 py-5 dark:border-white/10 dark:bg-white/5 lg:border-l lg:border-t-0 lg:px-6 lg:overflow-y-auto lg:overscroll-contain lg:max-h-[calc(92vh-76px)]"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <FieldShell label="Time spent" hint="Optional">
                    <input
                      type="text"
                      value={form.Time_spent}
                      onChange={(e) => updateField("Time_spent", e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-primary text-sm text-slate-800 outline-none transition focus:border-secondary/50 dark:border-white/10 dark:bg-[#0b1020] dark:text-white"
                      placeholder="e.g. 5 days"
                    />
                  </FieldShell>

                  <FieldShell label="Release date" hint="Optional">
                    <input
                      type="date"
                      value={form.release_date}
                      onChange={(e) => updateField("release_date", e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-primary text-sm text-slate-800 outline-none transition focus:border-secondary/50 dark:border-white/10 dark:bg-[#0b1020] dark:text-white"
                    />
                  </FieldShell>
                </div>

                <FieldShell label="Star rating" hint="Optional">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.5"
                    value={form.star_rating}
                    onChange={(e) => updateField("star_rating", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-primary text-sm text-slate-800 outline-none transition focus:border-secondary/50 dark:border-white/10 dark:bg-[#0b1020] dark:text-white"
                    placeholder="1 to 5"
                  />
                </FieldShell>

                <FieldShell label="Cover image">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("cover_image", e.target.files?.[0])}
                    className="block w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 font-primary text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-secondary file:px-4 file:py-2 file:font-semibold file:text-white hover:border-secondary/40 dark:border-white/10 dark:bg-[#0b1020] dark:text-slate-200"
                  />
                </FieldShell>

                <FieldShell label="PDF file">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileChange("pdf_file", e.target.files?.[0])}
                    className="block w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 font-primary text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:font-semibold file:text-white hover:border-secondary/40 dark:border-white/10 dark:bg-[#0b1020] dark:text-slate-200 dark:file:bg-white dark:file:text-slate-900"
                  />
                </FieldShell>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                    The book will be added to the shared library when approved
                    by the upload endpoint.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#18385f,#3f72af)] px-5 py-3 font-primary text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <i className="fa-solid fa-cloud-arrow-up" />
                    {isSubmitting ? "Saving..." : "Publish book"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default BookSubmissionPanel;
