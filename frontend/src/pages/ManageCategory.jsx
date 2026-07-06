import React, { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import Dashboard from "../components/DashboardHeader";
import api from "../api/api";

const ManageCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState("");
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await api.get("/get-all-categories");
        setCategories(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const openCreateForm = () => {
    setEditingCategory(null);
    setName("");
    setFormError(null);
    setShowForm(true);
  };

  const openEditForm = (category) => {
    setEditingCategory(category);
    setName(category.name);
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setName("");
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    if (!name.trim()) {
      setFormError("សូមបញ្ចូលឈ្មោះប្រភេទសៀវភៅ។");
      setSubmitting(false);
      return;
    }

    try {
      if (editingCategory) {
        const response = await api.put(
          `/update-category/${editingCategory.id}`,
          {
            name: name.trim(),
          },
        );
        setCategories((prev) =>
          prev.map((category) =>
            category.id === response.data.id ? response.data : category,
          ),
        );
      } else {
        const response = await api.post("/add-category", {
          name: name.trim(),
        });
        setCategories((prev) => [response.data, ...prev]);
      }
      closeForm();
    } catch (err) {
      const serverError = err?.response?.data?.message || err?.message;
      setFormError(serverError || "មានកំហុស។ សូមព្យាយាមម្ដងទៀត។");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoryId) => {
    const confirmed = window.confirm("តើអ្នកធានាថាចង់លុបប្រភេទនេះ? ");
    if (!confirmed) return;

    try {
      await api.delete(`/delete-category/${categoryId}`);
      setCategories((prev) =>
        prev.filter((category) => category.id !== categoryId),
      );
    } catch (err) {
      setError("លុពុំបានជោគជ័យ។ សូមព្យាយាមម្ដងទៀត។");
    }
  };

  if (loading) {
    return (
      <div className="font-primary">
        <SideBar />
        <Dashboard />
        <div className="ml-[290px] m-auto p-5 card flex flex-col items-center justify-center gap-3 bg-background">
          <p className="text-lg font-medium text-primary">
            កំពុងទាញយកប្រភេទ...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-primary">
        <SideBar />
        <Dashboard />
        <div className="ml-[290px] m-auto p-5 card flex flex-col items-center justify-center gap-3 bg-background">
          <p className="text-lg font-medium text-primary">មានកំហុស: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-primary">
      <SideBar />
      <Dashboard />
      <main className="ml-[290px] m-auto p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-primary font-primary">
              គ្រប់គ្រងប្រភេទសៀវភៅ
            </h1>
            <p className="text-sm text-gray-500">
              បន្ថែម កែប្រែ និង លុបប្រភេទសៀវភៅ។
            </p>
          </div>
          <button
            className="rounded-lg bg-accent px-4 py-2 text-white"
            onClick={openCreateForm}
          >
            + បន្ថែមប្រភេទ
          </button>
        </div>

        {showForm && (
          <div className="mb-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ឈ្មោះប្រភេទ
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                  placeholder="បញ្ចូលឈ្មោះ"
                />
                {formError && (
                  <p className="mt-2 text-sm text-red-600">{formError}</p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  បិទ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-secondary disabled:opacity-60"
                >
                  {editingCategory ? "កែប្រែប្រភេទ" : "បន្ថែមប្រភេទ"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-primary text-white">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">ឈ្មោះប្រភេទ</th>
                <th className="py-3 px-4">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr
                  key={category.id}
                  className="border-b border-gray-200 bg-white"
                >
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{category.name}</td>
                  <td className="py-3 px-4">
                    <button
                      className="mr-2 rounded-lg bg-accent px-3 py-1 text-white"
                      onClick={() => openEditForm(category)}
                    >
                      កែប្រែ
                    </button>
                    <button
                      className="rounded-lg bg-red-700 px-3 py-1 text-white"
                      onClick={() => handleDelete(category.id)}
                    >
                      លុប
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ManageCategory;
