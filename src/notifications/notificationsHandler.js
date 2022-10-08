import React, {useEffect, useState} from 'react';
import {fetchToken, onMessageListener} from './firebase';
import notifier from 'components/ui/notifier';
import ClientContractService from 'sources/contracts/ClientContractService';
import initialTransactionsManager from 'sources/utils/InitialTransactionsManager';

const PushNotificationContext = React.createContext(null);

const PushNotificationProvider = (props) => {
  const [fcmToken, setFcmToken] = useState('');

  useEffect(() => {
    fetchToken(setFcmToken);
    addPushNotificationListener();
  }, []);

  const addPushNotificationListener = () => {
    onMessageListener()
        .then((payload) => {
          notifier.info(payload.notification.title, payload.notification.body);
        })
        .catch((err) => console.log('failed: ', err));
  };

  const storeFcmToken = (password) => {
    if (!fcmToken) return;
    const clientContract = new ClientContractService(password);
    const setTokenFn = () => clientContract.setFCMToken(fcmToken);

    initialTransactionsManager.addTransaction(setTokenFn);
  };

  const values = {
    fcmToken,
    storeFcmToken,
  };

  return (
    <PushNotificationContext.Provider value={{...values}} {...props}>
      {props.children}
    </PushNotificationContext.Provider>
  );
};

const usePushNotification = () => React.useContext(PushNotificationContext);

export default PushNotificationContext;
export {PushNotificationProvider, usePushNotification};
