import React from 'react';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import UsePassword from './composables/usePassword';
import BalancerPage from './balancer';

class Balancer extends React.Component {
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
    return this.state.password ? <BalancerPage {...this.props} password={this.state.password} /> : null;
  }
}

export default Balancer;
