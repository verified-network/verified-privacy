import React, {Component} from 'react';
import './card.less';
import VerticallyModal from 'components/ui/modal/VerticallyModal';
import UiButton from 'components/ui/button/Button';

class ModalCard extends Component {
  constructor(props) {
    super(props);
  }

  handleHide = () => {
    this.props.onHide();
  };

  handleSubmit = () => {
    this.props.onSubmit();
  };

  render() {
    const {children, title, visibility, modalSize, buttonLabel, withFooter} = this.props;

    return (
      <>
        <VerticallyModal
          key="requestIssue"
          showModal={visibility}
          modalOnHide={this.handleHide}
          modalSize={modalSize || 'lg'}
          modalHeading={<h3>{title}</h3>}
          modalButton01={
            <UiButton
              buttonVariant="primary"
              buttonClass="SignUpButton"
              buttonText={buttonLabel || 'Submit'}
              type="submit"
              onClick={this.handleSubmit}
            />
          }
          withFooter={withFooter}
        >
          {children}
        </VerticallyModal>
      </>
    );
  }
}

export default ModalCard;
