import React, {Component} from 'react';
import {Nav} from 'react-bootstrap';
import './verticaltabs.less';
import PropTypes from 'prop-types';

class VerticalTabs extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {tabData, onSelect} = this.props;

    return (
      <Nav
        key="verticalNav"
        variant="pills"
        className="flex-column tabsTitle"
        onSelect={onSelect}
      >
        {tabData.map((object, index ) => {
          return (
            <Nav.Item key={index}>
              <Nav.Link eventKey={object.tabkey}>{object.text}</Nav.Link>
            </Nav.Item>
          );
        })}
      </Nav>
    );
  }
}
VerticalTabs.propTypes = {
  navText: PropTypes.string,
  navEvent: PropTypes.string,
};
export default VerticalTabs;
