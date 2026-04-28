/**
 * Push notifications disabled (Google services removed)
 */

export const requestUserPermission = async () => {
  console.log('Push notifications disabled');
  return null;
};

export const getFcmToken = async () => {
  return null;
};

export const notificationListener = () => {
  console.log('Notification listener disabled');
};

export const syncToken = async () => {
  console.log('Sync token disabled');
};
