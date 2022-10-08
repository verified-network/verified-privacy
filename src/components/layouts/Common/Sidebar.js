import React from 'react';
import { FaBars } from 'react-icons/fa';
import InvestorSidebarMenu from '../Investor/SidebarMenu';

class Sidebar extends React.Component {
  constructor() {
    super();

    this.state = {
      toggled: false,
    };
  }

  handleToggleSidebar = (value) => {
    this.setState({ toggled: value });
  };

  render() {
    const { toggled, collapsed } = this.state;
    const { group, role } = this.props;

    const SidebarMenu = group === 'investor' ? InvestorSidebarMenu : InvestorSidebarMenu;

    return (
      <>
        <div className={`app ${toggled ? 'toggled' : ''}`}>
          <SidebarMenu
            collapsed={collapsed}
            toggled={toggled}
            handleToggleSidebar={this.handleToggleSidebar}
            role={role}
          />

          <main style={{ padding: '0px 5% 0px 5%', overflow: 'auto' }} className='w-100 mb-5'>
            <div className="btn-toggle mt-2" onClick={() => this.handleToggleSidebar(true)}>
              <FaBars />
            </div>
            <div className='w-100'>
              {this.props.main}
            </div>
          </main>
        </div>
      </>
    );
  }
}

export default Sidebar;
