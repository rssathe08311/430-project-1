const fs = require('fs');

let booksJson = [];
let reviews = [];

const setBooksJson = (newBooksArray) => {
  booksJson = newBooksArray;
};

const setReviewsJson = (newReviewsArray) => {
    reviews = newReviewsArray;
};

const getBooksJson = () => booksJson;
const getReviewsJson = () => reviews;

module.exports = {
  setBooksJson,
  setReviewsJson,
  getBooksJson,
  getReviewsJson,
};
