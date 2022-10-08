import 'bootstrap-daterangepicker/daterangepicker.css';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import Loader from '../../ui/Loader';
import Transactions from './Transactions';
import notifier from 'components/ui/notifier';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import CashContractService from 'sources/contracts/CashContractService';
import Carousel from '../../ui/carrousel/Carrousel';
import { formatDate } from 'sources/contracts/AccountContractService';
import HolderContractService from 'sources/contracts/HolderContractService';
import { MESSAGES } from 'sources/messages';
import countryApi from 'sources/api/Country';
import KycContractService from 'sources/contracts/KycContractService';
import FactoryContractService from 'sources/contracts/FactoryContractServiceL2';
import initialTransactionsManager from 'sources/utils/InitialTransactionsManager';


class Pay extends React.Component {
  static contextType = PasswordStore;

  constructor() {
    super();

    this.state = {
      loading: false,
      cashData: [],
      selectedCurrency: '',
      startDate: '',
      endDate: '',
      transactionData: [],
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

          return this.loadTransactions(selectedCurrency);
        })
        .catch((error) => {
          notifier.error('Error', 'Error loading cash balances ' + error.toString());
        })
        .finally(() => {
          this.setState({ loading: false });
        });
    });
  };

  loadTransactions(currencyName) {
    return this.context.getPassword().then((password) => {
      const holderContract = new HolderContractService(password);

      this.setState({ loading: true });

      const endDate = this.state.endDate !== '' ? this.state.endDate : formatDate(new Date());

      initialTransactionsManager.addTransaction(() => {
        return holderContract.fetchTransactions('0', endDate);
      });

      return holderContract.getTransactions(endDate, currencyName)
        .then((transactionData) => {
          this.setState({ transactionData });
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error('Error loading transaction entries', e);
          // notifier.error('Error', 'Error loading transaction entries');
        })
        .finally(() => {
          this.setState({ loading: false });
        });
    });
  }

  handleSelectedCurrencyChange = (selectedCurrency) => {
    this.setState({ selectedCurrency });
    this.loadTransactions(selectedCurrency);
  }

  handleDateRangeChange = (event, picker) => {
    const startDate = formatDate(picker.startDate.toDate());
    const endDate = formatDate(picker.endDate.toDate());

    this.setState({ startDate, endDate });

    const selectedCurrency = this.state.selectedCurrency;

    return this.context.getPassword().then((password) => {
      const holderContract = new HolderContractService(password);

      this.setState({ loading: true });

      holderContract.fetchTransactions(startDate, endDate)
        .then(() => {
          return holderContract.getTransactions(endDate, selectedCurrency)
            .then((transactionData) => {
              this.setState({ transactionData });

              notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
            });
        })
        .catch(() => {
          notifier.error('Error', 'Error loading transaction entries');
        })
        .finally(() => {
          this.setState({ loading: false });
        });
    });
  }

  render() {
    const { loading, selectedCurrency, cashData, transactionData } = this.state;

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
            <Col className="d-flex justify-content-end">
              <DropdownButton onSelect={this.handleSelectedCurrencyChange}
                variant="primary" className="btn btn-primary mr-2" title="Filter currency">
                {cashData.map((currency) => {
                  return <Dropdown.Item eventKey={currency.name} active={currency.name === selectedCurrency}>
                    {currency.name}
                  </Dropdown.Item>;
                })}
              </DropdownButton>

              <DateRangePicker onApply={this.handleDateRangeChange}>
                <button class="btn btn-primary">
                  Change date range
                </button>
              </DateRangePicker>
            </Col>
          </Row>

          <Row>
            <Transactions transactionData={transactionData} />
          </Row>
        </section>
      </>
    );
  }
}

export default Pay;
