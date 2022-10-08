import {Store} from 'react-notifications-component';

const notificationConfig = {
  insert: 'top',
  container: 'top-right',
  animationIn: ['animated', 'fadeIn'],
  animationOut: ['animated', 'fadeOut'],
  width: 300,
};

const notifier = {
  default: (title = 'Message', message = ' ', duration = 2500) => Store.addNotification({
    title,
    message,
    type: 'default',
    dismiss: {duration: duration},
    ...notificationConfig,
  }),

  success: (title = 'Success', message = ' ', duration = 2500) => Store.addNotification({
    title,
    message,
    type: 'success',
    dismiss: {duration: duration}, ...notificationConfig,
  }),

  error: (title = 'Danger', message = ' ', duration = 2500) => Store.addNotification({
    title,
    message,
    type: 'danger',
    dismiss: {duration: duration}, ...notificationConfig,
  }),

  warning: (title = 'Warning', message = ' ', duration = 2500) => Store.addNotification({
    title,
    message,
    type: 'warning',
    dismiss: {duration: duration}, ...notificationConfig,
  }),

  info: (title = 'Info', message = ' ', duration = 2500) => Store.addNotification({
    title,
    message,
    type: 'info',
    dismiss: {duration: duration}, ...notificationConfig,
  }),
};

export default notifier;
