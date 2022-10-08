import React from 'react';
import {withRouter} from 'react-router-dom';

import {
  ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
  SidebarContent,
} from 'react-pro-sidebar';

import 'react-pro-sidebar/dist/css/styles.css';
import '../../../styles/css/sidebar.css';

import MakePayment from './MakePayment';
import AddOrBorrowMoney, {MoneyScreenMode} from './AddOrBorrowMoney';
import Withdraw from './Withdraw';
import ExchangeCurrency from './ExchangeCurrency';

class SidebarMenu extends React.Component {
  constructor() {
    super();

    this.state = {
      makePaymentModalVisibility: false,
      addMoneyModalVisibility: false,
      withdrawModalVisibility: false,
      exchangeModalVisibility: false,
      borrowMoneyModalVisibility: false,
      registerAccountModalVisibility: false,
    };
  }

  handleMakePaymentModalOpen = () => {
    this.setState({makePaymentModalVisibility: true});
  };

  handleMakePaymentModalClose = () => {
    this.setState({makePaymentModalVisibility: false});
  };

  handleAddMoneyModalOpen = () => {
    this.setState({addMoneyModalVisibility: true});
  };

  handleAddMoneyModalClose = () => {
    this.setState({addMoneyModalVisibility: false});
  };

  handleWithdrawModalOpen = () => {
    this.setState({withdrawModalVisibility: true});
  };

  handleWithdrawModalClose = () => {
    this.setState({withdrawModalVisibility: false});
  };

  handleExchangeModalOpen = () => {
    this.setState({exchangeModalVisibility: true});
  };

  handleExchangeModalClose = () => {
    this.setState({exchangeModalVisibility: false});
  };

  handleBorrowMoneyModalOpen = () => {
    this.setState({borrowMoneyModalVisibility: true});
  };

  handleBorrowMoneyModalClose = () => {
    this.setState({borrowMoneyModalVisibility: false});
  };

  handleRegisterAccountModalOpen = () => {
    this.setState({registerAccountModalVisibility: true});
  };

  handleRegisterAccountModalClose = () => {
    this.setState({registerAccountModalVisibility: false});
  };

  redirectTo = (url) => {
    this.props.history.push(url);
  };

  render() {
    const {
      makePaymentModalVisibility, addMoneyModalVisibility, withdrawModalVisibility, exchangeModalVisibility,
      borrowMoneyModalVisibility,
    } = this.state;

    const {toggled, collapsed, handleToggleSidebar} = this.props;

    return (
      <>
        <ProSidebar
          collapsed={collapsed}
          toggled={toggled}
          breakPoint="lg"
          onToggle={handleToggleSidebar}
          className='card mt-0 pt-0'
          style={{'backgroundColor': 'white'}}
        >
          {/* <SidebarHeader>
          <div
            style={{
              padding: '24px',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              fontSize: 14,
              letterSpacing: '1px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            0x7079C0a4CFECf0B575eaF7C103AfA197e847B217
          </div>
        </SidebarHeader> */}

          <SidebarContent>
            <Menu>
              <SubMenu title='Pay' onOpenChange={() => this.redirectTo('/investor/pay')}>
                <MenuItem onClick={this.handleAddMoneyModalOpen}>Add money</MenuItem>
                <MenuItem onClick={this.handleMakePaymentModalOpen}>Make payment</MenuItem>
                <MenuItem onClick={this.handleWithdrawModalOpen}>Withdraw money</MenuItem>
                <MenuItem onClick={this.handleExchangeModalOpen}>Exchange currency</MenuItem>
              </SubMenu>

              <SubMenu title='Finance'
                onOpenChange={() => this.redirectTo('/investor/finance')}>
                <MenuItem>Credit score</MenuItem>
                <MenuItem onClick={this.handleBorrowMoneyModalOpen}>Borrow money</MenuItem>

                <MenuItem onClick={() => this.redirectTo('/investor/products')}>Issue security</MenuItem>

                <SubMenu title='Service assets' 
                  onOpenChange={() => this.redirectTo('/investor/service_assets')}>
                  <MenuItem onClick={() => this.redirectTo('/investor/issues')}>Issues</MenuItem>
                </SubMenu>
              </SubMenu>

              <SubMenu title='Invest' onOpenChange={() => this.redirectTo('/investor/invest')}>
                <MenuItem onClick={() => this.redirectTo('/investor/register_account')}>
                  Register account
                </MenuItem>

                <MenuItem onClick={() => this.redirectTo('/investor/register_existing_product')}>
                  Register security
                </MenuItem>

                <MenuItem onClick={() => this.redirectTo('/investor/orders')}>Orders</MenuItem>

                <MenuItem onClick={() => this.redirectTo('/investor/portfolio')}>Portfolio</MenuItem>
              </SubMenu>
            </Menu>
          </SidebarContent>
        </ProSidebar>

        <MakePayment
          modalVisibility={makePaymentModalVisibility}
          onModalHide = {this.handleMakePaymentModalClose}
        />

        <AddOrBorrowMoney
          mode = {MoneyScreenMode.ADD_MONEY}
          modalVisibility={addMoneyModalVisibility}
          onModalHide = {this.handleAddMoneyModalClose}
        />

        <Withdraw
          modalVisibility={withdrawModalVisibility}
          onModalHide = {this.handleWithdrawModalClose}
        />

        <ExchangeCurrency
          modalVisibility={exchangeModalVisibility}
          onModalHide = {this.handleExchangeModalClose}
        />

        <AddOrBorrowMoney
          mode = {MoneyScreenMode.BORROW_MONEY}
          modalVisibility={borrowMoneyModalVisibility}
          onModalHide = {this.handleBorrowMoneyModalClose}
        />
      </>
    );
  }
}

export default withRouter(SidebarMenu);
