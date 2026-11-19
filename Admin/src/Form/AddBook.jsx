import React, { useEffect, useState } from "react";
import api from "../api/api.js";

const AddBook = ({
  isOpen,
  onClose,
  onBookAdded,
  onBookUpdated,
  initialData,
}) => {
  const [formValues, setFormValues] = useState({
    title: "",
    author: "",
    release_date: "",
    category_id: "",
    description: "",
    Time_spent: "",
    cover_image: null,
    pdf_file: null,
    review: "",
    star_rating: "",
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = Boolean(initialData?.id);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") {
        resetForm();
        onClose?.();
      }
    };
    document.addEventListener("keydown", handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/get-all-categories");
        setCategories(response.data || []);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormValues({
        title: initialData.title || "",
        author: initialData.author || "",
        release_date: initialData.release_date || "",
        category_id: initialData.category_id || categories?.[0]?.id || "",
        description: initialData.description || "",
        Time_spent: initialData.Time_spent || "",
        cover_image: null,
        pdf_file: null,
        review: initialData.review || "",
        star_rating: initialData.star_rating || "",
      });
      setErrors({});
    } else if (categories.length && !formValues.category_id) {
      setFormValues((prev) => ({
        ...prev,
        category_id: categories[0].id,
      }));
    }
  }, [initialData, categories]);

  const resetForm = () => {
    setFormValues({
      title: "",
      author: "",
      release_date: "",
      category_id: categories?.[0]?.id || "",
      description: "",
      Time_spent: "",
      cover_image: null,
      pdf_file: null,
      review: "",
      star_rating: "",
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: files[0] || null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const formData = new FormData();
    formData.append("title", formValues.title);
    formData.append("author", formValues.author);
    formData.append("release_date", formValues.release_date);
    formData.append("category_id", formValues.category_id);
    formData.append("description", formValues.description);
    formData.append("Time_spent", formValues.Time_spent);
    if (formValues.cover_image) {
      formData.append("cover_image", formValues.cover_image);
    }
    if (formValues.pdf_file) {
      formData.append("pdf_file", formValues.pdf_file);
    }
    formData.append("review", formValues.review);
    if (formValues.star_rating) {
      formData.append("star_rating", formValues.star_rating);
    }

    try {
      if (isEditMode) {
        formData.append("_method", "PUT");
      }

      const response = isEditMode
        ? await api.post(`/update-book/${initialData.id}`, formData)
        : await api.post("/add-book", formData);
      if (isEditMode) {
        onBookUpdated?.(response.data);
      } else {
        onBookAdded?.(response.data);
      }
      resetForm();
      onClose?.();
    } catch (error) {
      const responseErrors = error?.response?.data?.errors || {};
      setErrors(responseErrors);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-xs overflow-y-auto overscroll-contain">
      <div className="fixed inset-0" onClick={() => { resetForm(); onClose?.(); }} />
      <div className="relative z-10 my-auto flex w-full max-w-3xl max-h-[90vh] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-6 pb-4">
          <div>
            <h2 className="text-2xl font-semibold text-primary font-primary">
              {isEditMode ? "កែប្រែសៀវភៅ" : "បន្ថែមសៀវភៅថ្មី"}
            </h2>
            <p className="mt-1 text-sm text-gray-500 font-primary">
              {isEditMode
                ? "កែប្រែព័ត៌មានសៀវភៅ ហើយអនុញ្ញាតឲ្យផ្ទុកឯកសារថ្មី"
                : "សូមបំពេញព័ត៌មានសៀវភៅ និងផ្ទុករូបភាព និង PDF"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose?.();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer font-bold transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5 overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-primary font-primary text-gray-700">
                ចំណងជើង <span className="text-red-500">*</span>
              </span>
              <input
                name="title"
                value={formValues.title}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title[0]}</p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-primary font-primary text-gray-700">
                ឈ្មោះអ្នកនិពន្ធ <span className="text-red-500">*</span>
              </span>
              <input
                name="author"
                value={formValues.author}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                required
              />
              {errors.author && (
                <p className="mt-1 text-sm text-red-600">{errors.author[0]}</p>
              )}
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 font-primary">
                ប្រភេទ <span className="text-red-500">*</span>
              </span>
              <select
                name="category_id"
                value={formValues.category_id}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 focus:border-primary focus:outline-none"
                required
              >
                <option value="" disabled>
                  ជ្រើសប្រភេទ
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.category_id[0]}
                </p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 font-primary">
                ថ្ងៃចេញផ្សាយ
              </span>
              <input
                name="release_date"
                type="date"
                value={formValues.release_date}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 font-primary">
                រយៈពេលអាន
              </span>
              <input
                name="Time_spent"
                type="number"
                min="0"
                value={formValues.Time_spent}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 font-primary">
                គម្រប​សៀវភៅ {isEditMode ? "(optional)" : "*"}
              </span>
              <input
                type="file"
                name="cover_image"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm text-gray-700 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white"
                {...(!isEditMode && { required: true })}
              />
              {errors.cover_image && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.cover_image[0]}
                </p>
              )}
            </label>

            <label className="block">
              <span className="text-sm text-gray-700 font-primary">
                ឯកសារ PDF {isEditMode ? "(optional)" : "*"}
              </span>
              <input
                type="file"
                name="pdf_file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm text-gray-700 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white"
                {...(!isEditMode && { required: true })}
              />
              {errors.pdf_file && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.pdf_file[0]}
                </p>
              )}
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 font-primary">
              ពិពណ៌នា
            </span>
            <textarea
              name="description"
              value={formValues.description}
              onChange={handleInputChange}
              rows="4"
              className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none"
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description[0]}
              </p>
            )}
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 font-primary">
                Review
              </span>
              <input
                type="text"
                name="review"
                value={formValues.review}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 font-primary">
                Rating (1-5)
              </span>
              <input
                name="star_rating"
                type="number"
                min="1"
                max="5"
                value={formValues.star_rating}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              />
            </label>
          </div>

          {errors.general && (
            <p className="text-sm text-red-600">{errors.general}</p>
          )}
          </div>

          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/80 p-5 px-6">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose?.();
              }}
              className="rounded-2xl border border-gray-300 bg-white px-5 py-2.5 font-primary text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-primary px-6 py-2.5 font-primary text-sm font-medium text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
            >
              {submitting ? "កំពុងរក្សាទុក..." : isEditMode ? "កែប្រែសៀវភៅ" : "បន្ថែមសៀវភៅ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
