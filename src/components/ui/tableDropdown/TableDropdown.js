import React, {Component} from 'react';
import {Dropdown} from 'react-bootstrap';
import './tabledropdown.less';
import PropTypes from 'prop-types';

class Tabledropdown extends Component {
  onSelect = (index) => {
    const {dataObject} = this.props;

    const sep = index.split(/[@]+/);

    const indexNumber = sep[0];
    const indexLabel = sep[1];

    this.props.onSelect({index: indexNumber, indexLabel, ...dataObject});
  }

  render() {
    const {tableDropdownClass, tableDropdownList} = this.props;

    return (
      <Dropdown title="..." className={tableDropdownClass} onSelect={(index) => this.onSelect(index)}>
        <Dropdown.Toggle variant="success" id="dropdown-basic">---</Dropdown.Toggle>

        <Dropdown.Menu style={{'height': 'fit-content'}}>
          {tableDropdownList.map((value, index) => {
            return <Dropdown.Item key={index} eventKey={`${index}@${value}`}>{value}</Dropdown.Item>;
          })}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

Tabledropdown.propTypes = {
  tableDropdownClass: PropTypes.string.isRequired,
  tableDropdownList: PropTypes.array.isRequired,
};

export default Tabledropdown;
