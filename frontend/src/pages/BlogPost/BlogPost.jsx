import React from "react";
import Blogpage from "./Blogpage";
import BlogHero from "../../components/HeroSection/BlogHero";
import Footer from "../../components/Nav/Footer";

const BlogPost = () => {
  return (
    <div>
      <Blogpage />
      <Footer/>
      {/* <BlogHero/> */}
    </div>
  );
};

export default BlogPost;
