import React, {Component} from 'react';
import {Nav, Row, Col} from 'react-bootstrap';
import './verticaltabs.less';
import Tab from 'react-bootstrap/Tab';
import IssuerInboxCard from '../cardList/issuer/IssuerInboxCard';
import PropTypes from 'prop-types';
import IssuerKYCCard from '../cardList/issuer/IssuerKYCCard';
import PaginationList from '../pagination/Pagination';

class VerticalTabsIssuer extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {tabData, onSelect, listData} = this.props;

    return (
      <Tab.Container id="left-tabs-example" defaultActiveKey="issue_requests">
        <Row>
          <Col sm={3}>
            <Nav
              variant="pills"
              key="verticalNav"
              variant="pills"
              className="flex-column tabsTitle"
              onSelect={onSelect}
            >
              {tabData.map((object, index) => {
                return (
                  <Nav.Item key={index}>
                    <Nav.Link eventKey={object.tabkey}>{object.text}</Nav.Link>
                  </Nav.Item>
                );
              })}
              <Nav.Item>
                <Nav.Link eventKey="second">KYC Requests</Nav.Link>
              </Nav.Item>

            </Nav>
          </Col>
          <Col sm={9}>
            <Tab.Content>
              {listData.map((object, index) => {
                return (
                  <Tab.Pane
                    key={index * 2}
                    eventKey={object.tabkey}
                    buttonlabel={object.text}
                  >
                    {[1, 2, 3, 4].map((objectData, index1) => {
                      return object.tabkey === 'kycForm' ? (
                        <IssuerKYCCard />
                      ) : (
                        <IssuerInboxCard
                          key={index1 * 3}
                          tab={object.tabkey}
                          buttonlabel={object.tabkey}
                          {...object}
                        />
                      );
                    })}
                    <Row>
                      <Col sm={12}>  <PaginationList /></Col>
                    </Row>
                  </Tab.Pane>
                );
              })}
              <Tab.Pane eventKey="second">
                <IssuerKYCCard />
                <IssuerKYCCard />
                <IssuerKYCCard />
                <IssuerKYCCard />
                <Row>
                  <Col sm={12}>  <PaginationList /></Col>
                </Row>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    );
  }
}

VerticalTabsIssuer.propTypes = {
  tabData: PropTypes.array,
  listData: PropTypes.array,
};
export default VerticalTabsIssuer;
