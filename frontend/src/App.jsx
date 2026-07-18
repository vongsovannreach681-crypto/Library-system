import React from "react";
import Header from "./components/Header";
import BlogPost from "./pages/BlogPost/BlogPost";

const App = () => {
  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(63,114,175,0.12),_transparent_42%),linear-gradient(180deg,_#f9f7f7_0%,_#ffffff_100%)]">
        <Header />
        <BlogPost />
      </div>
    </>
  );
};

export default App;
