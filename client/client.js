// HTML functionality
// Initializes collapsible elements and adjusts box size dynamically after form submission.
// Parameters: None
// Returns: None
document.addEventListener("DOMContentLoaded", function () {
  const collapsibles = document.querySelectorAll(".collapsible");

  collapsibles.forEach(collapsible => {
    collapsible.addEventListener("click", function () {
      this.classList.toggle("active");

      const content = this.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });

  // Adjust box size dynamically after form submission or content updates
  const forms = document.querySelectorAll("form");

  forms.forEach(form => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const content = form.closest(".content");

      const result = form.querySelector('.result');
      result.textContent = "New content added after form submission!";
      
      setTimeout(() => {
        content.style.maxHeight = content.scrollHeight + "px";
      }, 100); 
    });
  });
});



// handleResponse
// Handles the response from fetch requests and updates the content area based on the status code.
// Parameters:
//   - response: The fetch response object.
//   - parseResponse: A boolean indicating whether to parse the JSON response.
//   - contentRef: The DOM element to update with the response message.
// Returns: None
const handleResponse = async (response, parseResponse, contentRef) => {
  const content = contentRef;
  content.innerHTML = '';

  switch (response.status) {
    case 200:
      content.innerHTML = '<b>Success</b>';
      break;
    case 201:
      content.innerHTML = '<b>Created</b>';
      break;
    case 204:
      content.innerHTML = '<b>Updated</b>';
      break;
    case 400:
      content.innerHTML = '<b>Bad Request</b>';
      break;
    case 404:
      content.innerHTML = '<b>Not Found</b>';
      break;
    case 409:
      content.innerHTML = '<b>Already Exists</b>';
      break;
    default:
      content.innerHTML = 'Error code not implemented by client.';
      break;
  }

  if (parseResponse && response.status !== 204) {
    const obj = await response.json();
    if (obj.message) {
      content.innerHTML += `<p>Message: ${obj.message}</p>`;
    } else {
      content.innerHTML += `<p>${JSON.stringify(obj, null, 2)}</p>`;
    }
  } else {
    console.log('Meta data received');
  }
};

// requestUpdate
// Handles GET and HEAD requests, constructing the URL and making the fetch call.
// Parameters: 
//   - form: The form element containing the request information.
// Returns: None
const requestUpdate = async (form) => {
  const method = form.querySelector('input[name="method"]:checked').value;
  const endpoint = form.getAttribute('data-endpoint');
  const queryParams = new URLSearchParams(new FormData(form)).toString();
  const url = method === 'GET' || method === 'HEAD' ? `${endpoint}?${queryParams}` : endpoint;

  const content = form.querySelector('.result');

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
      },
    });

    await handleResponse(response, method.toLowerCase() === 'get', content);
  } catch (error) {
    console.error('Error fetching data:', error);
    if (content) {
      content.innerHTML = '<b>Error fetching data.</b>'; // Show error message here
    }
  }
};

// sendPost
// Handles POST requests by gathering form data and sending it to the server.
// Parameters: 
//   - form: The form element containing the data to be sent.
// Returns: None
const sendPost = async (form) => {
  const endpoint = form.getAttribute('data-endpoint');
  const url = form.getAttribute('action');

  console.log(url);

  let formData = '';

  if (url === '/addBook') {
    const titleData = form.querySelector('#bookTitleData');
    const authorData = form.querySelector('#authorData');
    const yearData = form.querySelector('#yearData');
    const countryData = form.querySelector('#countryData');
    const languageData = form.querySelector('#languageData');
    const genresData = form.querySelector('#genresData');
    const pagesData = form.querySelector('#pagesData');
    const linkData = form.querySelector('#linkData');
    formData = `title=${titleData.value}&author=${authorData.value}&year=${yearData.value}&country=${countryData.value}
                &language=${languageData.value}&genres=${genresData.value}&pages=${pagesData.value}&link=${linkData.value}`;
  } else {
    // put in proper info they dont have ids rn
    const titleData = form.querySelector('#titleData');
    const reviewData = form.querySelector('#reviewData');
    const ratingData = form.querySelector('#ratingData');
    formData = `title=${titleData.value}&review=${reviewData.value}&rating=${ratingData.value}`;
  }

  const content = form.querySelector('.result');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: formData,
    });

    console.log('Response status:', response.status);
    await handleResponse(response, true, content);
  } catch (error) {
    console.error('Error in POST request:', error);
    if (content) {
      content.innerHTML = `<b>There was an error with the request:</b> ${error.message || error}`;
    }
  }
};

// init
// Initializes form submission event listeners for GET, HEAD, and POST requests.
// Parameters: None
// Returns: None
const init = () => {
  document.querySelectorAll('form[data-method="GET"], form[data-method="POST"]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const method = form.getAttribute('data-method');
      if (method === 'GET' || method === 'HEAD') {
        requestUpdate(form);
      } else if (method === 'POST') {
        sendPost(form);
      }
      return false;
    });
  });
};

// Window onload event to initialize the application.
window.onload = init;
