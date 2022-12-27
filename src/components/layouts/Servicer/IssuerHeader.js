import React from 'react';
import CommonHeader from '../Common/CommonHeader';

class IssuerHeader extends React.Component {
  render = () => {
    return (
      <CommonHeader role='issuer' finishSetup = {this.props.finishSetup}/>
    );
  }
}

export default IssuerHeader;
