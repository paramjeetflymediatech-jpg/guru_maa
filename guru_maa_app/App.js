/**
 * Gurumaa App
 * Uses src/screens folder for all screens
 */

import 'react-native-gesture-handler'; // 🔴 MUST be first

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screens
import AuthLoadingScreen from './src/screens/AuthLoadingScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import EnterOtpScreen from './src/screens/EnterOtpScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import SetPasswordScreen from './src/screens/SetPasswordScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import ReaderScreen from './src/screens/ReaderScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        />

        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="AuthLoading"
            screenOptions={{ headerBackTitleVisible: false }}
          >
            {/* 🔐 Auth check */}
            <Stack.Screen
              name="AuthLoading"
              component={AuthLoadingScreen}
              options={{ headerShown: false }}
            />

            {/* 🚀 Onboarding */}
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />

            {/* 🔐 Authentication */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
            <Stack.Screen
              name="SetPassword"
              component={SetPasswordScreen}
            />
            <Stack.Screen name="EnterOtp" component={EnterOtpScreen} />

            {/* 📚 Main App */}
            <Stack.Screen
              name="Library"
              component={LibraryScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Reader"
              component={ReaderScreen}
              options={{ title: 'Reader' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'Profile' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
