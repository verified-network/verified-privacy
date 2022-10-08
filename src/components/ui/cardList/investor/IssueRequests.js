import React, {Component} from 'react';
import {Col, Row, ListGroup, Card} from 'react-bootstrap';
import '../cardList.less';
import UiButton from '../../button/Button';
import {withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';


class InvestorIssueRequestsCard extends Component {
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
                  <p className="listgroupNameHead">ISIN number </p>
                  <p className="listgroupDetails">INE09000023</p>
                </Col>
                <Col sm={3}>
                  <p className="listgroupNameHead"> Issuer </p>
                  <p className="listgroupDetails">SREI Finance</p>
                </Col>
                <Col sm={4}>
                  <p className="listgroupNameHead">Amount paid for issue</p>
                  <p className="listgroupDetails">USD 5000</p>
                </Col>
                <Col sm={2} className="d-flex justify-content-center flex-column">
                  <p className="listgroupNameHead">Status</p>
                  <p className="listgroupDetails">Pending</p>
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
export default withRouter(InvestorIssueRequestsCard);

