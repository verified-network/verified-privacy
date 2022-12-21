import React from 'react';
import {Route, Redirect} from 'react-router-dom';

export default function AdminRoute({component: Component, ...rest}) {
  const currentUser = sessionStorage.getItem('isDashboardVisited');
  const isAdmin = sessionStorage.getItem('isAdmin');

  return (
    <Route
      {...rest}
      render={(props) => {
        const normalUserComponent = (currentUser && !isAdmin) ? <Redirect to="/issuer/dashboard"/> :
          <Redirect to="/servicer/dashboard"/>;

        return currentUser && isAdmin ? <Component {...props} /> : normalUserComponent;
      }}
    />
  );
}
