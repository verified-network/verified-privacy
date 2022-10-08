import config from '../Config';
import axios from 'axios';

function getLoggedUser(token) {
  const headers = token ? {
    Authorization: `Bearer ${token}`,
  } : {};

  return axios
      .get(config.authenticatedUserUrl, {headers})
      .then((response) => response.data);
}

function logout() {
  return axios
      .get(config.logoutUrl, {withCredentials: true})
      .then((response) => response.data);
}

export default {getLoggedUser, logout};
