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

const getBooks = (request, response) => {

};

const getAuthor = (request, response) => {

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