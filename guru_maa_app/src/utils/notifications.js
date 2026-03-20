import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Request permission for push notifications and return the FCM token.
 */
export const requestUserPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      return await getFcmToken();
    }
    return null;
  } catch (error) {
    console.log('Permission Error:', error);
    return null;
  }
};

export const getFcmToken = async () => {
  try {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await messaging().getToken();
      if (fcmToken) {
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
    return fcmToken;
  } catch (error) {
    console.log('Token Error:', error);
    return null;
  }
};

/**
 * Listen for background and foreground notifications.
 */
export const notificationListener = () => {
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification caused app to open from background state:', remoteMessage.notification);
  });

  messaging().getInitialNotification().then(remoteMessage => {
    if (remoteMessage) {
      console.log('Notification caused app to open from quit state:', remoteMessage.notification);
    }
  });

  messaging().onMessage(async remoteMessage => {
    Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
  });
};

/**
 * Sync the FCM token with the server if the user is logged in.
 */
export const syncToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) return; // Not logged in

    const fcmToken = await getFcmToken();
    if (!fcmToken) return;

    const { getDeviceId, getDeviceType } = require('./device');
    const { updateDeviceToken } = require('../api/auth.api');

    const deviceId = await getDeviceId();
    const deviceType = getDeviceType();

    await updateDeviceToken({
      deviceId,
      deviceType,
      pushToken: fcmToken
    });
    console.log('Push token synced with server');
  } catch (error) {
    console.log('Sync Token Error:', error);
  }
};
