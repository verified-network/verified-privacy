import axios from 'axios';

export class CoingeckoClient {
  constructor() {
    this.baseUrl = 'https://api.coingecko.com/api/v3';
  }

  async get(endpoint) {
    const {data} = await axios.get(this.baseUrl + endpoint);
    return data;
  }
}

export const coingeckoClient = new CoingeckoClient();
