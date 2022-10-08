import React, {Component} from 'react';
import {Form} from 'react-bootstrap';
import PropTypes from 'prop-types';

class FormSelector extends Component {
  render() {
    const {
      selectorClass,
      optionsValue,
      onChange,
      disabled,
      name,
      value,
    } = this.props;
    return (
      <Form.Row>
        <Form.Control
          as="select"
          placeholder="select"
          className={selectorClass}
          defaultValue=""
          onChange={onChange}
          disabled={disabled}
          name={name}
          value={value}
        >
          {optionsValue.map((element, index) => {
            if (typeof element === 'object') {
              return <option value={index === 0 ? '' : element.value} key={index}
                disabled={index === 0 ? 'true' : null}>
                {element.title}
              </option>;
            } else {
              return <option value={index === 0 ? '' : element} key={index} disabled={index === 0 ? 'true' : null}>
                {element}
              </option>;
            }
          })}
        </Form.Control>
      </Form.Row>
    );
  }
}

FormSelector.propTypes = {
  optionsValue: PropTypes.array,
  selectorClass: PropTypes.string,
};

export default FormSelector;
