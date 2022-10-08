import React, {Component} from 'react';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import './table.less';
import paginationFactory from 'react-bootstrap-table2-paginator';
import BootstrapTable from 'react-bootstrap-table-next';

const sortByIntegerValue = (a, b, order) => {
  const numA = parseInt(a);
  const numB = parseInt(b);

  if (order === 'asc') {
    return numB - numA;
  }

  return numA - numB;
};

const sortByDateValue = (a, b, order) => {
  const numA = (new Date(a)).getTime();
  const numB = (new Date(b)).getTime();

  if (order === 'asc') {
    return numB - numA;
  }

  return numA - numB;
};

class UiTable extends Component {
  noDataIndication = () => {
    return <p>No data</p>;
  }

  render() {
    const {
      tbodyData,
      thead,
      data,
      columns,
    } = this.props;

    const tableColumns = columns ?? thead;
    const tableData = data ?? tbodyData;

    return (
      <BootstrapTable keyField='id' data={tableData} columns={tableColumns.map((element) => {
        element.dataField = element.dataField ?? element.val;
        element.text = element.text ?? element.label;

        return element;
      })}
      bootstrap4
      pagination={paginationFactory()}
      noDataIndication = {this.noDataIndication}
      wrapperClasses="table-responsive"
      {...this.props}
      />
    );
  }
}

export {sortByIntegerValue, sortByDateValue};
export default UiTable;
