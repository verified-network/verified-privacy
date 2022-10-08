import React, {Component} from 'react';
import {Col, Row, ListGroup, Card} from 'react-bootstrap';
import '../cardList.less';
import UiButton from '../../button/Button';
import {withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';

class InvestorQuotesCard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Row>
        <Card className="listGroupCard marginBottom15">
          <Card.Body className="listgroupPadding">
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-around align-items-center  listgroupCardPadding">
                <Col sm={3}>
                  <p className="listgroupNameHead">Order ID </p>
                  <p className="listgroupDetails">77800901</p>
                </Col>
                <Col sm={3}>
                  <p className="listgroupNameHead"> ISIN/Product </p>
                  <p className="listgroupDetails">US100A99001</p>
                </Col>
                <Col sm={3}>
                  <p className="listgroupNameHead">Counterparty</p>
                  <p className="listgroupDetails">ABC Inc</p>
                </Col>
                <Col className="d-flex justify-content-center" sm={2}>
                  <UiButton
                    onClick={this.onViewDetails}
                    buttonText="View Details"
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
export default withRouter(InvestorQuotesCard);
