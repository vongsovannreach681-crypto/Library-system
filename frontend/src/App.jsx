import React from "react";
import Header from "./components/Header";
import BlogPost from "./pages/BlogPost/BlogPost";

const App = () => {
  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(63,114,175,0.12),_transparent_42%),linear-gradient(180deg,_#f9f7f7_0%,_#ffffff_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(17,45,78,0.3),_transparent_50%),linear-gradient(180deg,_#05070d_0%,_#0c1220_100%)] text-text-black dark:text-pure-white transition-colors duration-300">
        {/* Fixed Header Layout */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <Header />
        </div>
        
        {/* Main Content: Replaced mt-10 and negative z-index with pt-24 to safely clear the fixed header */}
        <div className="pt-24 pb-10">
          <BlogPost />
        </div>
      </div>
    </>
  );
};

export default App;