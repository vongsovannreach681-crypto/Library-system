import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Test from "./components/Test.jsx";
import ManageBookPage from "./pages/ManageBookPage.jsx";
import ManageCategory from "./pages/ManageCategory.jsx";
import LogToAdmin from "./Form/LogToAdmin.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ManageUser from "./pages/ManageUser.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LogToAdmin />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <App />
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
        <ManageUser/>
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <LogToAdmin />,
  },
  {
    path: "*",
    element: <LogToAdmin />,
  },
]);

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
