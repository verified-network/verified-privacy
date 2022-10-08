import axios from 'axios';
import LocalSessionManager from 'sources/utils/LocalSessionManager';

function getInstance() {
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common['Authorization'] = LocalSessionManager.getAuthToken();
  axios.defaults.headers.common['x-functions-key'] = process.env.X_FUNCTIONS_KEY ||
    '23o7dHkKdIMtjnft5q/J4mqpdBqqOOuajepmYqY0eAi9TaqQYsVSBA==';

  return axios;
}

export default {getInstance};
