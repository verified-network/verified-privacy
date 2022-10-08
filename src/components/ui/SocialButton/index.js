import React, {Component} from 'react';
import './button.less';

class SocialButton extends Component {
  render() {
    const {buttonLink, buttonText, imgSrc} = this.props;
    return (
      <a href={buttonLink}>
        <span type={undefined} className='btn socialBtn'>
          <img src={imgSrc} alt='' />
          {buttonText}
        </span>
      </a>
    );
  }
}

export default SocialButton;
