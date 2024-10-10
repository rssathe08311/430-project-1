// server.js implements an HTTP server for managing a book and review API,
// handling requests to load, parse, and store book and review data while
// providing routes for adding and retrieving books and reviews.

// Import 'fs' module and http module and responses.js/utils.js functions
const http = require('http');
const fs = require('fs');
const responseHandler = require('./responses.js');
const utils = require('../data/utils.js');

// Store a refrence to client.js
const clientScript = fs.readFileSync(`${__dirname}/../client/client.js`);

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// Load Books and Reviews
// This section loads books and reviews data from JSON files into the application.
// It reads the 'books.json' and 'reviews.json' files and updates the application's
// state with their contents.
// parameters: None
// return: None
fs.readFile(`${__dirname}/../data/books.json`, 'utf8', (err, data) => {
  if (err) {
    console.error('Error loading data: ', err);
    return;
  }
  const booksArray = JSON.parse(data);
  utils.setBooksJson(booksArray);
});

fs.readFile(`${__dirname}/../data/reviews.json`, 'utf8', (err, data) => {
  if (err) {
    console.error('Error loading data: ', err);
    return;
  }
  const reviewsArray = JSON.parse(data);
  utils.setReviewsJson(reviewsArray);
});

// parseBookBody
// Parses the body of an incoming request to extract book data and attaches it to the request object
// Parameters:
//   - request: The HTTP request object.
//   - response: The HTTP response object.
//   - handler: A callback function to handle the parsed data.
// Returns: None
const parseBookBody = (request, response, handler) => {
  const body = [];

  request.on('error', (err) => {
    console.error(err);
    responseHandler.badRequest(response);
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const contentType = request.headers['content-type'];

    let bodyData;

    if (contentType === 'application/x-www-form-urlencoded') {
      bodyData = new URLSearchParams(bodyString);
    } else {
      try {
        bodyData = JSON.parse(bodyString);
      } catch (err) {
        responseHandler.badRequest(response);
        return;
      }
    }

    // Format for books.json as refrence
    /* "author": "Chinua Achebe",
    "country": "Nigeria",
    "language": "English",
    "link": "https://en.wikipedia.org/wiki/Things_Fall_Apart\n",
    "pages": 209,
    "title": "Things Fall Apart",
    "year": 1958,
    "genres": [
      "Historical Fiction",
      "Postcolonial Literature"
    ] */

    request.body = {
      author: bodyData.get ? bodyData.get('author') : bodyData.author,
      country: bodyData.get ? bodyData.get('country') : bodyData.country,
      language: bodyData.get ? bodyData.get('language') : bodyData.language,
      link: bodyData.get ? bodyData.get('link') : bodyData.link,
      pages: bodyData.get ? bodyData.get('pages') : bodyData.pages,
      title: bodyData.get ? bodyData.get('title') : bodyData.title,
      year: bodyData.get ? bodyData.get('year') : bodyData.year,
      genres: bodyData.get ? bodyData.get('genres') : bodyData.genres,
    };

    handler(request, response);
  });
};

// parseReviewBody
// Parse the body of an incoming request to extract data and attaches it to the request object.
// Parameters:
//   - request: The HTTP request object.
//   - response: The HTTP response object.
//   - handler: A callback function to handle the parsed data.
// Returns: None
const parseReviewBody = (request, response, handler) => {
  const body = [];

  request.on('error', (err) => {
    console.error(err);
    responseHandler.badRequest(response);
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const contentType = request.headers['content-type'];

    let bodyData;

    if (contentType === 'application/x-www-form-urlencoded') {
      bodyData = new URLSearchParams(bodyString);
    } else {
      try {
        bodyData = JSON.parse(bodyString);
      } catch (err) {
        responseHandler.badRequest(response);
        return;
      }
    }

    request.body = {
      title: bodyData.get ? bodyData.get('title') : bodyData.title,
      review: bodyData.get ? bodyData.get('review') : bodyData.review,
      rating: bodyData.get ? bodyData.get('rating') : bodyData.rating,
    };

    handler(request, response);
  });
};

// handleGetHead
// Handles GET and HEAD requests by invoking the appropriate response based on the URL.
// Parameters:
//   - request: The HTTP request object.
//   - response: The HTTP response object.
//   - parsedUrl: The parsed URL object for the request.
// Returns: None
const handleGetHead = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/client.html') {
    responseHandler.getIndex(request, response);
  } else if (parsedUrl.pathname === '/docs.html') {
    responseHandler.getDocs(request, response);
  } else if (parsedUrl.pathname === '/style.css') {
    responseHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/getBooks') {
    responseHandler.getBooks(request, response);
  } else if (parsedUrl.pathname === '/getAuthor') {
    responseHandler.getAuthor(request, response);
  } else if (parsedUrl.pathname === '/client.js') { // Add this block
    response.writeHead(200, { 'Content-Type': 'application/javascript' });
    response.write(clientScript);
    response.end();
  } else if (parsedUrl.pathname === '/getTitle') {
    responseHandler.getTitle(request, response);
  } else if (parsedUrl.pathname === '/getGenres') {
    responseHandler.getGenres(request, response);
  } else if (parsedUrl.pathname === '/getReviews') {
    responseHandler.getReviews(request, response);
  } else {
    responseHandler.notFound(request, response);
  }
};

// handlePost
// Handles POST requests by parsing the body of the request and routing it to the correct handler.
// Parameters:
//   - request: The HTTP request object.
//   - response: The HTTP response object.
//   - parsedUrl: The parsed URL object for the request.
// Returns: None
const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addBook') {
    parseBookBody(request, response, responseHandler.addBook);
  } else if (parsedUrl.pathname === '/addReview') {
    parseReviewBody(request, response, responseHandler.addReview);
  } else {
    responseHandler.notFound(request, response);
  }
};

// onRequest
// Main request handler for incoming HTTP requests. Routes based on the request method and URL.
// Parameters:
//   - request: The HTTP request object.
//   - response: The HTTP response object.
// Returns: None
const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  request.query = Object.fromEntries(parsedUrl.searchParams);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else if (['GET', 'HEAD'].includes(request.method)) {
    handleGetHead(request, response, parsedUrl);
  } else {
    responseHandler.notFound(request, response);
  }
};

// Server Creation
// Initializes and starts the HTTP server, listening for incoming requests on the specified port.
// Parameters: None
// Returns: None
http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});
