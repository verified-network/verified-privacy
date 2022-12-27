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
import Revenues from 'components/layouts/Issuer/Revenues';
import RevenuesPublic from 'components/layouts/Issuer/RevenuesPublic';

class SidebarMenu extends React.Component {
  constructor() {
    super();

    this.state = {
      revenuesModalVisibility: false,
      revenuesPublicModalVisibility: false,
    };
  }

  forRoles = (roles, content) => {
    const {role} = this.props;

    if ((roles.length > 0 && roles[0] === '*') || roles.includes(role)) {
      return content;
    }
  }

  redirectTo = (url, state = {}) => {
    this.props.history.push(url, state);
  }

  handleRevenuesModalOpen = () => {
    this.setState({revenuesModalVisibility: true});
  };

  handleRevenuesModalClose = () => {
    this.setState({revenuesModalVisibility: false});
  };

  handleRevenuesPublicModalOpen = () => {
    this.setState({revenuesPublicModalVisibility: true});
  };

  handleRevenuesPublicModalClose = () => {
    this.setState({revenuesPublicModalVisibility: false});
  };

  render() {
    const {toggled, collapsed, handleToggleSidebar} = this.props;
    const {revenuesModalVisibility, revenuesPublicModalVisibility} = this.state;

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
              {this.forRoles(['*'], (
                <MenuItem onClick={() => this.redirectTo('/issuer/transactions')}>Transactions</MenuItem>
              ))}

              {this.forRoles(['Admin', 'KYCAML'], (
                <MenuItem onClick={() => this.redirectTo('/issuer/organization')} >Organization</MenuItem>
              ))}

              {this.forRoles(['DP'], (
                <MenuItem onClick={() => this.redirectTo('/issuer/users')}>Users</MenuItem>
              ))}


              {this.forRoles(['Custodian', 'DP'], (
                <SubMenu title='Requests' defaultOpen='true'>
                  {this.forRoles(['DP'], (
                    <>
                      <MenuItem onClick={() => this.redirectTo('/issuer/transfer_requests')}>
                          Transfer requests
                      </MenuItem>
                      <MenuItem onClick={() => this.redirectTo('/issuer/primary_issue_requests')}>
                          Primary issue requests
                      </MenuItem>
                      <MenuItem onClick={() => this.redirectTo('/issuer/secondary_issue_requests')}>
                          Secondary issue requests
                      </MenuItem>
                    </>
                  ))}

                  {this.forRoles(['Custodian'], (
                    <>
                      <MenuItem onClick={() => this.redirectTo('/issuer/issue_requests')}>
                          Issue requests
                      </MenuItem>
                      <MenuItem onClick={() => this.redirectTo('/issuer/withdrawal_requests')}>
                          Withdrawal requests
                      </MenuItem>
                    </>
                  ))}
                </SubMenu>
              ))}

              {this.forRoles(['DP'], (
                <SubMenu title='Service assets' open='true'>
                  <MenuItem onClick={() => this.redirectTo('/issuer/issues')}>Issues</MenuItem>
                </SubMenu>
              ))}

              {this.forRoles(['AM'], (
                <MenuItem onClick={() => this.redirectTo('/issuer/liquidity')}>Liquidity</MenuItem>
              ))}

              {this.forRoles(['Admin'], (
                <>
                  <MenuItem onClick={() => this.redirectTo('/issuer/admin_liquidity')}>Liquidity</MenuItem>
                  <MenuItem onClick={() => this.redirectTo('/issuer/asset_managers')}>Asset managers</MenuItem>
                  <SubMenu title='Revenues' open='true'>
                    <MenuItem onClick={this.handleRevenuesPublicModalOpen}>Public network</MenuItem>
                    <MenuItem onClick={this.handleRevenuesModalOpen}>Private network</MenuItem>
                  </SubMenu>
                  <SubMenu title='Revenue shareholders' open='true'>
                    <MenuItem onClick={() => this.redirectTo('/issuer/revenue_shareholders_public')}>
                      Public network
                    </MenuItem>
                    <MenuItem onClick={() => this.redirectTo('/issuer/revenue_shareholders')}>
                      Private network
                    </MenuItem>
                  </SubMenu>
                  <MenuItem onClick={() => this.redirectTo('/issuer/fee_rates')}>Fee rates</MenuItem>
                </>
              ))}
            </Menu>
          </SidebarContent>
        </ProSidebar>

        <Revenues
          modalVisibility={revenuesModalVisibility}
          onModalHide = {this.handleRevenuesModalClose}
        />

        <RevenuesPublic
          modalVisibility={revenuesPublicModalVisibility}
          onModalHide = {this.handleRevenuesPublicModalClose}
        />
      </>
    );
  }
}
export default withRouter(SidebarMenu);
