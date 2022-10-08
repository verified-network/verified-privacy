import './../currency/currency.less';
import React, {Component} from 'react';
import FormSelector from '../../ui/formSelector/formSelector';
import Loader from 'components/ui/Loader';
import countryApi from 'sources/api/Country';

class Country extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      countries: [],
      selectedCountry: '',
    };
  }

  componentDidMount() {
    this.loadCountries();
  }

  loadCountries = () => {
    this.setState({loading: true});

    countryApi.list().then((countries) => {
      this.setState({countries});
    }).finally(() => {
      this.setState({loading: false});
    });
  };

  handleChange = (e) => {
    const {countries} = this.state;
    const selectedCountryName = e.target.value;

    const country = countries.find((element) => {
      return element.name === selectedCountryName;
    });

    this.setState({selectedCountry: country.name});

    this.props.onChange(country);
  }

  render() {
    const {countries, loading, selectedCountry} = this.state;
    const {placeholderText} = this.props;

    return (
      <>
        {loading ? <Loader/> : ''}
        <FormSelector
          optionsValue={[
            placeholderText,
            ...(countries.map((element) => element.name)),
          ]}
          value={selectedCountry}
          onChange={this.handleChange}
          selectorClass="textForm custom-select dropdown"
        />
      </>
    );
  }
}

export default Country;
