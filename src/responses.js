const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const style = fs.readFileSync(`${__dirname}/../client/style.css`);



//retrieves html page
const getIndex = (request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html' });
  
    if (request.method !== 'HEAD') {
      response.write(index);
    }
  
    response.end();
};

//retrieves css file
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

  if(request.method !== 'HEAD' && status !== 204) {
    response.write(content);
  }
  response.end();
}

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found',
    id: 'notFound',
  };
  return respondJSON(request, response, 404, responseJSON);
}

//GET Requests

const getBooks = (request, response, parsedUrl) => {
  const limit = parsedUrl.searchParams.get('limit') || books.length;
  const responseJSON = {books: books.slice(0,limit)};

  if(request.method === 'HEAD'){
    return respondJSON(request, response, 200, {});
  }

  return respondJSON(request, response, 200, responseJSON);
};

const getAuthor = (request, response) => {
  const author = parsedUrl.searchParams.get('author');
  const filteredBooks = books.filter((book) => book.author === author);

  if (filteredBooks.length === 0) {
    let responseJSON = {
      message: 'No books found for the author',
      id: 'getAuthor',
    }
    if(request.method === 'HEAD'){
      return respondJSON(request, response, 404, {});
    }
    else{
      return respondJSON(request, response, 404, respondJSON);
    }
  }

  if(request.method === 'HEAD'){
    return respondJSON(request, response, 200, {});
  }

  return respondJSON(request, response, 200, { books: filteredBooks });
};

const getTitle = (request, response) => {

};

const getReviews = (request, response) => {

};


//POST Requests
const addBook = (request, response) => {

};

const addReview = (request, response) => {

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
  badRequest,
};