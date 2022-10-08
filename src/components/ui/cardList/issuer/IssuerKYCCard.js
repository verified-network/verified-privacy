import React, {Component} from 'react';
import {Col, Row, ListGroup, Card} from 'react-bootstrap';
import '../../cardList/cardList.less';
import UiButton from '../../button/Button';
import {withRouter} from 'react-router-dom';


class IssuerKYCCard extends Component {
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
                  <p className="listgroupNameHead"> Investor </p>
                  <p className="listgroupDetails">S Kumar</p>
                </Col>
                <Col sm={2}>
                  <p className="listgroupNameHead"> Identity number </p>
                  <p className="listgroupDetails">KRC902020</p>
                </Col>
                <Col sm={6}>
                  <p className="listgroupNameHead">Status</p>
                  <p className="listgroupDetails">Pending</p>
                </Col>

                <Col className="d-flex justify-content-end" sm={2}>
                  <UiButton
                    buttonLink="/issuer/view_kyc"
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

export default withRouter(IssuerKYCCard);

