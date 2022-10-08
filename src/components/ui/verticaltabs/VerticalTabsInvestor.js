import React, {Component} from 'react';
import {Nav, Row, Col} from 'react-bootstrap';
import './verticaltabs.less';
import Tab from 'react-bootstrap/Tab';
import PropTypes from 'prop-types';
import InvestorKYCRequestsCard from '../cardList/investor/KYCRequests';
import InvestorQuotesCard from '../cardList/investor/Quotes';
import InvestorIssuesCard from '../cardList/investor/Issues';
import IssuerPaymentsCard from '../cardList/investor/Payments';
import InvestorReceiptsCard from '../cardList/investor/Receipts';
import PaginationList from '../pagination/Pagination';

class VerticalTabsInvestor extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Tab.Container id="left-tabs-example" defaultActiveKey="first">
        <Row>
          <Col sm={3}>
            <Nav
              variant="pills"
              key="verticalNav"
              variant="pills"
              className="flex-column tabsTitle"
            >
              <Nav.Item>
                <Nav.Link eventKey="first">KYC Requests</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="second">Redemptions</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="third">Issues</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="fourth">Transfers</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="fifth">Receipts</Nav.Link>
              </Nav.Item>

            </Nav>
          </Col>
          <Col sm={9}>
            <Tab.Content>

              <Tab.Pane eventKey="first">
                <InvestorKYCRequestsCard />
                <InvestorKYCRequestsCard />
                <InvestorKYCRequestsCard />
                <InvestorKYCRequestsCard />
                <Row>
                  <Col sm={12}>  <PaginationList /></Col>
                </Row>
              </Tab.Pane>
              <Tab.Pane eventKey="second">
                <InvestorQuotesCard />
                <InvestorQuotesCard />
                <InvestorQuotesCard />
                <InvestorQuotesCard />
                <Row>
                  <Col sm={12}>  <PaginationList /></Col>
                </Row>
              </Tab.Pane>
              <Tab.Pane eventKey="third">
                <InvestorIssuesCard />
                <InvestorIssuesCard />
                <InvestorIssuesCard />
                <InvestorIssuesCard />
                <Row>
                  <Col sm={12}>  <PaginationList /></Col>
                </Row>
              </Tab.Pane>
              <Tab.Pane eventKey="fourth">
                <IssuerPaymentsCard />
                <IssuerPaymentsCard />
                <IssuerPaymentsCard />
                <IssuerPaymentsCard />
                <IssuerPaymentsCard />
                <Row>
                  <Col sm={12}>  <PaginationList /></Col>
                </Row>
              </Tab.Pane>
              <Tab.Pane eventKey="fifth">
                <InvestorReceiptsCard />
                <InvestorReceiptsCard />
                <InvestorReceiptsCard />
                <InvestorReceiptsCard />
                <InvestorReceiptsCard />
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

VerticalTabsInvestor.propTypes = {
  tabData: PropTypes.array,
  listData: PropTypes.array,
};
export default VerticalTabsInvestor;
