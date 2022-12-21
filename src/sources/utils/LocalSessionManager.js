import Encryption from 'sources/utils/Encryption';
import ContractService from 'sources/contracts/ContractService';

const LOCAL_STORAGE_PREFIX = 'verified_session_';

/*
user_id: {
    password: 'passwordExample'
    wallet: 'walletAddressExample'
}
*/

function isPasswordStored() {
  const username = retrieveLoggedUsername();
  const user = _retrieveUser(username);
  return !!(user && user.password);
}

function isWalletStored() {
  const username = retrieveLoggedUsername();
  const user = _retrieveUser(username);
  return user && user.wallet;
}

function checkPassword(password) {
  const hashedPassword = Encryption.hashString(password);
  const username = retrieveLoggedUsername();
  const user = _retrieveUser(username);

  return user.password === hashedPassword;
}

function setPassword(password) {
  const encryptedPassword = Encryption.hashString(password);

  const username = retrieveLoggedUsername();
  const user = _retrieveUser(username);
  user.password = encryptedPassword;

  _storeUser(username, user);
}

function changePassword(oldPassword, newPassword) {
  const wallet = getWallet(oldPassword);
  setWallet(wallet, newPassword);
  setPassword(newPassword);
}

function getWallet(password) {
  const username = retrieveLoggedUsername();
  const user = _retrieveUser(username);

  return Encryption.decryptString(user.wallet, password);
}

function getWalletAddress(password) {
  const contract = new ContractService(password);
  return contract.getWallet().address;
}

function setWallet(wallet, password) {
  ContractService.removeWalletCache();

  const username = retrieveLoggedUsername();
  const user = _retrieveUser(username);
  user.wallet = Encryption.encryptString(wallet, password);

  _storeUser(username, user);
}

function retrieveLoggedUsername() {
  return sessionStorage.getItem('username');
}

function setLoggedUsername(username) {
  if (retrieveLoggedUsername() !== username) {
    _storeLoggedUsername(username);
  } else {
    // Already logged
  }
}

// TODO: What if this get called before load user?
function getLoggedUsername() {
  return retrieveLoggedUsername();
}

function addPostedEvent(idEvent) {
  const previous = JSON.parse(sessionStorage.getItem('postedEvents')) || [];

  previous.push(idEvent);

  sessionStorage.setItem('postedEvents', JSON.stringify(previous));
}

function getPostedEvents() {
  return JSON.parse(sessionStorage.getItem('postedEvents')) || [];
}

function _retrieveUser(username) {
  const index = LOCAL_STORAGE_PREFIX + username;

  if (!localStorage.getItem(index)) {
    _storeUser(username, {});
    return {};
  }

  return JSON.parse(localStorage.getItem(index));
}

function _storeUser(username, value) {
  const index = LOCAL_STORAGE_PREFIX + username;
  localStorage.setItem(index, JSON.stringify(value));
}

function _storeLoggedUsername(username) {
  sessionStorage.setItem('username', username);

  if (!isPasswordStored()) {
    _storeUser(username, {});
  }
}

function storeAuthToken(token) {
  return localStorage.setItem('token', token);
}

function getAuthToken() {
  return localStorage.getItem('token');
}

export default {
  isPasswordStored,
  checkPassword,
  setPassword,
  changePassword,
  getWallet,
  setWallet,
  isWalletStored,
  setLoggedUsername,
  getLoggedUsername,
  getWalletAddress,
  storeAuthToken,
  getAuthToken,
  addPostedEvent,
  getPostedEvents,
};
