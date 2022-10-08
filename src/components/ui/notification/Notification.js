import React, {Component} from 'react';
import '../../../styles/typo.css';
import {Popover, OverlayTrigger} from 'react-bootstrap';
import '../../../components/ui/navbar/header.less';
import PropTypes from 'prop-types';


class Notification extends Component {
  // constructor() {
  //   super();
  //   this.state = {
  //     show: ''
  //   };
  // }
  render() {
    const {tooltiptext, Icon} = this.props;
    return (
      <OverlayTrigger
        trigger="click"
        placement="bottom"
        overlay={
          <Popover>
            <Popover.Title></Popover.Title>
            <Popover.Content>
              {tooltiptext}
            </Popover.Content>
          </Popover>
        }
      >
        {Icon}
      </OverlayTrigger>
    );
  }
}
Notification.propTypes = {
  targetList: PropTypes.any,
  showTooltip: PropTypes.any,
  tooltiptext: PropTypes.any,
  Icon: PropTypes.any,
};
export default Notification;
