import React, {Component} from 'react';
import {Col, Row, ListGroup, Card} from 'react-bootstrap';
import '../../cardList/cardList.less';


class IssuerPaymentsCard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Row>
        <Card className="listGroupCard marginBottom15">
          <Card.Body className="listgroupPadding">
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-space align-items-center listgroupCardPadding">

                <Col sm={3}>
                  <p className="listgroupNameHead"> Order ID </p>
                  <p className="listgroupDetails">87111022</p>
                </Col>
                <Col sm={3}>
                  <p className="listgroupNameHead"> Beneficiary </p>
                  <p className="listgroupDetails"> J Stone</p>
                </Col>
                <Col sm={4}>
                  <p className="listgroupNameHead">Amount</p>
                  <p className="listgroupDetails">GBP 4500</p>
                </Col>
                <Col sm={2} className="d-flex justify-content-center flex-column" >
                  <p className="listgroupNameHead">Status</p>
                  <p className="listgroupDetails">Confirmed</p>
                </Col>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </Row>
    );
  }
}

export default IssuerPaymentsCard;

