var window;

function ApiConsumer(port) {

  const getStudents = () => {
    return get('/students');
  }

  const getStudent = (id) => {
    return get(`/students/${id}`);
  }

  const get = (url) => {
    return fetch(`http://localhost:${port}${url}`).then(data => {
      if (data.status >= 400) {
        return Promise.reject(data);
      }
      return data.json();
    });
  };

  const postStudent = (id, profile) => {
    return fetch(`http://localhost:${port}/students/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profile)
    }).then(data => {
      if (data.status >= 400) {
        return Promise.reject(data);
      }
      return data.text();
    });
  }

  this.getStudents = getStudents;
  this.getStudent = getStudent;
  this.postStudent = postStudent;
}

if (window) {
  window.ApiConsumer = ApiConsumer;
} else {
  module.exports = ApiConsumer;
}