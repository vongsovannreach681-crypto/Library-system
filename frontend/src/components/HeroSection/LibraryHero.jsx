import React from "react";
import book1 from '../../assets/Book/Static1.PNG'
import book2 from '../../assets/Book/Static2.jpg'
import book3 from '../../assets/Book/Static3.jpg'
import book4 from '../../assets/Book/Static4.jpg'
const LibraryHero = () => {
  return (
    <>
      <section className="relative bg-primary overflow-hidden pt-20">
        {/* Container */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 items-center py-10 lg:py-35">
            {/* LEFT COLUMN: Text & Search */}
            <div className="text-center lg:text-left space-y-6">
              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-primary text-pure-white leading-[1.3]">
                ទាញយក <span >សៀវភៅអាន</span>
                <br className="hidden lg:block" />
                <span className="">ដោយឥតគិតថ្លៃ</span><span className="text-secondary">.</span>
              </h1>
              {/* Search Bar Container */}
              <div className="mt-8 max-w-lg mx-auto lg:mx-0 relative">
                {/* Input Field */}
                <input
                  type="text"
                  placeholder="ស្វែងរកសៀវភៅដើម្បីអាន"
                  className="w-full font-primary pl-6 pr-32 py-4 rounded-full text-text-black focus:outline-none focus:ring-4 focus:ring-secondary/50 shadow-xl placeholder-gray-400 text-base bg-white"
                />
                {/* Search Button (Inside Input) */}
                <button className="absolute right-2 top-2 bottom-2 bg-secondary hover:bg-blue-400 text-pure-white font-bold py-2 px-6 rounded-full transition-all duration-200 flex items-center gap-2">
                  Search
                </button>
              </div>
              {/* Subtext */}
              <p className="text-md font-primary sm:text-md text-light-gray max-w-2xl mx-auto lg:mx-0 font-light">
                    ចាប់ផ្តើមការអានសៀវភៅនៅលើសមាគមន៍សៀវភៅ ដើម្បីទទួលបានចំណេះដឹងថ្មីៗ។​<br />
                    តោះចូលទៅអានទាំងអស់គ្នា ។
              </p>
              {/* Popular Tags (Optional Visual Polish) */}
              <div className="invisible pt-6 flex flex-wrap gap-3 justify-center lg:justify-start items-center text-sm text-gray-400">
                <span>Popular Now:</span>
                <span className="px-3 py-1 border border-gray-600 rounded-full hover:border-secondary hover:text-secondary cursor-pointer transition">
                  Sci-Fi
                </span>
                <span className="px-3 py-1 border border-gray-600 rounded-full hover:border-secondary hover:text-secondary cursor-pointer transition">
                  Psychology
                </span>
                <span className="px-3 py-1 border border-gray-600 rounded-full hover:border-secondary hover:text-secondary cursor-pointer transition">
                  History
                </span>
              </div>
            </div>
            {/* RIGHT COLUMN: Image/Illustration */}
            <div className="relative lg:flex">
              {/* Book Image Placeholder */}
              {/* Replace 'src' with your actual book illustration image */}
              <img
                src={book1}
                alt="LibreShelf App Preview"
                className="relative lg:top-30 lg:left-10 lg:mx-0 z-10 w-64 sm:w-80 lg:w-[150px] drop-shadow-2xl hover:scale-105 transition duration-500 ease-in-out rounded-lg object-cover mx-auto"
              />
              <img
                src={book3}
                alt="LibreShelf App Preview"
                className="relative lg:bottom-55 lg:left-22 z-10 w-64 sm:w-80 lg:w-[150px] drop-shadow-2xl hover:scale-105 transition duration-500 ease-in-out rounded-lg object-cover hidden lg:block"
              />
              <img
                src={book4}
                alt="LibreShelf App Preview"
                className="relative lg:top-75 z-10 w-64 sm:w-80 lg:w-[150px] drop-shadow-2xl hover:scale-105 transition duration-500 ease-in-out rounded-lg object-cover hidden lg:block"
              />
              <img
                src={book2}
                alt="LibreShelf App Preview"
                className="relative lg:left-14 z-10 w-64 sm:w-80 lg:w-[150px] drop-shadow-2xl hover:scale-105 transition duration-500 ease-in-out rounded-lg object-cover hidden lg:block"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LibraryHero;
