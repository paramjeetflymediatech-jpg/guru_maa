// guru_maa_app/src/api/axios.instance.js
import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEV_HOST =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:4000' // Android emulator -> host machine
    : 'http://localhost:4000'; // iOS simulator / Metro same machine

const API = axios.create({
  baseURL: `${DEV_HOST}/api`,
  timeout: 15000,
});

// 🔐 Attach token
API.interceptors.request.use(async req => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ❗ Error handling (NO toast / window / localStorage)
API.interceptors.response.use(
  res => res,
  async error => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Something went wrong';

    if (status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }

    return Promise.reject({
      status,
      message,
    });
  },
);

export default API;
