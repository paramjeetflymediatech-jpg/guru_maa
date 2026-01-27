import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

function EnterOtpScreen({ navigation }) {
  const [otp, setOtp] = useState('');

  const onVerify = () => {
    // TODO: verify OTP with backend
    console.log('Verify OTP pressed', { otp });
  };

  return (
    <View style={styles.container}>
      <View style={styles.formWrapper}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          Please enter the code we sent to your email or phone.
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

        <TouchableOpacity style={styles.primaryButton} onPress={onVerify}>
          <Text style={styles.primaryButtonText}>Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Change email / password</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#555555',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 20,
    letterSpacing: 8,
    textAlign: 'center',
    width: 180,
  },
  primaryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default EnterOtpScreen;
