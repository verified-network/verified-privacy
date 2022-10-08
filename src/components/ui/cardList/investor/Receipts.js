import React, {Component} from 'react';
import {Col, Row, ListGroup, Card} from 'react-bootstrap';
import '../../cardList/cardList.less';
import {withRouter} from 'react-router-dom';

class InvestorReceiptsCard extends Component {
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
                <Col sm={2}>
                  <p className="listgroupNameHead"> Order ID </p>
                  <p className="listgroupDetails">11230028</p>
                </Col>
                <Col sm={2}>
                  <p className="listgroupNameHead"> Issuer </p>
                  <p className="listgroupDetails"> SREI Finance</p>
                </Col>
                <Col sm={3}>
                  <p className="listgroupNameHead">Payer </p>
                  <p className="listgroupDetails"> U&C Pte</p>
                </Col>
                <Col sm={3}>
                  <p className="listgroupNameHead">Amount </p>
                  <p className="listgroupDetails"> SGD 8900</p>
                </Col>
                <Col className="d-flex justify-content-end flex-column" sm={2}>
                  <p className="listgroupNameHead">Status </p>
                  <p className="listgroupDetails">  Confirmed</p>
                </Col>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </Row>
    );
  }
}

export default withRouter(InvestorReceiptsCard);
