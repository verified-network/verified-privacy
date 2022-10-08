require('normalize.css/normalize.css');
require('styles/App.css');

import React from 'react';
import {Form} from 'react-bootstrap';
import './textinput.less';
import PropTypes from 'prop-types';

class TextInput extends React.Component {
  render() {
    const {fieldType, placeholder, value, onChange, name, readOnly, onKeyPress, disabled} = this.props;

    return (
      <Form.Control
        type={fieldType}
        placeholder={placeholder}
        className="textForm"
        value={value}
        name={name}
        onChange={onChange}
        readOnly={readOnly}
        onKeyPress={onKeyPress}
        disabled={disabled}
      />
    );
  }
}

TextInput.propTypes = {
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  fieldType: PropTypes.string,
};

export default TextInput;
