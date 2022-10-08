import CashContractService from 'sources/contracts/CashContractService';
import FactoryContractService from 'sources/contracts/FactoryContractServiceL2';
import ContractService from 'sources/contracts/ContractService';
import Response from './Response';

/*
Events specification:

{
    type: CashIssue
    data: {

    }
}
*/

const EventType = {
  CASH_ISSUE: 'CashIssue',
};

class EventsContractService extends ContractService {
  subscribe(callback) {
    const cashContractService = new CashContractService(this.getPassword());
    const factoryContractService = new FactoryContractService(this.getPassword());

    factoryContractService.getCashCurrencies().then((currencies) => {
      for (const currency of currencies) {
        cashContractService.notifyCashIssue(currency, (event) => {
          Response.array(event)
              .then((eventData) => {
                const address = eventData[0];
                const currency = eventData[1];
                const amount = eventData[2];

                if (address === this.getWallet().address) {
                  const eventObject = {
                    type: EventType.CASH_ISSUE,
                    data: {
                      currency,
                      amount,
                    },
                  };

                  callback(eventObject);
                }
              })
              .catch((error) => {
                // Just ignore this error
                // eslint-disable-next-line no-console
                console.error('Error on event: ', error);
              });
        });
      }
    });
  }
}

export {EventType};
export default EventsContractService;
