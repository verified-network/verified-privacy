import React, {Component} from 'react';
import {Col, Form, Row} from 'react-bootstrap';
import UiTable from '../../ui/table/Table';
import '../../../styles/css/organization.less';
import '../../../styles/css/order.less';
import Loader from '../../ui/Loader';
import notifier from 'components/ui/notifier';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import ProductContractService from 'sources/contracts/ProductContractService';
import {withRouter} from 'react-router-dom';
import TableDropdown from 'components/ui/tableDropdown/TableDropdown';
import TextInput from 'components/ui/textinput/TextInput';
import VerticallyModal from 'components/ui/modal/VerticallyModal';
import UiButton from 'components/ui/button/Button';
import ModalCard from 'components/ui/card/ModalCard';
import {MESSAGES} from 'sources/messages';

const liquidityHeader = [
  {label: 'Owner', val: 'owner'},
  {label: 'Owned', val: 'owned'},
  {label: 'Offered', val: 'amountOffered'},
  {label: 'Desired', val: 'amountDesired'},
  {label: 'Minimum', val: 'minimum'},
  {label: 'ISIN', val: 'isin'},
  {label: 'Action', val: 'action'},
];

const RowActions = {
  PRODUCT_DETAILS: 'Product details',
  OFFERS_MADE: 'Offers made',
  MAKE_OFFER: 'Make offer',
  UNDER_WRITTEN: 'Underwritten',
};

