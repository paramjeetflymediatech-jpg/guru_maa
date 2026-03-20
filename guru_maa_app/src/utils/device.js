import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Gets the unique device ID for this app installation.
 * Generates a new one if it doesn't exist.
 */
export const getDeviceId = async () => {
    try {
        let deviceId = await AsyncStorage.getItem('deviceId');
        if (!deviceId) {
            // Generate a simple unique ID (Timestamp + Random string)
            deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            await AsyncStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    } catch (error) {
        console.error('Error getting deviceId:', error);
        return 'unknown_device';
    }
};

/**
 * Returns the device type (android or ios).
 */
export const getDeviceType = () => {
    return Platform.OS;
};
