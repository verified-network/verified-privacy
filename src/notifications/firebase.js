import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from "firebase/messaging";

export const firebaseConfig = {
    apiKey: "AIzaSyBfGBe8tI7MbvFh2YdSmFqiqGtYacsoymE",
    authDomain: "verified-wallet.firebaseapp.com",
    projectId: "verified-wallet",
    storageBucket: "verified-wallet.appspot.com",
    messagingSenderId: "963319591820",
    appId: "1:963319591820:web:32df82cbd97208b405dca9",
    measurementId: "G-PTR6G89SPX"
  };

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export const fetchToken = (setFcmToken) => {
  return getToken(messaging, {vapidKey: 'BK18HtxkDwuYcAus8QeqgAYvrskRw2S-KtwsWA3DLKCghTvuT0xCtqY9fC5lGd43XedJ9WAs-53EBJGex0VNgRo'}).then((currentToken) => {
    if (currentToken) {
      console.log('current token for client: ', currentToken);
      setFcmToken(currentToken);
    } else {
      console.log('No registration token available. Request permission to generate one.');
    }
  }).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
  });
}

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
});