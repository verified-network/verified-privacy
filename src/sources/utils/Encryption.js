import CryptoJS from 'crypto-js';

function encryptString(plainText, key) {
  return CryptoJS.AES.encrypt(plainText, `secret key ${key}`).toString();
}

function decryptString(cipherText, key) {
  const bytes = CryptoJS.AES.decrypt(cipherText, `secret key ${key}`);
  return bytes.toString(CryptoJS.enc.Utf8);
}

function encryptObject(plainObject, key) {
  return CryptoJS.AES.encrypt(JSON.stringify(plainObject), `secret key ${key}`).toString();
}

function decryptObject(cipherObject, key) {
  const bytes = CryptoJS.AES.decrypt(cipherObject, `secret key ${key}`);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

function hashString(string) {
  // eslint-disable-next-line new-cap
  const hash = CryptoJS.SHA3(string);
  return hash.toString(CryptoJS.enc.Base64);
}

export default {
  encryptString,
  decryptString,
  encryptObject,
  decryptObject,
  hashString,
};
