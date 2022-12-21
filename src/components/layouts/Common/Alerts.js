import React from 'react';
import {Row, Col, Alert} from 'react-bootstrap';
import Carousel from 'react-bootstrap/Carousel';
import Loader from '../../ui/Loader';
import notifier from 'components/ui/notifier';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import ClientContractService from 'sources/contracts/ClientContractService';
import paymentGateway from 'sources/api/PaymentGateway';
import GatewayKycModal from 'components/layouts/Common/Payments/GatewayKycModal';
import LiquidityContractService from 'sources/contracts/LiquidityContractService';
import BuyLiquidity from 'components/layouts/Investor/BuyLiquidity';

class Alerts extends React.Component {
  static contextType = PasswordStore;

  constructor() {
    super();

    this.state = {
      loading: false,
      gatewayAlertVisibility: false,
      gatewayKycModalVisibility: false,
      liquidityModalVisibility: false,
      paymentGatewayName: '',
      cashData: [],
      liquidityBalance: '-',
    };
  }

  componentDidMount() {
    this.checkGatewayKyc();
    this.loadLiquidityBalance();
  }

  handleGatewayKyc = () => {
    this.context.getPassword()
      .then((password) => {
        this.setState({loading: true});
        const clientContractService = new ClientContractService(password);
        const userAddress = clientContractService.getWallet().address;

        return paymentGateway.getGatewayName(userAddress).then((gatewayName) => {
          this.setState({
            paymentGatewayName: gatewayName,
            gatewayKycModalVisibility: true,
          });
        });
      })
      .catch((error) => {
        notifier.error('Error', error.toString());
      })
      .finally(() => {
        this.setState({loading: false});
      });
  };

  checkGatewayKyc = () => {
    this.context.getPassword()
      .then((password) => {
        this.setState({loading: true});

        const clientContractService = new ClientContractService(password);

        paymentGateway.isKycAccepted(clientContractService.getWallet().address)
          .then((isKycAccepted) => {
            this.setState({gatewayAlertVisibility: !isKycAccepted});
          });
      })
      .catch((error) => {
        notifier.error('Error', error.toString());
      })
      .finally(() => {
        this.setState({loading: false});
      });
  }

  loadLiquidityBalance = () => {
    this.context.getPassword()
      .then((password) => {
        this.setState({loading: true});

        const liquidityContract = new LiquidityContractService(password);

        liquidityContract.balanceOf()
          .then((liquidityBalance) => {
            this.setState({liquidityBalance});
          });
      })
      .finally(() => {
        this.setState({loading: false});
      });
  }

  handleGatewayAlertClose = () => {
    this.setState({gatewayAlertVisibility: false});
  }

  handleGatewayKycModalClose = () => {
    this.setState({gatewayKycModalVisibility: false});
  }

  handleLiquidityModalOpen = () => {
    this.setState({liquidityModalVisibility: true});
  }

  handleLiquidityModalClose = () => {
    this.setState({liquidityModalVisibility: false});
  }

  handleKycStatusChange = (status) => {
    if (status) {
      notifier.success('Success', 'Account created successfully');
      this.handleGatewayKycModalClose();
    }

    this.checkGatewayKyc();
  }

  render() {
    const {
      loading, gatewayAlertVisibility, gatewayKycModalVisibility, paymentGatewayName, liquidityBalance,
      liquidityModalVisibility,
    } = this.state;

    return (
      <Row className='h-100'>
        {loading ? <Loader /> : ''}
        <Col sm={12}>
          <Carousel variant="dark" indicators={false}>
            {gatewayAlertVisibility ? (
              <Carousel.Item>
                <Alert variant='danger' show={true} className='text-justify'
                  style={{'height': '6em', 'paddingLeft': '30px', 'paddingRight': '30px'}}>
                  <Alert.Link onClick={this.handleGatewayKyc}>
                    Connect your bank account
                  </Alert.Link>
                  {' '} to receive payment transfers.
                </Alert>
              </Carousel.Item>
            ) : ''}
            <Carousel.Item>
              <Alert variant='danger' onClose={this.handleGatewayAlertClose} className='text-justify'
                style={{'height': '6em', 'paddingLeft': '30px', 'paddingRight': '30px'}}>
                Liquidity balance:<br/> {liquidityBalance} VITTA<br/>
                <Alert.Link onClick={this.handleLiquidityModalOpen}>
                  Earn upto 10% ARR
                </Alert.Link>
              </Alert>
            </Carousel.Item>
          </Carousel>
        </Col>

        {gatewayKycModalVisibility ? (
          <GatewayKycModal show={gatewayKycModalVisibility} onHide={this.handleGatewayKycModalClose}
            onKycStatusChange={this.handleKycStatusChange} paymentGatewayName={paymentGatewayName}
          />
        ) : ''}

        <BuyLiquidity show={liquidityModalVisibility} onHide={this.handleLiquidityModalClose}/>
      </Row>
    );
  }
}

export default Alerts;
