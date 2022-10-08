import React, {Component} from 'react';
import loader from '../../../assets/images/loader.png';

class Loader extends Component {
  render() {
    return (
      <div className="loader" id="loaderImage">
        <img src={loader} className="App-loader" alt="loading..." />
      </div>
    );
  }
}

export default Loader;
