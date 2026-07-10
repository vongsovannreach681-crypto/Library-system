import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { Link } from "react-router-dom";

const TrendingCard = () => {
  const [book, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const getAllBook = async () => {
      try {
        const res = await api.get("/get-all-books");
        setBooks(res.data);
      } catch (err) {
        console.error("message : ", err);
      } finally {
        setLoading(false);
      }
    };
    getAllBook();
  });
  if (loading) {
    return (
      <>
        <section className="flex justify-center p-10">
          <div className="grid grid-cols-3 gap-5">
            {book.map((item) => (
              <Link
                to={`/bookDetail/${item.id}`}
                key={item.id}
                className="flex flex-column "
              >
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6 items-start  ">
                  {/* Left: Book Cover (Fixed Width) */}
                  <div className="w-full sm:w-[160px] flex-shrink-0">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md">
                      <img
                        src={item.cover_image}
                        alt="Book Title"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  {/* Right: Details */}
                  <div className="flex-1 flex flex-col h-full">
                    <div className="mb-1 flex items-center gap-2"></div>
                    <h3 className="text-xl bg-gray-300 w-[100%] font-primary md:text-2xl font-bold text-primary mb-2 line-clamp-1 ">
                      
                    </h3>
                    <p className="text-sm bg-gray-300 w-[100%] font-medium text-dark-gray font-primary  mb-3">
                      <span></span>
                    </p>
                    {/* Star Rating */}
                    <div className="flex items-center bg-gray-300 w-[100%] gap-1 text-accent mb-4 text-sm">
                      
                      <span className="text-dark-gray ml-1 font-primary">
                    
                        
                      </span>
                    </div>
                    <p className="text-dark-gray bg-gray-300 w-[100%] font-primary  text-sm leading-relaxed line-clamp-3 mb-6">
                      <span></span>
                    </p>
                    {/* Bottom Action */}
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                      <button className="text-dark-gray hover:text-red-500 transition">
                        <i className="ph-bold ph-heart text-xl" />
                      </button>
                      <a
                        href="#"
                        className="px-5 font-primary bg-gray-300 w-[100%] py-2 bg-primary text-pure-white text-sm font-bold rounded-lg hover:bg-secondary transition shadow-md flex items-center gap-2"
                      >
                        <span></span>
                         
                      </a>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </>
    );
  }
  return (
    <>
      <div className="w-80 mt-10">
        <h1 className="font-primary text-3xl mx-5  text-primary font-semibold">
          ប្រភេទសៀវភៅទាំងអស់
        </h1>
        <hr className="mx-4 my-2 h-1 bg-primary" />
      </div>
      <section className="flex justify-center p-10">
        <div className="grid grid-cols-3 gap-5">
          {book.map((item) => (
            <Link
              to={`/bookDetail/${item.id}`}
              key={item.id}
              className="flex flex-column "
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6 items-start  ">
                {/* Left: Book Cover (Fixed Width) */}
                <div className="w-full sm:w-[160px] flex-shrink-0">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md">
                    <img
                      src={item.cover_image}
                      alt="Book Title"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
                {/* Right: Details */}
                <div className="flex-1 flex flex-col h-full">
                  <div className="mb-1 flex items-center gap-2"></div>
                  <h3 className="text-xl font-primary md:text-2xl font-bold text-primary mb-2 line-clamp-1 ">
                    រឿង​ : {item.title}
                  </h3>
                  <p className="text-sm font-medium text-dark-gray font-primary  mb-3">
                    និពន្ធដោយ​ : {item.author}
                  </p>
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 text-accent mb-4 text-sm">
                    <i className="ph-fill ph-star" />
                    <i className="ph-fill ph-star" />
                    <i className="ph-fill ph-star" />
                    <i className="ph-fill ph-star" />
                    <i className="ph-fill ph-star" />
                    <span className="text-dark-gray ml-1 font-primary">
                      {" "}
                      ({item.star_rating})
                    </span>
                  </div>
                  <p className="text-dark-gray font-primary  text-sm leading-relaxed line-clamp-3 mb-6">
                    {item.description}
                  </p>
                  {/* Bottom Action */}
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <button className="text-dark-gray hover:text-red-500 transition">
                      <i className="ph-bold ph-heart text-xl" />
                    </button>
                    <a
                      href="#"
                      className="px-5 font-primary py-2 bg-primary text-pure-white text-sm font-bold rounded-lg hover:bg-secondary transition shadow-md flex items-center gap-2"
                    >
                      អានឥលូវនេះ <i className="ph-bold ph-book-open" />
                    </a>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default TrendingCard;
