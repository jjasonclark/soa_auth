const routes = {
  login: '/login',
  api: '/api'
};
let jwt = null;
const messageId = 'api-data';
const jwtId = 'jwt';

function showMessage(message) {
  document.getElementById(messageId).innerText = message;
}

function showError(err) {
  showMessage(err.toString());
}

function getAuthToken() {
  fetch(routes.login, { method: 'post' })
    .then(function(result) {
      return result.json();
    })
    .then(function(data) {
      jwt = data.jwt;
      document.getElementById(jwtId).innerText = jwt;
    })
    .catch(function(err) {
      showError(err);
    });
}

function getAPIData() {
  fetch(routes.api, {
    headers: {
      authorization: jwt
    }
  })
    .then(function(result) {
      if (result.status === 401) {
        return 'Failed authentication';
      }
      return result.json();
    })
    .then(function(data) {
      showMessage(JSON.stringify(data));
    })
    .catch(function(err) {
      showError(err);
    });
}
