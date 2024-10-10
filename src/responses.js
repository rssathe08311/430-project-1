// responses.js contains HTTP request handlers for a book API, handling book and review
// retrieval, addition, and filtering, along with JSON data management and error handling

// Import 'fs' module and utility functions
const fs = require('fs');
const utils = require('../data/utils.js');

// Load client-side files (HTML and CSS)
const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const style = fs.readFileSync(`${__dirname}/../client/style.css`);
const docs = fs.readFileSync(`${__dirname}/../client/docs.html`);

// Initialize an empty books array
let books = [];

// getIndex
// Serves the index HTML page.
// Parameters:
//   - request: The HTTP request object.
//   - response: The HTTP response object.
// Returns: None
const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });

  if (request.method !== 'HEAD') {
    response.write(index);
  }

  response.end();
};

// getDocs
// Serves the documentation HTML page.
// Parameters:
//   - request: The HTTP request object.
//   - response: The HTTP response object.
// Returns: None
const getDocs = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });

  if (request.method !== 'HEAD') {
    response.write(docs);
  }

  response.end();
};

// setBooks
// Updates the books array with a new array of books.
// Parameters:
//   - newBooksArray: The new array of books to replace the current one.
// Returns: None
const setBooks = (newBooksArray) => {
  books = newBooksArray;
};

// getCSS
// Serves the CSS file.
// Parameters:
//   - request: The HTTP request object.
//   - response: The HTTP response object.
// Returns: None
const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  if (request.method !== 'HEAD') {
    response.write(style);
  }
  response.end();
};

// respondJSON
// Sends a JSON response to the client with the given status and object.
// Parameters:
//   - request: The HTTP request object.
//   - response: The HTTP response object.
//   - status: The HTTP status code (e.g., 200, 404).
//   - object: The object to be sent as a JSON response.
// Returns: None
const respondJSON = (request, response, status, object) => {
  const content = JSON.stringify(object);
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });

  if (request.method !== 'HEAD' && status !== 204) {
    response.write(content);
  }
  response.end();
};

// notFound
// Sends a 404 Not Found JSON response to the client.
// Parameters:
//   - request: The HTTP request object.
//   - response: The HTTP response object.
// Returns: None
const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found',
    id: 'notFound',
  };
  return respondJSON(request, response, 404, responseJSON);
};

// GET/HEAD Requests

// getBooks
// Retrieves a list of books, optionally limited by a query parameter.
// Parameters:
//   - request: The HTTP request object, which may contain a 'limit' query parameter.
//   - response: The HTTP response object.
// Returns: Sends a JSON response with the list of books or a limited number of books.
const getBooks = (request, response) => {
  books = utils.getBooksJson();
  const limit = request.query.limit || books.length;
  const responseJSON = { books: books.slice(0, limit) };

  if (request.method === 'HEAD') {
    return respondJSON(request, response, 200, {});
  }

  return respondJSON(request, response, 200, responseJSON);
};

// getAuthor
// Retrieves books by a specific author, specified by a query parameter.
// Parameters:
//   - request: The HTTP request object, containing the 'author' query parameter.
//   - response: The HTTP response object.
// Returns: Sends a JSON response with the books of the specified author or a 404 error if not found
const getAuthor = (request, response) => {
  books = utils.getBooksJson();
  const author = request.query.author.toLowerCase();

  if (!author) {
    const responseJSON = {
      message: 'Author query is empty. Please provide a valid author name.',
      id: 'missingAuthor',
    };
    return respondJSON(request, response, 400, responseJSON);
  }

  const filteredBooks = books.filter((book) => book.author.toLowerCase() === author);

  if (filteredBooks.length === 0) {
    const responseJSON = {
      message: 'No books found for the author',
      id: 'getAuthor',
    };
    if (request.method === 'HEAD') {
      return respondJSON(request, response, 404, {});
    }

    return respondJSON(request, response, 404, responseJSON);
  }

  if (request.method === 'HEAD') {
    return respondJSON(request, response, 200, {});
  }

  return respondJSON(request, response, 200, { books: filteredBooks });
};

// getTitle
// Retrieves books by a specific title, specified by a query parameter.
// Parameters:
//   - request: The HTTP request object, containing the 'title' query parameter.
//   - response: The HTTP response object.
// Returns: Sends a JSON response with the books matching the title or a 404 error if not found.
const getTitle = (request, response) => {
  books = utils.getBooksJson();
  const title = request.query.title.toLowerCase();
  const filteredBooks = books.filter((book) => book.title.toLowerCase() === title);

  if (filteredBooks.length === 0) {
    const responseJSON = {
      message: 'No books found for the title',
      id: 'getTitle',
    };
    if (request.method === 'HEAD') {
      return respondJSON(request, response, 404, {});
    }

    return respondJSON(request, response, 404, responseJSON);
  }

  if (request.method === 'HEAD') {
    return respondJSON(request, response, 200, {});
  }

  return respondJSON(request, response, 200, { books: filteredBooks });
};

// getGenres
// Retrieves books by a specific genre, specified by a query parameter.
// Parameters:
//   - request: The HTTP request object, containing the 'genre' query parameter.
//   - response: The HTTP response object.
// Returns: Sends a JSON response with the books of the specified genre or a 404 error if not found.
const getGenres = (request, response) => {
  books = utils.getBooksJson();
  const genre = request.query.genre ? request.query.genre.toLowerCase() : null;

  if (!genre) {
    const responseJSON = {
      message: 'Genre query is empty. Please provide a valid genre.',
      id: 'missingGenre',
    };
    return respondJSON(request, response, 400, responseJSON);
  }

  const filtBook = books.filter((b) => b.genres && b.genres.some((g) => g.toLowerCase() === genre));

  if (filtBook.length === 0) {
    const responseJSON = {
      message: 'No books found for the specified genre.',
      id: 'getGenres',
    };
    if (request.method === 'HEAD') {
      return respondJSON(request, response, 404, {});
    }

    return respondJSON(request, response, 404, responseJSON);
  }

  if (request.method === 'HEAD') {
    return respondJSON(request, response, 200, {});
  }

  return respondJSON(request, response, 200, { books: filtBook });
};

