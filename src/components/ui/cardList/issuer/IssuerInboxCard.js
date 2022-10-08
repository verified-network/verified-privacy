import React, {Component} from 'react';
import {Col, Row, ListGroup, Card} from 'react-bootstrap';
import '../cardList.less';
import UiButton from '../../button/Button';
import {withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';


class IssuerInboxCard extends Component {
  constructor(props) {
    super(props);
  }

  onViewDetails = () => {
    const {tab, path} = this.props;
    if (tab === 'kyc_requests') {
      this.props.history.push(path);
    } else {
      this.props.history.push(path, {tab});
    }
  };

  render() {
    const {buttonlabel} = this.props;
    return (
      <Row>
        <Card className="listGroupCard marginBottom15">
          <Card.Body className="listgroupPadding">
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-around align-items-center  listgroupCardPadding">
                <Col sm={2}>
                  <p className="listgroupNameHead">ISIN number </p>
                  <p className="listgroupDetails">INE09000023</p>
                </Col>
                <Col sm={2}>
                  <p className="listgroupNameHead"> Issuer </p>
                  <p className="listgroupDetails">SREI Finance</p>
                </Col>
                <Col sm={2}>
                  <p className="listgroupNameHead">Amount Paid </p>
                  <p className="listgroupDetails">INR 5000</p>
                </Col>
                <Col sm={2}>
                  <p className="listgroupNameHead">Status</p>
                  <p className="listgroupDetails">Pending</p>
                </Col>

                <Col className="d-flex justify-content-center" sm={2}>
                  <UiButton
                    onClick={this.onViewDetails}
                    buttonText={buttonlabel}
                    buttonClass="SignUpButton"
                    buttonVariant="primary"
                  />
                </Col>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </Row>
    );
  }
}
UiButton.propTypes = {
  cardNameText: PropTypes.string,
  cardDescText: PropTypes.string,
  cardInfoText: PropTypes.string,


};
export default withRouter(IssuerInboxCard);

