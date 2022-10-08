import React, {Component} from 'react';
import {Col, Row, ListGroup, Card} from 'react-bootstrap';
import '../../cardList/cardList.less';
import UiButton from '../../button/Button';


class InvestorIssuesCard extends Component {
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
                  <p className="listgroupNameHead"> ISIN number/Product </p>
                  <p className="listgroupDetails">INE09000023</p>
                </Col>
                <Col sm={2}>
                  <p className="listgroupNameHead"> Issuer </p>
                  <p className="listgroupDetails"> SREI Finance</p>
                </Col>
                <Col sm={4}>
                  <p className="listgroupNameHead">Amount paid for issue</p>
                  <p className="listgroupDetails">INR 5000</p>
                </Col>

                <Col className="d-flex justify-content-end" sm={2}>
                  <UiButton
                    buttonLink=""
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

export default InvestorIssuesCard;
