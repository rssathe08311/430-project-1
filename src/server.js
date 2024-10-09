const http = require('http');
const fs = require('fs');
const responseHandler = require('./responses.js');

const clientScript = fs.readFileSync(`${__dirname}/../client/client.js`);
const utils = require('../data/utils.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// load books.json to booksJson
fs.readFile(`${__dirname}/../data/books.json`, 'utf8', (err, data) => {
  if (err) {
    console.error('Error loading data: ', err);
    return;
  }
  const booksArray = JSON.parse(data);
  utils.setBooksJson(booksArray);
});

// Load reviews.json to reviewsJson
fs.readFile(`${__dirname}/../data/reviews.json`, 'utf8', (err, data) => {
  if (err) {
    console.error('Error loading data: ', err);
    return;
  }
  const reviewsArray = JSON.parse(data);
  utils.setReviewsJson(reviewsArray);
});

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

const handleGetHead = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/client.html') {
    responseHandler.getIndex(request, response);
  } else if (parsedUrl.pathname === '/docs.html') {
    responseHandler.getDocs(request, response);
  } else if (parsedUrl.pathname === '/style.css') {
    responseHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/getBooks') {
    console.log(request.query);
    responseHandler.getBooks(request, response);
  } else if (parsedUrl.pathname === '/getAuthor') {
    responseHandler.getAuthor(request, response);
  } else if (parsedUrl.pathname === '/client.js') { // Add this block
    response.writeHead(200, { 'Content-Type': 'application/javascript' });
    response.write(clientScript);
    response.end();
  } else if (parsedUrl.pathname === '/getTitle') {
    responseHandler.getTitle(request, response);
  } else if (parsedUrl.pathname === '/getReviews') {
    responseHandler.getReviews(request, response);
  } else {
    responseHandler.notFound(request, response);
  }
};

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addBook') {
    parseBookBody(request, response, responseHandler.addBook);
  } else if (parsedUrl.pathname === '/addReview') {
    parseReviewBody(request, response, responseHandler.addReview);
  } else {
    responseHandler.notFound(request, response);
  }
};

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

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});
