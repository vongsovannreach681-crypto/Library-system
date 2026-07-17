import React from "react";
import Header from "../components/Header";
import LibraryHero from "../components/HeroSection/LibraryHero";
import NewRelease from "../components/marqueSlide/NewRelease";
import TrendingCard from "../components/card/TrendingCard";
import Footer from "../components/Nav/Footer";
import CustomerReview from "./CustomerReview";

const LibraryPage = () => {
  return (
    <div className="overflow-x-hidden bg-white dark:bg-slate-950">
      <div className="fixed top-0 left-0 right-0 z-30">
        <Header />
      </div>
      <LibraryHero className="" />
      <NewRelease />
      <CustomerReview />
      <TrendingCard />
      <Footer />
    </div>
  );
};

export default LibraryPage;
