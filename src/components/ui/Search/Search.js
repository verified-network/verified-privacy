import React from 'react';
import {InputGroup} from 'react-bootstrap';

import TextInput from '../textinput/TextInput';
import '../Search/search.less';

class Search extends React.Component {
  constructor() {
    super();
    this.state = {
      search: '',
    };
  }
  render() {
    const {search} = this.state;
    const {onClick, searchClass} = this.props;
    const {placeholderText} = this.props;
    return (
      <InputGroup className={searchClass}>
        <TextInput
          required
          placeholder={placeholderText}
          value={search}
          onChange={(e) => this.setState({search: e.target.value})}
        />

        <InputGroup.Append>
          <a href="">
            <i className="fa fa-search" aria-hidden="true" onClick={() => onClick(search)}></i> </a>
        </InputGroup.Append>
      </InputGroup>
    );
  }
}

export default Search;
