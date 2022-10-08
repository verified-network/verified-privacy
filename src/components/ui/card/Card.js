import React, {Component} from 'react';
import {Card} from 'react-bootstrap';
import './card.less';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';

class ProductCard extends Component {
  handleClick = (screen) => {
    if (typeof (screen) == 'function') {
      screen();
    } else {
      const {tab} = this.props;
      if (tab) {
        this.props.history.push(screen, {tab});
      } else {
        this.props.history.push(screen);
      }
    }
  };

  render() {
    const dashboardCardTitle = this.props.dashboardCardTitle;
    const dashboardCardCaption = this.props.dashboardCardCaption;
    const dashboardCardLink = this.props.dashboardCardLink;

    return (
      <Card className="dashboard-request-card" style={{cursor: 'pointer'}}
        onClick={() => this.handleClick(dashboardCardLink)}>
        <Card.Body className="request-card-padding">
          <Card.Title as="h6" className="font-weight-lighter">
            {dashboardCardTitle}
          </Card.Title>
          <Card.Text className="text-muted">
            {dashboardCardCaption}
          </Card.Text>
        </Card.Body>
      </Card>
    );
  }
}

ProductCard.propTypes = {
  dashboardCardTitle: PropTypes.string.isRequired,
  dashboardCardCaption: PropTypes.string.isRequired,
  dashboardCardLink: PropTypes.any,
};

export default withRouter(ProductCard);
