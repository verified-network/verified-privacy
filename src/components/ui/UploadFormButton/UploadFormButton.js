import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import React, {Component} from 'react';
import {Form} from 'react-bootstrap';
import PropTypes from 'prop-types';

class UploadFormButton extends Component {
  render() {
    const {placeholderText, onChange, value, accept} = this.props;

    return (
      <InputGroup className="mb-3">
        <FormControl
          placeholder="Upload File"
          aria-label="Add"
          aria-describedby="basic-addon2"
          type="file"
          className="custom-file-input"
          onChange={onChange}
          accept={accept}
        />

        <Form.Label className="custom-file-label" htmlFor="customFile">
          {value || placeholderText}
        </Form.Label>
      </InputGroup>
    );
  }
}

UploadFormButton.propTypes = {
  placeholderText: PropTypes.string.isRequired,
};

export default UploadFormButton;
