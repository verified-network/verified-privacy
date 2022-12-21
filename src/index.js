import 'core-js/fn/object/assign';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/Main';
import {ReactNotifications} from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';

// Bootstrap 3 Commented for temporary purpose
import './styles/index.less';

// for hot reloading
if (module.hot) {
  module.hot.accept();
}

// Bootstrap 4 Need to remove in future
// import 'bootstrap/dist/css/bootstrap.min.css';

// Render the main component into the dom
ReactDOM.render((
  <React.StrictMode>
    <ReactNotifications />
    <App />
  </React.StrictMode>
), document.getElementById('app'));
