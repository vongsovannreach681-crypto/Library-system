import React from "react";
import { Link } from "react-router-dom";

const LibreWork = () => {
  return (
    <div>
      <section className="relative bg-primary py-20 overflow-hidden">
        {/* 1. DECORATIVE CURVE BACKGROUND */}
        {/* This SVG sits behind the content to give depth */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          {/* A large, flowing curve in secondary color with low opacity */}
          <svg
            viewBox="0 0 1440 800"
            className="absolute w-[150%] h-auto -top-20 -left-40 opacity-20 text-secondary fill-current"
          >
            <path d="M0,256L60,245.3C120,235,240,213,360,224C480,235,600,277,720,298.7C840,320,960,320,1080,288C1200,256,1320,192,1380,160L1440,128L1440,800L1380,800C1320,800,1200,800,1080,800C960,800,840,800,720,800C600,800,480,800,360,800C240,800,120,800,60,800L0,800Z" />
          </svg>
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          {/* HEADER */}
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-primary font-extrabold text-pure-white">
              ហេតុអ្វីបានជាយើងបង្កើតបណ្ណាល័យនេះឡើង?
            </h2>
            <p className="text-gray-300 mt-4 text-lg max-w-2xl mx-auto font-primary">
              បណ្ណាល័យនេះត្រូវបានបង្កើតឡើងដោយនិស្សិត វង សុវណ្ណរាជ ដោយយកលំនាំតាម LibreShelf Website 
            </p>
          </div>
          {/* 2. GLASS CARDS GRID (1x3 Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
            {/* CARD 1: DISCOVER */}
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 pt-12 text-center shadow-xl hover:bg-white/15 transition-all duration-300 group">
              {/* Floating Icon (Centered Top) */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-secondary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <i className="ph-bold ph-magnifying-glass text-pure-white text-3xl" />
              </div>
              <h3 className="text-xl font-primary font-bold text-pure-white mb-4 mt-4">
                ងាយស្រួលរកសៀវភៅអាន
              </h3>
              <p className="text-gray-200 text-sm leading-relaxed font-primary">
                សិស្សានុស្សិសទាំងអស់អាចចូលមកអានសៀវភៅដោយសេរីដោយមិនគិតប្រាក់ ព្រមទាំងអាចទាញយកសៀវភៅទៅអានបានផងដែរ
              </p>
            </div>
            {/* CARD 2: READ (Highlighted) */}
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 pt-12 text-center shadow-xl hover:bg-white/15 transition-all duration-300 group mt-8 md:mt-0">
              {/* Floating Icon */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-secondary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <i className="ph-bold ph-book-open-text text-pure-white text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-pure-white mb-4 font-primary mt-4">
                អានបានគ្រប់ទីកន្លែង
              </h3>
              <p className="text-gray-200 text-sm leading-relaxed font-primary">
                ជាមួយបណ្ណាល័យនេះអ្នកអាចធ្វើការអានបានដោយគ្រប់ពេលវេលា​ដោយមិនចាំបាច់ចំណាយពេលទៅដល់បណ្ណាល័យផ្ទាល់
              </p>
            </div>
            {/* CARD 3: CONTRIBUTE */}
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 pt-12 text-center shadow-xl hover:bg-white/15 transition-all duration-300 group mt-8 md:mt-0">
              {/* Floating Icon */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-secondary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <i className="ph-bold ph-users-three text-pure-white text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-pure-white mb-4 mt-4 font-primary">
                ចែករំលែក
              </h3>
              <p className="text-gray-200 text-sm leading-relaxed font-primary">
                ចាប់ផ្តើមចែករំលែកមេរៀន នឹង សៀវភៅដល់សិស្សានុសិស្សដទៃដើម្បីឲ្យបណ្ណាល័យកាន់តែមានសៀវភៅច្រើន
              </p>
            </div>
          </div>
          {/* 3. CTA SECTION (Start Reading) */}
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-primary font-bold text-pure-white mb-8">
              ចាប់ផ្តើមអានជាមួយយើង
            </h2>
            {/* Glass Input Group */}
            <div className="relative max-w-xl mx-auto bg-white/10 backdrop-blur-sm p-2 rounded-2xl md:rounded-full border border-white/20 shadow-2xl flex flex-col sm:flex-row gap-2">
              {/* Email Input */}
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-transparent text-pure-white placeholder-gray-300 px-6 py-3 rounded-full focus:outline-none focus:bg-white/10 transition"
              />
              {/* Sign Up Button */}
              <Link
                to={"/login"}
                href=""
                className="flex-shrink-0​ font-primary bg-secondary text-pure-white font-bold py-3 px-8 rounded-full hover:bg-blue-400 transition shadow-lg flex items-center w-50 justify-center gap-2 cursor-pointer"
              >
                ចុះឈ្មោះចូល
              </Link>
            </div>
            <p className="text-gray-300 mt-6 text-sm font-primary">
              ចាប់ផ្តើមជាមួយយើងឥលូវនេះ
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LibreWork;
