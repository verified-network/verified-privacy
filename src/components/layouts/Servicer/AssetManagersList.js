import React, {Component} from 'react';
import {Col, Row} from 'react-bootstrap';
import UiTable from '../../ui/table/Table';
import '../../../styles/css/organization.less';
import '../../../styles/css/order.less';
import Loader from '../../ui/Loader';
import notifier from 'components/ui/notifier';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import {withRouter} from 'react-router-dom';
import TableDropdown from 'components/ui/tableDropdown/TableDropdown';
import TextInput from 'components/ui/textinput/TextInput';
import ModalCard from 'components/ui/card/ModalCard';
import {MESSAGES} from 'sources/messages';
import LiquidityContractService from 'sources/contracts/LiquidityContractService';

const managersTableHeaders = [
  {label: 'Manager', val: 'managerAddress'},
  {label: 'Manager name', val: 'managerName'},
  {label: 'Token', val: 'token'},
  {label: 'Provided', val: 'managerLiquidityProvided'},
  {label: 'Earnings', val: 'managerCommissionsEarned'},
  {label: 'Action', val: 'action'},
];

const RowActions = {
  PROVIDE_LIQUIDITY: 'Provide liquidity',
  REMOVE_MANAGER: 'Remove manager',
};

class AssetManagersList extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      managersPerformance: [],
      provideLiquidityModalVisibility: false,
      provideLiquidityAmount: '',
      tokenAmount: '',
      platformAddress: '',
      selectedRow: '',
    };
  }

  componentDidMount = () => {
    const platformAddress = this.props.match.params.platformAddress;

    this.setState({platformAddress});

    this.loadManagers(platformAddress);
  }

  loadManagers(platformAddress) {
    return this.context.getPassword().then((password) => {
      const liquidityContract = new LiquidityContractService(password);

      this.setState({loading: true});

      liquidityContract.getManagersPerformance(platformAddress)
        .then((managersPerformance) => {
          this.setState({managersPerformance});
        })
        .catch((error) => {
          notifier.error('Error', 'Error loading managers performance.');
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  }

  provideLiquidity = () => {
    return this.context.getPassword().then((password) => {
      const liquidityContract = new LiquidityContractService(password);

      this.setState({loading: true});

      const {platformAddress, provideLiquidityAmount, tokenAmount, selectedRow} = this.state;

      liquidityContract
        .provideLiquidity(
          platformAddress, selectedRow.managerAddress, provideLiquidityAmount, selectedRow.token, tokenAmount
        )
        .then(() => {
          notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
        })
        .catch((error) => {
          notifier.error('Error', 'Error providing liquidity.');
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  }

  removeManager = () => {
    return this.context.getPassword().then((password) => {
      const liquidityContract = new LiquidityContractService(password);

      this.setState({loading: true});

      const {platformAddress, selectedRow} = this.state;

      liquidityContract.removeManager(platformAddress, selectedRow.managerAddress)
        .then(() => {
          notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
        })
        .catch((error) => {
          notifier.error('Error', 'Error removing manager.');
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  }

  handleAction = (selected) => {
    const {indexLabel} = selected;

    this.setState({
      selectedRow: selected,
    });

    switch (indexLabel) {
    case RowActions.PROVIDE_LIQUIDITY: {
      this.handleProvideLiquidityModalOpen();
      break;
    }

    case RowActions.REMOVE_MANAGER: {
      this.removeManager();
      break;
    }
    }
  }

  handleProvideLiquidityModalOpen = () => {
    this.setState({provideLiquidityModalVisibility: true});
  };

  handleProvideLiquidityModalClose = () => {
    this.setState({
      provideLiquidityModalVisibility: false,
      provideLiquidityAmount: '',
      tokenAmount: '',
    });
  };

  handleChange = (e) => {
    this.setState({[e.target.name]: e.target.value});
  };

  render() {
    const {
      loading, managersPerformance, provideLiquidityModalVisibility, provideLiquidityAmount, tokenAmount,
    } = this.state;

    const rowActions = [];

    // eslint-disable-next-line guard-for-in
    for (const ref in RowActions) {
      rowActions.push(RowActions[ref]);
    }

    const rows = managersPerformance.map((element) => {
      element.action = (element.status !== '') ? (
        <TableDropdown dataObject={element}
          tableDropdownClass="tableDropDodownStyle"
          tableDropdownList={rowActions}
          onSelect={this.handleAction}
        />) : '';

      return element;
    });

    return (
      <div>
        {loading ? <Loader /> : ''}

        <section id="assetManagersList">
          <Row>
            <Col xs={12} sm={12} md={6} lg={6}>
              <h1 className="pageHeading">Managers</h1>
            </Col>
          </Row>
        </section>

        <section id="offersData">
          <div className="marginTop20">
            <UiTable thead={managersTableHeaders} tbodyData={rows} />
          </div>
        </section>

        <ModalCard title='Provide liquidity' visibility={provideLiquidityModalVisibility} modalSize='xs'
          onSubmit={this.provideLiquidity} onHide={this.handleProvideLiquidityModalClose}
        >
          <Row>
            <Col xs='12'>
              <TextInput
                placeholder="Liquidity amount"
                fieldType="text"
                value={provideLiquidityAmount}
                name='provideLiquidityAmount'
                onChange={this.handleChange}
              />
              <TextInput
                placeholder="Token amount"
                fieldType="text"
                value={tokenAmount}
                name='tokenAmount'
                onChange={this.handleChange}
              />
            </Col>
          </Row>
        </ModalCard>
      </div>
    );
  }
}

export default withRouter(AssetManagersList);
