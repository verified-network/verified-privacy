import Config from '../Config';
import Axios from 'sources/api/Axios';

function getEncryptedMetadata(address) {
  const axios = Axios.getInstance();

  return axios.get(Config.passbaseMetadataUrl, {params: {address}})
      .then((response) => response.data);
}

export default {getEncryptedMetadata};
