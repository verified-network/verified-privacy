import './currency.less';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import FormSelector from '../../ui/formSelector/formSelector';
import Loader from 'components/ui/Loader';
import FactoryContractServiceL2 from '../../../sources/contracts/FactoryContractServiceL2';
import FactoryContractServiceL1 from '../../../sources/contracts/FactoryContractServiceL1';

const CurrencyType = {
  CASH: 'Cash',
  BOND: 'Bond',
  FIAT: 'Fiat',
};

class Currency extends Component {
  static contextType = PasswordStore;

  constructor() {
    super();

    this.state = {
      currencies: [],
      selectedCurrency: '',
    };
  }

  componentDidMount() {
    this.loadCurrencies();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isL1 !== this.props.isL1) {
      this.setState({currencies: [], selectedCurrency: ''});
      this.props.onChange('');
      this.loadCurrencies();
    }
    if (nextProps.selectedCurrency && nextProps.selectedCurrency !== this.props.selectedCurrency) {
      this.setState({selectedCurrency: nextProps.selectedCurrency.name});
    }
  }

  loadCurrencies = () => {
    const {type} = this.props;

    this.context.getPassword().then((password) => {
      this.setState({loading: true});

      let factoryContractService = new FactoryContractServiceL2(password);

      if (this.props.isL1) {
        factoryContractService = new FactoryContractServiceL1(password);
      }

      let load = null;

      if (type === CurrencyType.CASH) {
        load = factoryContractService.getCashCurrencies().then((currencies) => {
          this.setState({currencies});
          this.props.onLoadCurrencies(currencies);
        });
      } else if (type === CurrencyType.BOND) {
        load = factoryContractService.getBondCurrencies().then((currencies) => {
          this.setState({currencies});
          this.props.onLoadCurrencies(currencies);
        });
      } else if (type === CurrencyType.FIAT) {
        load = factoryContractService.getFiatCurrencies().then((currencies) => {
          this.setState({currencies});
          this.props.onLoadCurrencies(currencies);
        });
      } else {
        // This must not happen
        // eslint-disable-next-line no-console
        console.error('Unknown currency Type in Currency Component');
      }

      load.finally(() => {
        this.setState({loading: false});
      });
    });
  };

  handleChange = (e) => {
    const {currencies} = this.state;
    const currencyName = e.target.value;
    this.setState({selectedCurrency: currencyName});
    const currency = currencies.find((element) => {
      return element.name == currencyName;
    });

    this.props.onChange(currency);
  }

  render() {
    const {currencies, selectedCurrency, loading} = this.state;
    const {placeholderText} = this.props;

    return (
      <>
        {loading ? <Loader/> : ''}
        <FormSelector
          optionsValue={[
            placeholderText,
            ...(currencies.map((element) => element.name)),
          ]}
          value={selectedCurrency}
          onChange={this.handleChange}
          selectorClass="textForm custom-select dropdown"
        />
      </>
    );
  }
}

Currency.propTypes = {
  placeholderText: PropTypes.string,
  paymentClass: PropTypes.string,
};

Currency.defaultProps = {
  onLoadCurrencies: () => {},
};

export {CurrencyType};
export default Currency;
