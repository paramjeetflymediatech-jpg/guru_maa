/**
 * Gurumaa App
 * Uses src/screens folder for all screens
 * Improved with bottom tab navigation for seamless UX
 */

import 'react-native-gesture-handler'; // 🔴 MUST be first

import React, { useState, useEffect } from 'react';
import { StatusBar, useColorScheme, View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import colors from './src/constants/theme';

// Error Boundary for catching rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error message:', error.message);
    console.error('[ErrorBoundary] Error stack:', error.stack);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#ef4444', marginBottom: 16 }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 8 }}>
            {this.state.error?.message}
          </Text>
          <Text style={{ fontSize: 12, color: '#999' }}>
            {this.state.error?.stack?.split('\n').slice(0, 5).join('\n')}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// Screens
import AuthLoadingScreen from './src/screens/AuthLoadingScreen';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import EnterOtpScreen from './src/screens/EnterOtpScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import SetPasswordScreen from './src/screens/SetPasswordScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import ReaderScreen from './src/screens/ReaderScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AboutAppScreen from './src/screens/AboutAppScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsConditionsScreen from './src/screens/TermsConditionsScreen';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const MainTab = createBottomTabNavigator();
const AppStack = createNativeStackNavigator();

// Custom Tab Icon Component
function TabIcon({ name, focused, color }) {
  let icon = '';
  switch (name) {
    case 'Library':
      icon = focused ? '📚' : '📖';
      break;
    case 'Profile':
      icon = focused ? '👤' : '👥';
      break;
    default:
      icon = '•';
  }
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.6 }]}>{icon}</Text>
    </View>
  );
}

// Main Tab Navigator - Contains the main app screens
function MainTabs() {
  const { t } = useTranslation();
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      })}
    >
      <MainTab.Screen 
        name="Library" 
        component={LibraryScreen}
        options={{ 
          tabBarLabel: t('library.title'),
          tabBarAccessibilityLabel: 'Navigate to Library'
        }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          tabBarLabel: t('profile.title'),
          tabBarAccessibilityLabel: 'Navigate to Profile'
        }}
      />
    </MainTab.Navigator>
  );
}

// Auth Stack Navigator - For authentication screens
function AuthNavigator() {
  const { t } = useTranslation();
  return (
    <AuthStack.Navigator
      screenOptions={{ 
        headerBackTitleVisible: false,
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.headerTint,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ 
          title: t('register.title'),
          headerShown: true,
        }}
      />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ 
          title: 'Reset Password',
          headerShown: true,
        }}
      />
      <AuthStack.Screen name="SetPassword" component={SetPasswordScreen} />
      <AuthStack.Screen 
        name="EnterOtp" 
        component={EnterOtpScreen}
        options={{ 
          title: 'Verify OTP',
          headerShown: true,
        }}
      />
    </AuthStack.Navigator>
  );
}

// Root Navigator
function RootNavigator() {
  const { t } = useTranslation();
  return (
    <RootStack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerBackTitleVisible: false }}
    >
      <RootStack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="AuthLoading"
        component={AuthLoadingScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="Auth"
        component={AuthNavigator}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="Main"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="Reader"
        component={ReaderScreen}
        options={{ 
          title: 'Reader',
          headerShown: true,
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerTint,
        }}
      />
      <RootStack.Screen
        name="About"
        component={AboutAppScreen}
        options={{ 
          title: 'About App',
          headerShown: true,
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerTint,
        }}
      />
      <RootStack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ 
          title: 'Privacy Policy',
          headerShown: true,
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerTint,
        }}
      />
      <RootStack.Screen
        name="TermsConditions"
        component={TermsConditionsScreen}
        options={{ 
          title: t('profile.terms'),
          headerShown: true,
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerTint,
        }}
      />
    </RootStack.Navigator>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  // Debug: Log theme initialization
  console.log('[App] Initializing navigation theme, isDarkMode:', isDarkMode);

  // React Navigation 7 theme configuration
  // Required properties: dark, colors
  // Optional properties: fonts (for custom fonts)
  const theme = {
    dark: isDarkMode,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.headerBackground,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.secondary,
      // Additional React Navigation 7 properties
      primaryContainer: colors.primaryLight,
      secondaryContainer: colors.secondaryLight,
      surface: colors.backgroundCard,
      surfaceVariant: colors.backgroundSecondary,
      onPrimary: colors.textOnPrimary,
      onSecondary: colors.textOnPrimary,
      onBackground: colors.textPrimary,
      onSurface: colors.textPrimary,
      onSurfaceVariant: colors.textSecondary,
      error: colors.error,
      onError: '#ffffff',
      elevation: {
        level0: 'transparent',
        level1: colors.backgroundCard,
        level2: colors.backgroundSecondary,
        level3: colors.backgroundSecondary,
        level4: colors.border,
        level5: colors.borderLight,
      },
    },
    // Explicitly define fonts to avoid 'regular' access errors
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400',
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500',
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700',
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '900',
      },
    },
  };

  // Debug: Log theme object
  console.log('[App] Theme object:', JSON.stringify(theme, null, 2));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <NavigationContainer theme={theme}>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 8,
    height: 60,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
  },
});

export default App;