// getReviews
// Retrieves reviews for a specific book title, specified by a query parameter.
// Parameters:
//   - request: The HTTP request object, containing the 'title' query parameter.
//   - response: The HTTP response object.
// Returns: Sends a JSON response with the reviews for the specified title,
//          or all reviews if no title is provided.
const getReviews = (request, response) => {
  const reviews = utils.getReviewsJson();
  const title = request.query.title.toLowerCase();

  if (!title) {
    return respondJSON(request, response, 200, reviews);
  }

  const filteredReviews = reviews.filter((review) => review.title.toLowerCase() === title);

  if (filteredReviews.length === 0) {
    const responseJSON = {
      message: 'No review found for title',
      id: 'getReviews',
    };
    if (request.method === 'HEAD') {
      return respondJSON(request, response, 404, {});
    }

    return respondJSON(request, response, 404, responseJSON);
  }

  if (request.method === 'HEAD') {
    return respondJSON(request, response, 200, {});
  }

  return respondJSON(request, response, 200, { reviews: filteredReviews });
};

// POST Requests

// addBook
// Adds a new book to the books.json file, ensuring it doesn't already exist.
// Parameters:
//   - request: The HTTP request object, containing the new book data in the body.
//   - response: The HTTP response object.
// Returns: Sends a 201 status if the book is successfully added,
// or relevant error status and messages if the book already exists or there are missing fields.
const addBook = (request, response) => {
  const newBook = request.body;
  const booksFilePath = `${__dirname}/../data/books.json`;
  books = utils.getBooksJson();

  if (!newBook.title || !newBook.author || !newBook.year || !newBook.genres) {
    const responseJSON = {
      message: 'Missing required fields',
      id: 'missingParams',
    };
    return respondJSON(request, response, 400, responseJSON);
  }

  const tempTitle = newBook.title.toLowerCase();
  const tempAuthor = newBook.author.toLowerCase();

  const existingBook = books.find(
    (book) => book.title.toLowerCase() === tempTitle && book.author.toLowerCase() === tempAuthor,
  );

  if (existingBook) {
    const responseJSON = {
      message: 'Book already exists.',
      id: 'bookExists',
    };
    return respondJSON(request, response, 409, responseJSON);
  }

  books.push({
    title: newBook.title,
    author: newBook.author,
    country: newBook.country || 'Unknown',
    language: newBook.language || 'Unknown',
    link: newBook.link || '',
    pages: newBook.pages || 0,
    year: newBook.year,
    genres: newBook.genres.split(' '),
  });

  return new Promise((resolve, reject) => {
    fs.writeFile(booksFilePath, JSON.stringify(books, null, 2), (err) => {
      if (err) {
        console.error('Error writing to books.json:', err);
        const responseJSON = {
          message: 'Could not save the book data. Please try again later.',
          id: 'internalError',
        };
        respondJSON(request, response, 500, responseJSON);
        reject(err);
        return;
      }

      utils.setBooksJson(books);

      const responseJSON = {
        message: 'Book added successfully!',
        book: newBook,
      };
      respondJSON(request, response, 201, responseJSON);
      resolve();
    });
  });
};

// addReview
// Adds a review for a specific book, saving it to reviews.json.
// The book must exist for the review to be added.
// Parameters:
//   - request: The HTTP request object, containing the review data in the body.
//   - response: The HTTP response object.
// Returns: Sends a 201 status if the review is successfully added,
//          or relevant error status if the book is not found or there are missing fields.
const addReview = (request, response) => {
  const newReview = request.body;
  books = utils.getBooksJson();

  // Check for required fields
  if (!newReview.title || !newReview.review || !newReview.rating) {
    const responseJSON = {
      message: 'Missing required fields',
      id: 'missingParams',
    };
    return respondJSON(request, response, 400, responseJSON);
  }

  const tempTitle = newReview.title.toLowerCase();

  const bookExists = books.find((book) => book.title.toLowerCase() === tempTitle);

  if (!bookExists) {
    const responseJSON = {
      message: 'The book you are trying to review does not exist.',
      id: 'bookNotFound',
    };
    return respondJSON(request, response, 404, responseJSON);
  }

  const reviews = utils.getReviewsJson();
  reviews.push(newReview);

  // Save reviews back to reviews.json
  return new Promise((resolve, reject) => {
    fs.writeFile(`${__dirname}/../data/reviews.json`, JSON.stringify(reviews, null, 2), (err) => {
      if (err) {
        console.error('Error writing to reviews.json:', err);
        const responseJSON = {
          message: 'Could not save the review data. Please try again later.',
          id: 'internalError',
        };
        respondJSON(request, response, 500, responseJSON);
        reject(err);
        return;
      }

      const responseJSON = {
        message: 'Review added successfully!',
        review: newReview,
      };
      respondJSON(request, response, 201, responseJSON);
      resolve(); // Resolve the promise
    });
  });
};

// Module exports for book-related API operations
module.exports = {
  getIndex,
  getDocs,
  getCSS,
  getBooks,
  getAuthor,
  getTitle,
  getGenres,
  getReviews,
  addBook,
  addReview,
  notFound,
  setBooks,
};
