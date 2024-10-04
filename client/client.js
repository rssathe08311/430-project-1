const handleResponse = async (response, parseResponse) => {
    const content = document.querySelector('#content');
    content.innerHTML = '';


    switch(response.status) {
      case 200:
        content.innerHTML = `<b>Success</b>`;
        break;
      case 201:
        content.innerHTML = `<b>Created</b>`;
        break;
      case 204:
        content.innerHTML = `<b>Updated (No Content)</b>`;
        break;
      case 400:
        content.innerHTML = `<b>Bad Request</b>`;
        break;
      case 404:
        content.innerHTML = `<b>Not Found</b>`;
        break;
      default:
        content.innerHTML = `Error code not implemented by client.`;
        break;
    }

    if(parseResponse && response.status !== 204) {
      const obj = await response.json();
      if(obj.message) {
        content.innerHTML += `<p>Message: ${obj.message}</p>`;
      }
      else {
        content.innerHTML += `<p>${JSON.stringify(obj)}</p>`;
      }
    }
    else {
      console.log("Meta data recieved ")
    }
  };

  const requestUpdate = async (userForm) => {
    const url = userForm.querySelector('#urlField').value;
    const method = userForm.querySelector('#methodSelect').value;

    const response = await fetch(url, {
      method,
      headers: {
        'Accept': 'application/json'
      }
    });

    handleResponse(response, method.toLowerCase() === 'get');
  }

  const sendPost = async (nameForm) => {
    const url = nameForm.getAttribute('action');
    const nameField = nameForm.querySelector('#nameField');
    const ageField = nameForm.querySelector('#ageField');

    const formData = `name=${nameField.value}&age=${ageField.value}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: formData,
      });

      await handleResponse(response, true);
      return;
    } catch (error) {
      console.error('Error in POST request:', error);
      const content = document.querySelector('#content');
      content.innerHTML = '<b>There was an error with the request.</b>';
    }

  }

  const init = () => {
    const userForm = document.querySelector('#userForm');
    const nameForm = document.querySelector('#nameForm');

    // Handling GET/HEAD requests
    userForm.addEventListener('submit', (e) => {
      e.preventDefault();
      requestUpdate(userForm);
      return false;
    });

    // handle Post requests
    nameForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendPost(nameForm);
      return false;
    });
  };

  window.onload = init;