import React, {Component} from 'react';
import {DropdownButton, Dropdown} from 'react-bootstrap';
import './dropdown.less';
import PropTypes from 'prop-types';

class UiDropdown extends Component {
  render() {
    const dropdownVariant = this.props.dropdownVariant;
    const dropdownData = this.props.dropdownData;
    const dropdownTitle = this.props.dropdownTitle;
    const dropdownClass = this.props.dropdownClass;
    const onSelect = this.props.onSelect;

    return (
      <DropdownButton
        variant={dropdownVariant}
        title={dropdownTitle}
        className={dropdownClass}
        onSelect={onSelect}
      >
        {dropdownData.map((value, index) => {
          return <Dropdown.Item key={index}>{value}</Dropdown.Item>;
        })}
      </DropdownButton>
    );
  }
}
UiDropdown.propTypes = {
  dropdownVariant: PropTypes.string.isRequired,
  dropdownData: PropTypes.array.isRequired,
  dropdownTitle: PropTypes.string.isRequired,
  dropdownClass: PropTypes.string,
};

export default UiDropdown;
