import React, {Component} from 'react';
import {Col, Row, ListGroup, Card} from 'react-bootstrap';
import '../cardList.less';

class InvestorInterestsCard extends Component {
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
                  <p className="listgroupNameHead">Transaction ID</p>
                  <p className="listgroupDetails">11000028</p>
                </Col>
                <Col sm={3}>
                  <p className="listgroupNameHead"> Interest </p>
                  <p className="listgroupDetails">Credit USD 125</p>
                </Col>
                <Col sm={4}>
                  <p className="listgroupNameHead">Type</p>
                  <p className="listgroupDetails">Deposit</p>
                </Col>
                <Col className="d-flex justify-content-center flex-column" sm={2}>
                  <p className="listgroupNameHead">Payer</p>
                  <p className="listgroupDetails">UOB Bank</p>
                </Col>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </Row>
    );
  }
}

export default InvestorInterestsCard;
