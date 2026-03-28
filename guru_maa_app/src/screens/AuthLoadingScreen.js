import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SafeAreaView } from 'react-native-safe-area-context';

function AuthLoadingScreen({ navigation }) {
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');

      navigation.reset({
        index: 0,
        routes: [{ name: token ? 'Main' : 'Onboarding' }],
      });
    };

    checkAuth();
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </SafeAreaView>
  );
}

export default AuthLoadingScreen;
