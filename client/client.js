const handleResponse = async (response, parseResponse, contentRef) => {
  // const content = form.querySelector('.result');
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

// Function to handle GET and HEAD requests
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

// Function to handle POST requests - super broken rn
const sendPost = async (form) => {
  const endpoint = form.getAttribute('data-endpoint');
  const url = form.getAttribute('action');

  let formData = '';

  if (url === '/addReview') {
    const titleData = '';
    formData = `title=${titleData.value}&age=${titleData.value}`;
  } else {
    // put in proper info they dont have ids rn
    const titleData = '';
    const reviewData = '';
    const ratingData = '';
    formData = `title=${titleData.value}&review=${reviewData.value}&rating=${ratingData.value}`;
  }

  /*
  const formData = new FormData(form);

  const bodyData = {};
  formData.forEach((value, key) => {
    bodyData[key] = value;
  });
  */

  const content = form.querySelector('.result');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: JSON.stringify(bodyData),
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

window.onload = init;
