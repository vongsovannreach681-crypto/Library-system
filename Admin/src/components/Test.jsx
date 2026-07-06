import React from 'react'
import { useState, useEffect } from 'react'
import api from '../api/api.js'
const Test = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getAllBooks = async () => {
      try {
        const response = await api.get('/get-all-books');
        setBooks(response.data);
        console.log(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    getAllBooks();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      
      <ul>
        {books.map((book) => (
          <li key={book.id}>{book.author}</li>
        ))}
      </ul>
    </div>
  )
}

export default Test