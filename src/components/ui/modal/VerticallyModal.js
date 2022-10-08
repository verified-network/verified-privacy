import React, {Component} from 'react';
import {Modal, Row} from 'react-bootstrap';
import PropTypes from 'prop-types';
import './modal.less';

class VerticallyModal extends Component {
  render() {
    const {
      modalText, showModal, modalOnHide, modalHeading, modalSize, modalButton01, modalButton02, children, closeButton,
      withFooter, style,
    } = this.props;

    return (
      <Modal show={showModal} onHide={modalOnHide} centered size={modalSize} backdrop="static" style={style}>
        <Modal.Header closeButton={closeButton !== false}>
          <Modal.Title>{modalHeading}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{display: `${children ? 'block' : 'none'}`}}>
          {modalText}
          {children}
        </Modal.Body>
        {withFooter !== false ? (
          <Modal.Footer>
            <Row>
              {modalButton01}
              {modalButton02}
            </Row>
          </Modal.Footer>
        ) : ''}
      </Modal>
    );
  }
}

VerticallyModal.propTypes = {
  showModal: PropTypes.any,
  modalOnHide: PropTypes.any,
  modalText: PropTypes.any,
  modalHeading: PropTypes.any,
  modalSize: PropTypes.any,
  modalButton01: PropTypes.any,
  modalButton02: PropTypes.any,
  children: PropTypes.any,
};

export default VerticallyModal;
