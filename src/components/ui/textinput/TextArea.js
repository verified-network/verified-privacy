require('normalize.css/normalize.css');
require('styles/App.css');

import React from 'react';
import {Form} from 'react-bootstrap';
import './textinput.less';
import PropTypes from 'prop-types';


class TextArea extends React.Component {
  render() {
    const placeholder = this.props.placeholder;
    return (
      <Form.Control as="textarea" rows="4" placeholder={placeholder} className="textAreaDisabled" readOnly/>
    );
  }
}

TextArea.propTypes = {
  placeholder: PropTypes.string,
};

export default TextArea;
