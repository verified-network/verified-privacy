import React, {Component} from 'react';
import {Col, Row, ListGroup, Card} from 'react-bootstrap';
import '../cardList.less';
import UiButton from '../../button/Button';
import {withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';


class IssuerDepositCard extends Component {
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
                <Col sm={2}>
                  <p className="listgroupNameHead">ISIN number </p>
                  <p className="listgroupDetails">Via</p>
                </Col>
                <Col sm={2}>
                  <p className="listgroupNameHead"> Investor </p>
                  <p className="listgroupDetails">Robert Stumper</p>
                </Col>
                <Col sm={3}>
                  <p className="listgroupNameHead">Amount to be deposited</p>
                  <p className="listgroupDetails">USD 5000</p>
                </Col>
                <Col sm={2}>
                  <p className="listgroupNameHead">Status</p>
                  <p className="listgroupDetails">Pending</p>
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
export default withRouter(IssuerDepositCard);

