import React, {Component} from 'react';
import Tab from 'react-bootstrap/Tab';
import ListGroupCard from '../cardList/CardList';
import PaginationList from '../pagination/Pagination';
import './verticaltabs.less';
import PropTypes from 'prop-types';

class VerticalList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listData: [
        {
          tabkey: 'issue_request',
          text: 'Issue Requests',
          buttonlabel: 'View Details',
          path: '/investor/dashboard',
        },
        {
          tabkey: 'kyc_requests',
          text: 'KYC Requests',
          buttonlabel: 'Fill KYC',
          path: '/investor/kyc',
        },
        {
          tabkey: 'order_requests',
          text: 'Quotes',
          buttonlabel: 'View Details',
          path: '/investor/dashboard',
        },
        {
          tabkey: 'issue',
          text: 'Issues',
          buttonlabel: 'View Details',
          path: '/investor/dashboard',
        },
        {
          tabkey: 'payment_requests',
          text: 'Payments',
          buttonlabel: 'View Details',
          path: '/investor/dashboard',
        },
        {
          tabkey: 'collection',
          text: 'Receipts',
          buttonlabel: 'View Details',
          path: '/investor/dashboard',
        },
        {
          tabkey: 'interest',
          text: 'Interest',
          buttonlabel: 'View Details',
          path: '/investor/dashboard',
        },
      ],
    };
  }

  render() {
    const {listData} = this.props;
    return (
      <div>
        <Tab.Content>
          {listData.map((object, index) => {
            return (
              <Tab.Pane
                key={index * 2}
                eventKey={object.tabkey}
                buttonlabel={object.text}
              >
                {[1, 2, 3, 4].map((objectData, index1) => {
                  return (
                    <ListGroupCard
                      key={index1 * 3}
                      tab={object.tabkey}
                      buttonlabel={object.tabkey}
                      {...object}
                    />
                  );
                })}
              </Tab.Pane>
            );
          })}
        </Tab.Content>
        <PaginationList />
      </div>
    );
  }
}
VerticalList.propTypes = {
  tabEvent: PropTypes.string,
  listEvent: PropTypes.string,
};
export default VerticalList;
