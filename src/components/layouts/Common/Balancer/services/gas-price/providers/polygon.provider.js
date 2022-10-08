import axios from 'axios';
import {GWEI_UNIT} from '../../../constants/units';

export default class PolygonProvider {
  async getLatest(
    txSpeed = 'standard'
  ) {
    try {
      const {data} = await axios.get<PolygonGasStationResponse>(
        'https://gasstation-mainnet.matic.network/v2'
      );
      return {
        price: Math.floor(data[txSpeed].maxFee * GWEI_UNIT),
        maxFeePerGas: Math.floor(data[txSpeed].maxFee * GWEI_UNIT),
        maxPriorityFeePerGas: Math.floor(
          data[txSpeed].maxPriorityFee * GWEI_UNIT
        ),
      };
    } catch (error) {
      console.log('[Polygon] Gas Platform Error', error);
      return null;
    }
  }
}
