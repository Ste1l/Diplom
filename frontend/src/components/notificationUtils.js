import { toast } from 'react-toastify';

const addNotification = (type, message) => {
  toast[type](message);
};

const removeNotification = (id) => {
  
};

export { addNotification, removeNotification };