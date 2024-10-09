const fs = require('fs');
const utils = require('../data/utils.js');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const style = fs.readFileSync(`${__dirname}/../client/style.css`);

let books = [];

// retrieves html page
const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });

  if (request.method !== 'HEAD') {
    response.write(index);
  }

  response.end();
};

const setBooks = (newBooksArray) => {
  books = newBooksArray;
};

// retrieves css file
const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  if (request.method !== 'HEAD') {
    response.write(style);
  }
  response.end();
};

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

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found',
    id: 'notFound',
  };
  return respondJSON(request, response, 404, responseJSON);
};

// GET Requests
const getBooks = (request, response, parsedUrl) => {
  books = utils.getBooksJson();
  const limit = parsedUrl.searchParams.get('limit') || books.length;
  const responseJSON = { books: books.slice(0, limit) };

  if (request.method === 'HEAD') {
    return respondJSON(request, response, 200, {});
  }

  return respondJSON(request, response, 200, responseJSON);
};

const getAuthor = (request, response, parsedUrl) => {
  books = utils.getBooksJson();
  const author = parsedUrl.searchParams.get('author');

  if (!author) {
    const responseJSON = {
      message: 'Author query is empty. Please provide a valid author name.',
      id: 'missingAuthor',
    };
    return respondJSON(request, response, 400, responseJSON);
  }

  const filteredBooks = books.filter((book) => book.author.toLowerCase() === author.toLowerCase());

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

const getTitle = (request, response, parsedUrl) => {
  books = utils.getBooksJson();
  const title = parsedUrl.searchParams.get('title');
  const filteredBooks = books.filter((book) => book.title.toLowerCase() === title.toLowerCase());

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

const getReviews = (request, response, parsedUrl) => {
  const reviews = utils.getReviewsJson();
  const title = parsedUrl.searchParams.get('title').toLowerCase();

  // Check for missing title parameter
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

  const existingBook = books.find(
    (book) => book.title === newBook.title && book.author === newBook.author,
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
    genres: newBook.genres,
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

      // Send success response
      const responseJSON = {
        message: 'Book added successfully!',
        book: newBook,
      };
      respondJSON(request, response, 201, responseJSON);
      resolve(); // Ensure the promise resolves
    });
  });
};

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

  const bookExists = books.find((book) => book.title === newReview.title);

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
        reject(err); // Reject the promise on error
        return; // Exit the function
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

module.exports = {
  getIndex,
  getCSS,
  getBooks,
  getAuthor,
  getTitle,
  getReviews,
  addBook,
  addReview,
  notFound,
  setBooks,
};
