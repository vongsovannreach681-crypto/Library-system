import "./index.css";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./components/RootLayout";
import App from "./App";
import DetailPage from "./pages/DetailPage";
import TrendingCard from "./components/card/TrendingCard";
import LibraryPage from "./pages/LibraryPage";
import Login from "./auth/Login";
import Register from "./auth/Register";
import UserProfile from "./pages/UserProfile";
import FavoritesPage from "./pages/FavoritesPage";
import BlogPostDetail from "./pages/BlogPost/BlogPostDetail";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
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
        path: "/post/:id",
        element: <BlogPostDetail />,
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
      {
        path: "/favorites",
        element: <FavoritesPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />,
);
