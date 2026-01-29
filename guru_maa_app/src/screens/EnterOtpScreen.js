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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { verifyOtp, resendOtp } from '../api/auth.api';

function EnterOtpScreen({ navigation, route }) {
  const { email, userId, forgotPassword } = route.params || {};
  console.log(route.params, 'params');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const onVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit code');
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOtp({
        otp,
        email,
        userId,
      });

      if (forgotPassword) {
        //redirect to setpassword screen
        return navigation.navigate('SetPassword', {
          email: email.trim(),
          userId: userId,
        });
      }
      // Save token for auto-login
      await AsyncStorage.setItem('token', response?.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response?.data.user));

      navigation.reset({
        index: 0,
        routes: [{ name: 'Library' }],
      });
    } catch (error) {
      console.log(error, 'eeee');
      Alert.alert(
        'Verification Failed',
        error?.message || 'Invalid OTP. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const onResendOtp = async () => {
    try {
      setResending(true);
      await resendOtp({ email, userId });
      Alert.alert('OTP Sent', 'A new OTP has been sent.');
    } catch (error) {
      Alert.alert('Error', error?.message || 'Unable to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.formWrapper}>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>
            Please enter the 6-digit code sent to your email
          </Text>

          <View style={styles.otpRow}>
            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="••••••"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={onVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onResendOtp} disabled={resending}>
            <Text style={styles.resendText}>
              {resending ? 'Resending...' : 'Resend OTP'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Change email / password</Text>
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

  formWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    color: '#6b7280',
  },

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },

  otpInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 22,
    letterSpacing: 10,
    textAlign: 'center',
    width: 200,
  },

  primaryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
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

  resendText: {
    color: '#007bff',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },

  linkText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 6,
    fontSize: 13,
  },
});

export default EnterOtpScreen;
