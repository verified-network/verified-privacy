import React, {Component} from 'react';
import {Col, Row, ListGroup, Card} from 'react-bootstrap';
import '../cardList.less';
import UiButton from '../../button/Button';
import {withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';


class InvestorKYCRequestsCard extends Component {
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
                  <p className="listgroupNameHead">Request ID </p>
                  <p className="listgroupDetails">12001020</p>
                </Col>
                <Col sm={3}>
                  <p className="listgroupNameHead"> ISIN/Product </p>
                  <p className="listgroupDetails">Via</p>
                </Col>
                <Col sm={3}>
                  <p className="listgroupNameHead">Issuer</p>
                  <p className="listgroupDetails">Verified AG</p>
                </Col>
                <Col className="d-flex justify-content-center" sm={2}>
                  <UiButton
                    onClick={this.onViewDetails}
                    buttonText="Fill KYC"
                    buttonClass="SignUpButton"
                    buttonVariant="primary"
                    buttonLink="/investor/kyc"
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
export default withRouter(InvestorKYCRequestsCard);

