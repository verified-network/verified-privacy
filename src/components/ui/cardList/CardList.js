import React, {Component} from 'react';
import {Col, Row, ListGroup, Card} from 'react-bootstrap';
import './cardList.less';
import UiButton from '../button/Button';
import {withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';


class ListGroupCard extends Component {
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
              <ListGroup.Item className="d-flex justify-content-space align-items-center listgroupCardPadding">

                <Col sm={4}>
                  <p className="listgroupNameHead"> Wine Tours La Dolce Vita </p>
                  <p className="listgroupDetails">Ticker 22345656</p>
                </Col>
                <Col sm={3}>
                  <p className="listInfo">
                        Asset Manager Targer investor Ticker
                  </p>
                </Col>
                <Col sm={2}>
                  <p className="listInfo">
                        John Walker <br />Real Estate GLC
                  </p>
                </Col>

                <Col className="d-flex justify-content-center" sm={3}>
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
export default withRouter(ListGroupCard);

