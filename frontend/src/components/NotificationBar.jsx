import React, { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNotification } from '../Context/NotificationContext';

const NotificationBar = () => {
  const { notifications, removeNotification } = useNotification();

  useEffect(() => {
    notifications.forEach(({ id, type, message }) => {
      switch(type) {
        case 'success':
          toast.success(message, {
            onClose: () => removeNotification(id),
            autoClose: 5000,
            hideProgressBar: false,
            newestOnTop: false,
            closeOnClick: true,
            rtl: false,
            pauseOnFocusLoss: false,
            draggable: false,
            progress: undefined,
            theme: 'light',
            bodyClassName: 'toastify-body-light'
          });
          break;
        case 'error':
          toast.error(message, {
            onClose: () => removeNotification(id),
            autoClose: 5000,
            hideProgressBar: false,
            newestOnTop: false,
            closeOnClick: true,
            rtl: false,
            pauseOnFocusLoss: false,
            draggable: false,
            progress: undefined,
            theme: 'light',
            bodyClassName: 'toastify-body-light'
          });
          break;
        default:
          toast(message, {
            onClose: () => removeNotification(id),
            autoClose: 5000,
            hideProgressBar: false,
            newestOnTop: false,
            closeOnClick: true,
            rtl: false,
            pauseOnFocusLoss: false,
            draggable: false,
            progress: undefined,
            theme: 'light',
            bodyClassName: 'toastify-body-light'
          });
      }
    });
  }, [notifications, removeNotification]);

  return (
    <ToastContainer
      position="top-right"
      limit={3}
    />
  );
};

export default NotificationBar;