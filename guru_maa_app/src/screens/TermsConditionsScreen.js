import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import colors from '../constants/theme';

function TermsConditionsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Terms and Conditions</Text>
          <Text style={styles.lastUpdated}>Last Updated: January 2024</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.description}>
              By downloading, installing, or using the Gurumaa mobile 
              application, you agree to be bound by these Terms and Conditions. 
              If you do not agree to these terms, please do not use our app.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Use License</Text>
            <Text style={styles.description}>
              Permission is granted to temporarily use the Gurumaa app for 
              personal, non-commercial use only. This is the grant of a 
              license, not a transfer of title, and under this license you 
              may not:
              {'\n\n'}\u2022 Modify or copy the materials
              {'\n\n'}\u2022 Use the materials for any commercial purpose
              {'\n\n'}\u2022 Transfer the materials to another person
              {'\n\n'}\u2022 Attempt to reverse engineer any software contained in the app
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. User Account</Text>
            <Text style={styles.description}>
              To access certain features of the app, you may be required to 
              create an account. You agree to:
              {'\n\n'}\u2022 Provide accurate and complete information
              {'\n\n'}\u2022 Maintain the security of your account credentials
              {'\n\n'}\u2022 Accept responsibility for all activities under your account
              {'\n\n'}\u2022 Notify us immediately of any unauthorized access
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Content and Intellectual Property</Text>
            <Text style={styles.description}>
              The content available in Gurumaa, including text, images, and 
              multimedia, is protected by copyright and other intellectual 
              property rights. You may not reproduce, distribute, modify, or 
              create derivative works from any content without our prior 
              written consent.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. User Conduct</Text>
            <Text style={styles.description}>
              When using the app, you agree not to:
              {'\n\n'}\u2022 Violate any applicable laws or regulations
              {'\n\n'}\u2022 Infringe upon the rights of others
              {'\n\n'}\u2022 Post or transmit harmful, offensive, or inappropriate content
              {'\n\n'}\u2022 Attempt to gain unauthorized access to the app
              {'\n\n'}\u2022 Interfere with the proper operation of the app
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Disclaimers</Text>
            <Text style={styles.description}>
              THE APP IS PROVIDED ON AN "AS IS" BASIS WITHOUT WARRANTIES OF 
              ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE APP 
              WILL BE UNINTERRUPTED OR ERROR-FREE. THE CONTENT PROVIDED IS 
              FOR EDUCATIONAL AND SPIRITUAL PURPOSES ONLY.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
            <Text style={styles.description}>
              IN NO EVENT SHALL GURUMAA BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR 
              USE OF OR INABILITY TO USE THE APP.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Indemnification</Text>
            <Text style={styles.description}>
              You agree to indemnify, defend, and hold harmless Gurumaa and its 
              officers, directors, employees, and agents from any claims, 
              damages, losses, or expenses arising out of your use of the app 
              or violation of these Terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Termination</Text>
            <Text style={styles.description}>
              We reserve the right to terminate your access to the app at any 
              time, without notice, for any reason, including violation of 
              these Terms and Conditions.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Governing Law</Text>
            <Text style={styles.description}>
              These Terms and Conditions shall be governed by and construed in 
              accordance with the laws of India, without regard to its conflict 
              of law provisions.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
            <Text style={styles.description}>
              We may modify these Terms and Conditions at any time. Your 
              continued use of the app after such modifications constitutes 
              your acceptance of the revised terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Contact Information</Text>
            <Text style={styles.description}>
              If you have any questions about these Terms and Conditions, 
              please contact us at: support@gurumaa.app
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.textTertiary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
});

export default TermsConditionsScreen;
