import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { requestDeleteAccount } from '../api/auth.api';
import colors, { spacing, typography, radius } from '../constants/theme';

const DeleteAccountRequestScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert(t('common.error'), "Please provide a reason for your request.");
      return;
    }

    Alert.alert(
      "Confirm Request",
      "Are you sure you want to submit a deletion request? This will be reviewed by the admin.",
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: "Submit",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await requestDeleteAccount({ reason });
              if (response.data.status === 'success') {
                Alert.alert(
                  t('common.success'),
                  response.data.message || "Your request has been submitted.",
                  [{ text: t('common.ok'), onPress: () => navigation.goBack() }]
                );
              }
            } catch (error) {
              console.error('[DELETE_REQUEST_ERROR]', error);
              Alert.alert(
                t('common.error'),
                error?.response?.data?.message || "Failed to submit request. Please try again later."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Account Deletion</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.infoText}>
              We are sorry to see you go. Please tell us why you want to delete your account. 
              Your request will be sent to the admin for processing.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Reason for deletion</Text>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={6}
                placeholder="Please share your feedback or reason for leaving..."
                placeholderTextColor="#999"
                value={reason}
                onChangeText={setReason}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Deletion Request</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Nevermind, Keep My Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8EE',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  backButtonText: {
    fontSize: 24,
    color: '#6B0000',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6B0000',
  },
  content: {
    flex: 1,
  },
  infoText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B0000',
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: '#333',
    minHeight: 150,
  },
  submitButton: {
    backgroundColor: '#6B0000',
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4A0072',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default DeleteAccountRequestScreen;
