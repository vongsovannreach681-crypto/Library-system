import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./index.css";
import ManageBookPage from "./pages/ManageBookPage.jsx";
import ManageCategory from "./pages/ManageCategory.jsx";
import LogToAdmin from "./Form/LogToAdmin.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ManageUser from "./pages/ManageUser.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LogToAdmin />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AdminPanel />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <AdminPanel />
      </ProtectedRoute>
    ),
  },
  {
    path: "/adminPanel",
    element: (
      <ProtectedRoute>
        <AdminPanel />
      </ProtectedRoute>
    ),
  },
  {
    path: "/manageBook",
    element: (
      <ProtectedRoute>
        <ManageBookPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/categories",
    element: (
      <ProtectedRoute>
        <ManageCategory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/user",
    element: (
      <ProtectedRoute>
        <ManageUser />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
