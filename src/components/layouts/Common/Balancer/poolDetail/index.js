import React from 'react';
import {TokensDataProvider} from '../providers/tokensProvider';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import UsePassword from '../composables/usePassword';
import KyberPoolDetail from './kyber';
import BalancerPoolDetail from './balancerPoolDetail';

const PoolDetail = (props) => {
  console.log('poolDetail render', props.match.params);
  return (
    props.match.params.type === 'kyber' ? <KyberPoolDetail {...props} /> : <BalancerPoolDetail {...props} />
  );
};

class PoolDetailPage extends React.Component {
  static contextType = PasswordStore;

  constructor() {
    super();

    this.state = {
      password: false,
    };
  }

  componentDidMount() {
    this.context.getPassword().then((password) => {
      UsePassword.setPassword(password);
      this.setState({password});
    });
  }

  render() {
    return this.state.password ? <TokensDataProvider><PoolDetail {...this.props} password={this.state.password} /></TokensDataProvider> : null;
  }
}

export default PoolDetailPage;
