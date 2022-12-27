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

class SidebarMenu extends React.Component {
  constructor() {
    super();

    /*this.state = {
      makePaymentModalVisibility: false,
      addMoneyModalVisibility: false,
      withdrawModalVisibility: false,
      exchangeModalVisibility: false,
      borrowMoneyModalVisibility: false,
      registerAccountModalVisibility: false,
    };*/
  }

  /*handleRegisterAccountModalOpen = () => {
    this.setState({registerAccountModalVisibility: true});
  };

  handleRegisterAccountModalClose = () => {
    this.setState({registerAccountModalVisibility: false});
  };*/

  redirectTo = (url) => {
    this.props.history.push(url);
  };

  render() {
    /*const {
      makePaymentModalVisibility, addMoneyModalVisibility, withdrawModalVisibility, exchangeModalVisibility,
      borrowMoneyModalVisibility,
    } = this.state;*/

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

              <SubMenu title='Issue new security'>

                <MenuItem onClick={() => this.redirectTo('/issuer/RegisterNewProduct')}>Issue security</MenuItem>

                <SubMenu title='Service assets'>
                  <MenuItem onClick={() => this.redirectTo('/issuer/issues')}>Issues</MenuItem>
                </SubMenu>
              </SubMenu>

              <SubMenu title='Register secondaries' >
                <MenuItem onClick={() => this.redirectTo('/issuer/RegisterExistingProduct')}>
                Register security
                </MenuItem>

              </SubMenu>
            </Menu>
          </SidebarContent>
        </ProSidebar>

        
      </>
    );
  }
}

export default withRouter(SidebarMenu);
