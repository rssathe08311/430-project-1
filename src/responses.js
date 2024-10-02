const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const style = fs.readFileSync(`${__dirname}/../client/style.css`);

const getIndex = (request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html' });
  
    if (request.method !== 'HEAD') {
      response.write(index);
    }
  
    response.end();
};

const getCSS = (request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/css' });
    if (request.method !== 'HEAD') {
      response.write(style);
    }
    response.end();
};