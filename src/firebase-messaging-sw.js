// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: 'AIzaSyBfGBe8tI7MbvFh2YdSmFqiqGtYacsoymE',
  authDomain: 'verified-wallet.firebaseapp.com',
  projectId: 'verified-wallet',
  storageBucket: 'verified-wallet.appspot.com',
  messagingSenderId: '963319591820',
  appId: '1:963319591820:web:32df82cbd97208b405dca9',
  measurementId: 'G-PTR6G89SPX',
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
