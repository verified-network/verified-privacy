const UsePassword = function() {
  let password = '';

  function setPassword(value) {
    password = value;
  }

  function getPassword() {
    return password;
  }

  return {
    setPassword,
    getPassword,
  };
};

export default UsePassword();
