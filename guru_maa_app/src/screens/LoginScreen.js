import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Logo from './logoscreen';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../api/auth.api';
// import AsyncStorage from '@react-native-async-storage/async-storage';

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Email and password are required');
      return;
    }
    try {
      setLoading(true);
      const response = await loginUser({
        email: email.trim(),
        password,
      });
      let user = response?.data?.user;

      if (!user.isVerified) {
        Alert.alert(
          'Login Failed',
          response?.data?.message || 'OTP verification required',
        );
        return navigation.reset({
          index: 0,
          routes: [{ name: 'EnterOtp' }],
        });
      }
      // 👉 Store token if API returns it
      if (response?.data?.token) {
        await AsyncStorage.setItem('token', response?.data?.token);
      }
      navigation.reset({
        index: 0,
        routes: [{ name: 'Library' }],
      });
    } catch (error) {
      console.log(error, 'ererrr');
      Alert.alert(
        'Login Failed',
        error?.response?.data?.message || 'Invalid email or password',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Logo size={96} />
          <Text style={styles.appName}>Gurumaa</Text>
          <Text style={styles.appTagline}>
            Secure spiritual library at your fingertips
          </Text>
        </View>

        {/* FORM */}
        <View style={styles.formWrapper}>
          <Text style={styles.title}>Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={onLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text style={styles.linkText}>
              Don&apos;t have an account? Register
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  header: {
    paddingTop: 64,
    paddingBottom: 24,
    alignItems: 'center',
  },

  appName: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#275fb4',
  },

  appTagline: {
    marginTop: 6,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },

  formWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },

  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    fontSize: 15,
    color: '#111827',
  },

  primaryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },

  disabledButton: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  linkText: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
});

export default LoginScreen;
