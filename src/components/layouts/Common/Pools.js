import 'bootstrap-daterangepicker/daterangepicker.css';
import React from 'react';
import { Row } from 'react-bootstrap';
import Loader from '../../ui/Loader';
import notifier from 'components/ui/notifier';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import CashContractService from 'sources/contracts/CashContractService';
import Carousel from '../../ui/carrousel/Carrousel';
import countryApi from 'sources/api/Country';
import KycContractService from 'sources/contracts/KycContractService';
import FactoryContractService from 'sources/contracts/FactoryContractServiceL2';


class Pools extends React.Component {
  static contextType = PasswordStore;

  constructor() {
    super();

    this.state = {
      loading: false,
      cashData: [],
      selectedCurrency: '',
    };
  }

  componentDidMount() {
    this.context.getPassword().then((password) => {
      const kycContract = new KycContractService(password);

      this.setState({ loading: true });

      kycContract.getCountry().then((userCountry) => {
        countryApi.list().then((countries) => {
          const userCountryObj = (countries.find((country) => country.code === userCountry));

          const userCurrency = userCountryObj ? userCountryObj.currency : 'USD';

          this.setState({
            selectedCurrency: FactoryContractService.getCashCurrencyNameByFiatName(userCurrency),
          });
        }).finally(() => {
          this.setState({ loading: false });
          this.loadCashData();
        });
      });
    });
  }

  loadCashData = () => {
    return this.context.getPassword().then((password) => {
      const cashContract = new CashContractService(password);

      this.setState({ loading: true });

      cashContract.allBalances()
        .then((balances) => {
          let selectedCurrency = this.state.selectedCurrency;

          if (!selectedCurrency) {
            selectedCurrency = balances[0].name;

            this.setState({
              selectedCurrency: balances[0].name,
            });
          }

          this.setState({
            cashData: balances,
          });
        })
        .catch((error) => {
          notifier.error('Error', 'Error loading cash balances ' + error.toString());
        })
        .finally(() => {
          this.setState({ loading: false });
        });
    });
  };

  render() {
    const { loading, cashData } = this.state;

    const items = cashData.map((item) => {
      return {
        name: item.name,
        value: item.balance,
      };
    });

    return (
      <>
        {loading ? <Loader /> : ''}
        <section className='p-0 mt-0'>
          <Carousel items={items} />
          <Row>
            <h3 className='pt-4'>Balancer Pools</h3>
          </Row>
        </section>
      </>
    );
  }
}

export default Pools;
