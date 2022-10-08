import React from 'react';

export default React.createContext({
  password: '',

  isPasswordStored() {
    return this.password && this.password !== '';
  },

  getPassword() {
    return this.password;
  },

  setPassword(password) {
    this.password = password;
  },
});
