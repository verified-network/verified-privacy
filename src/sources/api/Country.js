import config from '../Config';
import Axios from 'sources/api/Axios';

function list() {
  const axios = Axios.getInstance();

  return axios.get(config.listCountryApi)
    .then((response) => response.data);
}

export default {list};
