import React, {Component} from 'react';
import {Pagination} from 'react-bootstrap';
import './pagination.less';

class PaginationList extends Component {
  pageNumber() {
    const active = 2;
    const items = [];
    for (let number = 1; number <= 5; number++) {
      items.push(
        <Pagination.Item key={number} active={number === active}>
          {number}
        </Pagination.Item>
      );
    }
  }

  render() {
    return (
      <Pagination aria-label="Page navigation" className="marginTop20">
        <Pagination.First/>
        <Pagination.Prev/>
        <Pagination.Item>{1}</Pagination.Item>
        <Pagination.Item>{2}</Pagination.Item>
        <Pagination.Ellipsis/>
        <Pagination.Item>{20}</Pagination.Item>
        <Pagination.Next/>
        <Pagination.Last/>
      </Pagination>
    );
  }
}

export default PaginationList;
