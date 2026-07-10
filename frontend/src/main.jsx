import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DetailPage from "./pages/DetailPage";
import TrendingCard from "./components/card/TrendingCard";
import LibraryPage from "./pages/LibraryPage";
import Login from "./auth/Login";
import Register from "./auth/Register";
import UserProfile from "./pages/UserProfile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/library",
    element: <LibraryPage />,
  },
  {
    path: "/bookDetail/:id",
    element: <DetailPage />,
  },
  {
    path: "/card",
    element: <TrendingCard />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/profile",
    element: <UserProfile />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />,
);