class Liquidity extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      platforms: [],
      selectedPlatform: '',
      offeredToken: '',
      allocation: '',
      offers: [],
      selectedOwnedAddress: '',
      offersModalVisibility: false,
      productDetailsModalVisibility: false,
      offerMadeModalVisibility: false,
      makeOfferModalVisibility: false,
      underwrittenModalVisibility: false,
      selectedRow: {},
      offerMade: {},
      currentSearch: {},
      makeOfferOfferedAmount: '',
      makeOfferDesiredAmount: '',
      makeOfferMinimumAmount: '',
      underwrittenData: {},
    };
  }

  componentDidMount = () => {
    this.loadPlatforms();
  }

  loadPlatforms = () => {
    return this.context.getPassword().then((password) => {
      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      productContract.getPlatforms()
        .then((platforms) => {
          this.setState({platforms});
        })
        .catch((error) => {
          notifier.error('Error', 'Error loading platforms.');
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  }

  loadAllocation = (selectedPlatform) => {
    return this.context.getPassword().then((password) => {
      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      productContract.getAllotedStake(selectedPlatform)
        .then((allocation) => {
          this.setState({allocation});
        })
        .catch((error) => {
          notifier.error('Error', 'Error loading allocation.');
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  }

  loadOffers = () => {
    return this.context.getPassword().then((password) => {
      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      const {selectedPlatform, offeredToken} = this.state;

      productContract.getOffered(selectedPlatform, offeredToken)
        .then((offers) => {
          this.setState({
            offers,
            currentSearch: {
              selectedPlatform,
              offeredToken,
            },
          });

          this.handleOffersModalClose();
        })
        .catch((error) => {
          notifier.error('Error', 'Error loading offers.');
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  }

  loadOfferMade = () => {
    return this.context.getPassword().then((password) => {
      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      const {currentSearch, selectedRow} = this.state;

      productContract.getOfferMade(currentSearch.selectedPlatform, currentSearch.offeredToken, selectedRow.owned)
        .then((offerMade) => {
          this.setState({offerMade});
          this.handleOffersModalClose();
        })
        .catch((error) => {
          notifier.error('Error', 'Error loading offers.');
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  }

  makeOffer = () => {
    return this.context.getPassword().then((password) => {
      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      const {
        currentSearch, selectedRow, makeOfferOfferedAmount, makeOfferDesiredAmount, makeOfferMinimumAmount,
      } = this.state;
      productContract
        .makeOffer(
          currentSearch.selectedPlatform, currentSearch.offeredToken, selectedRow.isin, makeOfferOfferedAmount,
          selectedRow.owned, makeOfferDesiredAmount, makeOfferMinimumAmount, selectedRow.owner
        )
        .then(() => {
          notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
        })
        .catch((error) => {
          notifier.error('Error', 'Error making offer.');
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  }

  loadUnderwritten() {
    return this.context.getPassword().then((password) => {
      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      const {currentSearch, selectedRow} = this.state;

      productContract
        .getLiquidityProviders(currentSearch.selectedPlatform, currentSearch.offeredToken, selectedRow.owned)
        .then((underwrittenData) => {
          this.setState({underwrittenData});
        })
        .catch((error) => {
          notifier.error('Error', 'Error loading underwritten data.');
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
    case RowActions.PRODUCT_DETAILS: {
      this.handleProductDetailsModalOpen();
      break;
    }

    case RowActions.OFFERS_MADE: {
      this.loadOfferMade();
      this.handleOfferMadeModalOpen();
      break;
    }

    case RowActions.MAKE_OFFER: {
      this.handleMakeOfferModalOpen();
      break;
    }

    case RowActions.UNDER_WRITTEN: {
      this.loadUnderwritten();
      this.handleUnderwrittenModalOpen();
      break;
    }
    }
  }

  handleProductDetailsModalOpen = () => {
    this.setState({productDetailsModalVisibility: true});
  };

  handleProductDetailsModalClose = () => {
    this.setState({productDetailsModalVisibility: false});
  };

  handleOffersModalOpen = () => {
    this.setState({offersModalVisibility: true});
  };

  handleOffersModalClose = () => {
    this.setState({
      offersModalVisibility: false,
      selectedPlatform: '',
      offeredToken: '',
    });
  };

  handleOfferMadeModalOpen = () => {
    this.setState({offerMadeModalVisibility: true});
  };

  handleOfferMadeModalClose = () => {
    this.setState({offerMadeModalVisibility: false});
  };

  handleMakeOfferModalOpen = () => {
    this.setState({makeOfferModalVisibility: true});
  };

  handleMakeOfferModalClose = () => {
    this.setState({makeOfferModalVisibility: false});
  };

  handleUnderwrittenModalOpen = () => {
    this.setState({underwrittenModalVisibility: true});
  };

  handleUnderwrittenModalClose = () => {
    this.setState({underwrittenModalVisibility: false});
  };

  handlePlatformChange = (e) => {
    const newValue = e.target.value;

    this.setState({
      selectedPlatform: newValue,
    });

    if (newValue) {
      this.loadAllocation(newValue);
    } else {
      this.setState({
        allocation: '',
      });
    }
  }

  handleChange = (e) => {
    this.setState({[e.target.name]: e.target.value});
  };

  render() {
    const {
      loading, platforms, selectedPlatform, allocation, offeredToken, offers, offersModalVisibility,
      productDetailsModalVisibility, offerMadeModalVisibility, selectedRow, offerMade, makeOfferModalVisibility,
      makeOfferOfferedAmount, makeOfferDesiredAmount, makeOfferMinimumAmount, underwrittenModalVisibility,
      underwrittenData,
    } = this.state;

    const rowActions = [];

    // eslint-disable-next-line guard-for-in
    for (const ref in RowActions) {
      rowActions.push(RowActions[ref]);
    }

    const rows = offers.map((element) => {
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
        <section id="liquidity">
          <Row>
            <Col xs={12} sm={12} md={6} lg={6}>
              <h1 className="pageHeading">Liquidity</h1>
            </Col>
          </Row>

          <Row className='d-flex align-items-end flex-column'>
            <UiButton buttonText="Find offers" buttonClass="SignUpButton managerBtn"
              buttonVariant="primary" onClick={this.handleOffersModalOpen}
            />
          </Row>
        </section>
        <section id="offersData">
          <div className="marginTop20">
            <UiTable thead={liquidityHeader} tbodyData={rows}/>
          </div>
        </section>

        <VerticallyModal
          key="findOffers" closeButton='true' showModal={offersModalVisibility} modalSize={'md'}
          modalOnHide={this.handleOffersModalClose} modalHeading={<h3>Find offers</h3>}
          modalButton01={<UiButton buttonText="Find" buttonClass="SignUpButton" buttonVariant="primary"
            onClick={this.loadOffers}/>}
        >
          <Row>
            <Col xs='12'>
              <Form.Control
                as="select"
                placeholder="Select"
                className="textForm custom-select dropdown"
                name='selectedPlatform'
                onChange={this.handlePlatformChange}
                value={selectedPlatform}
              >
                <option value="">
                  Platform
                </option>
                {platforms.map((platform) => {
                  return (
                    <option key={platform.address} value={platform.address}>{platform.name}</option>
                  );
                })}
              </Form.Control>
            </Col>

            <Col xs='12'>
              <TextInput
                placeholder="Offered token"
                fieldType="text"
                name='offeredToken'
                value={offeredToken}
                onChange={this.handleChange}
              />
            </Col>

            <hr/>

            <Col xs='12' style={{'textAlign': 'left'}} className="marginTop20">
              Allocation: {allocation || 'Select platform'}
            </Col>
          </Row>
        </VerticallyModal>

        <ModalCard title='Offer made' visibility={offerMadeModalVisibility} modalSize='md' buttonLabel='Close'
          onSubmit={this.handleOfferMadeModalClose} onHide={this.handleOfferMadeModalClose}
        >
          <Row>
            <Col xs='12' style={{'text-align': 'left'}}>
              Offered amount: {offerMade['amountOffered']}
            </Col>
            <Col xs='12' style={{'text-align': 'left'}}>
              Desired amount: {offerMade['amountDesired']}
            </Col>
            <Col xs='12' style={{'text-align': 'left'}}>
              Minimum amount: {offerMade['minimum']}
            </Col>
          </Row>
        </ModalCard>

        <ModalCard title='Make offer' visibility={makeOfferModalVisibility} modalSize='md'
          onSubmit={this.makeOffer} onHide={this.handleMakeOfferModalClose}>
          <Row>
            <Col xs='12'>
              <TextInput
                placeholder="Offered amount"
                fieldType="text"
                value={makeOfferOfferedAmount}
                name={'makeOfferOfferedAmount'}
                onChange={this.handleChange}
              />
            </Col>

            <Col xs='12'>
              <TextInput
                placeholder="Desired amount"
                fieldType="text"
                value={makeOfferDesiredAmount}
                name='makeOfferDesiredAmount'
                onChange={this.handleChange}
              />
            </Col>

            <Col xs='12'>
              <TextInput
                placeholder="Minimum amount"
                fieldType="text"
                value={makeOfferMinimumAmount}
                name={'makeOfferMinimumAmount'}
                onChange={this.handleChange}
              />
            </Col>
          </Row>
        </ModalCard>

        <ModalCard title='Underwritten data' visibility={underwrittenModalVisibility} modalSize='md' buttonLabel='Close'
          onSubmit={this.handleUnderwrittenModalClose} onHide={this.handleUnderwrittenModalClose}
        >
          <Row>
            <Col xs='12' style={{'text-align': 'left'}}>
              Underwritten: {underwrittenData['underwritten']}
            </Col>
            <Col xs='12' style={{'text-align': 'left'}}>
              Subscribed: {underwrittenData['subscribed']}
            </Col>
            <Col xs='12' style={{'text-align': 'left'}}>
              Earned: {underwrittenData['earned']}
            </Col>
          </Row>
        </ModalCard>
      </div>
    );
  }
}

export default withRouter(Liquidity);
