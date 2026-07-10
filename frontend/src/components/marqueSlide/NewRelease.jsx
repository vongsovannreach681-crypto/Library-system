import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { useRef } from "react";
import { Link } from "react-router-dom";
import LoadingState from "../card/LoadingState";
const NewRelease = () => {
  const [book, setBook] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const marqueeRef = useRef(null);
  useEffect(() => {
    const getAllBooks = async () => {
      try {
        const response = await api.get("get-all-books");
        setBook(response.data);
      } catch (err) {
        console.error("Message : ", err);
      } finally {
        setLoading(false);
      }
    };
    getAllBooks();
  }, []);
  if (loading) {
    return (
      <>
        <div className="w-80 mt-10">
          <h1 className="font-primary text-3xl mx-5  text-primary font-semibold">
            សៀវភៅដែលពេញនិយម
          </h1>
          <hr className="mx-4 my-2 h-1 bg-primary" />
        </div>
        <LoadingState />
      </>
    );
  }
  return (
    <>
      <div className="w-80 mt-10">
        <h1 className="font-primary text-3xl mx-5  text-primary font-semibold">
          សៀវភៅដែលពេញនិយម
        </h1>
        <hr className="mx-4 my-2 h-1 bg-primary" />
      </div>
      <marquee
        behavior="scroll"
        direction="left"
        ref={marqueeRef}
        behavior="scroll"
        scrollAmount="20"
        direction="left"
        onMouseOver={() => marqueeRef.current?.stop()}
        onMouseOut={() => marqueeRef.current?.start()}
      >
        <div className="flex gap-5 mt-3">
          {book.map((item) => (
            <Link
              to={`/bookDetail/${item.id}`}
              key={item.id}
              className="flex flex-col gap-5 items-center"
            >
              <img
                className="w-35 h-45 rounded ml-5"
                src={item.cover_image}
                alt={item.title}
              />
              <p className=" font-primary text-primary font-medium text-center">
                {item.title}
              </p>
            </Link>
          ))}
        </div>
      </marquee>
      <br />
      <br />
      <br />
    </>
  );
};

export default NewRelease;
