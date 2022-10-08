require('normalize.css/normalize.css');
require('styles/App.css');

import React from 'react';
import {Form} from 'react-bootstrap';
import './textinput.less';
import PropTypes from 'prop-types';


class TextInputReadOnly extends React.Component {
  render() {
    const fieldType = this.props.fieldType;
    const placeholder = this.props.placeholder;
    return (
      <Form.Control type={fieldType} placeholder={placeholder} className="placeholderReadOnly textForm" readOnly/>
    );
  }
}

TextInputReadOnly.propTypes = {
  placeholder: PropTypes.string.isRequired,
  fieldType: PropTypes.string,
};

export default TextInputReadOnly;
