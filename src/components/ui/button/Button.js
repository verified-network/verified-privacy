import React, {Component} from 'react';
import Button from 'react-bootstrap/Button';
import './button.less';
import PropTypes from 'prop-types';

class UiButton extends Component {
  render() {
    const {buttonClass, buttonLink, buttonText, buttonVariant, onClick, ...prop} = this.props;

    return (
      <Button variant={buttonVariant} className={buttonClass} href={buttonLink} {...prop} onClick={onClick}>
        {buttonText}
      </Button>
    );
  }
}

UiButton.propTypes = {
  buttonVariant: PropTypes.string.isRequired,
  buttonText: PropTypes.string,
  buttonClass: PropTypes.string,
  buttonLink: PropTypes.string,
};

export default UiButton;
